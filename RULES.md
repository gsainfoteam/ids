# IDS Agent Rules

## Repo structure

Monorepo (`gsainfoteam/ids`). pnpm workspace + Turborepo.

```
packages/
  core/     tokens + Style Dictionary codegen. Private — not published.
  css/      @gsainfoteam/ids-css GitHub Packages npm package. CSS variables + Tailwind @theme.
  react/    @gsainfoteam/ids-react GitHub Packages npm package. React components + ThemeProvider.
  flutter/  ids_flutter pub.dev package (publisher: gistory.me). Flutter components + ThemeProvider.
```

## Generated files — do not edit manually

These files are written by `pnpm codegen` (Style Dictionary build). Edits will be overwritten.

- `packages/css/dist/ids.css`
- `packages/react/src/tokens/types.ts`
- `packages/flutter/lib/tokens/*.dart`

To change tokens: edit files under `packages/core/tokens/`, then run `pnpm codegen`.

## Common commands

```bash
pnpm codegen          # Run Style Dictionary: core → css/react/flutter
pnpm build            # Build all packages (turbo, css before react)
pnpm typecheck        # TypeScript check all packages
pnpm lint             # ESLint all packages
pnpm storybook        # Storybook for ids-react (port 6006)
```

## Package responsibilities

**core** — Token source of truth. `sd.config.js` defines all formatters. Output goes directly to sibling packages. No build artifact. `pnpm build` in core = `style-dictionary build`.

**css** — Pure CSS package. No React dependency. Consumers import `@gsainfoteam/ids-css` and add Tailwind themselves (peerDep). Do not `@import "tailwindcss"` inside this package.

**react** — Component library. Library build via Vite (`dist/index.js`, `dist/index.cjs`). All components are implemented from scratch — no Radix, Base UI, or other headless deps. Storybook for development.

**flutter** — Dart package. Platform directories (android/, ios/, etc.) intentionally absent — this is a package, not an app. Published to pub.dev via OIDC — no token.

## React source layout

Components are grouped by the `유형` column of the Notion Components database. The folder is the
category, and the Storybook title is `<Category>/<Component>`.

```
packages/react/src/
  components/
    action/      Button, ButtonGroup, IconButton, IconToggle, Toggle, ToggleGroup, FloatingButton
    form/        Field and every *Field, Checkbox, Radio, Switch, Slider, Select, Rating, ...
    data/        Accordion, Avatar, Badge, Calendar, Card, Chip, Item, TimePicker, ...
    feedback/    Alert, Progress, Spinner
    layout/      AspectRatio, Divider, Spacer
    navigation/  (Breadcrumb, Pagination, Stepper, Tabs)
    overlay/     (Dialog, Drawer, Menu, Popover, Tooltip)
    typography/  Kbd, Label
    utility/     Slot, Group, ThemeProvider
  internal/      shared parts that are not exported: control-surface, icon-square, arc,
                 field-popup, temporal-field
  foundations/   token stories with no component (Typography, Radius, InteractiveState)
  hooks/ utils/ tokens/
```

A new component goes into the category Notion gives it. Code shared by several components but not
public goes into `internal/`, never loose at the root of `components/`.

## Stories

Every component's `index.stories.tsx` has the same shape, in this order:

1. `Playground` — args wired to controls, nothing else.
2. `Gallery` — **required.** Every variant, size and state on one screen, built from the story kit
   so all galleries read alike. Import it as `~story-kit`.
3. One story per feature worth showing (keyboard, paste, form integration, composition), each with
   a `play` function when the behaviour can be asserted.

```tsx
import { Gallery } from '~story-kit';

export const Gallery: Story = {
  render: () => (
    <Gallery>
      <Gallery.Section title="Variant × Size">
        <Gallery.Matrix rows={sizes} columns={variants} render={(size, variant) => (
          <Button size={size} variant={variant}>{variant}</Button>
        )} />
      </Gallery.Section>
      <Gallery.Section title="States">
        <Gallery.Row label="disabled">...</Gallery.Row>
      </Gallery.Section>
    </Gallery>
  ),
};
```

Declare the meta as `const meta = { ... } satisfies Meta<typeof X>`. The global decorator wraps
every story in `ThemeProvider`, so stories do not add their own theme or page padding.

## Component styling

**Multi-part components use one `tv({ slots })`, not several `tv()` calls.** A component with a
root plus parts (track/thumb, trigger/panel, box/indicator) declares every part as a slot in a
single `Style`, so a variant like `colorScheme` or `size` is written once and fans out to the
parts that need it.

```tsx
export const Style = tv({
  slots: { root: '...', track: '...', thumb: '...' },
  variants: {
    size: { standard: { track: 'h-2', thumb: 'size-4' }, tiny: { track: 'h-1', thumb: 'size-3' } },
  },
  defaultVariants: { size: 'standard' },
});

const { root, track, thumb } = Style({ size });
```

Do not declare `Root`/`TrackStyle`/`ThumbStyle` as separate `tv()` calls, and do not style a part
with a bare `cn('...')` when it belongs to the same component — that hides the part from the
variant system and duplicates the variant keys.

Colors that a variant fans out to several parts go through a CSS custom property
(`[--chip-accent:var(--ids-color-primary)]`) rather than one class per part-and-scheme pair.

**Tailwind only generates classes it can see as literal text in a source file.** A class assembled
at runtime never reaches the stylesheet, and the failure is silent — the class lands in the DOM
and does nothing.

```tsx
const halo = (p: string) => `${p}ring-[3px]`; // never generated
export const focusRing = { native: 'focus-visible:ring-[3px]' }; // fine, it is literal
```

Shared style fragments (`focus-ring.ts`, `control-surface.ts`) therefore spell every variant out
in full rather than composing prefixes.

**Focus is a soft ring, never an offset outline.** Add the `focus-ring` class. It is a single
`@utility` in the CSS package that covers every trigger IDS uses — `:focus-visible` for real form
controls, `[data-focus-visible]` for components driven by `useInteractive`, and
`:has([data-text-field-input]:focus-visible)` / `:has([data-text-area-input]:focus-visible)` for a
TextField or TextArea container wrapping its sentinel input. Borders stay `inset-ring`,
so the focus ring sits outside them and composes with `shadow-xs` instead of replacing it.

**Radius is 12px, and containers grow it concentrically.** The scale is `standard` (12px, every
control at every size), `indicator` (4px, only for boxes under 24px such as the Checkbox box or
Kbd, where 12px would read as a circle) and `full`. There is no `sm`/`md`/`lg` radius.

A padded container (Card, Alert, Item, a popup) takes its padding from `concentric-p-*` instead of
`p-*` plus `rounded-*`. The utility sets the padding and makes the corner the content's corner
plus that padding, so a Card at `concentric-p-4` holding a Button is 28px around a 12px button.
Nesting adds up: the utility detects nested `concentric-p-*` containers with `:has()` and sums
their padding in, exact for two levels. Popovers are excluded because they are not visually
nested in the element that contains them in the DOM.

```tsx
root: 'concentric-p-4',        // padding 16px, radius 12 + 16 (+ nested padding)
root: 'concentric-p-3 px-4',   // asymmetric: radius follows the concentric value, px overrides inline
```

Do not hardcode `rounded-[10px]`, and do not pair `p-*` with a hand-computed radius.

**Structural lines are neutral.** Field borders, card edges, dividers and group seams use
`--ids-color-border` (neutral 200 light, 800 dark), the way shadcn/ui keeps chrome gray and lets
only content and focus carry color. `--ids-color-outline` is the theme-tinted line; keep it for
places that should read as the brand, such as an outline Button.

Icons come from `@heroicons/react` (a runtime dependency). Consumers can override any glyph
through the matching `*.Indicator` / `*.Close` part.

## ThemeProvider

Every IDS component relies on `data-color` and `data-mode` attributes injected by `ThemeProvider`. Without it, CSS variables are undefined and colors will not render.

```tsx
<ThemeProvider color="blue" mode="light">
  <App />
</ThemeProvider>
```

## Adding a new color

1. Add palette values to `packages/core/tokens/palette.json`
2. Add `packages/core/tokens/semantic/[color].light.json` and `[color].dark.json`
3. Run `pnpm codegen` and commit the generated files

## Versioning — Changesets (fixed mode)

`@gsainfoteam/ids-css`, `@gsainfoteam/ids-react` and `ids_flutter` always share the same version.

`packages/flutter` carries a minimal private `package.json` so Changesets can track it — Changesets
only reads npm manifests. `pnpm version:packages` bumps that file and then mirrors the version into
`pubspec.yaml`; pub.dev OIDC publishing requires it to match the release tag.

```bash
pnpm changeset          # Describe a change → creates .changeset/*.md
# → open PR, merge it
pnpm version:packages   # Bump package.json + pubspec.yaml, write CHANGELOGs
# → commit, open PR, merge it
git tag v1.2.3 && git push origin v1.2.3
# → release.yml publishes to GitHub Packages + pub.dev
gh release create v1.2.3 --generate-notes --verify-tag
```

## Dependency graph

```mermaid
graph LR
  core["packages/core (codegen source)"]
  css["@gsainfoteam/ids-css"]
  react["@gsainfoteam/ids-react"]
  flutter["ids_flutter"]
  tw["tailwindcss"]

  core -->|codegen| css
  core -->|codegen| react
  core -->|codegen| flutter
  css -->|peerDep| react
  tw -->|peerDep| react
  tw -->|peerDep| css
```

`core` is never a runtime dependency of anything. It is a build-time code generator only.
