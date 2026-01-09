# Project Scaffolding Plan (Source of Truth)

This file defines the step-by-step plan and task list to scaffold the project according to our configuration principles. It is the single source of truth for scope, acceptance criteria, and progress.

## Scope & Decisions

- CI: GitHub Actions (primary), cloud-agnostic deployment posture.
- Runtime: Node 22.x, Yarn Berry 4.12.0 with immutable installs.
- Framework: NestJS (TypeScript), Jest for tests, ESLint + Prettier for quality.

## Assumptions & Prerequisites

- macOS dev environment with git and Node 22 available (via nvm).
- Corepack is available and can be enabled.
- Branch: `chore/scaffolding`.

## High-Level Phases

1. Tooling baseline (Node/Yarn pinning, immutable installs)
2. Repo metadata (EditorConfig, Prettier, .gitignore)
3. `package.json` initialization (scripts, engines, commit tooling)
4. ESLint configuration (type-aware)
5. TypeScript configuration (strict)
6. Jest configuration (unit + e2e, coverage, JUnit)
7. NestJS minimal app scaffold
8. OpenAPI generation script and wiring
9. Husky hooks and commit discipline
10. Dockerization (Dockerfile, docker-compose, .dockerignore)
11. VS Code workspace settings
12. GitHub Actions CI (Quality → Test → Build)
13. Quality gate run
14. Commit and open PR

## Task List (Track Progress Here)

- [x] 1. Set up Yarn Berry + Node engines
  - Deliverables: `.nvmrc (22)`, `.yarnrc.yml` (immutable, nodeLinker node-modules, global cache), pinned Yarn `4.12.0` under `.yarn/releases/`.
  - Acceptance: `corepack enable` works; `yarn -v` matches pinned; `yarn install --immutable` succeeds.
- [x] 2. Create baseline metadata files
  - Deliverables: `.editorconfig`, `.prettierrc`, `.prettierignore`, `.gitignore` per principles.
  - Acceptance: `yarn format:check` runs; ignores align with spec.
- [x] 3. Initialize `package.json`
  - Deliverables: scripts (`lint`, `format`, `format:check`, `type-check`, `test`, `test:cov`, `test:e2e`, `openapi:generate`, `dedupe`, `dedupe:check`, `prepare`, `commitlint`, `commit`), `engines`, `lint-staged`, `commitizen` config.
  - Acceptance: `yarn` scripts visible; `yarn dedupe:check` runs.
- [x] 4. ESLint configuration
  - Deliverables: `eslint.config.mjs` with `@eslint/js`, `typescript-eslint` (type-checked), `eslint-config-prettier`, jest overrides, ignores, key rules.
  - Acceptance: `yarn lint` runs without crashing; type-aware rules apply to `*.ts`.
- [x] 5. TypeScript configuration
  - Deliverables: `tsconfig.json`, `tsconfig.build.json` (CommonJS, ES2022 target, strict true, decorators enabled, `dist` outDir, incremental true; excludes: `test`, `dist`, `**/*spec.ts`).
  - Acceptance: `yarn type-check` passes on baseline code.
- [x] 6. Jest configuration
  - Deliverables: `jest.config.ts`, `jest-e2e.config.ts` with `ts-jest`, coverage (`text`, `lcov`, `cobertura`), JUnit to `coverage/junit.xml`.
  - Acceptance: `yarn test:cov --passWithNoTests` succeeds.
- [x] 7. NestJS minimal app scaffold
  - Deliverables: `nest-cli.json`, `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts`, specs for controller/service.
  - Acceptance: `yarn build` works; unit tests pass; app starts locally.
- [x] 8. OpenAPI generation
  - Deliverables: `scripts/generate-openapi.ts`, `openapi.json`, `openapi:generate` script.
  - Acceptance: Running the script produces a valid `openapi.json` and is idempotent.
- [x] 9. Husky + Git hooks
  - Deliverables: Husky installed via `prepare` and hooks: `commit-msg`, `pre-commit`, `pre-push`, `post-checkout`, `post-commit` as specified.
  - Acceptance: Conventional commits enforced; pre-commit runs openapi generation, lint-staged, type-check, and build (unless WIP).
- [x] 10. Dockerization
  - Deliverables: `Dockerfile` (multi-stage), `.dockerignore`, `docker-compose.yml` with `postgres:16-alpine` and healthcheck; API profiles.
  - Acceptance: `docker build` succeeds; `docker-compose up` brings up Postgres and API (when wired).
- [x] 11. VS Code workspace settings
  - Deliverables: `.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/launch.json` for Nest and Jest debugging.
  - Acceptance: Format on save, ESLint fixes, and launch configs present.
- [x] 12. GitHub Actions CI
  - Deliverables: `.github/workflows/ci.yml` with Quality → Test → Build jobs; Node 22; corepack; immutable installs; artifacts for coverage/junit/dist.
  - Acceptance: Workflow runs on pushes/PRs to `main|master|dev|feat/*|fix/*|chore/*` and passes.
- [x] 13. Quality gate run
  - Deliverables: Local run of `yarn format:check`, `yarn lint`, `yarn type-check`, `yarn test:cov --passWithNoTests`.
  - Acceptance: All commands succeed; no unfixable ESLint errors.
- [x] 14. Commit and open PR
  - Deliverables: Commit(s) on `chore/scaffolding`, PR opened to `dev` (or mainline strategy agreed).
  - Acceptance: CI green on PR; review-ready.

## Approval Checkpoints (Require Confirmation)

- A1: After tasks 1–3 complete (tooling + metadata + package.json), proceed to code scaffold (tasks 4–7)?
- A2: After task 7 (NestJS scaffold) and task 8 (OpenAPI) complete, proceed to hooks and Docker (tasks 9–11)?
- A3: After tasks 9–11 complete, add CI (task 12)?
- A4: After task 12, run quality gate (task 13) and prepare PR (task 14)?

## Execution Notes

- We will update checkboxes here as tasks progress.
- Each approval checkpoint will be requested explicitly before continuing.
