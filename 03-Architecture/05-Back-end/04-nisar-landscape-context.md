# NISAR and landscape context

Radar, GRACE, GEDI and the other context layers, and their pending and retry behaviour.

**Where the code lives**

- `services/science-api/src/itza_science/context`

---

## NISAR and landscape context

`/v1/nisar` and `/v1/context/{grace,gedi,ecostress}` now return typed, provenanced
results with explicit empty coverage and source gaps. Cold requests wait at most
20 seconds by default, then return a pollable 202 while bounded background work
continues. Context work does not use the terrain/zone lock. Successful complete
results are cached; failed or partial responses are immediately retryable. Raw
context downloads are temporary; context assets have age/size eviction and missing
cached assets are rebuilt. These policies do not change bundle/spatial caches.

NISAR baseline SME2 values are quality-screened and labeled provisional, with
same-date SMAP 9 km comparison. GRACE returns gain-adjusted monthly TWS anomaly
and an observed-date OLS trend at regional effective resolution; it does not
isolate groundwater. GEDI returns sparse quality-screened RH98/cover footprints,
joined by shot number, with tentative woody-structure hints. ECOSTRESS returns
clear-land LST/ESI with native masks. Galleries are bounded recent samples rather
than exhaustive historical retrievals. Numeric statistics use native pixels;
geographic PNG previews do not imply finer observational resolution.

See the [context API methods and operational contract](https://github.com/ITZA-SPACE/itza/blob/dev/services/science-api/README.md#nisar-and-landscape-context-endpoints)
for query limits, pending/retry semantics, product versions, QA policies, units,
cache retention and verification limits. Response schemas and examples are in
OpenAPI. Offline native-layout synthetic fixtures cover all four products; real
context granules and demo-field availability still require live verification.
