# Data

How NASA and USDA data becomes one Field Data Bundle: the adapter contract, the source manifest, caching, the dataset store and the hero-field pipeline.

[Back to Architecture](../00-README.md)

## Pages

- [Adapter contract](01-adapter-contract.md): The one interface every data source implements, so the engine only ever sees canonical variables.
- [Source manifest](02-source-manifest.md): data-sources.yaml: every dataset, its resolution, license and how it is reached.
- [Field Data Bundle](03-field-data-bundle.md): The core contract: one immutable file with all series, soil, gaps and provenance for a field.
- [Caching](04-caching.md): What is cached where, and how stale data is detected.
- [Dataset store (Google Cloud Storage)](05-dataset-store.md): One shared, versioned dataset store on Google Cloud Storage, so nobody re-downloads SMAP, IMERG, HLS and the rest. It holds **area-of-interest clips and derived products, never global archives**. The team reads it, and the science API mounts it read-only.
- [Hero-field precompute pipeline](06-hero-field-precompute.md): How the four demo fields are built ahead of time and shipped as static bundles.
