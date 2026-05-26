# IDS — Infoteam Design System

Cross-platform design system for [GIST Infoteam](https://github.com/gsainfoteam) services (지글, 팟쥐, etc.).

React (Web) and Flutter (Mobile) with a shared token pipeline.

## Packages

| Package | Version | Description |
|---|---|---|
| `@infoteam/ids-css` | [![npm](https://img.shields.io/npm/v/@infoteam/ids-css)](https://www.npmjs.com/package/@infoteam/ids-css) | CSS variables + Tailwind `@theme` |
| `@infoteam/ids-react` | [![npm](https://img.shields.io/npm/v/@infoteam/ids-react)](https://www.npmjs.com/package/@infoteam/ids-react) | React components |
| `ids_flutter` | [![pub](https://img.shields.io/pub/v/ids_flutter)](https://pub.dev/packages/ids_flutter) | Flutter components |

## Getting started

**React**

```bash
npm install @infoteam/ids-react @infoteam/ids-css tailwindcss
```

```css
/* global.css */
@import "tailwindcss";
@import "@infoteam/ids-css";
```

```tsx
import { ThemeProvider } from '@infoteam/ids-react';

export function App() {
  return (
    <ThemeProvider color="blue" mode="light">
      <Router />
    </ThemeProvider>
  );
}
```

**Flutter**

```yaml
# pubspec.yaml
dependencies:
  ids_flutter: ^1.0.0
```

```dart
// main.dart
void main() {
  runApp(
    ThemeProvider(
      color: IdsColor.blue,
      mode: IdsMode.light,
      child: const MyApp(),
    ),
  );
}
```

## Development

```bash
pnpm install
pnpm codegen    # tokens → css / react / flutter
pnpm build      # build all packages
pnpm storybook  # component playground (port 6006)
```

## Architecture

See [IDS Architecture.md](./IDS%20Architecture.md) for the full design doc.

Token pipeline: `packages/core/tokens/` → Style Dictionary → `packages/css/`, `packages/react/`, `packages/flutter/`
