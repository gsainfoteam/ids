# resize-handle

끌거나 키로 크기를 바꾸는 손잡이의 공용 부품입니다. 키 표, `role="separator"` 의 ARIA, 포인터 끌기, 손잡이 클래스 조각, 가장자리 위의 막대로 그리는 가장자리 손잡이(`ResizeEdge`), 모서리를 따라 휜 호로 그리는 모서리 손잡이(`ResizeGrip`)가 있습니다.

| 파일                                       | 내용                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| [`axis.ts`](#axists)                       | 키 표(`resizeKeyMap`), separator 의 ARIA(`separatorProps`), `ResizeAxis` 타입         |
| [`measure.ts`](#measurets)                 | 그려진 크기와 CSS 의 px 한계, 모서리 반지름 재기, 쓰는 방향, 끄는 동안 문서의 커서  |
| [`use-resize-drag.ts`](#use-resize-dragts) | 포인터 끌기 hook. 한 프레임에 한 번 움직임을 알리고 Escape 로 되돌린다               |
| [`use-resize-axes.ts`](#use-resize-axests) | `ResizeAxis` 를 끌기, 키, separator 에 잇는 hook, 크기와 모서리 반지름을 지켜보는 hook |
| [`edge.tsx`](#edgetsx)                     | 가장자리 손잡이 `ResizeEdge`. 한 축의 separator 이고 가장자리 위의 막대로 그린다     |
| [`arc.ts`](#arcts)                         | 모서리 손잡이의 호와 누를 띠의 SVG path, 손잡이 상자의 크기(순수 함수)               |
| [`grip.tsx`](#griptsx)                     | 모서리 손잡이 `ResizeGrip`. 숨은 separator 둘(너비, 높이)을 담은 group               |
| [`style.ts`](#stylets)                     | 손잡이 클래스 조각 `resizeHandle`, `resizeEdgeStyle`, `resizeGripStyle`              |

## 쓰는 곳

| 가져가는 것                                                           | 쓰는 곳                                             |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| `resizeKeyMap`, `separatorProps`, `resizeHandle`                      | DataTable 의 열 너비 핸들                           |
| `useMeasuredAxes`, `ResizeEdge`, `ResizeGrip`                         | Resizable(가장자리 손잡이와 모서리 손잡이)          |
| `useMeasuredAxes`, `ResizeEdge`, `ResizeGrip`(`band="outward"`)       | TextArea 의 크기 조절 손잡이                        |
| `useResizeDrag`, `resizeKeyMap`, `separatorProps`, `resizeHandle`     | Splitter 의 패널 사이 핸들                          |
| `data-resize-handle` 속성                                             | Drawer 의 끌기 제외, `pressable.ts` 의 안쪽 컨트롤 |

- 크기를 가진 상태(열 너비, 요소 크기, 패널 크기)는 쓰는 쪽이 가집니다. 이 모듈은 값을 받아 다음 값을 계산하고 알려 줄 뿐입니다.
- Resizable 과 TextArea 는 같은 `ResizeEdge`, `ResizeGrip` 을 그립니다. 모양과 자리는 이 모듈의 스타일이 정하므로 두 컴포넌트의 손잡이는 늘 같습니다. 다른 것은 누를 띠(`band`) 하나입니다([누를 띠](#누를-띠)).
- DataTable 은 끌기를 TanStack Table 의 `getResizeHandler()` 에 맡기고 키, ARIA, 클래스만 가져갑니다. 열 너비는 TanStack 의 상태라서, 끄는 동안의 너비를 `<col>` 에 그리는 일도 TanStack 이 합니다.
- Splitter 는 끌기, 키 표, separator ARIA, 클래스 조각을 가져가고, 퍼센트 계산(`layout.ts`), 방향키 한 걸음의 뜻(`resizeBy`), `Enter`(접기), 누른 핸들의 포커스는 자기 것으로 둡니다. 끌기의 px 는 패널들이 나눠 쓰는 길이(핸들 선을 뺀 길이)로 나눠 퍼센트로 바꿉니다.

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

```ts
// components/layout/splitter/use-splitter.ts: 방향키의 걸음을 직접 받는다
const stepBy = (px: number) =>
  moveHandleTo(handle, sizes, keyTarget(sizes, constraints, handle, (px * 100) / length));

resizeKeyMap(
  handleLine,
  { value: range.now, min: range.min, max: range.max }, // 퍼센트. Home, End 만 읽는다
  (size) => moveHandleTo(handle, sizes, size),
  stepBy,
);
```

### 왜 이렇게

- `orientation` 은 ARIA 의 뜻 그대로 **선의 방향**입니다. 너비를 바꾸는 손잡이는 세로선(`vertical`)이라 `←` `→` 로 움직이고, 높이를 바꾸는 손잡이는 가로선(`horizontal`)이라 `↑` `↓` 로 움직입니다. `separatorOrientation('width')` 가 `'vertical'` 입니다.
- 방향키는 선이 움직이는 쪽입니다. 오른쪽 끝의 선은 `→` 로 넓어지고, 아래쪽 선은 `↓` 로 높아집니다. RTL 에서 끝은 왼쪽이라 `keyHandler` 의 `dir: 'rtl'` 이 `←` `→` 를 맞바꿉니다.
- 다음 값은 `clamp` 로 `[min, max]` 안에 둡니다. `max` 가 `Infinity` 면 `End` 는 표에 없고 `aria-valuemax` 도 붙이지 않습니다. separator 의 `aria-valuemax` 기본값은 100 이라, 400px 에 빈 최댓값을 두면 범위 밖으로 읽힙니다.
- 넷째 인자 `resizeBy` 를 넘기면 방향키는 걸음(부호 붙은 px)을 그대로 넘기고 자르지 않습니다. 넘기지 않으면 `value` 에 걸음을 더해 자른 값으로 `resizeTo` 를 부릅니다. 이때 범위는 `Home` `End` 만 읽어서 px 가 아니어도 됩니다.
- Splitter 가 `resizeBy` 를 쓰는 이유: 한 걸음이 접힌 패널을 최소 크기까지 열거나 최소 크기의 패널을 접고(`keyTarget`), 앞 패널이 최소 크기에 닿으면 그 앞 패널까지 밉니다. 앞 패널의 범위로 자르면 이 두 가지가 막힙니다. `Home` `End` 는 앞 패널의 범위 끝으로 갑니다.
- `Enter` 는 표에 없습니다. 되돌리기(Resizable, DataTable)든 접기(Splitter)든 쓰는 쪽이 정합니다.
- `separatorProps` 는 `tabIndex={0}` 과 `data-resize-handle` 도 붙입니다. `disabled` 면 Tab 순서에서 빠지고 `aria-disabled`, `data-disabled` 가 붙습니다.
- `axisSeparatorProps(axis, t, disabled)` 는 `ResizeAxis` 에서 값(정수 px), 이름("너비", "높이"), `aria-valuetext`("400px"), `aria-controls` 를 채웁니다. 문구는 `resizable` 묶음의 키입니다.

### 알아둘 것

- `aria-valuenow` 가 없는 포커스 가능한 separator 는 axe 의 `aria-required-attr` 에 걸립니다. 값을 모르는 첫 렌더(서버 렌더, 크기를 주지 않은 요소)에만 비워 두고, 그려진 크기를 재면 채웁니다.

## measure.ts

- `measureAxis(element, dimension)` 는 그려진 크기(`offsetWidth`, `offsetHeight`. `content-box` 면 padding 과 border 를 뺀 값)와 CSS 의 `min-*`, `max-*` 가운데 px 인 값을 돌려줍니다. `%` 나 `min-content` 는 읽을 수 없어 `0` 과 `Infinity` 로 둡니다.
- `holdResizeCursor(document, cursor)` 는 끄는 동안 `<html>` 에 크기 조절 커서와 `user-select: none` 을 걸고, 되돌리는 함수를 돌려줍니다. 포인터가 손잡이 밖으로 나가도 커서가 바뀌지 않고, 끄는 길의 글자가 선택되지 않습니다.
- `markDragged`, `isBeingDragged` 는 끄는 중인 요소를 `WeakSet` 에 적습니다. `useMeasuredAxes` 가 끄는 동안의 크기 변화를 state 로 옮기지 않게 합니다.
- `innerEndEndRadius(element)` 는 `border-end-end-radius`(LTR 오른쪽 아래, RTL 왼쪽 아래)를 읽어, 짧은 변의 절반으로 자르고, 그 모서리의 테두리 두께(`border-inline-end-width`, `border-block-end-width` 중 큰 쪽)를 뺀 안쪽 반지름입니다. `%` 는 가로 값은 폭, 세로 값은 높이에 대해 풀고, 타원 반지름은 둘 중 작은 쪽을 씁니다.

## use-resize-drag.ts

### 쓰는 법

```ts
const drag = useResizeDrag({
  axes: 'inline',                        // 'inline' | 'block' | 'both' → ew / ns / nwse(RTL 이면 nesw) 커서
  disabled,
  onStart: (handle) => { /* 시작 크기를 적어 둔다. handle 은 누른 손잡이 요소 */ },
  onMove: ({ inline, block }) => { /* 한 프레임에 한 번: DOM 에 바로 쓴다 */ },
  onEnd: ({ inline, block }) => { /* 한 번: state 로 확정한다 */ },
  onCancel: () => { /* Escape, 움직이지 않은 누르기: 시작 크기로 */ },
  onReset: () => { /* 두 번 누르기 */ },
  onDraggingChange: (dragging) => { /* 시작과 끝. 같은 이벤트 안에서 부른다 */ },
});

<div {...drag.dragProps} />               // data-resize-handle, data-dragging, pointer 핸들러, onDoubleClick
```

### 왜 이렇게

- 주 버튼(`button === 0`)만 끕니다. `pointerdown` 의 기본 동작을 막아 포커스가 옮겨 가지 않고 글자 선택이 시작되지 않습니다. 누른 손잡이에 포커스를 주려면 쓰는 쪽이 `onStart` 가 받은 요소에 줍니다. Splitter 는 누른 핸들에 포커스를 두어 바로 방향키로 이어 옮길 수 있게 합니다.
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
// edge.tsx: 한 축의 가장자리 손잡이
const separator = useAxisSeparator(axis, { disabled, onDraggingChange });
<div {...separator} aria-label={props['aria-label'] ?? separator['aria-label']} />
```

- `useMeasuredAxes({ width, height })` 는 `ResizeObserver` 로 그려진 크기와 CSS px 한계를 state 로 둡니다. 크기를 주지 않은 축의 `aria-valuenow` 와, CSS 한계가 들어간 `aria-valuemin` `aria-valuemax` 가 여기서 옵니다. 끄는 동안은 읽지 않습니다.
- `useAxesDrag(axes, { disabled, onDraggingChange })` 는 `useResizeDrag` 를 축에 잇습니다. 시작할 때 그려진 크기와 한계를 재고, 프레임마다 요소의 `style.width` / `style.height` 에 바로 쓰고, 끝에는 인라인 값을 시작 전으로 되돌린 뒤 `flushSync` 로 `resize` 를 부릅니다. 제어 컴포넌트의 부모가 값을 받지 않으면 요소는 원래 크기로 남습니다.
- `axisKeyMap(axis, resizeTo?)` 는 누른 순간의 그려진 크기로 `resizeKeyMap` 을 만듭니다.
- `useAxisSeparator(axis, options)` 는 한 축의 separator 에 필요한 것(ARIA, 끌기, 키, `Enter` 되돌리기)을 한 번에 돌려줍니다.
- `useCornerRadius(corner)` 는 `corner` 요소의 `innerEndEndRadius` 를 state 로 둡니다. 마운트할 때와 `ResizeObserver` 가 크기 변화를 알릴 때 읽고, 부른 컴포넌트가 다시 렌더될 때마다 한 번 더 읽습니다. 요소가 아직 없으면 `null` 입니다.

### 왜 이렇게

- 끄는 동안 CSS 변수가 아니라 크기 속성 자체를 씁니다. 인라인 `width: var(--x)` 는 변수가 비어 있으면 `auto` 가 되어 요소의 `w-full`, `w-80` 같은 클래스 너비를 지웁니다. 크기를 바꾼 적 없는 요소는 클래스 너비를 그대로 써야 합니다.
- 계산은 늘 **그려진 크기**에서 시작합니다. CSS 한계에 막혀 state 와 그려진 크기가 달라져도, 다음 끌기와 키가 막힌 곳에서 이어집니다.
- 끝에 되돌리고 확정하는 것은 한 이벤트 안이라 화면에는 되돌린 크기가 그려지지 않습니다.
- 반지름은 크기가 그대로인 채 클래스만 바뀌어도(`rounded-*` 교체) 달라지는데, `ResizeObserver` 는 이것을 알리지 않습니다. 그래서 렌더마다 다시 읽고, 같은 값이면 state 가 그대로라 다시 렌더하지 않습니다.

## edge.tsx

가장자리 손잡이입니다. 손잡이 자신이 `role="separator"`(이름 "너비" 또는 "높이")이고 Tab 에 멈춥니다.

```tsx
// components/layout/resizable/handle.tsx
<ResizeEdge
  axis={direction === 'horizontal' ? axes.width : axes.height}
  disabled={disabled}
  onDraggingChange={onDraggingChange}
  data-resizable-handle=""
/>

// components/form/text-area/root.tsx: 필드의 마지막 자식. 누를 띠는 바깥으로만
<ResizeEdge axis={height} band="outward" disabled={disabled} />
```

| 축의 `dimension` | 가장자리                      | 손잡이 요소                 | 보이는 막대(`before:`) | 커서        |
| ---------------- | ----------------------------- | --------------------------- | ---------------------- | ----------- |
| `width`          | 끝(LTR 오른쪽, RTL 왼쪽)      | `inset-y-0 -end-px w-0.5`   | 4x32px                 | `ew-resize` |
| `height`         | 아래                          | `inset-x-0 -bottom-px h-0.5` | 32x4px                 | `ns-resize` |

- 손잡이 요소는 가장 가까운 positioned 조상(Resizable 의 root, TextArea 의 필드)의 padding 상자 가장자리를 가운데에 둔 2px 띠이고, 막대는 그 가운데에 그립니다. 막대는 요소 밖으로 2px 나옵니다.
- ARIA, 끌기, 키, `Enter` 되돌리기는 `useAxisSeparator` 입니다. `data-resize-edge` 가 붙습니다.
- `className` 은 `resizeEdgeStyle` 에 합쳐 겹치는 클래스(위치, 크기, `before:hidden`)를 이깁니다. `asChild` 면 자식 요소가 손잡이가 됩니다.
- 포커스는 손잡이 요소의 `focus-ring` 입니다. 가장자리 전체를 따라 3px 링이 생깁니다.

### 알아둘 것

- 부르는 쪽은 조상을 `relative` 로 두고, `overflow` 로 자르지 않습니다. 자르면 막대의 바깥 2px 과 누를 띠의 바깥 부분이 잘립니다.

## 누를 띠

`ResizeEdge` 와 `ResizeGrip` 은 `band` 로 누를 띠의 자리를 고릅니다. 띠의 폭은 둘 다 24px 입니다(2.5.8).

| `band`           | 누를 띠                                                          | 쓰는 곳   |
| ---------------- | ---------------------------------------------------------------- | --------- |
| `centered`(기본) | 선을 가운데에 둔다. 요소 안쪽 12px, 바깥 12px                    | Resizable |
| `outward`        | 선의 안쪽 끝에서 바깥으로. 요소 안쪽 2px(보이는 선), 바깥 22px   | TextArea  |

```ts
// style.ts: 가장자리 손잡이의 띠(after:)
{ dimension: 'height', band: 'centered', class: 'after:inset-x-0 after:top-1/2 after:h-6 after:-translate-y-1/2' }
{ dimension: 'height', band: 'outward', class: 'after:inset-x-0 after:-top-px after:h-6' } // 2px 요소의 1px 위 = 막대의 위 끝
```

### 왜 이렇게

- TextArea 는 가장자리 가까이에 누를 것이 있습니다. 가운데 띠의 안쪽 12px 은 그것을 덮습니다.
  - 아래 바의 버튼: 아래와 끝 가장자리에서 6px(tiny 4px) 안쪽에서 끝납니다.
  - 세로 스크롤 막대: 끝 가장자리에서 2px 안쪽부터 8px 입니다. `horizontal` 의 띠가 막대 전체를, `vertical` 의 띠가 막대의 아래 끝을 덮습니다.
- `outward` 의 띠는 보이는 선의 안쪽 끝(2px)에서 멈춥니다. 보이는 선은 어디를 눌러도 손잡이이고, 스크롤 막대(2px 안쪽부터)와 버튼은 덮지 않습니다.
- 대신 요소 밖 22px 을 덮습니다. 절대 위치 요소는 흐름 안의 다음 형제보다 위에 그려지므로, 필드 아래(`Field` 의 설명과 오류는 8px 아래)나 끝 쪽 22px 안의 것은 손잡이가 받습니다.
- Resizable 은 안쪽 내용을 모르므로 가운데 띠를 두고, 끝에 붙은 안쪽 컨트롤이 있으면 `Resizable.Handle` 의 `className` 으로 영역을 바꾸게 합니다.

## arc.ts

`gripArc(cornerRadius, band)` 는 모서리 손잡이를 그릴 값을 돌려줍니다. 순수 함수입니다.

| 값       | 뜻                                                                                     |
| -------- | -------------------------------------------------------------------------------------- |
| `size`   | 손잡이 상자의 한 변. 상자의 끝 아래 꼭짓점이 요소의 padding 상자 꼭짓점에 놓인다        |
| `bleed`  | SVG 가 상자 밖으로 나가는 거리. 누를 띠의 바깥 끝까지: `centered` 12px, `outward` 22px  |
| `view`   | SVG 의 한 변(`size + 2 * bleed`), `viewBox` 와 같은 px                                  |
| `arc`    | 선(4px)과 포커스 띠(10px)가 따라가는 path. padding 상자의 가장자리 위                    |
| `target` | 누를 띠(24px, 끝은 자른 모양)의 path. `outward` 는 선에서 10px 바깥의 같은 중심 path    |

```ts
gripArc(15, 'centered'); // Resizable 의 16px 모서리(테두리 1px): 반지름 15 의 호, 선은 테두리 안쪽 선 위
gripArc(10, 'outward');  // TextArea 의 10px 모서리(테두리는 inset ring): 반지름 10 의 호, 띠는 반지름 20 의 path
gripArc(0, 'centered');  // 각진 모서리: 반지름 2 로 끝이 살짝 둥근 ㄴ 자
```

- path 는 LTR 의 끝 아래 모서리 모양입니다. 아래 가장자리를 따라 오다가(`H`) 모서리와 같은 중심의 4분의 1 원을 돌고(`A`) 끝 가장자리를 따라 올라갑니다(`V`). RTL 은 SVG 를 `rtl:-scale-x-100` 으로 뒤집어 왼쪽 아래 모서리가 됩니다.

### 왜 이렇게

- 선은 가장자리 막대처럼 padding 상자의 가장자리 위에 섭니다. 그래서 선의 반지름은 모서리 반지름이고, 선과 모서리의 중심이 같습니다. 반지름이 2px(선 두께의 절반)보다 작으면 2px 로 둡니다. 각진 모서리에서 끝이 살짝 둥근 ㄴ 자가 되는 까닭입니다.
- 직선은 호와 두 직선의 길이가 가장자리 막대와 같은 32px 이 되게 정하고, 적어도 4px 입니다.
- 누를 띠는 끝을 자른 선(`butt`)이라 손잡이 상자 밖으로 가장자리를 따라 더 나가지 않습니다.
- `outward` 의 띠는 선보다 10px 바깥에 반지름이 10px 큰 같은 중심 path 입니다. 24px 띠의 안쪽 끝이 선의 안쪽 끝과 겹칩니다([누를 띠](#누를-띠)).
- 좌표는 0.01px 로 반올림해 path 문자열을 짧게 둡니다.

## grip.tsx

모서리 손잡이입니다. 손잡이는 `role="group"`(이름 "크기 조절")이고, 안에 숨은 separator 둘(너비, 높이)이 roving tabindex 로 Tab 한 칸을 나눠 씁니다.

```tsx
// components/layout/resizable/handle.tsx
<ResizeGrip
  axes={[axes.width, axes.height]}
  corner={element}                       // 호가 따라갈 모서리의 요소. 손잡이의 positioned 조상
  disabled={disabled}
  onDraggingChange={onDraggingChange}
/>

// components/form/text-area/root.tsx: 높이 축은 textarea, 너비 축은 필드 전체를 바꾼다
<ResizeGrip axes={[width, height]} corner={shell} band="outward" disabled={disabled} />
```

- 손잡이는 가장 가까운 positioned 조상의 끝 아래 꼭짓점에 스스로 섭니다(`absolute end-0 bottom-0`). `corner` 는 그 조상이어야 호가 모서리와 같은 중심이 됩니다.
- 두 축의 요소가 달라도 됩니다. 축마다 `target` 이 있어, TextArea 는 높이를 textarea 에, 너비를 필드 전체에 씁니다.
- 반지름은 `useCornerRadius(corner)` 로 읽습니다. 읽기 전에는(서버 렌더, 첫 렌더) 호를 그리지 않고 separator 만 둡니다.
- `←` `→` 가 너비를 바꾸고 너비 separator 로, `↑` `↓` 가 높이를 바꾸고 높이 separator 로 포커스를 옮깁니다. 값을 바꾼 뒤(`flushSync`) 포커스를 옮기므로, 포커스는 늘 값이 이미 바뀐 separator 에 있어 스크린 리더가 바뀐 값을 읽습니다. `Home` `End` 는 포커스한 축, `Enter` 와 두 번 누르기는 두 축 모두를 되돌립니다.
- 포인터로는 두 축을 함께 끕니다.

### 왜 이렇게

- SVG 한 장에 path 셋을 겹칩니다. 아래부터 포커스 띠, 선, 누를 띠입니다.
  - 선은 `stroke: currentColor` 라 손잡이 상자의 글자색 사다리(`handle` → `handle-hover` → `data-dragging` 의 `handle-active`)를 그대로 따릅니다.
  - 포커스 띠는 선보다 양쪽 3px 넓은 `primary` 40% 선이고, 안의 separator 에 포커스가 있을 때(`:has(:focus-visible)`)만 보입니다. 그때 선은 `primary` 가 됩니다. `focus-ring` 의 3px 링과 테두리 색을 호에 옮긴 것입니다.
  - 누를 띠는 투명한 24px 선에 `pointer-events="stroke"` 를 줍니다. 손잡이 상자와 SVG 는 `pointer-events: none` 이라, 누를 곳은 호를 따라가는 띠뿐이고 상자의 나머지(호 안쪽의 내용)는 그대로 눌립니다.
- 띠에서 시작한 `pointerdown` 은 손잡이 상자의 React 핸들러로 올라가고, 끌기는 상자에 pointer capture 를 겁니다. capture 는 `pointer-events` 와 상관없이 걸립니다.
- 띠 위에 올리면 상자도 `:hover` 가 됩니다(자손을 가리키면 조상도 hover 입니다). 그래서 사다리가 띠 위에서만 한 단계 오릅니다. 커서는 띠에 걸고, `disabled` 면 띠가 포인터를 받지 않습니다(`group-data-disabled`).
- `children` 이나 `asChild` 를 받으면(`custom`) 호 대신 그 표시를 모서리 안쪽 16px 상자에 그립니다. 이때는 상자 자신이 포인터를 받고, 누를 영역은 상자 둘레 24px(`after:`), 포커스는 상자 둘레의 링입니다.

### 알아둘 것

- Storybook 의 `userEvent` 는 `pointer-events: none` 인 요소를 누르지 못합니다. play 에서는 `[data-resize-grip-target]` path 를 누릅니다. 테스트는 `[data-resize-grip-arc]` path 의 `getPointAtLength` 와 `getScreenCTM` 으로 호 위의 점을 구합니다(`tests/resize-grip.ts`).
- 부모에 `overflow: hidden` 이 있으면 선의 바깥 2px 과 띠의 바깥 부분(`centered` 12px, `outward` 22px)이 잘립니다. 가장자리 손잡이와 같습니다.

## style.ts

| 조각                           | 내용                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `resizeHandle.base`            | `touch-none select-none outline-none` 과 누를 영역이 될 `after:absolute`                     |
| `resizeHandle.hitArea.*`       | `after:` 로 가운데에 둔 24px 누를 영역(2.5.8). `vertical` 은 폭, `horizontal` 은 높이, `corner` 는 24x24 |
| `resizeHandle.cursor.*`        | `ew-resize`, `ns-resize`, `nwse-resize`(RTL `nesw-resize`)                                   |
| `resizeHandle.focus`           | `focus-ring`                                                                                 |
| `resizeHandle.focusWithin`     | 안의 separator 가 `:focus-visible` 일 때 그리는 링                                           |
| `resizeHandle.ladder.ink/pill` | 손잡이 사다리: `handle` → hover `handle-hover` → `data-dragging` `handle-active`             |
| `resizeHandle.ladder.line`     | 배경으로 그린 선: `border` → hover `handle-hover` → `data-dragging` `handle-active`          |
| `resizeHandle.disabled`        | `data-disabled` 면 포인터를 받지 않고 흐리게                                                 |
| `resizeEdgeStyle`              | 가장자리 손잡이. `dimension` 이 자리와 막대, `band` 가 누를 띠를 정한다                      |
| `resizeGripStyle`              | 모서리 손잡이의 `grip`(모서리에 서는 상자), `drawing`(SVG), `halo`, `arc`, `target`, `separator` 슬롯. `custom` 변형은 표시를 담는 16px 상자 |

- 보이는 선이나 표시가 얇아도 누를 영역은 24px 입니다. `hitArea.*` 는 가운데 정렬이라 손잡이 요소의 두께와 상관없습니다.
- DataTable 은 선을 `before:` 로 그리고 쉬는 때 투명하게 둡니다. 열 경계마다 선이 보이지 않게 하려는 것입니다. 커서는 `col-resize` 로 바꿔 씁니다.
- Splitter 의 핸들은 1px 요소 자신이 선이라 `ladder.line` 을 씁니다. 쉬는 때는 패널 사이의 구분선이고 올리거나 끌 때만 손잡이 색이 됩니다. 배경이 바뀌므로 전환은 `motion` 대신 `transition-colors` 입니다. `className="bg-..."` 로 쉬는 색만 바꿔도 hover 와 끄는 동안의 색은 남습니다.
- DataTable 의 누를 영역은 경계 양쪽 12px 이라, 옆 열의 정렬 버튼 가장자리 4px(tiny 8px)은 핸들이 받습니다.
