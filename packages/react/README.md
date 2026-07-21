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

## 인터랙션 state

IDS는 hover / press / focus 같은 상태를 **외부 구독 API로 열지 않는다.**  
필요한 쪽(부모 또는 그 노드)이 state를 소유하고, props·render prop으로 흘린다.

실행 예시는 Storybook `Patterns/Interactive state`를 참고한다.

### 1. 노드 로컬 (부모 → 자식)

같은 컴포넌트 안·자손이 상태에 반응할 때.  
`variant` / `children` 등에 `(state) => value`를 넘긴다.

```tsx
<Button variant={(s) => (s.hovered ? 'solid' : 'outline')}>
  {(s) => (s.hovered ? 'Hovered' : 'Idle')}
</Button>
```

DOM에는 `data-hovered` 등이 붙으므로, 자손 스타일만 필요하면 CSS `group` / 셀렉터로도 충분하다.

### 2. Lift (sibling)

형제끼리 JS로 같은 인터랙션에 반응해야 할 때.  
Button에 Context를 심지 말고, **공통 조상(부모)이 `useInteractive`로 state를 들고** 나눠 준다.

```tsx
function Row() {
  const { state, handlers } = useInteractive<HTMLButtonElement>();

  return (
    <>
      <button {...handlers} {...interactiveDataProps(state)}>
        Hover me
      </button>
      {state.hovered && <Hint />}
    </>
  );
}
```

sibling 스타일만 맞추면 Tailwind `group` / `peer` + `data-*`로도 된다. JS 분기가 필요할 때만 lift한다.

### 하지 않는 것

- 컴포넌트마다 Context로 hover 등을 바깥에 뿌리는 구조
- 범용 sibling 구독 / store subscribe API

Tabs·Menu처럼 **진짜 compound**가 생기면 그때 Root Context(또는 store)를 도입한다.  
transient 인터랙션(hover 등)까지 구독 레이어로 빼지 않는다.

## 컴포넌트

### Button

```tsx
import { Button } from '@infoteam/ids-react';

<Button variant="solid" size="standard" onClick={() => {}}>
  클릭
</Button>
```

| prop | 타입 | 기본값 |
|---|---|---|
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'solid'` |
| `size` | `'standard' \| 'tiny'` | `'standard'` |
| `disabled` | `boolean` | `false` |

## 개발

```bash
pnpm storybook   # http://localhost:6006
pnpm build
pnpm typecheck
pnpm lint
```

외부 headless 라이브러리(Radix, Base UI 등)에 의존하지 않고 전부 직접 구현한다.
