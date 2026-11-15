# Terrain, frames and management zones

How elevation, imagery frames and zone polygons are produced.

**Where the code lives**

- `services/science-api/src/itza_science/terrain`

---

## Terrain, frame and zone implementation

The science service now derives bundle elevation/slope and local terrain products
from NASADEM/SRTM on a buffered 30 m UTM grid. D8 routes downhill without filling
pits; flow is local to the buffer. Concavity is a relative elevation hint, not a
frost forecast. Numerical GeoTIFFs and colorized PNG previews are served separately.
NDVI/moisture frame indexes include source, date, bounds and byte size; transparent
geographic PNGs are bounded to 150,000 bytes. Missing sources remain explicit gaps.

`POST /v1/zones` requires ≥3 ha, ≥30 usable HLS pixels and ≥2 comparable years.
Standardized multi-year NDVI mean/CV/circular peak timing plus available terrain
and coarse NISAR moisture feed deterministic k=2–4 silhouette selection. Annual
adjusted Rand index and matched membership retention describe stability; GeoJSON
is field-clipped and reports retained-pixel coverage. Caller AWC remains unchanged;
optional curve-number scenarios use Williams' documented slope correction, with
low confidence and baseline provenance. These parameters support later mini-backtests.

The [science API spatial contract and methods](https://github.com/ITZA-SPACE/itza/blob/dev/services/science-api/README.md#terrain-frame-sequences-and-management-zones)
document request/response models, palettes, thresholds, source limits, precomputed
numeric moisture manifests, cache/refresh behavior and scientific limitations.
The route models are published in OpenAPI; no shared bundle schema changed.
