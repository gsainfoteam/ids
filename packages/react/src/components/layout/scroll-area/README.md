# ScrollArea

넘치는 내용을 브라우저 스크롤 그대로 움직이고, OS 의 회색 막대 대신 IDS 막대를 내용 위에 그립니다.

- **스크롤은 브라우저 것.** 휠, 트랙패드, 터치, 키보드, `scrollTop` 이 평소처럼 동작합니다. 막대만 숨깁니다(`scrollbar-width: none`, `::-webkit-scrollbar`).
- **끝에서 튕기지 않습니다.** viewport 는 `overscroll-behavior: none` 이라 끝을 넘겨 끌어도 고무줄처럼 늘어났다 돌아오지 않고, 스크롤이 바깥 페이지로 넘어가지도 않습니다. 튕김이나 페이지로 이어지는 스크롤이 필요하면 `ScrollArea.Viewport` 에 `overscroll-auto` 를 줍니다.
- **폭을 차지하지 않습니다.** 막대는 내용 위에 겹쳐 그려서 넘치든 아니든 내용 폭이 같습니다.
- **둥근 모서리를 넘지 않습니다.** 막대 끝은 root 의 모서리 반지름에서 곡선이 닿는 만큼 물러나고, 옆 가장자리와 2px 떨어집니다.
- **선언 순서가 자리를 정합니다.** 내용 뒤에 선언한 막대는 기본 자리, 앞에 선언한 막대는 반대편에 섭니다.

```tsx
import { ScrollArea } from '@gsainfoteam/ids-react';

<ScrollArea className="h-64 w-72 rounded-standard border border-(--ids-color-border)">
  <p>긴 내용</p>
</ScrollArea>
```

## 보이는 방식

```tsx
<ScrollArea variant="hover" />   // 기본. 포인터를 올리거나 스크롤하거나 끄는 동안
<ScrollArea variant="auto" />    // 넘치면 늘
<ScrollArea variant="always" />  // 넘치지 않아도 트랙과 함께 늘
```

- `hover` 는 포인터가 나가거나 스크롤이 멈추면 300ms 뒤에 사라집니다. 스크롤이 멈췄다고 보는 것은 마지막 `scroll` 500ms 뒤입니다.
- `always` 에서 넘치지 않으면 트랙만 보이고 thumb 은 숨습니다.
- 막대에 올리거나 끄는 동안 막대가 2px 두꺼워지고 트랙이 보입니다.
- 나타나고 사라지는 것은 `opacity` 전환입니다. `prefers-reduced-motion` 이면 전환 없이 바로 바뀝니다.
- 숨은 막대는 포인터를 받지 않습니다. 그 자리의 클릭은 내용으로 갑니다.

## 크기와 방향

```tsx
<ScrollArea size="standard" />          // 8px (기본)
<ScrollArea size="tiny" />              // 6px

<ScrollArea orientation="vertical" />   // 막대를 선언하지 않았을 때의 기본
<ScrollArea orientation="horizontal" />
<ScrollArea orientation="both" />       // 두 막대와 Corner
```

- `Scrollbar` 를 선언했으면 `orientation` 은 적지 않아도 됩니다. 선언한 막대의 방향이 곧 스크롤 방향입니다. 가로 막대만 선언하면 `horizontal`, 둘 다 선언하면 `both` 입니다.
- `orientation` 을 적으면 선언하지 않은 방향에 기본 막대를 채웁니다. `orientation="both"` 에 세로 막대만 선언하면 가로는 기본 막대입니다.
- 두께는 root 의 `--scroll-area-thickness`, 옆 간격은 `--scroll-area-gap` 입니다. `className="[--scroll-area-thickness:4px]"` 로 바꿀 수 있습니다.
- `orientation` 은 viewport 의 `overflow` 도 정합니다. `vertical` 은 가로를 잘라 냅니다(`overflow-x: hidden`).

## 파트와 자리

```tsx
<ScrollArea>
  <ScrollArea.Scrollbar orientation="vertical" />   {/* 내용 앞: 시작 쪽(LTR 왼쪽) */}
  <ScrollArea.Viewport>...</ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="horizontal">   {/* 내용 뒤: 아래 */}
    <ScrollArea.Thumb className="bg-(--ids-color-primary)" />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea>
```

| 파트        | 기본 / 동작                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| `Viewport`  | 스크롤하는 요소. 없으면 파트가 아닌 자식을 감싸 만든다                       |
| `Scrollbar` | 막대(트랙). `orientation` 마다 하나. 선언한 방향으로 스크롤한다 |
| `Thumb`     | 막대 안의 손잡이. 없으면 기본 thumb                                          |
| `Corner`    | 두 막대가 만나는 칸. `both` 면 자동으로 붙는다. 내용을 넣으면 그 모서리를 차지한다 |

- 세로 막대의 기본 자리는 논리적 끝(LTR 오른쪽, RTL 왼쪽), 가로 막대는 아래입니다. 내용보다 앞에 선언하면 시작 쪽, 위로 갑니다.
- 가로 thumb 은 RTL 에서 오른쪽에서 출발합니다.
- 한 방향에 막대를 둘 선언하면 개발 빌드에서 경고하고 마지막 것만 배치합니다.
- `Scrollbar`, `Thumb`, `Corner` 를 ScrollArea 밖에 두면 개발 빌드에서 경고하고 아무것도 그리지 않습니다. `Viewport` 는 밖에서 오류입니다.
- 내용은 `Viewport` 안이나 ScrollArea 바로 아래 중 한쪽에만 둡니다. 둘 다면 오류입니다.

## 다른 요소를 스크롤 요소로

```tsx
<ScrollArea className="h-60">
  <ScrollArea.Viewport asChild>
    <div role="listbox" aria-label="도시">...</div>
  </ScrollArea.Viewport>
</ScrollArea>

<ScrollArea asChild>
  <div popover="manual" role="menu" className="concentric-p-1 p-0 ...">
    ...
  </div>
</ScrollArea>
```

- `Viewport asChild` 는 자식 요소가 스크롤 요소가 됩니다. listbox 와 옵션 사이에 요소가 끼지 않아 옵션의 offset parent 와 `scrollTop` 이 listbox 에 남습니다.
- `ScrollArea asChild` 는 자식 요소가 root 가 되고, 그 자식들은 viewport 안에 들어갑니다. 팝업이나 대화상자 자체를 스크롤 영역으로 만들 때 씁니다.
- asChild 로 합칠 때 자식의 `className`, `style` 과 겹치는 속성이 이깁니다. 팝업의 `fixed` 가 root 의 `relative` 를 이기는 식입니다.

## 둥근 모서리

- 막대 끝의 안쪽 거리는 **ScrollArea root 의 계산된 `border-radius`** 로 정합니다. 네 모서리를 따로 읽고, 테두리 두께를 빼고, RTL 이면 좌우를 바꿉니다.
- 거리는 `간격 + 반지름 - √(반지름² - (반지름 - 간격)²)` 입니다. 막대 바깥 모서리가 곡선 안쪽에 오는 가장 가까운 자리입니다. 14px 팝업(테두리 1px)에서 약 9px 입니다.
- 두 막대가 함께 보이면 서로의 두께 + 간격만큼도 비웁니다. 모서리가 둥글어 Corner 칸이 곡선 밖으로 나가면 Corner 를 숨깁니다.
- root 가 둥근 컨테이너의 모서리에 붙어 있지만 root 자신은 둥글지 않으면 `rounded-[inherit]` 를 줍니다. Select 목록이 팝업 모서리를 이렇게 받습니다.
- 반지름은 root 의 크기가 바뀔 때 다시 읽습니다. 스크롤 중에는 읽지 않습니다.
- padding 이 있는 컨테이너를 root 로 쓰면 모서리만 `concentric-p-*` 로 정하고 padding 은 viewport 에 줍니다(`concentric-p-1 p-0` + viewport `p-1`). 그래야 내용이 테두리 바로 안쪽에서 잘립니다.

## 모서리를 차지하는 내용

```tsx
<ScrollArea>
  <ScrollArea.Viewport asChild>
    <textarea />
  </ScrollArea.Viewport>
  <ScrollArea.Corner>
    <button type="button" aria-label="크기 조절" className="size-4" />
  </ScrollArea.Corner>
</ScrollArea>
```

- `ScrollArea.Corner` 에 내용을 넣으면 그 모서리(막대가 만나는 자리, 기본은 끝 아래)를 차지합니다. native 스크롤 막대가 native 크기 조절 손잡이 위에서 멈추는 것과 같습니다.
- 막대가 하나만 보여도, 넘치지 않아도 늘 보입니다. `aria-hidden` 이 붙지 않고, `data-occupied` 가 붙습니다.
- Corner 는 root 의 모서리에 딱 붙습니다(두 가장자리에서 0). 크기는 내용이 정하고, 내용의 크기가 바뀌면 막대를 다시 놓습니다.
- 그 모서리에서 끝나는 막대는 Corner 앞에서 간격(`--scroll-area-gap`)만큼 떨어져 멈춥니다.
- 둥근 모서리의 곡선 밖으로 나가지 않게 그리는 것은 내용의 몫입니다. TextArea 의 손잡이는 root 의 모서리 반지름을 읽어 같은 중심의 호로 그립니다.

## 키보드

- 스크롤 키(화살표, PageUp/Down, Home/End, Space)는 브라우저가 처리합니다.
- 넘치는데 안에 포커스를 받을 요소가 하나도 없으면 viewport 가 `tabIndex={0}` 을 받아 Tab 으로 들어올 수 있습니다. 긴 약관 같은 글을 키보드로 읽게 합니다. 이때 `focus-ring` 이 켜집니다.
- 스스로 포커스를 다루는 역할(`listbox`, `menu`, `grid`, `tree`, `tablist`, `radiogroup`, `combobox`, `menubar`, `treegrid`)의 viewport 는 받지 않습니다.
- `tabIndex` 를 넘기면 그 값을 씁니다.
- 막대는 `aria-hidden` 이고 포커스를 받지 않습니다.

## 포인터

- thumb 을 끌면 끈 거리 × (넘친 길이 / thumb 이 움직일 수 있는 길이)만큼 스크롤합니다. 포인터를 막대에 잡아 두어(pointer capture) 막대 밖으로 나가도 따라옵니다.
- 트랙을 누르면 누른 쪽으로 viewport 의 87.5% 만큼 넘깁니다.
- 막대를 눌러도 포커스와 글자 선택은 그대로입니다.
- Drawer 안에서 막대를 끌면 Drawer 가 끌리지 않습니다.

## 상태

| 속성                                  | 붙는 곳         | 뜻                                      |
| ------------------------------------- | --------------- | --------------------------------------- |
| `data-overflow-x` / `data-overflow-y` | root            | 그 방향으로 넘친다                      |
| `data-hovering`                       | root            | 포인터가 위에 있다(터치 제외)           |
| `data-scrolling`                      | root            | 스크롤 중이다(마지막 스크롤 500ms 까지) |
| `data-dragging`                       | root, 끄는 막대 | thumb 을 끄는 중이다                    |
| `data-visible`                        | 막대            | 막대가 보인다                           |
| `data-overflow`                       | 막대            | 막대 방향으로 넘친다                    |
| `data-orientation` / `data-placement` | 막대            | 방향, 자리(`start` / `end`)             |
| `data-tab-stop`                       | viewport        | Tab 멈춤을 받았다                       |
| `data-occupied`                       | Corner          | 내용이 모서리를 차지한다                |
| `data-variant` / `data-size`          | root            | 넘긴 값                                 |

- `className` 과 `style` 은 `ScrollArea.State`(`overflowX`, `overflowY`, `hovering`, `scrolling`, `dragging` 등)를 받는 함수도 됩니다.
- 요소에는 `data-scroll-area`, `data-scroll-area-viewport`, `data-scroll-area-scrollbar`, `data-scroll-area-thumb`, `data-scroll-area-corner` 가 붙습니다.

## 색

| 토큰                        | 쓰임                                    |
| --------------------------- | --------------------------------------- |
| `--ids-color-handle`        | thumb                                   |
| `--ids-color-handle-hover`  | thumb 에 올렸을 때                      |
| `--ids-color-handle-active` | thumb 을 끌 때                          |
| `--ids-color-muted`         | `always` 트랙, 막대에 올렸을 때, Corner |

- 중립 토큰이라 `data-mode` 에만 따릅니다. 다크 모드는 토큰이 바꿉니다.

## 속성

| 속성                  | 기본 / 동작                              |
| --------------------- | ---------------------------------------- |
| `variant`             | `hover`(기본) / `auto` / `always`        |
| `size`                | `standard`(기본, 8px) / `tiny`(6px)      |
| `orientation`         | 선언한 막대의 방향, 없으면 `vertical` |
| `asChild`             | 자식 요소 하나를 root 로 쓴다            |
| `className` / `style` | 상태를 받는 함수도 된다                  |
| 그 외 속성            | root 로 간다                             |

## IDS 안에서 쓰는 곳

- Select, ChipField 의 옵션 목록(팝업과 하단 시트), 필드 팝업 자체(달력, 색 선택기가 넘칠 때)
- Menu 의 내용, 명령 팔레트의 목록
- Dialog, Drawer, Popover 의 본문. Popover 의 화살표는 ScrollArea 밖에 둡니다
- TextArea 의 textarea(`Viewport asChild`)와 크기 조절 손잡이(내용을 담은 `Corner`)
- TimePicker 의 컬럼(`size="tiny"`, listbox 가 `Viewport asChild`)

## 알아둘 것

- **`<textarea>` 도 viewport 가 됩니다.** `Viewport asChild` 로 textarea 자신이 스크롤하고, 막대는 그 위에 겹칩니다. 입력은 자식 크기를 바꾸지 않으므로 `input` 이벤트마다 한 프레임에 한 번 다시 잽니다. 스스로 포커스를 받는 요소(textarea, contenteditable)는 Tab 멈춤을 따로 받지 않습니다.
- 스크립트가 바꾼 값(`value` prop)은 `input` 을 내지 않습니다. 높이가 그대로인 채 내용만 늘면 다음 스크롤이나 크기 변화 때 넘침을 다시 봅니다.
- root 는 `relative flex flex-col` 이고 viewport 는 남은 높이를 받습니다(`grow`, `min-h-0`). 높이는 root 에 줍니다(`h-*`, `max-h-*`).
- 내용 크기는 viewport 의 직접 자식마다 `ResizeObserver` 로 봅니다. 자식이 절대 위치로 viewport 밖까지 뻗는 경우는 다음 스크롤이나 크기 변화 때 맞춰집니다.
- 스크롤 중에는 한 프레임에 한 번(`requestAnimationFrame`) viewport 의 스크롤 값만 읽고 막대 요소의 CSS 변수(`--scroll-area-thumb-offset`)만 씁니다. root 의 모양은 다시 읽지 않고, 바뀐 값만 쓰며, thumb 은 `translate` 로 움직입니다.
