# Stream Module (rename Config + absorb api) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the shallow `config` + `api` split with a single deep `Stream` module (document schema/serde/validation + load/save I/O), mirroring the `Catalog` leaf pattern.

**Architecture:** `git mv` `src/core/config/` → `src/core/stream/`, move stream HTTP client + mock into that folder, export `export * as Stream from './stream/index.js'`, delete `src/core/api/`. Product language: **Stream** = persisted Formata blueprint document only (not a runtime stream instance). App remains the composition root; Catalog stays a dependency leaf used by stream validation.

**Tech Stack:** Bun, Vitest (`bun run test`), TypeScript, AJV JSON Schema (`json-schema-to-ts`), `true-myth` Task/Result, Svelte 5 (`$core` path alias), YAML via existing `serde.ts`.

## Global Constraints

- ALWAYS use Bun (`bun run test`, not `bun test`; `bun run check` / `bun run build` when verifying).
- NEVER fix eslint perfectionist/sort-order warnings — notify only if they appear.
- Prefer minimal, localized changes; do not refactor workflow UI or Catalog.
- Keep intended DAG: `catalog` ← `stream/validation`; `stream/client` → `stream` validate/serde; `app` → `Catalog` + `Stream` (no `$core` barrel import from inside `stream/` that would cycle — use relative imports like Catalog).
- Stream means **blueprint document** in formata-arch; do not model process/stream-instance runtime.
- Preserve localStorage key `'formata-config'` and nested property `appData.config` (draft shape) to avoid wiping in-progress builder drafts — type becomes `Stream.Data`, key name stays.
- Do not commit unless the user asks; commits in this plan are optional checkpoints when the user wants them.
- Parent Attesta submodule bump / embed rebuild is **out of scope** for this plan (note at end only).

## File structure (target)

```
src/core/stream/
  schema.ts              # AJV document schema ($id formata-arch/stream, $defs.Data)
  types.ts               # Data, Step, Substep, Dpp, Organization, Role
  serde.ts               # serialize / deserialize YAML
  validation.ts          # validate / isData (Catalog categories option)
  utils.ts               # getEntitySchema / createTestSample
  client.ts              # load(id) / save(data, streamId?, newFlag?)
  index.ts               # re-export all of the above
  stream.sample.yaml     # YAML fixture (was config.sample.yaml)
  stream.mock.json       # HTTP wire mock (was api/stream.mock.json)
  schema.test.ts
  serde.test.ts
  validation.test.ts
  index.test.ts          # smoke: load uses mock in DEV path / parse via validate

src/core/index.ts        # export * as Stream; remove Config
src/core/api/            # DELETED
```

**Export surface (callers use `import { Stream } from '$core'`):**

| Export | Meaning |
|--------|---------|
| `Stream.Data` | Full blueprint document (was `Config.Config`) |
| `Stream.Step` / `Substep` / `Dpp` / `Organization` / `Role` | Nested document types |
| `Stream.Schema` | AJV schema object |
| `Stream.validate` / `serialize` / `deserialize` | Document ops |
| `Stream.getEntitySchema` / `createTestSample` / `isData` | Helpers |
| `Stream.load(id)` / `Stream.save(data, streamId?, newFlag?)` | HTTP I/O (was `loadStream` / `saveStream`) |

---

### Task 1: Move `config/` → `stream/` and rename sample fixture

**Files:**
- Move: `src/core/config/**` → `src/core/stream/**` (git mv)
- Rename: `src/core/stream/config.sample.yaml` → `src/core/stream/stream.sample.yaml`
- Modify: every test/helper in `src/core/stream/` that references `config.sample.yaml`
- Modify: `src/core/index.ts` (temporary: still export as `Config` from new path so the tree stays green mid-refactor — Task 3 renames the barrel)

**Interfaces:**
- Consumes: existing config module behaviour unchanged
- Produces: files live under `src/core/stream/`; sample path is `stream.sample.yaml`

- [ ] **Step 1: Move the directory with git**

```bash
cd /Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/attesta/server/cmd/server/formata-arch
git mv src/core/config src/core/stream
git mv src/core/stream/config.sample.yaml src/core/stream/stream.sample.yaml
```

- [ ] **Step 2: Update fixture path strings inside the moved tests**

In these files, replace `config.sample.yaml` with `stream.sample.yaml` (URL + error messages):

- `src/core/stream/schema.test.ts`
- `src/core/stream/serde.test.ts`
- `src/core/stream/validation.test.ts`

Also update `src/core/app/app.test.ts` sample loader:

```typescript
const url = new URL('../stream/stream.sample.yaml', import.meta.url);
// ...
throw new Error('failed to load stream.sample.yaml');
```

And change its serde import:

```typescript
import { deserialize } from '../stream/serde.js';
```

- [ ] **Step 3: Point the core barrel at the new folder (keep name `Config` for now)**

`src/core/index.ts`:

```typescript
export * as Catalog from './catalog/index.js';
export * as Config from './stream/index.js';
export * as Form from './form/index.js';
```

- [ ] **Step 4: Fix deep imports that still say `$core/config`**

Replace `$core/config/` with `$core/stream/` in:

- `src/core/workflow/workflow-tree.svelte.ts`
- `src/core/workflow/workflow-tree.types.ts`
- `src/core/workflow/workflow-editor.svelte`
- `src/core/workflow/step-form.svelte`
- `src/core/workflow/substep-form.svelte`
- `src/core/workflow/state.svelte.ts`
- `src/core/workflow/components/substep-formata.svelte`

Example:

```typescript
import type { Step, Substep } from '$core/stream/types.js';
```

- [ ] **Step 5: Run tests — expect green**

```bash
bun run test
```

Expected: all tests PASS (same behaviour, new paths).

- [ ] **Step 6: Commit (only if user asked)**

```bash
git add -A src/core docs/superpowers/plans/2026-07-28-stream-module.md
git commit -m "$(cat <<'EOF'
refactor(core): move config package to stream/

Keep Config barrel alias temporarily; sample fixture renamed to stream.sample.yaml.
EOF
)"
```

---

### Task 2: Absorb `api` into `stream/client.ts`

**Files:**
- Create: `src/core/stream/client.ts`
- Create: `src/core/stream/index.test.ts` (client smoke via validate + mock import)
- Move: `src/core/api/stream.mock.json` → `src/core/stream/stream.mock.json`
- Modify: `src/core/stream/index.ts`
- Modify: `src/core/app/app.svelte.ts`, `src/core/app/app.test.ts`
- Delete: `src/core/api/client.ts`, `src/core/api/index.ts`, `src/core/api/` (empty)

**Interfaces:**
- Consumes: `validate`, `serialize` from stream module; `createDevAwareFetcher` / `fetchJsonTask` / `fetchTask` / `ValidationError` from `$core/utils/fetch.js`
- Produces:
  - `load(id: string): Task.Task<Data, Error>`
  - `save(data: Data, streamId?: string, newFlag?: boolean): Task.Task<void, Error>`

- [ ] **Step 1: Write the failing client contract test**

Create `src/core/stream/index.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import streamMock from './stream.mock.json' with { type: 'json' };
import { validate } from './validation.js';

describe('stream.mock.json', () => {
	it('validates as a stream document (AJV, no taxonomy option)', () => {
		const result = validate(streamMock);
		expect(result.isOk).toBe(true);
	});
});
```

- [ ] **Step 2: Run test — expect FAIL (missing mock at new path)**

```bash
bun run test -- src/core/stream/index.test.ts
```

Expected: FAIL resolving `./stream.mock.json` (file not at new path yet).

- [ ] **Step 3: Move mock + add client + export it**

```bash
git mv src/core/api/stream.mock.json src/core/stream/stream.mock.json
```

Create `src/core/stream/client.ts` (adapt from old api client; use relative validate/serialize; type `Data` once Task 3 lands — for this task still import `Config` type name from `./types.js` as `Config` until Task 3):

```typescript
import {
	createDevAwareFetcher,
	fetchJsonTask,
	fetchTask,
	ValidationError
} from '$core/utils/fetch.js';
import * as Task from 'true-myth/task';

import { serialize } from './serde.js';
import type { Config } from './types.js';
import { validate } from './validation.js';
import streamMockData from './stream.mock.json' with { type: 'json' };

export function load(id: string): Task.Task<Config, Error> {
	return fetchJsonTask(
		`/my/organization/formata-builder/stream/${id}`,
		(payload: unknown) => validate(payload).mapErr(ValidationError.fromAjv),
		undefined,
		createDevAwareFetcher(() => streamMockData)
	);
}

export function save(
	config: Config,
	streamId?: string,
	newFlag?: boolean
): Task.Task<void, Error> {
	return Task.fromResult(serialize(config))
		.andThen((c) => {
			const url = new URL('/my/organization/formata-builder', window.location.origin);
			if (streamId) {
				url.searchParams.set('stream', streamId);
			}
			if (newFlag) {
				url.searchParams.set('new', 'true');
			}
			return fetchTask(
				url,
				{ method: 'POST', body: c },
				createDevAwareFetcher(() => console.log(url, c))
			);
		})
		.map(() => undefined);
}
```

Update `src/core/stream/index.ts`:

```typescript
export * from './schema.js';
export * from './serde.js';
export * from './types.js';
export * from './utils.js';
export * from './validation.js';
export * from './client.js';
```

- [ ] **Step 4: Switch App off `$core/api` onto Stream client**

In `src/core/app/app.svelte.ts`:

```typescript
import { Catalog, Config } from '$core';
// remove: import { loadStream, saveStream } from '$core/api/index.js';
```

Replace calls:

```typescript
const res = await Config.load(streamId);
// ...
await Config.save(this.buildConfig(), this.#editData?.streamId, this.#editData?.new).match({
```

In `src/core/app/app.test.ts`, replace the api mock:

```typescript
vi.mock('$core/stream/client.js', () => ({
	load: () => Task.reject(new Error('unexpected Stream.load')),
	save: () => Task.resolve(undefined)
}));
```

Remove any remaining `$core/api` imports/mocks.

- [ ] **Step 5: Delete the api package**

```bash
rm src/core/api/client.ts src/core/api/index.ts
rmdir src/core/api
```

Confirm nothing still imports `$core/api`:

```bash
rg '\$core/api|core/api' src || true
```

Expected: no matches.

- [ ] **Step 6: Run targeted + full tests**

```bash
bun run test -- src/core/stream/index.test.ts src/core/app/app.test.ts
bun run test
```

Expected: PASS.

- [ ] **Step 7: Commit (only if user asked)**

```bash
git add -A src/core
git commit -m "$(cat <<'EOF'
refactor(stream): absorb api client into Stream module

load/save live next to schema/serde; delete thin api package.
EOF
)"
```

---

### Task 3: Rename `Config` type/barrel to `Stream` / `Data`

**Files:**
- Modify: `src/core/stream/types.ts`
- Modify: `src/core/stream/schema.ts` (`$id`, `$defs.Config` → `$defs.Data`, root `$ref`)
- Modify: `src/core/stream/validation.ts` (`isConfig` → `isData`, `Config` type → `Data`)
- Modify: `src/core/stream/serde.ts`, `utils.ts`, `client.ts` (type names)
- Modify: `src/core/stream/*.test.ts` (variable names optional; types must compile)
- Modify: `src/core/index.ts` (`export * as Stream`)
- Modify: all `Config.` call sites → `Stream.`
- Modify: `src/core/app/utils.ts` (`DEFAULT_CONFIG: Stream.Data`)
- Modify: `src/routes/dpp.svelte`

**Interfaces:**
- Consumes: Task 1–2 file layout + `load`/`save`
- Produces: public namespace `Stream` with `Stream.Data` (not `Stream.Config`)

- [ ] **Step 1: Update schema `$id` and `$defs` root name**

In `src/core/stream/schema.ts`:

- Change `$id: 'formata-arch/config'` → `$id: 'formata-arch/stream'`
- Rename `$defs.Config` key to `$defs.Data`
- Change root `$ref: '#/$defs/Config'` → `$ref: '#/$defs/Data'`

`getEntitySchema` uses `keyof typeof Schema.$defs` — after this, pass `'Data'` only if something requested the root entity schema; existing `getEntitySchema('Dpp')` stays valid.

- [ ] **Step 2: Rename the TypeScript document type**

`src/core/stream/types.ts`:

```typescript
import type { FromSchema } from 'json-schema-to-ts';

import type { Schema } from './schema.js';

export type Data = FromSchema<typeof Schema>;

export type Step = Data['workflow']['steps'][number];

export type Substep = Step['substeps'][number];

export type Dpp = Data['dpp'];

export type Organization = Data['organizations'][number];

export type Role = Data['roles'][number];
```

- [ ] **Step 3: Update validation / serde / utils / client to `Data` / `isData`**

`validation.ts`: import `Data`, rename `isConfig` → `isData`, `validate` returns `Result<Data, ErrorObject[]>`.

`serde.ts`:

```typescript
export function serialize(config: Data): Result<string, Error> { /* unchanged body */ }

export function deserialize(str: string): Result<Data, Error> { /* unchanged body */ }
```

Update comments: say “stream document”, not “AttestaConfig”.

`utils.ts`: `createTestSample(): Data` (fix `import * as Config from './types.js'` — import `type { Data }`).

`client.ts`: `Task.Task<Data, Error>`; parameter `data: Data` on `save`.

- [ ] **Step 4: Switch core barrel to `Stream`**

`src/core/index.ts`:

```typescript
export * as Catalog from './catalog/index.js';
export * as Stream from './stream/index.js';
export * as Form from './form/index.js';
```

- [ ] **Step 5: Update all `Config` namespace call sites**

Replace `import { Catalog, Config }` / `Config.` with `Stream` in:

- `src/core/app/app.svelte.ts` — `Stream.Data`, `Stream.validate`, `Stream.Organization`, `Stream.Role`, `Stream.load`, `Stream.save`, `Stream.deserialize`, `Stream.serialize`
- `src/core/app/utils.ts` — `DEFAULT_CONFIG: Stream.Data` (keep constant name for now; Task 4 can rename)
- `src/routes/dpp.svelte` — `Stream.Dpp`, `Stream.getEntitySchema('Dpp')`
- `src/core/stream/schema.test.ts` — `import * as Stream from './schema.js'` or keep local `import { Schema }`; fix `Config.Schema` → `Schema` / `Stream.Schema` as appropriate
- `src/core/stream/utils.ts` — drop any `Config.Config` leftover
- `src/core/config/...` — should not exist

Keep deep type imports as `$core/stream/types.js` (already Stream folder).

`appData` stays:

```typescript
export const appData = lsSync<{ config: Stream.Data }>('formata-config', {
	config: DEFAULT_CONFIG
});
```

- [ ] **Step 6: Run typecheck + tests**

```bash
bun run check
bun run test
```

Expected: check has no errors; all tests PASS.

- [ ] **Step 7: Commit (only if user asked)**

```bash
git add -A src
git commit -m "$(cat <<'EOF'
refactor(core): rename Config namespace to Stream.Data

Align document module naming with Catalog.*; schema $id formata-arch/stream.
EOF
)"
```

---

### Task 4: Align App method names with Stream vocabulary (thin cleanup)

**Files:**
- Modify: `src/core/app/app.svelte.ts`
- Modify: `src/core/app/utils.ts` (`DEFAULT_CONFIG` → `DEFAULT_STREAM`)
- Modify: `src/core/app/app.test.ts`
- Modify: `src/core/workflow/components/category-select.helpers.test.ts`
- Modify: `src/routes/save.svelte`
- Modify: `src/routes/workflow.svelte`
- Modify: `src/routes/_sidebar.svelte`
- Modify: `src/core/workflow/workflow-tree.svelte.ts` (only `app.configErrors` reads)

**Interfaces:**
- Consumes: `Stream.*` from Task 3
- Produces App surface:
  - `errors` (was `configErrors`)
  - `build(): Stream.Data` (was `buildConfig`)
  - `save(): Promise<void>` (was `saveConfig`)
  - `importFromString(text: string): void` (was `importConfigFromString`)
  - `getSerialized(): ReturnType of Stream.serialize` (was `getSerializedConfig`)
  - `DEFAULT_STREAM` (was `DEFAULT_CONFIG`)
  - Unchanged: `appData.config`, LS key `'formata-config'`, `canSave`

- [ ] **Step 1: Rename exports in `utils.ts` and update tests that import them**

```typescript
import { Stream } from '$core';

export const DEFAULT_STREAM: Stream.Data = {
	workflow: {
		name: 'Workflow',
		description: 'Workflow description',
		steps: []
	},
	organizations: [],
	roles: [],
	dpp: {
		enabled: false,
		gtin: '',
		lotInputKey: '',
		lotDefault: '',
		serialInputKey: '',
		serialStrategy: '',
		productName: '',
		productDescription: '',
		ownerName: ''
	}
};
```

Update `app.test.ts` and `category-select.helpers.test.ts` to import `DEFAULT_STREAM`.

- [ ] **Step 2: Rename App members**

In `app.svelte.ts`, rename fields/methods as in Interfaces above. Example save:

```typescript
async save() {
	if (!this.canSave) return;
	this.#state = { type: 'loading' };

	await Stream.save(this.build(), this.#editData?.streamId, this.#editData?.new).match({
		Resolved: () => toast.success('Workflow saved successfully'),
		Rejected: (error) => toast.error(error.message)
	});

	this.#state = { type: 'ready' };
}
```

Derived errors:

```typescript
errors: ErrorObject[] | undefined = $derived.by(() => {
	const res = Stream.validate(appData.config, { categories: this.catalog.categories });
	if (res.isOk) return undefined;
	return res.error;
});

get canSave() {
	return !this.errors;
}
```

- [ ] **Step 3: Update UI call sites**

`src/routes/save.svelte`:

```svelte
const serialized = app.getSerialized();
<!-- ... -->
<Button onclick={() => app.save()} disabled={!app.canSave}>
{#if app.errors}
  {#each app.errors as err, i (i)}
```

`src/routes/workflow.svelte`: `app.configErrors` → `app.errors` (including local `const configErrors = $derived(...)` → `streamErrors` or `errors`).

`src/routes/_sidebar.svelte`: `app.importFromString(text)`.

`src/core/workflow/workflow-tree.svelte.ts`: `app.configErrors` → `app.errors`.

`app.test.ts`: expectations on `app.errors`; describe string can say `errors / canSave`.

- [ ] **Step 4: Run full verification**

```bash
bun run test
bun run check
bun run build
```

Expected: tests PASS; `check` clean; `build` succeeds.

- [ ] **Step 5: Confirm DAG / no leftover Config or api**

```bash
rg -n "from '\\$core/api'|from '\\$core/config'|export \\* as Config|Config\\.Config|loadStream|saveStream|config\\.sample" src || true
rg -n "AttestaConfig|formata-arch/config" src/core/stream || true
```

Expected: no matches (except possibly comments — remove those).

- [ ] **Step 6: Commit (only if user asked)**

```bash
git add -A src
git commit -m "$(cat <<'EOF'
refactor(app): align App save/import APIs with Stream module

Rename configErrors/buildConfig/saveConfig helpers; keep formata-config LS key.
EOF
)"
```

---

### Task 5: Self-review gate (no code unless gaps)

**Files:** none expected

- [ ] **Step 1: Spec coverage checklist**

Confirm each item has a task above:

| Requirement | Task |
|-------------|------|
| Unified Stream module | 1–3 |
| Absorb thin api | 2 |
| Rename config vocabulary | 3–4 |
| Catalog-parallel exports (`Data`, `load`, `save`) | 2–3 |
| Keep Catalog leaf / validation import relative | unchanged pattern in `validation.ts` |
| Dual fixtures JSON+YAML kept, renamed | 1–2 |
| Preserve LS draft key | 3–4 |
| No Catalog/UI redesign | constraints |

- [ ] **Step 2: Note out-of-scope follow-ups (do not implement here)**

- Parent Attesta: bump `formata-arch` submodule SHA after push; `bun run build` in formata-arch if Go `embed` serves the bundle; restart server.
- Optional later: derive `stream.mock.json` from `stream.sample.yaml` in a test helper to DRY fixtures.
- Optional later: migrate `appData.config` → `appData.stream` + LS key (breaking drafts).

---

## Self-review (author)

1. **Spec coverage:** Unified Stream module, api absorption, Config rename, fixture rename, App API align, DAG preserved — all tasked.
2. **Placeholders:** None; concrete paths, signatures, and commands included.
3. **Type consistency:** `Stream.Data`, `Stream.load` / `Stream.save`, App `build` / `save` / `errors` / `DEFAULT_STREAM` used consistently across tasks.

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-07-28-stream-module.md`.

You asked for **inline** execution. Two options remain available if you want to change course:

1. **Subagent-Driven** — fresh subagent per task + review between tasks  
2. **Inline Execution** — execute tasks in this session with checkpoints  

Say **go** (or confirm inline) to start Task 1 in this session.
