# resize-handle

끌거나 키로 크기를 바꾸는 손잡이의 공용 부품입니다. 키 표, `role="separator"` 의 ARIA, 포인터 끌기, 손잡이 클래스 조각, 모서리 손잡이(`ResizeGrip`)가 있습니다.

| 파일                                       | 내용                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| [`axis.ts`](#axists)                       | 키 표(`resizeKeyMap`), separator 의 ARIA(`separatorProps`), `ResizeAxis` 타입         |
| [`measure.ts`](#measurets)                 | 그려진 크기와 CSS 의 px 한계 재기, 쓰는 방향, 끄는 동안 문서의 커서                 |
| [`use-resize-drag.ts`](#use-resize-dragts) | 포인터 끌기 hook. 한 프레임에 한 번 움직임을 알리고 Escape 로 되돌린다               |
| [`use-resize-axes.ts`](#use-resize-axests) | `ResizeAxis` 를 끌기, 키, separator 에 잇는 hook, 그려진 크기를 지켜보는 hook       |
| [`grip.tsx`](#griptsx)                     | 모서리 손잡이 `ResizeGrip`. 한 축이면 separator, 두 축이면 separator 둘을 담은 group |
| [`style.ts`](#stylets)                     | 손잡이 클래스 조각 `resizeHandle`, 모서리 손잡이의 `resizeGripStyle`                 |

## 쓰는 곳

| 가져가는 것                                                           | 쓰는 곳                                             |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| `resizeKeyMap`, `separatorProps`, `resizeHandle`                      | DataTable 의 열 너비 핸들                           |
| `useMeasuredAxes`, `useAxisSeparator`, `ResizeGrip`, `resizeHandle`   | Resizable(가장자리 손잡이와 모서리 손잡이)          |
| `useMeasuredAxes`, `ResizeGrip`, `ResizeAxis`                         | TextArea 의 크기 조절 손잡이                        |
| `data-resize-handle` 속성                                             | Drawer 의 끌기 제외, `pressable.ts` 의 안쪽 컨트롤 |

- 크기를 가진 상태(열 너비, 요소 크기, 패널 크기)는 쓰는 쪽이 가집니다. 이 모듈은 값을 받아 다음 값을 계산하고 알려 줄 뿐입니다.
- DataTable 은 끌기를 TanStack Table 의 `getResizeHandler()` 에 맡기고 키, ARIA, 클래스만 가져갑니다. 열 너비는 TanStack 의 상태라서, 끄는 동안의 너비를 `<col>` 에 그리는 일도 TanStack 이 합니다.
- 패널 사이의 경계(Splitter)는 `useResizeDrag`, `resizeKeyMap`, `separatorProps`, `resizeHandle` 을 그대로 쓰고, 패널 크기 계산과 `Enter`(접기)만 따로 둡니다.

## axis.ts

### 쓰는 법

```tsx
// components/data/data-table/column-header.tsx
const range = { value: size, min, max };

<div
  {...separatorProps({ orientation: 'vertical', ...range })}
  aria-label={t('dataTable.resize', { column: columnName(header) })}
  onKeyDown={keyHandler(
    { ...resizeKeyMap('vertical', range, resizeTo), Enter: () => column.resetSize() },
    { dir: rtl ? 'rtl' : 'ltr' },
  )}
/>
```

| 키                | `vertical`(너비) | `horizontal`(높이) |
| ----------------- | ---------------- | ------------------ |
| `←` `→` / `↑` `↓` | 16px 줄이고 늘림 | 16px 줄이고 늘림   |
| `Shift` + 방향키  | 64px             | 64px               |
| `Home` / `End`    | `min` / `max`    | `min` / `max`      |

### 왜 이렇게

- `orientation` 은 ARIA 의 뜻 그대로 **선의 방향**입니다. 너비를 바꾸는 손잡이는 세로선(`vertical`)이라 `←` `→` 로 움직이고, 높이를 바꾸는 손잡이는 가로선(`horizontal`)이라 `↑` `↓` 로 움직입니다. `separatorOrientation('width')` 가 `'vertical'` 입니다.
- 방향키는 선이 움직이는 쪽입니다. 오른쪽 끝의 선은 `→` 로 넓어지고, 아래쪽 선은 `↓` 로 높아집니다. RTL 에서 끝은 왼쪽이라 `keyHandler` 의 `dir: 'rtl'` 이 `←` `→` 를 맞바꿉니다.
- 다음 값은 `clamp` 로 `[min, max]` 안에 둡니다. `max` 가 `Infinity` 면 `End` 는 표에 없고 `aria-valuemax` 도 붙이지 않습니다. separator 의 `aria-valuemax` 기본값은 100 이라, 400px 에 빈 최댓값을 두면 범위 밖으로 읽힙니다.
- `Enter` 는 표에 없습니다. 되돌리기(Resizable, DataTable)든 접기(Splitter)든 쓰는 쪽이 정합니다.
- `separatorProps` 는 `tabIndex={0}` 과 `data-resize-handle` 도 붙입니다. `disabled` 면 Tab 순서에서 빠지고 `aria-disabled`, `data-disabled` 가 붙습니다.
- `axisSeparatorProps(axis, t, disabled)` 는 `ResizeAxis` 에서 값(정수 px), 이름("너비", "높이"), `aria-valuetext`("400px"), `aria-controls` 를 채웁니다. 문구는 `resizable` 묶음의 키입니다.

### 알아둘 것

- `aria-valuenow` 가 없는 포커스 가능한 separator 는 axe 의 `aria-required-attr` 에 걸립니다. 값을 모르는 첫 렌더(서버 렌더, 크기를 주지 않은 요소)에만 비워 두고, 그려진 크기를 재면 채웁니다.

## measure.ts

- `measureAxis(element, dimension)` 는 그려진 크기(`offsetWidth`, `offsetHeight`. `content-box` 면 padding 과 border 를 뺀 값)와 CSS 의 `min-*`, `max-*` 가운데 px 인 값을 돌려줍니다. `%` 나 `min-content` 는 읽을 수 없어 `0` 과 `Infinity` 로 둡니다.
- `holdResizeCursor(document, cursor)` 는 끄는 동안 `<html>` 에 크기 조절 커서와 `user-select: none` 을 걸고, 되돌리는 함수를 돌려줍니다. 포인터가 손잡이 밖으로 나가도 커서가 바뀌지 않고, 끄는 길의 글자가 선택되지 않습니다.
- `markDragged`, `isBeingDragged` 는 끄는 중인 요소를 `WeakSet` 에 적습니다. `useMeasuredAxes` 가 끄는 동안의 크기 변화를 state 로 옮기지 않게 합니다.

## use-resize-drag.ts

### 쓰는 법

```ts
const drag = useResizeDrag({
  axes: 'inline',                        // 'inline' | 'block' | 'both' → ew / ns / nwse(RTL 이면 nesw) 커서
  disabled,
  onStart: () => { /* 시작 크기를 적어 둔다 */ },
  onMove: ({ inline, block }) => { /* 한 프레임에 한 번: DOM 에 바로 쓴다 */ },
  onEnd: ({ inline, block }) => { /* 한 번: state 로 확정한다 */ },
  onCancel: () => { /* Escape, 움직이지 않은 누르기: 시작 크기로 */ },
  onReset: () => { /* 두 번 누르기 */ },
  onDraggingChange: (dragging) => { /* 시작과 끝. 같은 이벤트 안에서 부른다 */ },
});

<div {...drag.dragProps} />               // data-resize-handle, data-dragging, pointer 핸들러, onDoubleClick
```

### 왜 이렇게

- 주 버튼(`button === 0`)만 끕니다. `pointerdown` 의 기본 동작을 막아 포커스가 옮겨 가지 않고 글자 선택이 시작되지 않습니다.
- `tryCapturePointer` 로 포인터를 잡아 손잡이 밖의 움직임도 받습니다. `touch-action: none` 은 클래스 조각(`resizeHandle.base`)이 겁니다.
- `pointermove` 는 좌표만 적고, 계산과 DOM 쓰기는 `requestAnimationFrame` 에서 한 번 합니다. 끄는 동안 React 는 다시 렌더하지 않고, `onEnd` 에서 한 번 확정합니다.
- 델타는 논리 방향입니다. `inline` 은 쓰는 방향의 끝 쪽이 양수라 RTL 에서는 `x` 이동을 뒤집고, `block` 은 아래쪽이 양수입니다.
- 끝은 `pointerup`, `pointercancel`, `lostpointercapture` 가운데 먼저 온 것입니다. 움직이지 않고 떼면 `onCancel` 입니다. 누르기만 한 손잡이가 크기를 주지 않은 요소를 px 로 굳히지 않습니다.
- 끄는 동안 `window` 의 capture 단계에서 Escape 를 듣고 `preventDefault()` 한 뒤 `onCancel` 을 부릅니다. 레이어 스택(`overlay/layer-stack.ts`)은 `defaultPrevented` 인 Escape 를 건너뛰므로, 대화상자 안에서 끌다 Escape 를 눌러도 대화상자는 닫히지 않습니다. 전파는 막지 않습니다.
- 끄는 동안 손잡이에 `data-dragging` 이 붙습니다. 끄는 도중 컴포넌트가 사라지면 커서, 리스너, 프레임을 풀고 `onCancel` 을 부릅니다.

### 알아둘 것

- 콜백은 렌더마다 새로 넘겨도 됩니다. hook 은 마지막 렌더의 콜백을 부릅니다.
- `click` 은 끌고 놓아도 납니다. 누르는 표면 안의 손잡이가 표면을 누르지 않는 것은 `pressable.ts` 가 `[data-resize-handle]` 을 안쪽 컨트롤로 보기 때문입니다.

## use-resize-axes.ts

`ResizeAxis` 는 크기를 바꿀 요소 하나의 한 축입니다.

```ts
type ResizeAxis = {
  dimension: 'width' | 'height';
  target: HTMLElement | null;   // 크기를 바꿀 요소
  size: number | undefined;     // aria-valuenow. 없으면 아직 모른다
  min: number;                  // 한계. 잴 때 CSS 의 px 한계와 한 번 더 겹친다
  max: number;
  controls?: string;            // aria-controls
  resize: (size: number) => void;
  reset: () => void;            // Enter, 두 번 누르기
};
```

```tsx
// components/layout/resizable/handle.tsx: 한 축의 가장자리 손잡이
const separator = useAxisSeparator(axis, { disabled, onDraggingChange });
<div {...separator} aria-label={props['aria-label'] ?? separator['aria-label']} />
```

- `useMeasuredAxes({ width, height })` 는 `ResizeObserver` 로 그려진 크기와 CSS px 한계를 state 로 둡니다. 크기를 주지 않은 축의 `aria-valuenow` 와, CSS 한계가 들어간 `aria-valuemin` `aria-valuemax` 가 여기서 옵니다. 끄는 동안은 읽지 않습니다.
- `useAxesDrag(axes, { disabled, onDraggingChange })` 는 `useResizeDrag` 를 축에 잇습니다. 시작할 때 그려진 크기와 한계를 재고, 프레임마다 요소의 `style.width` / `style.height` 에 바로 쓰고, 끝에는 인라인 값을 시작 전으로 되돌린 뒤 `flushSync` 로 `resize` 를 부릅니다. 제어 컴포넌트의 부모가 값을 받지 않으면 요소는 원래 크기로 남습니다.
- `axisKeyMap(axis, resizeTo?)` 는 누른 순간의 그려진 크기로 `resizeKeyMap` 을 만듭니다.
- `useAxisSeparator(axis, options)` 는 한 축의 separator 에 필요한 것(ARIA, 끌기, 키, `Enter` 되돌리기)을 한 번에 돌려줍니다.

### 왜 이렇게

- 끄는 동안 CSS 변수가 아니라 크기 속성 자체를 씁니다. 인라인 `width: var(--x)` 는 변수가 비어 있으면 `auto` 가 되어 요소의 `w-full`, `w-80` 같은 클래스 너비를 지웁니다. 크기를 바꾼 적 없는 요소는 클래스 너비를 그대로 써야 합니다.
- 계산은 늘 **그려진 크기**에서 시작합니다. CSS 한계에 막혀 state 와 그려진 크기가 달라져도, 다음 끌기와 키가 막힌 곳에서 이어집니다.
- 끝에 되돌리고 확정하는 것은 한 이벤트 안이라 화면에는 되돌린 크기가 그려지지 않습니다.

## grip.tsx

모서리 손잡이입니다. 축 수에 따라 모양이 둘입니다.

| 축          | 구조                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| 하나        | 손잡이 자신이 `role="separator"`(이름 "너비" 또는 "높이")이고 Tab 에 멈춘다                            |
| 너비와 높이 | 손잡이는 `role="group"`(이름 "크기 조절"), 안에 숨은 separator 둘이 roving tabindex 로 Tab 한 칸이다 |

```tsx
// components/layout/resizable/handle.tsx
<ResizeGrip
  axes={[axes.width, axes.height]}
  disabled={disabled}
  onDraggingChange={onDraggingChange}
  className={styles.grip({ className })}
/>

// components/form/text-area/input.tsx: 입력 칸(ScrollArea)의 끝 아래 모서리를 차지한다.
// 높이 축은 textarea, 너비 축은 테두리 컨테이너를 바꾼다
<ScrollArea.Corner>
  <ResizeGrip axes={resize.axes} disabled={resize.disabled} />
</ScrollArea.Corner>
```

- 두 축의 요소가 달라도 됩니다. 축마다 `target` 이 있어, TextArea 는 높이를 textarea 에, 너비를 필드 전체에 씁니다.

- 두 축이면 `←` `→` 가 너비를 바꾸고 너비 separator 로, `↑` `↓` 가 높이를 바꾸고 높이 separator 로 포커스를 옮깁니다. 값을 바꾼 뒤(`flushSync`) 포커스를 옮기므로, 포커스는 늘 값이 이미 바뀐 separator 에 있어 스크린 리더가 바뀐 값을 읽습니다. `Home` `End` 는 포커스한 축, `Enter` 와 두 번 누르기는 두 축 모두를 되돌립니다.
- 포커스 링은 group 에 `:has(:focus-visible)` 로 그립니다. separator 는 `sr-only` 입니다.
- 포인터로는 두 축을 함께 끕니다. `asChild` 면 자식 요소가 손잡이가 되고 숨은 separator 는 그 안에 들어갑니다. `children` 은 기본 표시(대각선 두 줄)를 바꿉니다.
- 표시는 `rtl:-scale-x-100` 으로 뒤집혀 RTL 의 왼쪽 아래 모서리를 향합니다.

## style.ts

| 조각                           | 내용                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `resizeHandle.base`            | `touch-none select-none outline-none` 과 누를 영역이 될 `after:absolute`                     |
| `resizeHandle.hitArea.*`       | `after:` 로 24px 누를 영역(2.5.8). `vertical` 은 폭, `horizontal` 은 높이, `corner` 는 24x24 |
| `resizeHandle.cursor.*`        | `ew-resize`, `ns-resize`, `nwse-resize`(RTL `nesw-resize`)                                   |
| `resizeHandle.focus`           | `focus-ring`                                                                                 |
| `resizeHandle.focusWithin`     | 안의 separator 가 `:focus-visible` 일 때 그리는 링                                           |
| `resizeHandle.ladder.ink/pill` | 손잡이 사다리: `handle` → hover `handle-hover` → `data-dragging` `handle-active`             |
| `resizeHandle.disabled`        | `data-disabled` 면 포인터를 받지 않고 흐리게                                                 |
| `resizeGripStyle`              | 모서리 손잡이의 `grip`(16px, `rounded-indicator`), `mark`, `separator` 슬롯                  |

- 보이는 선이나 표시가 얇아도 누를 영역은 24px 입니다. 영역은 가운데 정렬이라 손잡이 요소의 두께와 상관없습니다.
- DataTable 은 선을 `before:` 로 그리고 쉬는 때 투명하게 둡니다. 열 경계마다 선이 보이지 않게 하려는 것입니다. 커서는 `col-resize` 로 바꿔 씁니다.
- DataTable 의 누를 영역은 경계 양쪽 12px 이라, 옆 열의 정렬 버튼 가장자리 4px(tiny 8px)은 핸들이 받습니다.
