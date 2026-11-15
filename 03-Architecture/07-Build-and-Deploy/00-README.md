# Build and deploy

Continuous integration, release to Google Cloud Run, the data and ML pipelines, and the Cloudflare and VPS pieces.

[Back to Architecture](../00-README.md)

## Pages

- [Continuous integration](01-continuous-integration.md): Every pull request, and every push to `dev` or `main`, runs the CI workflow (`.github/workflows/ci.yml`). Runs on the same branch cancel older ones.
- [Release to Cloud Run](02-release-to-cloud-run.md): Every push to `main` runs `.github/workflows/release.yml`. It builds two container images, pushes them to Artifact Registry and deploys two Cloud Run services in `europe-west1`: `itza-science-api` first, then `itza-web`.
- [Data and ML pipelines](03-data-and-ml-pipelines.md): Batch Python jobs, run with uv by the team or on NVIDIA Brev. Outputs go to the repository or the dataset store. **Brev never serves traffic.**
- [VPS and Cloudflare](04-vps-and-cloudflare.md): Two places outside Google Cloud take part in delivery: the Cloudflare Worker that proxies the assistant, and a Docker Compose stack kept as a manual fallback.
