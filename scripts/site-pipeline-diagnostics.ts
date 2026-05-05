import { access, readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

/** validate-site 语义分类（对用户可见的稳定标签） */
export type ValidateDiagnosticType = "schema-error" | "missing-page" | "token-residue" | "locale-mismatch";

/** build-site 语义分类：数据加载/校验 vs 构建工具运行时 */
export type BuildDiagnosticLayer = "data-problem" | "runtime-problem";

export type PipelineDiagnosticError = {
  /** validate / build / generate / pipeline */
  scope: "validate" | "build" | "generate" | "pipeline";
  /** 上层分类：validate 四类或 build 两类等 */
  type: ValidateDiagnosticType | BuildDiagnosticLayer | "generate-error" | "invocation-error" | "unknown";
  message: string;
  detail?: string;
};

const TEXT_EXT = new Set([".ts", ".json"]);

function flattenMessage(detail?: string): string {
  return (detail ?? "").toLowerCase();
}

/**
 * locale / 多语言一致性（Zod refine 与人类可读报错）
 */
function matchLocaleMismatch(textNorm: string, textRaw: string): boolean {
  return (
    textNorm.includes("missing or empty value for locale") ||
    textNorm.includes("defaultlocale must be one of locales") ||
    /\blocale\b.*\b(mismatch|missing|unsupported|must)/i.test(textRaw)
  );
}

/**
 * content 缺失或首页缺失（目录不存在、读取失败、无 "/"）
 */
function matchMissingPage(textNorm: string): boolean {
  return (
    textNorm.includes("pages directory not found") ||
    textNorm.includes("missing homepage") ||
    textNorm.includes("failed to read pages directory")
  );
}

/**
 * Schema / Page JSON / SiteConfig.parse 链路
 */
function matchSchema(norm: string, raw: string): boolean {
  if (
    matchMissingPage(norm) &&
    !/\bzod\b|SiteConfigSchema|PageSchema|invalid_type|too_small|regex test failed/i.test(raw)
  ) {
    return false;
  }
  return (
    /\bzod\b|\bsiteconfigschema\b|\bpageschema\b|\bparse error\b|\bunexpected token\b|invalid[_\s]?(type|string|literal)|too[_\s]?small|\[\s*\{\s*"((expected|received|path|issues))"/i.test(
      raw,
    ) ||
    /failed to load site config\b/i.test(raw) ||
    /failed to load page\b/i.test(raw)
  );
}

async function collectFilesRecursive(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(current: string): Promise<void> {
    let dirents;
    try {
      dirents = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const d of dirents) {
      const p = join(current, d.name);
      if (d.isDirectory()) {
        await walk(p);
      } else if (d.isFile() && TEXT_EXT.has(extname(d.name).toLowerCase())) {
        results.push(p);
      }
    }
  }

  await walk(rootDir);
  return results;
}

/** 未完成 token 替换的 `{{TOKEN}}` 残留扫描 */
export async function findTemplateTokenResidue(siteDir: string): Promise<string[]> {
  const hits: string[] = [];

  async function scanFile(absPath: string): Promise<void> {
    try {
      const txt = await readFile(absPath, "utf8");
      if (txt.includes("{{")) {
        hits.push(absPath);
      }
    } catch {
      /* ignore */
    }
  }

  await scanFile(join(siteDir, "site.config.ts"));

  const contentRoot = join(siteDir, "content");
  try {
    await access(contentRoot);
    const files = await collectFilesRecursive(contentRoot);
    await Promise.all(files.map((f) => scanFile(f)));
  } catch {
    /* missing content dir — leave hits as config-only */
  }

  return hits;
}

/** 依据子进程聚合输出与生成的站点路径，推导 validate 阶段诊断条目 */
export async function classifyValidateFailure(
  siteSlug: string,
  repoRoot: string,
  stderrOrAll: string,
): Promise<PipelineDiagnosticError[]> {
  const textRaw = stderrOrAll;
  const norm = flattenMessage(stderrOrAll);

  const primary: PipelineDiagnosticError[] = [];

  if (matchLocaleMismatch(norm, textRaw)) {
    primary.push({
      scope: "validate",
      type: "locale-mismatch",
      message:
        "Locale coverage or default locale does not match configured locales (check site.config multilingual fields vs locales[]).",
      detail: truncate(stripNoise(textRaw)),
    });
  }

  if (matchMissingPage(norm)) {
    primary.push({
      scope: "validate",
      type: "missing-page",
      message:
        'Missing locale page directory or missing homepage slug "/" — ensure content/<locale>/pages exists and defines "/".',
      detail: truncate(stripNoise(textRaw)),
    });
  }

  if (matchSchema(norm, textRaw) && siteSlug.length > 0) {
    primary.push({
      scope: "validate",
      type: "schema-error",
      message:
        "Zod/schema validation failed (site.config.ts SiteConfigShape or Page JSON Shape). Inspect path hints in detail.",
      detail: truncate(stripNoise(textRaw)),
    });
  }

  const siteDir = join(repoRoot, "sites", siteSlug);
  let tokenFiles: string[] = [];
  try {
    await access(siteDir);
    tokenFiles = await findTemplateTokenResidue(siteDir);
  } catch {
    /* scaffold directory missing — skip residue scan */
  }

  const merged: PipelineDiagnosticError[] = [...primary];

  if (tokenFiles.length > 0) {
    merged.push({
      scope: "validate",
      type: "token-residue",
      message:
        "Unresolved template placeholders '{{…}}' still present — pipeline token substitution incomplete or manual edit corrupted tokens.",
      detail: tokenFiles.join("\n"),
    });
  }

  if (primary.length === 0 && tokenFiles.length === 0 && textRaw.trim().length > 0) {
    merged.push({
      scope: "validate",
      type: "unknown",
      message: "Validation failed — see detail for subprocess output.",
      detail: truncate(stripNoise(textRaw)),
    });
  }

  return merged;
}

/** 判定 build-site 失败属于数据链路还是 Astro/Vite 运行时 */
export function classifyBuildFailure(stderrOrAll: string): PipelineDiagnosticError[] {
  const textRaw = stderrOrAll;
  const norm = flattenMessage(stderrOrAll);

  const dataSignals =
    /failed to load site\b|failed to validate site\b|site config not found\b|missing homepage\b|pages directory not found\b|failed to load page\b|\bzod\b|siteconfigschema|pageschema|\bvalidation\b|\bparse\b.*\b(json|typescript)\b|\bcopysiteassets\b|\bloadsite\b/i.test(
      textRaw,
    );

  const runtimeSignals =
    /\[vite\]|\bvite\b|\brollup\b|\bastro\b|\besbuild\b|\bpreprocessor\b|cann?ot find module|failed to resolve|UnhandledRejection|\bUnhandled\b\s+error\b|error during build|build failed\b/i.test(
      textRaw,
    );

  const detail = truncate(stripNoise(textRaw));

  if (dataSignals && !runtimeSignals) {
    return [
      {
        scope: "build",
        type: "data-problem",
        message:
          "Failure occurred while loading/validating site data or emitting .generated output (site-core / validators phase).",
        detail,
      },
    ];
  }

  if (runtimeSignals && !dataSignals) {
    return [
      {
        scope: "build",
        type: "runtime-problem",
        message: "Failure in Astro/Vite/bundler or module resolution after data was staged — check theme imports and SSR/client islands.",
        detail,
      },
    ];
  }

  if (dataSignals && runtimeSignals) {
    return [
      {
        scope: "build",
        type: "data-problem",
        message: "Output suggests both configuration/content issues and bundler/runtime issues — inspect detail ordering.",
        detail,
      },
      {
        scope: "build",
        type: "runtime-problem",
        message: "Bundler/theme signals also present.",
        detail: undefined,
      },
    ];
  }

  /** loadSite succeeds then astro dies with terse message — default runtime */
  if (norm.includes("failed to build site") || norm.includes("elifecycle")) {
    return [
      {
        scope: "build",
        type: "runtime-problem",
        message: "Build subprocess failed — treat as runtime/tooling unless detail shows loader/schema strings above.",
        detail,
      },
    ];
  }

  return [
    {
      scope: "build",
      type: "runtime-problem",
      message: "Unclassified build failure — inspect raw log detail.",
      detail,
    },
  ];
}

/** generate（create-site）阶段 */
export function classifyGenerateFailure(stderrOrAll: string): PipelineDiagnosticError[] {
  return [
    {
      scope: "generate",
      type: "generate-error",
      message: "Site scaffold generation failed.",
      detail: truncate(stripNoise(stderrOrAll)),
    },
  ];
}

export function classifyPipelineInvocationFailure(message: string): PipelineDiagnosticError[] {
  return [
    {
      scope: "pipeline",
      type: "invocation-error",
      message,
    },
  ];
}

function stripNoise(s: string): string {
  return s.replace(/^>\s*global-site-factory[^\n]+\n/gm, "").replace(/^pnpm exec tsx[^\n]+\n/gim, "").trim();
}

function truncate(text: string, max = 6000): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}\n… (${text.length - max} characters truncated)`;
}
