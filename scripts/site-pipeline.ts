import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execa, type Result } from "execa";
import {
  type PipelineDiagnosticError,
  classifyBuildFailure,
  classifyGenerateFailure,
  classifyPipelineInvocationFailure,
  classifyValidateFailure,
} from "./site-pipeline-diagnostics.js";
import { requireSiteCliInvocation } from "./site-script-guard.js";

const SITE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type RunnableStageId = "generate-site" | "validate-site" | "build-site";

/** `pnpm site pipeline`（stdout）：一行 JSON — Site Pipeline V1 */
export type SitePipelineResult = {
  siteSlug: string;
  status: "success" | "failed";
  stepFailed?: "generate" | "validate" | "build";
  errors?: PipelineDiagnosticError[];
};

function getRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function captureChildLog(cmd: readonly string[], result: Result): string {
  const head = `exit=${result.exitCode ?? "unknown"}\ncommand: ${cmd.join(" ")}\n`;
  const body =
    typeof result.all === "string" && result.all.length > 0
      ? result.all
      : [result.stderr, result.stdout].filter(Boolean).join("\n");
  return `${head}${body}`;
}

async function runSiteCommand(
  label: RunnableStageId,
  siteCliSubcommand: "create" | "validate" | "build",
  siteSlug: string,
  repoRoot: string,
): Promise<{ ok: true; durationMs: number } | { ok: false; durationMs: number; log: string }> {
  const started = performance.now();
  const argv = ["site", siteCliSubcommand, siteSlug] as const;

  process.stderr.write(`[site-pipeline] → ${label}\n`);

  const result = await execa("pnpm", argv, {
    cwd: repoRoot,
    reject: false,
    all: true,
    preferLocal: true,
  });

  const durationMs = Math.round(performance.now() - started);

  if (result.exitCode !== 0) {
    return { ok: false, durationMs, log: captureChildLog(["pnpm", ...argv], result) };
  }

  return { ok: true, durationMs };
}

function emitPipelineResult(report: SitePipelineResult): void {
  process.stdout.write(`${JSON.stringify(report)}\n`);
}

async function collectErrorsForFailure(
  step: RunnableStageId,
  siteSlug: string,
  repoRoot: string,
  log: string,
): Promise<PipelineDiagnosticError[]> {
  if (step === "generate-site") {
    return classifyGenerateFailure(log);
  }

  if (step === "validate-site") {
    return classifyValidateFailure(siteSlug, repoRoot, log);
  }

  return classifyBuildFailure(log);
}

async function main(): Promise<void> {
  requireSiteCliInvocation("site-pipeline");

  const siteSlug = process.argv[2];
  const repoRoot = getRepoRoot();

  if (!siteSlug) {
    emitPipelineResult({
      siteSlug: "",
      status: "failed",
      errors: classifyPipelineInvocationFailure("Missing site slug. Usage: pnpm site pipeline <siteSlug>"),
    });
    process.stderr.write("Missing site slug. Usage: pnpm site pipeline <siteSlug>\n");
    process.exit(1);
    return;
  }

  if (!SITE_SLUG_PATTERN.test(siteSlug)) {
    emitPipelineResult({
      siteSlug,
      status: "failed",
      errors: classifyPipelineInvocationFailure(
        `Invalid site slug "${siteSlug}". Use lowercase kebab-case (e.g. gamma-energy).`,
      ),
    });
    process.stderr.write(`Invalid site slug "${siteSlug}".\n`);
    process.exit(1);
    return;
  }

  const totalStart = performance.now();

  const gen = await runSiteCommand("generate-site", "create", siteSlug, repoRoot);

  if (!gen.ok) {
    const errs = await collectErrorsForFailure("generate-site", siteSlug, repoRoot, gen.log);
    emitPipelineResult({
      siteSlug,
      status: "failed",
      stepFailed: "generate",
      errors: errs,
    });
    process.stderr.write(`${gen.log.slice(0, 4000)}${gen.log.length > 4000 ? "\n…" : ""}\n`);
    process.exit(1);
    return;
  }

  const val = await runSiteCommand("validate-site", "validate", siteSlug, repoRoot);

  if (!val.ok) {
    const errs = await collectErrorsForFailure("validate-site", siteSlug, repoRoot, val.log);
    emitPipelineResult({
      siteSlug,
      status: "failed",
      stepFailed: "validate",
      errors: errs,
    });
    process.stderr.write(`${val.log.slice(0, 4000)}${val.log.length > 4000 ? "\n…" : ""}\n`);
    process.exit(1);
    return;
  }

  const build = await runSiteCommand("build-site", "build", siteSlug, repoRoot);

  if (!build.ok) {
    const errs = await collectErrorsForFailure("build-site", siteSlug, repoRoot, build.log);
    emitPipelineResult({
      siteSlug,
      status: "failed",
      stepFailed: "build",
      errors: errs,
    });
    process.stderr.write(`${build.log.slice(0, 4000)}${build.log.length > 4000 ? "\n…" : ""}\n`);
    process.exit(1);
    return;
  }

  const durationMsTotal = Math.round(performance.now() - totalStart);
  emitPipelineResult({ siteSlug, status: "success" });
  process.stderr.write(`[site-pipeline] done: success (${durationMsTotal}ms)\n`);
  process.exit(0);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  emitPipelineResult({
    siteSlug: process.argv[2] ?? "",
    status: "failed",
    errors: classifyPipelineInvocationFailure(message),
  });
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
