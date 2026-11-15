# Continuous integration

Every pull request, and every push to `dev` or `main`, runs the CI workflow (`.github/workflows/ci.yml`). Runs on the same branch cancel older ones.

| Job | What it checks |
|---|---|
| **Backend · science-api** | Ruff lint and format, mypy strict types, pytest unit and integration tests with coverage of at least 90% |
| **Backend · si-gateway** | Lint, format, types, tests and a bundle build of the Cloudflare Worker |
| **Contracts** | The generated schema files are up to date (`pnpm schemas:check`), then engine and knowledge tests |
| **Frontend** | Lint, format, types, tests and a production build of the web app and every package it depends on |
| **Pipelines** | Lint, types and offline tests for demo-bundle building, fixture capture and ML |
| **Pipelines · dataset store** | The same checks for `pipelines/data_store` |
| **Pipelines · Prithvi** | The same checks for `pipelines/prithvi` |
| **Docker** | The science-api image builds |

## Principles

- **Tests never touch the network.** They use the offline fixtures in `fixtures/` and recorded NASA granule clips.
- **Contracts are checked, not trusted.** Types and validators are generated from `schemas/`; CI fails when a generated file is stale.
- **Each project is locked.** Python projects use `uv sync --locked`, JavaScript uses `pnpm install --frozen-lockfile`.
- **A license gate** lists production dependencies and blocks unapproved licenses ([Legal: third-party notices](../../09-Development/THIRD_PARTY_NOTICES.md)).
- **Dev follows main.** `sync-dev.yml` merges every push to `main` into `dev`, so `dev` is always `main` plus stacked work.

## Related pages

[Testing strategy](../08-Quality/03-testing-strategy.md) · [Release to Cloud Run](02-release-to-cloud-run.md)
