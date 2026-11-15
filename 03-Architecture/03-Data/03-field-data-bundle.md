# Field Data Bundle

The core contract: one immutable file with all series, soil, gaps and provenance for a field.

**Where the code lives**

- `schemas/field-bundle.schema.json`

---

## Field Data Bundle (core contract)

```jsonc
{
  "schema": "field-bundle/1.0",
  "field": { "id": "sha256:…", "geometry": { /* GeoJSON */ }, "area_ha": 12.4,
             "centroid": [5.33, 36.12], "elevation_m": 980, "slope_mean_deg": 3.1 },
  "generated_at": "2026-11-14T10:00:00Z",
  "series": [
    { "var": "precip", "unit": "mm/day", "cadence": "daily",
      "start": "2001-01-01", "values": [/* … */],
      "quality": [/* per-step flags */],
      "provenance": { "source": "gpm_imerg_final_daily", "version": "07",
                      "resolution_m": 11000, "method": "area_weighted",
                      "retrieved": "2026-11-10" },
      "segments": [ { "start": "2025-10-01", "source": "gpm_imerg_late_daily" } ] }
  ],
  "phenology": [ /* per-season Field Memory output */ ],
  "layers": { "zones": "zones.geojson", "ndvi_frames": "frames/index.json",
              "nisar": [ { "date": "2026-10-02", "href": "nisar_20261002.png" } ] },
  "context": { "grace_tws_trend_cm_per_yr": -0.8, "gedi_footprints": 14 },
  "soil": { "clay_pct": { "value": 34, "source": "soilgrids", "confidence": "medium" } },
  "gaps": [ { "var": "sm_surface", "reason": "cell larger than field", "severity": "info" } ]
}
```

Storage: Parquet for long series (client decodes with a WASM Parquet reader or receives Arrow/JSON chunks), JSON for metadata, PNG/WebP frames for 3D textures, GeoJSON for zones.

The bundle, its series and provenance, the engine input/output, the evidence card and the assistant tool I/O are defined as JSON Schemas (draft 2020-12) in `schemas/`, each with an `$id` and a version label. `pnpm schemas:generate` writes TypeScript types to `packages/engine/src/contracts/generated/` (import from `@itza/engine/contracts`) and Pydantic models to `services/science-api/src/itza_science/contracts/`; `pnpm schemas:check` fails when they are stale. A series without provenance, or an evidence card or item missing a mandatory field, fails validation. Change rules: [schemas/README.md](https://github.com/ITZA-SPACE/itza/blob/dev/schemas/README.md).
