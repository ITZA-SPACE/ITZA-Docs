# Prithvi-EO-2.0

The NASA/IBM foundation model: experimental crop and fallow classification.

**Where the code lives**

- `pipelines/prithvi`

---

## Prithvi-EO-2.0 (P2)

- Fine-tune `Prithvi-EO-2.0-100M-TL` (or `tiny-TL` for CPU) with TerraTorch on multi-temporal HLS chips for crop vs fallow (and cereal vs legume where labels exist). Start from the official multi-temporal crop config in the Prithvi-EO-2.0 repo.
- Labels: farmer-confirmed seasons, US CDL for transfer pretraining, any official challenge labels.
- The implemented CPU experiment uses TerraTorch tiny-TL with a small convolutional head, 16 training chips and 5 spatially held-out 2022 HLS/CDL chips (minimum chip-edge separation 414,902 m). Accuracy 0.798733 equals the training-majority baseline and fallow IoU is zero; these measurements do not establish classification skill. Raw-source manifests, the pinned base checkpoint revision, metrics and reproduction are in `pipelines/prithvi/`. No story-field supervision or validation is claimed without farmer-confirmed labels.
- Inference precomputed for demo fields; served as raster layer and as 4th opinion.
- `GET /v1/prithvi/{bundle_id}` reads a validated `prithvi/1` publication from `ITZA_PRITHVI_DIR` (default `models/prithvi`). It returns the model/checkpoint digest, class legend, per-season raster filenames, SHA-256 checksums and source · resolution · period provenance, plus gaps and limitations. `GET /v1/prithvi/{bundle_id}/rasters/{year}` serves the verified one-band uint8 GeoTIFF (0 = no data, 1 = crop, 2 = fallow/idle). Missing bundles/seasons return 404; malformed or corrupt publications return 503. Path traversal, external symlinks, oversized files and unknown classes are rejected. The API runtime does not install torch or perform training.
