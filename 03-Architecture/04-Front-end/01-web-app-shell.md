# Web app shell

The web app (`apps/web`) is a React 19 + TypeScript + Vite single-page app. It is installable as a PWA and designed phone-first. This page explains how the shell is put together; the [routes and features](02-routes-and-features.md) page maps each screen to its code, and the [design system](04-design-system.md) page covers the visual language.

**Where the code lives**

- `apps/web/src/app`: root layout, shell (sidebar, bottom bar, top bar, page header)
- `apps/web/src/routes`: one file per route (TanStack Router, file-based)
- `apps/web/src/state`: the field store
- `apps/web/src/copy`: all user-facing text
- `packages/ui-kit/src`: shared components and design tokens
- Package page: [Components: web app](../../04-Components/apps-web.md)

## Routing

- **File-based routes.** A route is a file under `src/routes/`. The route tree is generated and not committed.
- **Layout route.** `_workspace.tsx` keeps the map mounted while you move between workspace pages. The map page (`/field`) shows the map in a glass frame with the field panel beside it (a bottom sheet on phones). Every other workspace page takes the full width while the map stays mounted but hidden, so coming back is instant.
- **Code splitting.** `maplibre-gl` and Terra Draw load only with the workspace route; KaTeX loads only when a formula is shown.

## Navigation: seven places

The information architecture comes from the Figma "Simple · Field" frame: seven places, each a section whose pages sit side by side as segmented tabs. Every route is two clicks away (`src/app/shell/nav.ts`).

| Place | Tabs |
|---|---|
| Field | Map · 3D |
| Past | Seasons · Climate |
| Plan | Your farm · Compare · Build |
| Future | (one page) |
| Decide | Models · Proof |
| Ask ITZA | (one page) |
| Sources | (one page; Formulas, Validation and Data and credits tabs inside) |

Plus **Guided demo** and **Settings** as icon buttons.

- **Desktop and tablet:** a collapsible glass sidebar, remembered per browser. Collapsed it is an icon rail with tooltips.
- **Phones:** the sidebar gives way to a bottom bar (Field, Past, Plan, Ask, More) with labels always visible and safe-area insets for the installed PWA. "More" opens the remaining places as tiles in a bottom sheet.
- A top bar holds the field switcher, and a shared `PageHeader` draws each page's title, one-line subtitle and tabs.

## Ask ITZA stays alive

Ask ITZA is a full page (`/ask`), but the chat stays mounted at the root once loaded and draws into the page through a portal. A conversation survives a trip to the map and back. "Ask about this" queues a question and opens the page.

## Progressive disclosure

Dense content is folded behind labeled disclosures: evidence, benefits and information gaps fold behind counts while risks stay open, and dated gaps are grouped. Wide tables scroll inside `TableScroll`. Copy is short: one-line page subtitles and 1 to 3 word buttons. Secondary detail (soil, priorities, limits, ground truth, prices, satellite context, zone notes, score breakdowns, climate stripes) sits behind disclosures.

## The guided flow

The guided flow (Field, History, Inputs, Compare) is walked with Back and Next on each step page.

## Copy lives in files

There is no i18n library. Copy is one JSON file per feature under `src/copy/en/`, and the `t(key)` key type is generated from them. The assistant replies in the user's language, but the interface itself is English.

## The field store

The Zustand field store (`src/state/fieldStore.ts`) holds:

- the field outline and its derived area, centroid and perimeter
- the confirmed history
- farmer inputs, priorities, scenario and ground truth

It is serializable and saved per field. The field id is `sha256:` of the outline rounded to 5 decimals, which is the bundle contract. The browser and the science API compute the same id, including Python's rounding and float repr, so a cached bundle is found on both sides.

## Data loading

The bundle loader (`src/data`) is progressive: it starts as soon as the outline settles, merges series by priority, keeps the cached bundle when a refresh returns less data, and revalidates cached hero bundles against the static file. Details: [Caching](../03-Data/04-caching.md).

## Map details

- Place search uses Photon, debounced and cached.
- MapLibre's tile worker is registered through Vite (`?worker&url`) because the library cannot locate it once bundled.
- Basemaps and terrain: OpenFreeMap (dark style), EOxCloudless 2016 Sentinel-2 imagery (CC BY 4.0, attribution shown on the map), AWS Terrain Tiles. See [3D twin](03-3d-twin.md).

## Offline and install

`vite-plugin-pwa` provides the manifest, precache and tile caching. The app shows an install prompt, an offline indicator, an update toast and a saved-fields list. The guided demo works fully offline on the hero fields.

## Related pages

[Routes and features](02-routes-and-features.md) · [3D twin](03-3d-twin.md) · [Design system](04-design-system.md) · [Technology stack](../01-System-Overview/02-technology-stack.md)
