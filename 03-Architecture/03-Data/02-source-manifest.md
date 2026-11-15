# Source manifest

data-sources.yaml: every dataset, its resolution, license and how it is reached.

**Where the code lives**

- `data-sources.yaml`

---

## Manifest (`data-sources.yaml`)

```yaml
sources:
  - id: nasa_power_daily
    provider: NASA LaRC POWER
    product: POWER Daily API
    version: "v2.10"
    runtime: browser            # browser | server
    auth: none
    endpoint: https://power.larc.nasa.gov/api/temporal/daily/point
    variables:
      tmax:   { source_var: T2M_MAX, unit: degC }
      tmin:   { source_var: T2M_MIN, unit: degC }
      precip: { source_var: PRECTOTCORR, unit: mm/day }
    resolution_m: 55000
    coverage: { start: 1981-01-01, end: near_real_time }
  - id: gpm_imerg_final_daily
    product: GPM_3IMERGDF
    version: "07"
    runtime: server
    auth: earthdata
    variables: { precip: { source_var: precipitation, unit: mm/day } }
    resolution_m: 11000

priority:
  precip: [gpm_imerg_final_daily, gpm_imerg_late_daily, nasa_power_daily]
  ndvi:   [hls_vi, modis_mod13q1_ornl, viirs_vnp13a1]
  sm_rootzone: [smap_l4, nldas_noah, gldas_noah]
  et_actual: [nldas_noah, gldas_noah]
```

Adding a resource from the official list ([CHALLENGE_RULES_2026.md §7](../../08-Challenge-and-Submission/CHALLENGE_RULES_2026.md#7-official-resources-for-field-shift-and-itza-coverage)) = new manifest entry + adapter class + conformance test (fixture in, schema-valid canonical series out).

As implemented (`packages/adapters-browser/src/manifest.ts` validates the real file; unknown variables are rejected):

- `kind` (default `series`) says what an entry returns: `series` (canonical variables), `soil` (`clay_pct`, `sand_pct`, `silt_pct`, `soc_pct`, `ph`, `awc_mm_per_m`), `phenology` (`greenup`, `peak`, `dormancy`) or `catalog` (CMR availability only: no variables, `resolution_m: 0`). Vector `soil` sources may also use 0 to denote survey polygons rather than a fixed raster resolution.
- `priority` holds the server chains and is read by `services/science-api`, which walks those ids as granule sources, so browser ids must not appear there. `browser_priority` holds the browser chains per canonical variable; the client tries `priority` through the server bundle first, then `browser_priority` in order. For `et_actual`, the browser MODIS/POWER chain stays ahead of modeled NLDAS/GLDAS cross-checks.
- Browser entries: `nasa_power_daily`, `nasa_power_climatology`, `ornl_modis_mod13q1`, `ornl_modis_mod16a2gf`, `ornl_modis_mcd12q2`, `cmr`, `soilgrids`. POWER `EVPTRNS` maps to `et_actual` through a latent-heat conversion (2.45 MJ/kg) and `GWETROOT` to `sm_rootzone` as a 0-1 wetness index (unit `fraction`, quality capped at low). MOD16A2GF 8-day composites are expanded to a daily mm/day rate because the series cadence set has no 8-day step.
- GLDAS/NLDAS return daily 0–100 cm volumetric moisture and signed net ET from complete native UTC intervals, flagged modeled (per-step quality 1, low confidence, explicit provenance method). The server splices SMAP → NLDAS → GLDAS per day and retains source switches; see [conversion and fixture evidence](../../05-Data-Sources/NASA_DATA_SOURCES.md#gldas--nldas-implementation-and-verification-106).
- Browser adapters return `{ series, gaps }` and never throw: timeouts and HTTP failures become gap records with the reason.
