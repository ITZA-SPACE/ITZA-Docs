# Design system

ITZA uses a dark "space glass" design system, designed in Figma ("ITZA / design system") and implemented as CSS tokens. Every component reads the tokens, so charts, map controls and the printed rotation card stay consistent.

**Where the code lives**

- `packages/ui-kit/src/tokens.css`: all tokens and the glass utilities
- `packages/ui-kit/src/components`: components built on the tokens
- `apps/web/src/lib/palettes.ts` and `echartsSetup.ts`: the dark chart theme

## Colors

| Token | Value | Use |
|---|---|---|
| `--color-void` | `#06060b` | Page background, the deepest layer |
| `--color-deep` | `#0d0d16` | Cards and panels |
| `--color-rain` | `#7fd0ff` | Brand light blue, accents and selection |
| `--color-space` | `#2f7bff` | Brand blue, primary actions |
| `--color-leaf` | `#79ffae` | Field outline and vegetation |
| `--color-sun` | `#ffc857` | Warning and focus ring |
| `--color-violet` | `#a99bff` | Assistant |
| `--color-good-ink` | `#34e0a1` | Success |
| `--color-risk-ink` | `#ff8fa3` | Danger and risk |
| `--color-ink` / `--color-ink-muted` | `#f3f7ff` / `#a8b8d8` | Primary and secondary text |
| `--color-rim` | white at 20% | The hairline rim on glass surfaces |

The brand gradient "Aurora" runs from Rain to Space at 135 degrees, and is used for selected options and premium actions.

## Type

Familjen Grotesk for display and titles, DM Sans for body text, both bundled with Fontsource so they work offline. Scale: caption 13/18, body 16/24, title 20/26, display 36/42.

## Shape and spacing

4-pt spacing scale with a 16 px screen gutter. Radii: control 14 px, panel 20 px, card 24 px, pill fully rounded.

## Glass

Glass materials combine a blur, a faint sheen, a hairline rim and a soft specular top edge. The utilities are `glass-panel`, `glass-control`, `glass-selected` and `bg-aurora`. Rims were softened to a 20% hairline with a quieter specular edge after review.

## Printing

Printed pages and the rotation card use a light palette under `@media print`, so a farmer can hand a card to an advisor on paper.

## Accessibility

Focus rings use the sun color, option controls are real checkboxes and radios, and decorative artwork is marked hidden. The layout has no sideways overflow on phones.

## Related pages

[Web app shell](01-web-app-shell.md) · [Routes and features](02-routes-and-features.md)
