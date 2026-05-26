# @infoteam/ids-react

IDS React 컴포넌트 라이브러리.

## 설치

```bash
npm install @infoteam/ids-react @infoteam/ids-css
npm install tailwindcss  # peerDependency
```

## 설정

CSS 엔트리포인트에서 import:

```css
@import "@infoteam/ids-css";
@import "tailwindcss";
```

앱 최상단에 `ThemeProvider` 추가:

```tsx
import { ThemeProvider } from '@infoteam/ids-react';

function App() {
  return (
    <ThemeProvider color="blue" mode="light">
      {/* 앱 전체 */}
    </ThemeProvider>
  );
}
```

`ThemeProvider` 없이는 CSS 변수가 정의되지 않아 색상이 렌더링되지 않는다.

## ThemeProvider

| prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `color` | `IdsColor` | `'blue'` | 색상 테마 |
| `mode` | `IdsMode` | `'light'` | 라이트/다크 모드 |

```tsx
import { useTheme } from '@infoteam/ids-react';

function ThemeToggle() {
  const { toggleMode } = useTheme();
  return <button onClick={toggleMode}>모드 전환</button>;
}
```

## 컴포넌트

### Button

```tsx
import { Button } from '@infoteam/ids-react';

<Button variant="solid" size="md" onClick={() => {}}>
  클릭
</Button>
```

| prop | 타입 | 기본값 |
|---|---|---|
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` |
| `disabled` | `boolean` | `false` |

## 개발

```bash
pnpm storybook   # http://localhost:6006
pnpm build
pnpm typecheck
pnpm lint
```

외부 headless 라이브러리(Radix, Base UI 등)에 의존하지 않고 전부 직접 구현한다.
