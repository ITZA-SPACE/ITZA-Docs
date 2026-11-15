# Front-end

The React web app: shell and navigation, every route and feature, the 3D twin and the design system.

[Back to Architecture](../00-README.md)

## Pages

- [Web app shell](01-web-app-shell.md): The web app (`apps/web`) is a React 19 + TypeScript + Vite single-page app. It is installable as a PWA and designed phone-first. This page explains how the shell is put together; the [routes and features](02-routes-and-features.md) page maps each screen to its code, and the [design system](04-design-system.md) page covers the visual language.
- [Routes and features](02-routes-and-features.md): Every screen in the app, the route that serves it and the folder where its code lives. All folders are under `apps/web/src`.
- [3D field twin](03-3d-twin.md): How the terrain, imagery frames, relief and time-lapse are drawn in the browser.
- [Design system](04-design-system.md): ITZA uses a dark "space glass" design system, designed in Figma ("ITZA / design system") and implemented as CSS tokens. Every component reads the tokens, so charts, map controls and the printed rotation card stay consistent.
