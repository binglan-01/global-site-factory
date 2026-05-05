# FACTORY v1 System Contract（Final Contract Version）

本文为 **FACTORY v1** 的系统契约收口：**不扩展能力、不改变架构**，仅将概念、规则与实现备注分层表述。与 [`factory-v1-final-spec.md`](./factory-v1-final-spec.md)、[`factory-v1-maintenance-governance.md`](./factory-v1-maintenance-governance.md) 同属 v1 契约族；条款语义须与二者一致，修订时应同步更新上述文档。

---

## CONTRACT SUMMARY（契约摘要，≤ 1 页）

**IS**：本仓库是一个 **单团队 multi-site 静态官网生产工厂**，面向多个 **技术站点实例** 交付独立产物；**不是**多租户 SaaS、**不是**必选 DB/CMS 驱动的站点平台。

**IS**：**唯一对外、受支持的站点工厂 CLI 接口** 是 `pnpm site`。所有「为新站/存量站生成或校验产物」的官方操作 **必须** 通过 `pnpm site <子命令>` 表达；`lint`、`typecheck`、`apps/site-builder` 内的 `astro` 脚本等 **不得** 被宣称为与 `pnpm site` 等价的工厂入口。

**MUST**：**Factory Layer**（由 `pnpm site` 编排的站点生成侧）**必须** 负责脚手架、校验、聚合站点载荷及写入构建中间产物、触发面向该站点的静态构建编排；**必须** 以 **`packages/site-core`** 作为 **唯一合法** 的 `sites/` 读取与站点源聚合路径（按仓库既定职责）。

**MUST**：**Runtime Layer** **是** `apps/site-builder`（Astro 应用）。**必须** 仅基于约定中间产物（`.generated`）消费站点载荷；**不得** 将 `sites/` 作为其站点数据源。

**MUST**：**Edge Runtime**（仓库根目录 **`functions/`**）**是** 部署边缘能力（如 API），**归属运行时/部署集成**，**不属于** Factory Layer；**不得** 将其表述为 `pnpm site` 的子命令或工厂 CLI 的等价物。

**MUST**：一个 **`siteSlug`** **是** **技术站点实例标识**（小写 kebab-case），通常对应一个独立站点产物与部署单元；**不得** 在契约层将其等同于「法人实体」或法律主体。

**MUST**：语言集合 **由** 各站点配置声明；**必须** 满足已发布校验/schema 规则；**不得** 在契约层假定全仓库固定为 `en`/`zh` 二元组。

**MUST**：**`pnpm site pipeline <siteSlug>` 必须** 语义上等价于依次执行 **`create` → `validate` → `build`**，且 **以 `create` 为第一步**。**存量站点**（`sites/<siteSlug>/` 已存在）的日常变更 **不得** 依赖 `pipeline` 作为默认工作流；**应当** 使用 **`validate` 与 `build`**。**新站脚手架** 方可将 `pipeline` 作为默认一站式入口（在可创建的前提下）。

**MUST NOT（v1 维护期）**：**不得** 引入与 `pnpm site` **平权**的第二条「官方工厂 CLI」；**不得** 在 v1 内另立第二套 pipeline 编排或 **无兼容地** 改写 `pipeline` 的阶段顺序及其机器可读输出契约；**不得** 以 architecture 演进为目的拆分 Factory 为新的顶层宿主而不升级 v2。（更细的允许/禁止矩阵见 FULL SPEC。）

**MUST NOT**：生产文档、交付说明、CI 手册 **不得** 将 **`SITE_FACTORY_ALLOW_DIRECT_SCRIPTS`** 等逃生手段宣称为受支持入口；该机制 **仅是** 排障后门。（详见 FINAL SPEC。）

---

## FULL SPEC（全文规范）

### 1. Conceptual Model（概念层）

以下陈述定义 **心智模型** 与 **跨层语义**；**不** 描述脚本级实现。

| 概念 | IS / 含义 |
|------|-----------|
| **站点工厂（Site Factory）** | IS 在 v1 中即 **Factory Layer**：把「某 `siteSlug` 的站点源」变为「可部署的静态站点产物」这一过程的单入口编排者。 |
| **技术站点实例（`siteSlug`）** | IS 仓库内一个 **独立的站点配置与内容命名空间** 的标识符；可与商业上的「公司/品牌/法人」多对一或一对多；契约层 **不** 绑定法域定义。 |
| **Factory Layer** | IS **编排与数据源侧**：脚手架、校验、经 **唯一合法 `sites/` reader** 聚合、写入约定中间产物、触发构建编排；**通过且仅通过** `pnpm site` 对外。 |
| **Runtime Layer** | IS **`apps/site-builder`**：在 **给定** 站点中间产物的前提下完成 Astro 侧渲染与静态构建；**数据面** **不** 指向 `sites/`。 |
| **Edge Runtime** | IS 根 **`functions/`** 所提供的边缘执行：与浏览器/边缘交互相关的能力；**层次上** 与 Factory CLI **分离**。 |
| **Dev Tooling** | IS `lint` / `typecheck` 等研发质量任务：**语义上** 不参与「某一 `siteSlug` 的产物合同」。 |
| **`.generated` 边界** | IS Factory **向** Runtime **移交**校验后载荷的约定面；Runtime **必须** 只认该约定面（及构建脚本同步的公共资源规则）。 |

**IS NOT**：必选关系型数据库、必选 Headless CMS、多租户隔离平台、与 `pnpm site` 平权的第二官方流水线。

---

### 2. System Contract（规则层）

本节 **必须** 以 `pnpm site` 为 **唯一**对外 CLI 接口来表述工厂能力；子命令名称与职责 **必须与** FINAL SPEC §B 表一致。

#### 2.1 官方 CLI 接口

- **必须（MUST）**：受支持的工厂操作 **仅能** 描述为 `pnpm site create|validate|build|pipeline|build-all|clean` 及其参数语义。
- **必须（MUST）**：`build` **必须** 驱动「写入中间产物 + 触发该站点的 Astro 构建」这一 v1 合同链；业务侧 **不得** 将直接在 `apps/site-builder` 内调用 `astro build` 文档化为官方工厂入口（与 FINAL SPEC §C 一致）。
- **必须（MUST）**：`pipeline` **必须** 保持 **create → validate → build** 的阶段顺序；**不得（MUST NOT）** 在 v1 维护期内无 v2 决议地改写该顺序或 `pipeline` 的机器可读输出契约。

#### 2.2 层次边界

- **必须（MUST）**：**唯一合法** 的 `sites/` 读取（及站点源聚合的既定职责） **必须通过** `packages/site-core` 路径实现；其它包或层 **不得** 在契约上成为并行的站点源 reader。
- **必须（MUST）**：`apps/site-builder` **必须** 将 `.generated`（及仓库已约定的公共资源规则）作为站点数据输入；**不得（MUST NOT）** 将 `sites/` 作为运行时数据源。
- **必须（MUST）**：根 **`functions/`** **必须** 被归类为 **Edge Runtime / 部署集成**；**不得（MUST NOT）** 在文档或产品语义上将其并入 Factory Layer，也 **不得** 视为 `pnpm site` 子命令本体。

#### 2.3 站点身份与语言模型

- **必须（MUST）**：`siteSlug` **必须** 符合仓库已定的小写 kebab-case ASCII 规则；其含义 **是** **技术站点实例**，**不得（MUST NOT）** 在契约文本中等同于单一法人。
- **必须（MUST）**：语言列表与默认语言 **必须** 在各站点的 `site.config.ts`（或等价已支持配置面）中声明，并 **必须** 通过 `packages/validators` 校验；**不得（MUST NOT）** 假设全厂固定仅有 `en` 与 `zh`。
- **应当（SHOULD）**：内容文件 **应当** 按声明的 locale 分目录维护；具体 URL 是否前缀化由 Runtime 配置与路由合同决定（契约层不强制某一 URL 形态）。

#### 2.4 工作流合同（新站 vs 存量站）

- **必须（MUST）**：`pnpm site pipeline <siteSlug>` **必须** 以 **`create` 为首阶段**；若 `sites/<siteSlug>/` **已存在**且 `create` **拒绝覆盖**，则 **不得** 将 `pipeline` 描述为存量站默认工作流。
- **必须（MUST）**：**存量站点** 的配置与内容迭代 **必须** 以 **`pnpm site validate <siteSlug>`** 与 **`pnpm site build <siteSlug>`** 为主路径；二者 **必须** 可用于 **不** 触发脚手架的迭代。
- **应当（SHOULD）**：**应当** 在 **`build` 之前** 完成 **`validate`**，以便在校验失败时 **不** 将无效载荷推入构建。
- **应当（SHOULD）**：**新站** 在目录可创建的前提下 **应当** 可使用 `pipeline` 作为单命令闭环。

#### 2.5 v1 维护期：允许与禁止（与 governance 对齐的契约化表述）

- **允许（MUST be considered allowed in v1）**：对 `packages/validators` 的 **向后兼容** 增量（加可选字段、加可选 union 成员等）；`sites/*/content` 与模板内容更新；**向后兼容** 的 `site.config.ts` 用法；在 **不改变** 「仅从 `.generated` 消费站点」前提下对 `apps/site-builder` 的修复；对根 `functions/` 的修复；依 **既有框架工作流** 对 section/schema/主题的 **加法式** 扩展；一般 **不改变对外契约** 的 bugfix。
- **不得（MUST NOT）**：与 `pnpm site` 平权的新 CLI 入口；第二套 pipeline 或替换 `pipeline` 契约；以架构演进而 **新增** Factory 顶层拆分的默认路线；未升格 v2 的破坏性 config/schema；单站 slug 硬编码分支、绕过 schema 的合同外字段（与 governance 一致）。
- **必须（MUST）**：凡涉及「官方入口、源到产物链路、脚手架/流水线语义」或范式级切换的事项，**必须** 走 **v2 级** 显性决议，而 **不得** 作为 v1 维护期的默认纳入方式。

#### 2.6 非生产入口（逃生）

- **必须（MUST）**：`SITE_FACTORY_ALLOW_DIRECT_SCRIPTS` **必须** 被文档化为 **非生产、非伙伴依赖** 的排障后门；官方交付路径 **必须** 仍仅为 `pnpm site`。

---

### 3. Implementation Notes（实现备注，非规范）

以下内容 **不** 构成对外产品承诺，仅帮助实现者与仓库对齐；**不得** 替代上文规则层。

- **CLI 实现入口**、**具体脚本路径**、**子进程环境变量**（如 `SITE_FACTORY_FROM_SITE_CLI`）以仓库当前代码为准。
- **`locales` 字符串的语法约束**（例如语言/地区子标签格式）以 `packages/validators` 中 **当前** `LocaleSchema` 为准；契约层只要求 **通过校验**。
- **脚手架所用模板目录名**、**`pipeline` 成功时最后一行 stdout 的结构** 属于 **v1 已发布行为** 的细节；变更若影响工具解析，应视为 **契约变更** 并按 FINAL SPEC / governance 升级沟通。
- **`pnpm site build-all` / `clean`** 所清扫或遍历的 **具体目录列表** 以当前脚本行为与 FINAL SPEC 描述为准。

---

*契约文档版本：FACTORY v1 System Contract · Final Contract Version · 与 Architecture Freeze 同步。*
