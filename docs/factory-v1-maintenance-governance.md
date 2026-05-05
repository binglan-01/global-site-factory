# v1 Maintenance Mode Governance（维护期治理规范）

本文件与 **`docs/factory-v1-final-spec.md`**（FACTORY v1 FINAL SPEC）配套，约束仓库在 **v1  Architecture Freeze** 下的长期行为：**默认稳定维护**，**不默认继续架构演进**。任何违反本文「禁止清单」的事项须走 **v2 升级决议**（RFC / 路线图 / 破坏性版本沟通），不得在 v1 维护期内「悄悄做成常态」。

---

## 1. v1 Freeze Policy（冻结策略）

### 禁止（v1 维护期内默认不接受）

| 类别 | 说明 |
|------|------|
| **新 CLI 入口** | 不得在根目录 `package.json`（或其它对外文档）新增与 `pnpm site` **平权**的根级脚本或其它「第二代站点流水线入口」。内部实现细节若必须调整，仍需由 `pnpm site` 独占对外语义。 |
| **新 pipeline 编排方式** | 不得引入第二套站点编排语义（例如并行的 `pnpm site-pipeline`、`tools/another-cli`）或改写 `pnpm site pipeline` 的阶段顺序 / 契约（stdout JSON shape、步骤含义），除非升格为 **v2**。 |
| **新 Factory Layer 模块拆分** | 不得为了在 v1「继续演进架构」而把当前 Factory 链路拆成新的顶层包目录、新开独立 Node 服务等（例如再从 `packages/site-core` 拆出多套 loader 宿主）。Bugfix / 在同一包内的小范围重构若以 **不改变对外契约与目录职责** 为前提，可作例外，但必须可审查、可回归。 |

### 允许（v1 维护期默认放行）

| 类别 | 说明 |
|------|------|
| **Schema 字段扩展（向后兼容）** | 在 `packages/validators` 等处以 **可加字段、可加可选 union 成员** 为主；不得依赖「删字段 / 改名 / 必填化旧字段」来推进功能（该类属破坏性演进，触发 v2 评估）。 |
| **模板与站点内容更新** | 见下文 **Content Layer** / **templates**。 |
| **Bugfix** | 行为与契约不变前提下的修正（含运行时、校验误报、脚本边界条件）。 |

---

## 2. 允许的变更类型（Maintenance Allowlist）

### A. Content Layer

- **`sites/*/content/`**  
  - 页面 JSON、`seo`、导航相关文案数据结构（在现行 schema 允许范围内）。
- **`templates/*/content/`**（及模板附属静态 Markdown/JSON）  
  - 仅模板源内容与新站默认文案；**不改变**脚手架工具「复制哪些路径」的顶层设计即属 v1 允许范畴。

不属于 Content Layer：`apps/`、`packages/*` 中为实现新交互而新增的 **流水线或入口**——若仅为填内容则留在 A；若需改工厂形状则按 §3。

### B. Config Layer（向后兼容）

- **`sites/<slug>/site.config.ts`**  
  - **首选**：仅为 **新增**、`defineSiteConfig` / Zod schema 已支持的 **可选** 字段赋值。  
  - **不推荐在 v1 常态化**：删除已有键、改名为技术标识、把原可选改成必填而使旧站失效——此类应归入 **破坏性变更** 并按 v2 / 站内迁移脚本策略处理。
- **validators 中与 config 对齐的 additive 变更**：与 Freeze Policy「schema 向后兼容」一致。

### C. Runtime Fix

- **`apps/site-builder/`**  
  - 在不改变「仅从 `.generated` 消费站点」边界的前提下：**Astro/路由/Vite/React 岛屿** 等缺陷修复与性能微调。
- **`functions/`（根目录）**  
  - 与安全、合规有关的修复；**不等价**于新增第二条 Factory CLI。

### D. Schema & Themes（Additive，须在既有流程内）

- 按 **`70-framework-change-workflow`** 增补 section 类型、主题实现与 `SectionRenderer` 分支：**属于 v1 允许的能力扩展**，因其是「契约内向后兼容加法」，**不是**「新开 Factory Layer 模块拆分」。  
- 禁止：为满足单站而绕过 schema、在渲染层硬编码 slug、或未走 validators 的合同外字段。

---

## 3. 结构性变更必须升级 v2（触发条件）

出现以下任一类（**非穷尽**，同类事项等同处理）即 **不应**仅以「v1 维护 PR」合并，而应启动 **v1 → v2** 的规划与告知：

| 触发域 | 示例 |
|--------|------|
| **CLI 入口** | 新根脚本替代或并列于 `pnpm site`；或将 Cloudflare/OS 层面的「另一条 build 命令」宣称为官方工厂入口。 |
| **pipeline 流程** | 增减阶段、调换顺序、拆分 pipeline 为多命令产品化形态、改写 pipeline 机器可读输出契约且无兼容层。 |
| **模板系统改造** | 多模板选型引擎、运行时拉模板、`create` 语义从「拷贝固定模板」升级为可插拔注册表等 **顶层设计变更**。 |
| **multi-tenant / SaaS 化** | 多租户隔离、远端配置源、计费/租户级特性开关等与当前「单体仓库 + 静态导出」范式根本不同的形态。 |
| **数据源 / 运行时边界破坏** | 例如让 `apps/site-builder` 直接读 `sites/`、引入数据库/Headless CMS 作为必选依赖（与当前 No-Go 及架构边界冲突时视为 v2 范畴）。 |

v2 **未必**要立即开发，但必须 **显性决策**（记录在 RFC、路线图或发行说明），避免 v1 维护分支上无限堆叠隐含架构债。

---

## 4. 输出汇总

### 4.1 v1 维护期允许 / 禁止清单

| | 条目 |
|--|------|
| **✅ 允许** | Content：`sites/*/content`、templates 内容；Config：向后兼容的 `site.config.ts` / Zod additive；Runtime：`apps/site-builder`、根 `functions/` 的 bugfix；按框架流程添加 section/schema/主题；一般 bugfix |
| **❌ 禁止** | 新 CLI 入口；新 pipeline 编排或契约替换；Factory Layer **为架构演进目的**的新拆分；破坏性 config/schema（删改必填无迁移）；多租户/SaaS 化、模板系统顶层设计改造等未升格 v2 的大改 |

### 4.2 v1 → v2 升级触发条件（一句话）

凡 **改变「谁算官方入口」「站点如何从源到静态产物」「脚手架/流水线语义」或引入 **多租户/动态模板/第二套数据源** 等范式级切换，即从 v1 maintenance 跨入 **须单独立项的 v2**。

### 4.3 「隐性结构漂移」风险是否存在？

**存在。** 典型不靠 bug、而靠流程「慢慢变形」：

1. **文档与流水线漂移**：CI 文档写 `pnpm exec tsx` + `SITE_FACTORY_ALLOW_DIRECT_SCRIPTS`，等价第二入口常态化。  
2. **隐性脚本增殖**：根 `package.json` 或脚本目录出现「再给一条 build 某站的路径」，未在评审中与 `pnpm site` 对齐。  
3. **单站特例进核心**：为主题或单公司在 `packages/theme-*`、`SectionRenderer` 写 slug 分支，等同于未经 v2/RFC 的架构腐化（No-Go 已禁，但若执行松懈仍会漂移）。  
4. **Schema「假兼容」**：表面加字段，但实际把旧 JSON 静默失败或必填隐式依赖，造成事实破坏性。  

**缓解**：MR/发布检查清单显性对照本文与 `factory-v1-final-spec`；契约变更单列版本说明；禁止在生产文档中放行 escape hatch。

---

*维护治理版本：FACTORY **v1** · 与 `docs/factory-v1-final-spec.md` 同步维护。*
