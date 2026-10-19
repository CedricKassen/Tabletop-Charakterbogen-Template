# Character sheet kit – notes for AI assistants

Printable TTRPG character sheets as React + CSS. Output is PDF via browser print or
`pnpm export`. This is not an app or editor: never add state, forms, inputs or
interactivity to sheets.

## Ground rules

- **Kit (`src/kit/`) stays unstyled.** It only draws structure (lines, frames, boxes),
  using tokens. Colours, fonts, images and ornaments belong in a sheet's `theme.css`.
- **A sheet** = `src/sheets/<id>/index.tsx` (default export + optional `title`) +
  `theme.css` + optional `assets/`. Every theme rule is scoped under `.sheet-<id>`.
- **Style through the public surface**: `--cs-*` tokens, `cs-*` class names,
  `data-*` variant attributes, the `className` prop, and slot props
  (`decoration`, `header`, `footer`, `before`, `after`, `ImageSlot`). Don't fork a
  component to restyle it.
- **Print-first**: size things in `mm`/`pt`, never `px`. A `Page` has a fixed size
  and `overflow: hidden`, so content that doesn't fit gets clipped silently.
  Use `fill` / `Grid` `1fr` rows to use leftover space.
- Derived tokens (`--cs-line-color`, `--cs-frame-color`, `--cs-fill`,
  `--cs-heading-font`) aren't set on `:root`. They're read with fallbacks, so they
  follow `--cs-ink` / `--cs-font` unless a theme sets them explicitly.

## Changing the kit

- New component: add it to the right file in `src/kit/`, export it from `index.ts`,
  accept `BaseProps` and spread `base(rest, "cs-<name>", style)` onto the root.
  Add structural CSS to `base.css`, add a demo to `src/sheets/kitchen-sink`, and
  document it in the README component table.
- Class names and data-attributes are the theming API. Treat renames as breaking.

## Verify

```sh
pnpm typecheck
pnpm export <id>                     # → out/<id>.pdf
pdfinfo out/<id>.pdf                 # page count / size
pdftoppm -r 80 -png out/<id>.pdf /tmp/x   # look at the render
```

Check the page count: one `Page` should give one PDF page. If you get more,
something overflows or breaks.
