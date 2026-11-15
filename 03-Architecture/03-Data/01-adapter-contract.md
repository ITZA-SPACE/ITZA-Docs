# Adapter contract

The one interface every data source implements, so the engine only ever sees canonical variables.

**Where the code lives**

- `packages/adapters-browser/src`
- `services/science-api/src`

---

## Adapter contract

Each data source implements one adapter. Python (server) and TypeScript (browser) versions share the same manifest and output schema.

```python
class DataAdapter(Protocol):
    id: str                      # "nasa_power_daily"
    manifest: SourceManifest     # loaded from data-sources.yaml

    def capabilities(self) -> Capabilities: ...
    #   canonical variables, spatial/temporal coverage, resolution, auth, latency class

    def fetch(self, geometry: Geometry, period: Period,
              variables: list[CanonicalVar]) -> list[CanonicalSeries]: ...
    #   returns field-tier series with provenance; never raises on partial data,
    #   returns Gap records instead

    def fetch_grid(self, geometry: Geometry, when: DateOrRange,
                   variable: CanonicalVar, target_grid: Grid) -> GridLayer | None: ...
    #   optional, for zone tier and map layers
```

```ts
interface BrowserAdapter {
  id: string;
  capabilities(): Capabilities;
  fetch(req: FetchRequest, signal: AbortSignal): Promise<CanonicalSeries[]>;
}
```
