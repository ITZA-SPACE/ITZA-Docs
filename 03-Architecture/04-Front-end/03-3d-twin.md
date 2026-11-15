# 3D field twin

How the terrain, imagery frames, relief and time-lapse are drawn in the browser.

**Where the code lives**

- `apps/web/src/map`
- `apps/web/src/twin`

---

## 3D field twin rendering

- **Base:** MapLibre GL JS 6 with `raster-dem` terrain source (Terrarium tiles) and hillshade; pitch/bearing camera animations; globe projection for the opening shot.
- **Draped data (as built):** dated NDVI and moisture frames are precomputed colorized PNGs (served by the science API or shipped with hero bundles; no TiTiler tile server) and drawn as MapLibre canvas sources on its terrain; zones, slope classes and flow paths are MapLibre/deck.gl overlays. The original plan of a deck.gl `TerrainLayer` textured per timestep was dropped (see the time-lapse note below).
- **Animation:** frame index driven by the global timeline store; frames preloaded (decoded `ImageBitmap`s) to avoid flicker; 4–12 fps playback, interpolated cross-fade.
- **Derived terrain products:** slope, flow accumulation and flow lines computed server-side from NASADEM (D8) and shipped as GeoJSON/PNG.
- **Relief package (#144):** the terrain index also lists `relief`: one height image (16-bit height split over the red and green channels of a PNG) and one aerial JPEG per field, on a longitude/latitude grid of about 1 m cells covering the field plus 150 m. USGS 3DEP lidar and USDA NAIP in the United States; the 30 m DEM and the EOxCloudless 2016 mosaic elsewhere, flagged coarse. Built once per field by the science API (or shipped in a hero bundle under `assets/relief/`), so a field view needs two static files instead of streamed terrain and imagery tiles. Contract and limits: [science API README](https://github.com/ITZA-SPACE/itza/blob/dev/services/science-api/README.md#terrain-frame-sequences-and-management-zones).
- **Close-up relief view:** `apps/web/src/twin/relief/` draws the relief package with three.js as one mesh per field (height colours or the aerial picture, plus a rain sheet that runs downhill, `water.ts`). A non-hero field gets its package from `POST /v1/relief` with its outline alone.
- **Fallback:** WebGL2 unavailable → a flat SVG outline of the field with its area and position (core, `apps/web/src/twin/FlatField.tsx`). MapLibre 6 itself needs WebGL2, so a 2D map with the animated layers is not possible with the same library; the animated 2D layers remain to be built if a canvas-only renderer is added.
- **Implementation notes (core twin):** the twin is a lazy route (`/twin`); deck.gl 9.4 runs interleaved through `MapboxOverlay` with a small shim that points `map.transform` at MapLibre 6's internal camera, because deck.gl still reads the old property. Draped frames (time-lapse) are added through the `layers` prop of `FieldTwin`. The field outline is lifted onto the terrain surface with `map.queryTerrainElevation` and drawn without depth testing so it never sinks under a ridge.
- **Time-lapse and overlays (F-12):** frames are draped with MapLibre canvas sources (a canvas painted from preloaded `ImageBitmap`s, cross-faded, 4/8/12 fps), not a deck.gl `TerrainLayer`, because MapLibre already drapes rasters on its terrain and a second deck terrain would duplicate it. Frame and terrain indexes come from `layers.ndvi_frames` and the terrain index (science API, or a hero field's static `frames/`, `terrain.json`, `zones.json`); frames decode at most 512 px a side. The player follows the global timeline store and the season shown by the Season Replay (Replay mode). Flow paths, slope classes, frost-pocket hint and zones toggle with captions and provenance; the 2D view draws the same layers. Hero assets are the real bundles from #17 (`apps/web/public/bundles/`).
- **Alternative:** CesiumJS if true globe/3D Tiles become necessary (heavier bundle; not default).
