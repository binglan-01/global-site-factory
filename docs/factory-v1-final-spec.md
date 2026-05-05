# FACTORY v1 FINAL SPEC

**Architecture Freeze**：本仓库站点生成侧架构在 **v1** 阶段视为 **定版**。定版含义是：**不再以「继续结构性拆分」作为默认演进方向**；后续以缺陷修复、内容/主题扩展、小步非破坏式优化为主。若未来需要 v2 级重构，应通过显式 RFC / 版本号升级决策，而非默认持续拆分。

**维护期可操作边界**（允许/禁止变更类型、v2 触发条件、隐性漂移风险）见：**`docs/factory-v1-maintenance-governance.md`**。

---

## A. 官方唯一入口定义

**对外、受支持的站点工厂操作入口仅有：**

```text
pnpm site
```

所有 `create` / `validate` / `build` / `pipeline` / `build-all` / `clean` 均通过 `pnpm site <子命令> …` 调用。实现入口：`tools/site-cli/site.ts`。

---

## B. 支持能力范围（Factory v1）

| 子命令 | 作用 | 典型参数 |
|--------|------|----------|
| `create` | 从模板脚手架落盘 `sites/<siteSlug>/` | `<siteSlug>` |
| `validate` | Zod + `loadSite` 校验配置与页面 JSON | `<siteSlug>` |
| `build` | 写入 `.generated` 并驱动 Astro，产出 `dist/sites/<siteSlug>/` | `<siteSlug>` |
| `pipeline` | `create` → `validate` → `build` 一条龙；stdout 末行结构化 JSON | `<siteSlug>` |
| `build-all` | 对 `sites/` 下目录批量执行 `pnpm site build <slug>` | 无 slug |
| `clean` | 清理生成物与约定的中间目录（如 `.generated`、dist 路径等） | 无 slug |

上述范围即 **v1 FACTORY SPEC 承诺的 CLI 契约**。

---

## C. 明确不属于 Factory 的能力

以下内容 **不属于** 「站点工厂（Factory Layer）」产品入口，不向业务方宣称与 `pnpm site` 等价：

| 能力 | 归属 | 说明 |
|------|------|------|
| `pnpm lint` | Dev Tooling | 仓库/包级代码风格与 ESLint（或等价）任务 |
| `pnpm typecheck` | Dev Tooling | TypeScript / turbo 类型检查 |
| **`astro build`（在 `apps/site-builder` 包内执行）** | Runtime Layer | 静态站点运行时构建；**正常运行路径上由 Factory 在 `pnpm site build` 内间接触发**，不推荐业务人员单独当作「站点工厂官方入口」使用 |

换言之：**工厂负责编排与数据源**；**Astro 是运行时渲染引擎**；**lint/typecheck 是研发质量门禁**——三者分层，互不取代。

---

## 三类边界（v1）

### 1. Factory Layer（站点生成系统）

**职责：** 脚手架、校验、聚合站点数据、`build-all`/`clean`、以及通过 `pnpm site` 暴露的一切。

**边界：**

- 唯一读写入 `sites/<siteSlug>/` 的官方路径：`packages/site-core`（与其它规则一致）。
- 将验证后的载荷写入 `apps/site-builder/.generated/`，再不进入「主题/React 运行时细节」的实现。
- 不引入数据库、不引入 Headless CMS、不把 Next.js 等第二套静态框架并进「官方入口」（与仓库 No-Go 规则一致）。

### 2. Runtime Layer（`apps/site-builder`）

**职责：** 在 **给定 `.generated`** 的前提下，运行 Astro/`vite` **客户端与水合** ，产出静态资源与 HTML。

**边界：**

- **禁止**直接从 `sites/` 或仓库外未约定路径读取站点源；仅以 `.generated`（及构建脚本同步的公共资源）为准。
- `package.json` 中的 `build`/`dev` 等脚本属于 **应用运行时**，不是 **工厂对外 CLI**。
- Cloudflare Functions 若在根目录 `functions/`，归属部署/运行时集成，亦非 `pnpm site` 子命令本体。

### 3. Dev Tooling Layer（lint / typecheck）

**职责：** CI 与人类开发者在合并前验证代码库健康度。

**边界：**

- 不参与「生成某个公司站点产物」的合同；可在流水线中与 `pnpm site build-all` 并列执行，但 **语义上独立**。
- 不改变 Factory CLI 的版本承诺；删除或新增 turbo 任务需单独评估，不叫「 Factory 功能性发布」。

---

## 逃生通道（非生产入口）

### `SITE_FACTORY_ALLOW_DIRECT_SCRIPTS=1`

若干内部脚本（如 `scripts/validate-site.ts`、`scripts/site-pipeline.ts`、`tools/create-site/create-site.ts` 等）在默认情况下要求由 `pnpm site` 子进程注入 `SITE_FACTORY_FROM_SITE_CLI=1` 后方可执行。

设置 **`SITE_FACTORY_ALLOW_DIRECT_SCRIPTS=1`** 可绕过该校验，允许用例如 `pnpm exec tsx scripts/...` **直接调试**。

**必须在文档与心智模型中写明：**

- 这是 **debug / 排障 backdoor**，**不是** 生产环境或合作伙伴应依赖的入口。
- 生产流水线、新员工入职文档、客户交付说明书中 **只允许**写 `pnpm site …`，不得将该环境变量宣称为官方用法。

---

## v1 定版评审结论（回答「能否维护」）

### 当前系统是否可以认为「v1 feature complete」？

**在「多实体静态官网生成」这一产品边界内，可以。** v1 已具备：脚手架、结构化校验、单站构建、流水线、全站构建与清理的单入口闭环；数据源与运行时隔离（`.generated`）清晰。  
**不包含**的事项（如无 DB、无 CMS、无第二套前端框架）属于既有 No-Go / 范畴选择，不叫「未完成功能」，除非路线图显式升级 v2。

### 是否存在结构性风险（非 Bug）？

**存在可接受的、已知的结构性约束（需在维护期内留意，而非当季必拆）：**

1. **流水线与存量站**：`pipeline` 仍以 `create` 为第一步，对已存在的 `sites/<slug>/` 会拒绝覆盖——存量站迭代依赖 `validate`/`build`，而非重新定义 `pipeline` 语义（产品设计层面需对外说明）。
2. **单入口与内部 `pnpm exec tsx`**：工厂内部仍通过 `pnpm exec tsx` 拉起脚本；一致性依赖 `SITE_FACTORY_FROM_SITE_CLI` 与环境约定，演进时需避免新增「绕过 site CLI 的官方文档」。
3. **多云与多端**：仓库假设 Astro 静态导出 + Pages Functions；若未来要多运行时，属于 **架构外扩**，应走 v2 评估而非默认继续拆 v1。
4. **逃生通道**：`SITE_FACTORY_ALLOW_DIRECT_SCRIPTS` 若被写入生产 CI，会形成「隐性第二入口」，属流程风险而非代码缺陷。

### 是否可以进入「稳定维护模式（maintenance mode）」？

**可以。** 在满足以下条件时可声明进入维护模式：

- 新能力默认以「主题 / 内容 / validators 扩展」或「小补丁」交付，**不默认**立项「拆掉 Factory Layer」；
- PR 模板或发布说明中区分 **Factory 契约变更**（少见）与 **站点内容/主题变更**（常见）；
- 任何破坏 `pnpm site` 子命令语义或 `.generated` 契约的改动，按 **minor/major** 或内部「v1.1 / v2」沟通，而非无声迭代。

---

*文档版本：FACTORY v1 FINAL · 与仓库 Architecture Freeze 声明同步。*
