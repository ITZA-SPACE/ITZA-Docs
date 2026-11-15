# Native field-bundle ingestion and verification

How Earthdata granules become a verified bundle, and what happens when a source is missing.

**Where the code lives**

- `services/science-api/src/itza_science/adapters`

---

## Native field-bundle ingestion and verification

The bundle API retains `{geometry,period,variables?}` and its `queued/running/done/error`
job states. Optional `refresh: true` rebuilds completed cached results; errored jobs
can be retried by POST. In-flight jobs are lost on restart, so clients must POST
again; completed bundles are restored from the file cache. Cache keys include
source versions and variable mappings. Cache-write failures become safe job errors.

Earthdata tokens and username/password pairs can be loaded from server `.env`
settings. Auth/search/download are serialized off the event loop; credentials and
raw upstream errors never enter responses. The reader groups native granule assets
and downloads only required NetCDF/HDF5 or NDVI/Fmask files, with a daily granule cap.
IMERG V07 uses `precipitation` and named dimension transposition. SMAP L4 uses its
native `Geophysical_Data` group/EASE-Grid and all available three-hourly samples for
daily means, flagging incomplete sampling. HLS VI uses separate scaled NDVI/QA COGs,
windowed reads, and native CRS-aware, equal-area pixel-overlap weighting. Days
between HLS visits are represented by nulls, not acquisition-failure warnings.

Missing terrain is null with explicit gaps in the shared bundle contract. Generated
consumers are updated together; the engine rejects missing elevation before ET0.
Real clips from all five collections, two SMAP timestamps and native QA assets are
replayed in offline unit/integration tests; source provenance and a manual live
verification record accompany them in `fixtures/earthdata/recorded/`. Synthetic
fixtures remain separate. See the [science service README](https://github.com/ITZA-SPACE/itza/blob/dev/services/science-api/README.md#field-bundles-and-native-nasa-inputs)
for configuration, manifest packaging, retries and verification limits.
