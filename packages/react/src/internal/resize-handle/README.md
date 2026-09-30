# resize-handle

끌거나 키로 크기를 바꾸는 손잡이의 공용 부품입니다. 키 표, `role="separator"` 의 ARIA, 손잡이 클래스 조각이 있습니다.

| 파일                 | 내용                                                            |
| -------------------- | --------------------------------------------------------------- |
| [`axis.ts`](#axists) | 키 표(`resizeKeyMap`), separator 의 ARIA(`separatorProps`)      |
| [`style.ts`](#stylets) | 손잡이 클래스 조각 `resizeHandle`                              |

## 쓰는 곳

| 가져가는 것                                      | 쓰는 곳                                             |
| ------------------------------------------------ | --------------------------------------------------- |
| `resizeKeyMap`, `separatorProps`, `resizeHandle` | DataTable 의 열 너비 핸들                           |
| `data-resize-handle` 속성                        | Drawer 의 끌기 제외, `pressable.ts` 의 안쪽 컨트롤 |

- 크기를 가진 상태(열 너비, 요소 크기, 패널 크기)는 쓰는 쪽이 가집니다. 이 모듈은 값을 받아 다음 값을 계산하고 알려 줄 뿐입니다.
- DataTable 은 끌기를 TanStack Table 의 `getResizeHandler()` 에 맡기고 키, ARIA, 클래스만 가져갑니다. 열 너비는 TanStack 의 상태라서, 끄는 동안의 너비를 `<col>` 에 그리는 일도 TanStack 이 합니다.

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
- `Enter` 는 표에 없습니다. 되돌리기(DataTable)든 접기(Splitter)든 쓰는 쪽이 정합니다.
- `separatorProps` 는 `tabIndex={0}` 과 `data-resize-handle` 도 붙입니다. `disabled` 면 Tab 순서에서 빠지고 `aria-disabled`, `data-disabled` 가 붙습니다.

### 알아둘 것

- `aria-valuenow` 가 없는 포커스 가능한 separator 는 axe 의 `aria-required-attr` 에 걸립니다. 값을 모르는 첫 렌더(서버 렌더)에만 비워 둡니다.

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

- 보이는 선이나 표시가 얇아도 누를 영역은 24px 입니다. 영역은 가운데 정렬이라 손잡이 요소의 두께와 상관없습니다.
- DataTable 은 선을 `before:` 로 그리고 쉬는 때 투명하게 둡니다. 열 경계마다 선이 보이지 않게 하려는 것입니다. 커서는 `col-resize` 로 바꿔 씁니다.
- DataTable 의 누를 영역은 경계 양쪽 12px 이라, 옆 열의 정렬 버튼 가장자리 4px(tiny 8px)은 핸들이 받습니다.
