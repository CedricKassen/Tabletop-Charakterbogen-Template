# Character sheet kit

Unstyled React components for building printable tabletop RPG character sheets.
A sheet is one TSX file plus one CSS theme. The output is PDF, via the browser's
"Print → Save as PDF" or the headless `pnpm export`.

This is **not** a sheet editor. You write sheets as code, by hand or with an AI,
and print them.

## Quick start

```sh
pnpm install
pnpm dev                 # http://localhost:5173 lists all sheets
pnpm export              # → out/<sheet>.pdf for every sheet
pnpm export pandoria     # only selected sheets
pnpm typecheck
```

Printing from the browser: open a sheet → **Print / Save as PDF** → destination
"Save as PDF", margins **None** (or Default), **Background graphics** on. Page size
and orientation come from the sheet itself.

`pnpm export` uses `$CHROME_PATH` if set, else Playwright's Chromium
(`pnpm exec playwright install chromium`), else an installed Google Chrome.

## Project layout

```
src/kit/            the component library (unstyled)
  base.css          tokens + structural styles; the only CSS the kit ships
src/sheets/<id>/    one folder per sheet
  index.tsx         default-exports the sheet, optionally `export const title`
  theme.css         styles, scoped under `.sheet-<id>`
  assets/           images, fonts
scripts/export-pdf.ts
```

Example sheets:

- `kitchen-sink`: every component and variant with default styling. It's the catalog.
- `pandoria`: the reference sheet in `referenzen/` rebuilt (structure only).

## Making a new sheet

1. Create `src/sheets/my-game/index.tsx`:

   ```tsx
   import { Page, Grid, Section, Field } from "../../kit";
   import "./theme.css";

   export const title = "My Game";

   export default function MyGame() {
     return (
       <Page size="A4" orientation="portrait">
         <Section title="Identity">
           <Field label="Name" />
         </Section>
       </Page>
     );
   }
   ```

2. Create `src/sheets/my-game/theme.css` and scope every rule under `.sheet-my-game`.
3. Open `/?sheet=my-game`.

## Components

Every component accepts `className`, `style`, `area` (the grid-area name inside a
`Grid`) and `fill` (take the remaining space in a column/grid cell). Plain numbers
for lengths are **millimetres**; strings pass through (`"40%"`, `"2em"`). All
value props are optional. Leave them out and you get a blank sheet to fill by hand,
or set them for pre-filled sheets (NPCs, pregens).

| Component | Purpose | Key props |
|---|---|---|
| `Page` | One physical sheet, prints as exactly one page | `size` A4/A5/Letter, `orientation`, `margin` |
| `Grid` | CSS grid layout | `columns`, `rows` (number or template), `areas`, `gap` |
| `Stack` | Flex row/column | `direction`, `gap`, `align`, `justify`, `wrap` |
| `Section` | Framed panel | `title`, `titlePlacement` top/banner/side, `header`, `footer`, `decoration`, `frameless` |
| `Banner` | Standalone heading strip | `before`, `after` |
| `Divider` | Horizontal/vertical rule | `label`, `direction` |
| `Field` | Label + writing line | `label`, `value`, `labelPosition` left/above/below, `width`, `labelWidth` |
| `FieldRow` | Fields side by side | `gap` |
| `Lines` | Ruled lines | `count`, `label`, `values`, `lineHeight` |
| `BulletList` | Ruled lines with markers | `count`, `marker` |
| `FractionField` | `LP: __ / __` | `label`, `current`, `max`, `separator`, `captions` |
| `ValueBox` | One prominent value | `shape` square/rounded/circle/shield/hexagon/diamond/heart, `size`, `labelPosition`, `sub` |
| `NoteBox` | Free-text area | `title`, `ruled`, `minHeight` |
| `Pips` | Checkboxes / bubbles | `count`, `filled`, `shape` circle/square/diamond, `groupSize`, `direction` |
| `Track` | Labelled step track (health, stress) | `steps` (number or labels / `{label, note}`), `filled` |
| `Clock` | Segmented progress clock | `segments`, `filled`, `size` |
| `Scale` | Values to circle (0–10, d4–d12) | `from`, `to`, `values`, `marked` |
| `Table` | Ruled table | `columns` (`type` text/pips/check, `render`), `rows`, `data`, `headless` |
| `ListTable` | Skill list `[o] Name ..... [ ]` | `items`, `marker` none/check/pips, `leader`, `showValue` |
| `StatBlock` | Attribute score + modifier | `label`, `abbr`, `layout` stacked/inline |
| `StatTable` | Attribute table with icons | `stats`, `columns`, `labelHeader` |
| `ImageSlot` | Portrait, logo, icon, ornament | `src`, `width`, `height`, `framed`, `placeholder`, children (inline SVG) |

## Styling

`src/kit/base.css` draws structure only: lines, frames and boxes. There are no
colours and no images. A theme:

1. **Overrides tokens** on the sheet root:
   ```css
   .sheet-my-game {
     --cs-font: "Cinzel", serif;
     --cs-ink: #2b1d0e;
     --cs-paper: #f4ead5;
     --cs-frame-width: 0.6mm;
     --cs-row-height: 7mm;
   }
   ```
   Token list: see the top of `base.css`.
2. **Targets stable class names and data-attributes**, never internal DOM structure:
   `.cs-section__title`, `.cs-pip[data-filled]`, `.cs-valuebox[data-shape="shield"]`,
   `.cs-section[data-title-placement="banner"] > .cs-section__header`, …
3. **Adds graphics** through `Section decoration={…}`, `Banner before/after`,
   `ImageSlot src`, `border-image` on `.cs-section`, or background images on `.cs-page`.
4. **Adds own class names** with `className` to target single instances.

Empty `ImageSlot`s show a dashed placeholder on screen and nothing in print.
