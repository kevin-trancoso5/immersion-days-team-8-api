# Configuration Principles (Scaffold Baseline)

This document captures the default configuration conventions used in this repository so the same baseline can be reused when scaffolding a new project.

## Goals

- Deterministic installs and reproducible builds (local + CI + Docker).
- Fast feedback loops (pre-commit / pre-push automation).
- Consistent code style (Prettier) and code quality (ESLint + type-aware rules).
- Type-safety enforced via `tsc --noEmit`.
- Test baseline with Jest and CI publishing.

## Runtime & Package Manager

### Node.js

- Required engine: Node `>= 22.0.0`.
- CI uses Node `22.x`.

Related pin:

- `.nvmrc` pins major version `22` for local developer tooling.

### Yarn

- Package manager: `yarn@4.12.0` (Berry).
- Use Corepack (`corepack enable`) everywhere (local, CI, Docker).

### Yarn config defaults

From `.yarnrc.yml`:

- `enableImmutableInstalls: true` → installs must be lockfile-consistent.
- `nodeLinker: node-modules` → classic `node_modules` layout (not PnP).
- `enableGlobalCache: true`, `nmMode: hardlinks-global` → faster installs.
- `checksumBehavior: throw` → rejects checksum mismatch.

**Principle:** for any scaffolding, copy `.yarnrc.yml` and commit the pinned yarn release under `.yarn/releases/`.

## TypeScript

### tsconfig baseline

`tsconfig.json` (selected principles):

- CommonJS output (`"module": "CommonJS"`) with Node resolution.
- Target `ES2022`.
- Strict type checking enabled (`strict: true` + `noImplicitAny: true` + `strictNullChecks: true`).
- Decorators enabled (`emitDecoratorMetadata`, `experimentalDecorators`) for NestJS.
- Build output to `./dist`.
- Incremental builds enabled (`incremental: true`).

### Build tsconfig

`tsconfig.build.json`:

- Extends base tsconfig.
- Excludes test sources and build outputs: `test`, `dist`, `**/*spec.ts`.

### Type-check command

- `yarn type-check` runs: `tsc -p tsconfig.json --noEmit`.

**Principle:** treat `yarn type-check` as a required quality gate (pre-commit + CI).

## Formatting (Prettier)

### Rules

From `.prettierrc`:

- Single quotes
- Semicolons
- Trailing commas: `all`
- Print width: `100`
- Tab width: `2`

### Ignore patterns

From `.prettierignore`:

- `node_modules`, `dist`, `coverage`, `.yarn`, `.pnp.*`, logs
- Workspace/editor metadata: `.vscode/*`
- CI/metadata folders: `.github/*`

### Commands

- `yarn format` → `prettier --write .`
- `yarn format:check` → `prettier --check .`

**Principle:** run formatting in hooks/CI as a *check* (CI) and *auto-fix* (developer command).

## Linting (ESLint)

### Config style

- Flat config (`eslint.config.mjs`).
- Combines:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended **type-checked** (applies only to `**/*.ts`)
  - `eslint-config-prettier` to avoid rule conflicts with Prettier

### Ignores

- `dist/**`, `node_modules/**`, `.yarn/**`, `coverage/**`, `commitlint.config.js`

### Key rule principles

TypeScript:

- Unused vars warn, allow underscore-prefixed args: `@typescript-eslint/no-unused-vars`.
- Avoid `any` (warn).
- Promise correctness is enforced:
  - `@typescript-eslint/no-floating-promises`: error
  - `@typescript-eslint/await-thenable`: error
  - `@typescript-eslint/no-misused-promises`: error
  - `@typescript-eslint/return-await`: error in try/catch

Best practices:

- `no-debugger`: error
- `no-console`: warn (allow `console.warn` / `console.error`)
- `prefer-const`, `no-var`, `object-shorthand`, `prefer-template`, `prefer-arrow-callback`: error

Complexity/size guardrails:

- `max-lines-per-function`: warn (max 100, skip blanks/comments)
- `max-depth`: warn (4)
- `complexity`: warn (10)

Tests overrides (`**/*.spec.ts`, `test/**/*.ts`):

- Enables `eslint-plugin-jest` rules.
- Relaxes strict/unsafe rules for test ergonomics.

### Command

- `yarn lint` → `eslint --fix .`

**Principle:** keep lint as an auto-fixing command locally, and run it in CI as-is (will fail if unfixable issues remain).

## Tests (Jest)

### Unit tests

- Config: `jest.config.ts`
- Preset: `ts-jest`
- `testMatch`: `**/**/*.spec.ts`
- Coverage output: `coverage/`
- Coverage reporters: `text`, `lcov`, `cobertura`
- JUnit output: `coverage/junit.xml` via `jest-junit`

Coverage thresholds:

- `coverageThreshold.global` is set to 0 across the board (reporting is enabled; gating is not).
- Note: the repository README mentions a higher minimum coverage threshold, but the current `jest.config.ts` does not enforce it.

### E2E tests

- Config: `jest-e2e.config.ts`
- `testMatch`: `**/test/**/*.e2e-spec.ts`

### Commands

- `yarn test` / `yarn test:watch` / `yarn test:cov`
- `yarn test:e2e`

**Principle:** CI runs `test:cov --passWithNoTests` and publishes junit + coverage artifacts.

## NestJS build

- `nest-cli.json` sets `sourceRoot: "src"` and `deleteOutDir: true`.
- `yarn build` → `nest build`.
- `yarn dev` / `yarn start:dev` run `nest start --watch` with optional env flags.

## Commit discipline

### Commit message linting

- Commitlint config: `commitlint.config.js`
- Extends `@commitlint/config-conventional`.
- Allowed commit types: `feat`, `fix`, `chore`, `wip`.

### Commitizen

- `yarn commit` uses Commitizen (`cz-conventional-changelog`).

**Principle:** enforce conventional commits via commit-msg hook and make the happy path easy via `yarn commit`.

## Git hooks (Husky)

Husky is installed via `yarn prepare` (`"prepare": "husky"`).

### `commit-msg`

- Runs commitlint: `yarn commitlint --edit "$1"`.
- If commit message starts with `wip:`, it writes `.git/SKIP_BUILD_FLAG` to mark WIP mode.

### `pre-commit`

Runs, in order:

1. Generate OpenAPI: `yarn openapi:generate` and auto-format + `git add openapi.json` if updated.
2. Run `yarn lint-staged` (formats + eslint fixes only for staged files).
3. Run `yarn type-check`.
4. If `.git/SKIP_BUILD_FLAG` exists (WIP mode), stop early after type-check.
5. Otherwise, run `yarn build`.

**Principle:** commits are blocked unless code is formatted, linted, type-safe, and buildable; WIP commits are allowed to skip heavier steps.

### `pre-push`

- Validates branch naming:
  - Allowed: `main`, `master`, `dev`, `feat/*`, `fix/*`, `chore/*`
- Prevents pushing WIP commits to protected branches (`main|master|dev`).
- Runs tests: `yarn test --passWithNoTests --bail`.

### `post-checkout`

- Warns if branch name doesn’t follow `feat/*|fix/*|chore/*` (skips warnings for `main|master|dev`).

### `post-commit`

- Deletes `.git/SKIP_BUILD_FLAG`.

## Staged-file automation (lint-staged)

In `package.json`:

- Pattern: `*.{ts,js,json,md,yml,yaml}`
- Commands (in order):
  - `eslint --fix`
  - `prettier --write`

**Principle:** staged changes should be auto-corrected (lint + format) before entering history.

## Dependency hygiene

- `yarn dedupe` and `yarn dedupe:check` are part of standard tooling.
- CI runs `yarn dedupe:check` in the Quality stage.

## CI/CD (Provider-Agnostic)

Use any CI system (e.g., GitHub Actions, GitLab CI, CircleCI). Keep the pipeline simple and deterministic. In this repository, we use GitHub Actions by default; see `.github/workflows/ci.yml`.

### Trigger branches

- `main`, `master`, `dev`, and `chore/*`, `feat/*`, `fix/*`.

### Stages

1. **Quality**

- `yarn dedupe:check`
- `yarn lint`
- `yarn format:check`
- `yarn type-check`

1. **Test** (depends on Quality)

- `yarn test:cov --passWithNoTests`
- Publish JUnit results from `coverage/junit.xml`
- Publish `coverage/` as an artifact (optional)

  Note: E2E tests are configured (`jest-e2e.config.ts`) but are not executed by default in CI.

1. **Build** (depends on Test)

- `yarn build`
- Publish `dist/` as an artifact (optional)

### CI setup basics

- Use Node `22.x`.
- Enable Corepack and use the pinned Yarn release.
- Cache Yarn installs keyed on `yarn.lock`.
- Run `yarn install --immutable`.

**Principle:** CI should use immutable installs and shared caching for speed, regardless of the CI provider.

## Containerization

### Dockerfile

- Multi-stage build:
  - `base` uses `node:22-bookworm-slim` + `corepack enable`.
  - `deps` copies `package.json`, `yarn.lock`, `.yarnrc.yml`, and `.yarn/` then runs `yarn install --immutable` using the pinned Yarn release.
  - `build` copies TS/Nest config + `src/` then runs `yarn build`.
  - `runner` is runtime image:
    - Sets `NODE_ENV` from build arg `MODE` (default `LOCAL`).
    - Runs as non-root `node` user.
    - Exposes `PORT=3000`.
    - Adds a `/health` HTTP healthcheck (requires `curl`).

**Principle:** runtime image contains only `dist`, `node_modules`, and minimal runtime dependencies.

### .dockerignore

From `.dockerignore`:

- Excludes local artifacts and repo-only files from the build context (`node_modules`, `dist`, `.git`, `coverage`, docs, tests, editor configs, CI config, etc.).
- This matches the Dockerfile approach: only `src/` + build config files are needed to build.

### docker-compose

- Provides local `postgres:16-alpine` with healthcheck.
- Provides profiles:
  - `api` for local
  - `api-staging`
  - `api-prod`
- API service depends on Postgres health.

## OpenAPI generation

- `yarn openapi:generate` runs: `ts-node -r tsconfig-paths/register scripts/generate-openapi.ts`.
- `openapi.json` is treated as generated artifact and updated automatically during pre-commit.

**Principle:** keep OpenAPI spec up to date on every commit.

## Editor & whitespace consistency

### EditorConfig

From `.editorconfig`:

- UTF-8, LF endings, final newline required.
- 2-space indentation.
- Trim trailing whitespace (except Markdown).

### VS Code workspace defaults

From `.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/launch.json`:

- Format on save using Prettier (`prettier.requireConfig: true`).
- ESLint auto-fix configured via `source.fixAll.eslint`.
- 100-column ruler (aligns with Prettier `printWidth: 100`).
- Debug profiles for Nest watch+debug and Jest (unit + e2e).

**Principle:** commit `.vscode/` in the scaffold to align the whole team on formatting, linting, and debugging defaults.

## Git ignore policy

From `.gitignore`:

- Yarn Berry: ignore most of `.yarn/*` but keep `.yarn/releases`, `.yarn/plugins`, etc. (ensures the pinned Yarn runtime is versioned).
- Ignore local build/test outputs and env files (`dist`, `coverage`, `node_modules`, `.env*`).

## Scaffold checklist (copy these into a new project)

Minimum files/config to replicate:

- `package.json` (scripts + engines + lint-staged + commitizen config)
- `.yarnrc.yml` + `.yarn/releases/...` + `yarn.lock`
- `.nvmrc` (recommended)
- `.prettierrc`, `.prettierignore`
- `.editorconfig`
- `eslint.config.mjs`
- `tsconfig.json`, `tsconfig.build.json`
- `jest.config.ts`, `jest-e2e.config.ts`
- `commitlint.config.js`
- `.husky/*` hooks and `"prepare": "husky"`
- `.gitignore`
- CI configuration for GitHub Actions (recommended here): `.github/workflows/ci.yml` (or an equivalent for your chosen provider)
- `Dockerfile`, `docker-compose.yml`, `.dockerignore` (if containerized)
- `.vscode/` (recommended for team consistency)

Recommended baseline scripts to keep:

- `lint`, `format`, `format:check`, `type-check`
- `test`, `test:cov`, `test:e2e`
- `dedupe`, `dedupe:check`
- `prepare`, `commitlint`, `commit`
