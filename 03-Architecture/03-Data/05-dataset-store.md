# Dataset store (Google Cloud Storage)

One shared, versioned dataset store on Google Cloud Storage, so nobody re-downloads SMAP, IMERG, HLS and the rest. It holds **area-of-interest clips and derived products, never global archives**. The team reads it, and the science API mounts it read-only.

**Where the code lives**

- `pipelines/data_store/` (`manifest.yaml`, `sync.py`, `clip.py`)
- `.github/workflows/release.yml`: the read-only volume mount on the science API
- `services/science-api/src/itza_science`: reads the store before calling Earthdata

## How it fits in

```
NASA Earthdata  ──fetch + clip──▶  pipelines/data_store (sync.py)  ──push──▶  Cloud Storage bucket
                                                                                  │ read-only mount
                                                       Cloud Run itza-science-api ◀┘  /data/store
```

- `manifest.yaml` lists every object set: source product, version, original URL or DOI, retrieval date, spatial and temporal subset, license, citation, and the byte size and SHA-256 of each file.
- `sync.py` has `validate`, `verify`, `pull` (team), `fetch`, `register` and `push` (maintainer). `pull` uses `gcloud storage rsync`, so a rerun resumes an interrupted transfer, then checks every SHA-256.
- Sets that have a `clip` recipe (SMAP L4 and IMERG) are streamed: sample global granules, download a few at a time, write one clip per region and delete the global file, so disk use stays small.
- The science API serves SMAP and IMERG **from the store first** and only falls back to live Earthdata when a clip is missing (#128). The hero-field pipeline does the same (#130).
- Every clip is checked against its SHA-256 before use. A damaged clip, or a file the manifest does not list, aborts the build.

## Bucket setup and settings

A shared, versioned, read-only-for-the-team store for the large NASA inputs (issue #103). Sync tool, manifest and usage: [`pipelines/data_store/`](https://github.com/ITZA-SPACE/itza/blob/dev/pipelines/data_store/README.md). Created once by a GCP project admin, not by CI, and only after the team approves the size table in the issue.

```bash
# Replace PROJECT and GROUP; run as a project admin.
gcloud storage buckets create gs://PROJECT-itza-data \
  --project=PROJECT --location=europe-west1 --default-storage-class=STANDARD \
  --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets update gs://PROJECT-itza-data --versioning
cat > lifecycle.json <<'JSON'
{"rule": [{"action": {"type": "Delete"}, "condition": {"daysSinceNoncurrentTime": 30, "isLive": false}}]}
JSON
gcloud storage buckets update gs://PROJECT-itza-data --lifecycle-file=lifecycle.json
# Team reads through a Google group; one pipeline account and one maintainer write.
gcloud storage buckets add-iam-policy-binding gs://PROJECT-itza-data \
  --member=group:GROUP --role=roles/storage.objectViewer
gcloud storage buckets add-iam-policy-binding gs://PROJECT-itza-data \
  --member=serviceAccount:itza-data@PROJECT.iam.gserviceaccount.com --role=roles/storage.objectAdmin
```

| Item | Choice |
|---|---|
| Location, class | `europe-west1`, Standard, uniform bucket-level access |
| Public access | prevented; no public objects (the app serves its own static bundles) |
| Versioning | on; noncurrent versions deleted after 30 days |
| Layout | `raw/<source>/<version>/`, `derived/<pipeline>/<version>/`, `manifests/` |
| Readers | the team Google group, `roles/storage.objectViewer` |
| Writers | the `itza-data` service account and one data maintainer, `roles/storage.objectAdmin` on this bucket only (use workload identity, no key files) |
| Secrets | none in the repo or manifest; Earthdata from `~/.netrc` or Secret Manager |

Costs (approximate; check the [GCS pricing page](https://cloud.google.com/storage/pricing) before approving, prices change):

- Storage: Standard in `europe-west1` is about USD 0.02 per GB per month, so the 50 GB target is about USD 1 per month. Noncurrent versions count for 30 days.
- Operations: a few thousand class A/B operations per sync, well under one cent.
- Egress: pulling from outside Google Cloud is billed per GB (about USD 0.12 per GB at the first internet tier), so a full 50 GB pull costs a teammate's project about USD 6. Pull only the sets you need, and pull once per machine.

The science API service mounts the bucket read-only at `/data/store` (Cloud Run volume of type `cloud-storage`, second-generation environment; `itza-run` has `roles/storage.objectViewer` on the bucket). The release workflow sets this up on every deploy, from the repo variable `GCP_DATASET_BUCKET`. The mount is a live view, but the API indexes the store once per instance, so sets pushed later are read after the next instance start (a deploy, or a scale from zero). Layout under the mount follows the bucket, e.g. `/data/store/derived/gpm-imerg/v07-clips/<region>/<granule>.nc4`. The API reads them when `ITZA_DATASET_STORE_DIR` points at the mount. To apply the same configuration by hand:

```bash
gcloud run services update itza-science-api --region=europe-west1 --execution-environment=gen2 \
  --clear-volumes --clear-volume-mounts --update-env-vars=ITZA_DATASET_STORE_DIR=/data/store \
  --add-volume=name=dataset-store,type=cloud-storage,bucket=<bucket>,readonly=true \
  --add-volume-mount=volume=dataset-store,mount-path=/data/store
```


## Related pages

[Source manifest](02-source-manifest.md) · [Hero-field precompute](06-hero-field-precompute.md) · [Release to Cloud Run](../07-Build-and-Deploy/02-release-to-cloud-run.md) · [Data pipelines](../07-Build-and-Deploy/03-data-and-ml-pipelines.md)
