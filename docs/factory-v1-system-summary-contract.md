# SYSTEM SUMMARY CARD — v1 PRECISION CONTRACT

**Status:** FACTORY v1 Architecture Freeze — normative contract for operators and automated agents.  
**Audience:** cold start / context handoff. **Non-goals:** new features, refactors, or implementation narration.

---

## PURPOSE

- The repository **must** be treated as a **multi-tenant static corporate-site generation platform**: many independent **technical site instances** under one codebase.
- **Factory operations** are defined as: scaffold, validate, materialize build inputs, orchestrate static export, and repo-wide batch/clean — **only** through **ENTRY CONTRACT** below.
- **Legal entity, brand, and registered business facts** **must** be modeled as **site configuration and content data**, not as identifiers in routing or directory names.
- **Business continuity** in v1 **must** default to **maintenance-mode evolution** (additive, non-destructive) unless an explicit v2 decision exists per maintenance governance.

---

## BOUNDARY

- **Factory Layer (`pnpm site` + `packages/site-core` + `packages/validators` + `sites/` + orchestrated scripts)** **must** own: reading site sources, validation, emitting **`.generated` payloads**, driving the static export step, and declaring the supported CLI surface.
- **Runtime Layer (`apps/site-builder`)** **is defined as** the Astro/Vite/React island static renderer: it **must** consume **only** `apps/site-builder/.generated/` (plus build-copied public assets) as site-bound input. It **must not** be equated with Factory; package-local `build`/`dev` scripts **must not** be documented as peers of `pnpm site`.
- **Edge Runtime (repo root `functions/`)** **is defined as** deploy-time HTTP handlers (e.g. Pages Functions). It **must not** be treated as Factory; it **must not** substitute for `pnpm site` in product or partner documentation.
- **Dev Tooling (`pnpm lint`, `pnpm typecheck`, etc.)** **must** be understood as **repository health checks**, not as site-generation contracts; they **may** run alongside Factory builds but **must not** replace `pnpm site` semantics.

---

## MODEL

### 3.1 Technical site instance (`siteSlug`)

- **`siteSlug`** **is defined as** a **technical site instance identifier** (ASCII **kebab-case**, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`).
- **`siteSlug`** **must not** be interpreted as a **legal company**, **sole tradename**, or **unique business key**. Corporate identity **must** live in structured config fields (e.g. `company.*`, `domain`, registry rows for humans).
- The on-disk instance root **`sites/<siteSlug>/`** **must** match **`slug`** in that instance’s validated site config **byte-for-byte**.

### 3.2 Locales

- **Supported locales** **are defined as** the **`locales` array** and **`defaultLocale`** in the validated site configuration — **not** as a fixed pair `en`/`zh`.
- Each locale string **must** match **`^[a-z]{2}(?:-[A-Z]{2})?$`** (examples: `en`, `zh`, `en-US`).
- **`defaultLocale` must** be an element of **`locales`**.
- **Content paths** **must** exist per declared locale: `sites/<siteSlug>/content/<locale>/pages/…` **must** be populated for every locale in **`locales`** for pages that instance ships.
- **URL shape** **is defined as**: default locale **without** `/<locale>` prefix; non-default locales **with** `/<locale>/…` prefix derived from configured locale codes — **not** from an assumed `zh` segment.

### 3.3 Pipeline vs incremental work (new vs existing)

- **`pnpm site pipeline <siteSlug>`** **is defined as** the **greenfield instance path**: ordered stages **`create` → `validate` → `build`**, with machine-readable summary on **stdout** (see **RUNTIME CONTRACT · Pipeline machine output**).
- **`create` semantics** **must** **refuse** overwriting an existing `sites/<siteSlug>/` directory. Therefore an **already materialized** instance **must not** use **`pipeline`** as the routine edit loop.
- **Ongoing work on an existing instance** **must** use **`pnpm site validate <siteSlug>`** and **`pnpm site build <siteSlug>`** (and registry/content edits as required by workflow docs). **`pipeline`** **must not** be advertised as the default daily entry for existing instances.

### 3.4 Themes & sections

- A **theme** **is defined as** a replaceable visual system keyed by **`site.config.ts` → `theme`** and registered in theme contracts; themes **must not** embed site-specific names, contacts, or navigation lists.
- A **section type** **is defined as** a `validators`-backed discriminated content shape consumed by **`SectionRenderer`** dispatch. Missing theme support **must** degrade to a safe fallback — **not** to build failure.

---

## ENTRY CONTRACT

- The **only supported external entry** for Factory operations **is**: **`pnpm site <subcommand> …`**.
- **Subcommands with `<siteSlug>`** **must** be: `create`, `validate`, `build`, `pipeline`.
- **Global subcommands** **must** be: `build-all`, `clean` — **without** trailing arguments.
- Internal script execution **must** be gated: Factory scripts **must** run only when **`SITE_FACTORY_FROM_SITE_CLI=1`** is set by that entry (or when **DEBUG CHANNEL** explicitly allows otherwise).

---

## WORKFLOW

### 5.1 New technical site instance

- A new instance **must** be created through **`pnpm site pipeline <siteSlug>`** (or **`pnpm site create`** followed by **`validate`** then **`build`**) — **not** by duplicating another `sites/<other>/` tree by hand.
- Registry rows and naming rules for humans **must** be updated per workspace governance **before or during** creation.

### 5.2 Existing technical site instance

- Changes **must** stay under **`sites/<siteSlug>/`** for site data unless a **framework change** is explicitly approved; after edits, **`pnpm site validate <siteSlug>`** then **`pnpm site build <siteSlug>`** **must** pass for shippable intent.

### 5.3 Repository-wide

- **`pnpm site build-all`** **must** be used to validate **all** instances build in batch maintenance scenarios.
- **`pnpm site clean`** **must** be understood as clearing agreed generated/intermediate outputs (e.g. `.generated`, `dist` targets per script contract) — **not** as deleting `sites/`.

---

## DATA CONTRACT

- **Site source of truth** **is defined as** `sites/<siteSlug>/site.config.ts` and **`sites/<siteSlug>/content/<locale>/pages/*.json`**, plus **`sites/<siteSlug>/assets/`** for instance-owned binaries, subject to **`packages/validators`** schemas.
- **Runtime input bundle** for **`@factory/site-builder`** **is defined as** fresh content under **`apps/site-builder/.generated/`**: at minimum **`site.json`** (validated config) and **`pages.json`** (pages keyed by locale). That directory tree **must** be **treated as ephemeral output** — **never** hand-edited.
- **Public asset paths in content** **must** reference **`/assets/…`** only (site build **must** materialize instance assets into the export’s asset root).
- **Static export output** for an instance **is defined as** **`dist/sites/<siteSlug>/`** after a successful **`pnpm site build <siteSlug>`**.

### Site reads

- **All** loading of `sites/<siteSlug>/` for validation and build **must** go through **`@factory/site-core`** (`loadSite` and related exports). **`apps/site-builder` must not** read `sites/` directly.

---

## RUNTIME CONTRACT

### 7.1 Static renderer (`apps/site-builder`)

- **`apps/site-builder`** **must** render from **`.generated`** + copied public assets only.
- **Theme selection** **must** be data-driven from **`site.json`**; **slug-based branching in renderer code** **must not** occur for per-instance behavior.

### 7.2 Pipeline machine output

- On **`pnpm site pipeline`**, the **last line of stdout** **must** be a single JSON object **`SitePipelineResult`**:
  - **`siteSlug`**: string  
  - **`status`**: `"success"` \| `"failed"`  
  - **`stepFailed`** (when failed): **`"generate"`** \| **`"validate"`** \| **`"build"`**  
  - **`errors`**: optional structured diagnostics array when failed  
- Human-oriented progress **may** appear on **stderr**; consumers **must** treat **stdout’s final JSON line** as the contract.

### 7.3 Edge (`functions/`)

- HTTP endpoints under **`functions/`** **must** be treated as **deployment/runtime** concerns (e.g. **`/api/lead`**), **not** as Factory CLI capabilities. Secrets **must** come from environment bindings — **not** from themes or site copy.

---

## SYSTEM RULES

- **v1 maintenance** **must** prefer **additive** schema/theme/content changes; **breaking** renames or reshapes **must** trigger **explicit v2 / migration governance**, not silent drift.
- **A second public Factory CLI** at repo root **must not** be introduced as a peer to **`pnpm site`**.
- **The Factory pipeline’s stage order and machine-readable result shape** **must not** change without a **versioned / v2-level** decision.
- **Database-backed CMS, generic database requirement, Next.js (or a second SSG framework), Tailwind as mandatory styling**, and **GitHub Actions as the primary site build path** **must not** be introduced as **v1 defaults** (per repository No-Go policy).
- **Customer PII** in lead handlers **must not** be logged to consoles or third-party sinks by default.

---

## EXTENSION RULES

- Any new **section type** or cross-cutting theme capability **must** update: **`packages/validators` union**, **every active theme** (real or safe fallback), **theme exports**, **`SectionRenderer` dispatch**, and **theme documentation/registries** — **in one coherent framework change**, **not** as a one-off site hack.
- **Per-instance behavior** **must** be expressed via **schema-backed config or section fields**, **not** via **`siteSlug` conditionals** in shared packages.

---

## DEBUG CHANNEL

- **`SITE_FACTORY_ALLOW_DIRECT_SCRIPTS=1`** **is defined as** the **only** escape hatch to run internal scripts outside **`pnpm site`** — for **debug / maintenance**, **not** for production or partner docs.
- Production CI, onboarding playbooks, and customer-facing runbooks **must** document **only** **`pnpm site …`**.

---

*See also `docs/factory-v1-final-spec.md`, `docs/factory-v1-maintenance-governance.md`, and `docs/site-and-theme-workflow.md`.*
