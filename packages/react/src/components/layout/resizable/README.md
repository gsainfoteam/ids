# Resizable

요소 하나의 크기를 손잡이로 바꿉니다. `<textarea>` 의 크기 조절 손잡이를 아무 요소에나 붙인 것입니다.

- **키보드로도.** 손잡이는 `role="separator"` 라 Tab 으로 가서 방향키로 16px, `Shift` 와 함께 64px 씩 바꿉니다.
- **손잡이는 방향에 따라 하나.** `both` 는 모서리 손잡이 하나(Tab 한 칸), `horizontal` 은 끝 가장자리, `vertical` 은 아래 가장자리입니다.
- **끄는 동안 다시 렌더하지 않습니다.** 한 프레임에 한 번 DOM 에 크기를 쓰고, 놓을 때 한 번 알립니다.
- **누를 영역은 24px.** 보이는 선과 표시가 얇아도 손잡이를 잡을 영역은 24px 입니다.
- **쓰는 방향을 따릅니다.** RTL 에서는 손잡이가 왼쪽에 서고 `←` 가 넓힙니다.
- 여러 패널을 나누는 경계는 이 컴포넌트가 아니라 `Splitter` 입니다.

```tsx
import { Resizable } from '@gsainfoteam/ids-react';

<Resizable defaultWidth={400} defaultHeight={240} minWidth={240} className="concentric-p-4 border">
  내용
</Resizable>;
```

## 방향

```tsx
<Resizable />                            // both(기본): 모서리 손잡이. 두 축을 함께 끈다
<Resizable direction="horizontal" />     // 끝 가장자리(LTR 오른쪽). 너비만
<Resizable direction="vertical" />       // 아래 가장자리. 높이만
```

| `direction`  | 손잡이                            | 스크린 리더                                                 |
| ------------ | --------------------------------- | ----------------------------------------------------------- |
| `both`       | 끝 아래 모서리의 대각선 표시      | group "크기 조절" 안에 separator "너비", "높이"(Tab 한 칸) |
| `horizontal` | 끝 가장자리 가운데의 세로 막대    | separator "너비"(`aria-orientation="vertical"`)             |
| `vertical`   | 아래 가장자리 가운데의 가로 막대  | separator "높이"(`aria-orientation="horizontal"`)           |

## 크기

```tsx
<Resizable defaultWidth={400} defaultHeight={240} />             // 비제어
<Resizable width={width} onWidthChange={setWidth} />             // 제어. px 숫자
<Resizable height={height} onHeightChange={setHeight} />
<Resizable direction="horizontal" className="w-full" />          // 크기를 주지 않으면 CSS 크기에서 시작
```

- 크기는 px 숫자이고 요소의 `style.width` `style.height` 로 들어갑니다. `className` 의 너비보다 우선합니다.
- 크기를 주지 않으면 처음에는 CSS 크기(`w-full` 등)를 따르고, 처음 바꿀 때부터 px 크기를 가집니다.
- `onWidthChange` `onHeightChange` 는 끌기가 끝날 때 한 번, 키를 누를 때마다 부릅니다. 끄는 도중에는 부르지 않습니다.
- `Enter` 와 손잡이 두 번 누르기는 처음 크기로 돌아갑니다: `defaultWidth`, 없으면 처음 받은 `width`, 둘 다 없으면 CSS 크기. CSS 크기로 돌아갈 때는 그 크기를 잰 값을 알립니다.

## 한계

```tsx
<Resizable minWidth={240} maxWidth={640} minHeight={120} maxHeight={480} />
<Resizable direction="vertical" className="min-h-20 max-h-96" />   // px 인 CSS 한계도 지킨다
```

- 기본은 `min*` 0, `max*` 없음입니다.
- 요소의 CSS `min-width` `max-width` `min-height` `max-height` 가 px 이면 props 한계와 함께 지킵니다. `%` 나 `min-content` 는 읽지 못하므로 props 로 줍니다.
- `max*` 가 없으면 `End` 키는 동작하지 않고 `aria-valuemax` 도 붙지 않습니다.

## 손잡이 바꾸기

```tsx
<Resizable direction="horizontal">
  내용
  <Resizable.Handle className="inset-y-3 w-1 bg-(--ids-color-primary) before:hidden" />
</Resizable>

<Resizable>
  내용
  <Resizable.Handle>
    <MyGripIcon />                       {/* 모서리 표시를 바꾼다 */}
  </Resizable.Handle>
</Resizable>

<Resizable direction="vertical">
  내용
  <Resizable.Handle asChild>
    <div className="bg-(--ids-color-muted)" />   {/* 자식 요소가 손잡이가 된다 */}
  </Resizable.Handle>
</Resizable>
```

- `Resizable.Handle` 을 적으면 기본 손잡이를 그리지 않습니다. 손잡이의 종류는 `direction` 이 정합니다.
- 가장자리 손잡이의 보이는 막대는 `before:` 로 그립니다. 막대를 지우려면 `before:hidden` 입니다.
- `asChild` 로 합칠 때 겹치는 클래스(위치, 크기)는 손잡이 쪽이 이깁니다. 위치와 크기는 `Resizable.Handle` 의 `className` 으로 바꿉니다.
- `aria-label` 을 주면 기본 이름("너비", "높이", "크기 조절") 대신 씁니다.

## 다른 요소를 그대로

```tsx
<Resizable asChild defaultWidth={320}>
  <Card>
    <Card.Title>제목</Card.Title>
  </Card>
</Resizable>
```

- 자식 요소 하나가 크기를 바꿀 요소가 되고, 손잡이는 그 안의 끝에 들어갑니다. 자식은 `ref`, `style`, `className` 을 받아야 합니다.
- 자식의 `className` 이 겹치는 클래스를 이깁니다. `fixed` 자식이 `relative` 를 이기는 식입니다. 크기(`style.width` `style.height`)는 Resizable 이 이깁니다.

## 키보드

| 키                     | 가장자리 손잡이        | 모서리 손잡이                                       |
| ---------------------- | ---------------------- | --------------------------------------------------- |
| `←` `→`                | 너비 16px(horizontal)  | 너비 16px, 포커스를 너비 separator 로               |
| `↑` `↓`                | 높이 16px(vertical)    | 높이 16px, 포커스를 높이 separator 로               |
| `Shift` + 방향키       | 64px                   | 64px                                                |
| `Home` / `End`         | 최솟값 / 최댓값        | 포커스한 축의 최솟값 / 최댓값                       |
| `Enter`                | 처음 크기              | 두 축 모두 처음 크기                                |

- RTL 에서는 `←` `→` 가 맞바뀝니다. 끝 가장자리가 왼쪽이라 `←` 가 넓힙니다.
- 모서리 손잡이의 포커스는 늘 값이 바뀐 separator 에 있어, 스크린 리더가 바뀐 값("416px")을 읽습니다.

## 포인터

- 가장자리는 한 축, 모서리는 두 축을 끕니다. 손잡이 밖으로 나가도 포인터를 잡아 둡니다.
- 끄는 동안 페이지 전체의 커서가 크기 조절 커서가 되고 글자가 선택되지 않습니다.
- 끄는 동안 `Escape` 를 누르면 처음 크기로 돌아갑니다. 대화상자 안이어도 대화상자는 닫히지 않습니다.
- 손잡이를 두 번 누르면 처음 크기로 돌아갑니다.
- 손잡이를 눌러도 포커스는 옮겨 가지 않습니다. 누르는 Card 안에서 손잡이를 끌어도 Card 가 눌리지 않고, Drawer 안에서 끌어도 Drawer 가 끌리지 않습니다.
- 터치도 같습니다. 손잡이는 `touch-action: none` 입니다.

## 상태

```tsx
<Resizable className={(state) => (state.dragging ? 'ring-2' : undefined)} />
```

| 상태        | 뜻                                                 |
| ----------- | -------------------------------------------------- |
| `direction` | 넘긴 방향                                          |
| `width`     | 지금 너비(px). 서버 렌더에서 크기가 없으면 `undefined` |
| `height`    | 지금 높이(px)                                      |
| `dragging`  | 포인터로 끄는 중                                   |
| `disabled`  | 비활성                                             |

- 요소에는 `data-resizable`, `data-direction`, 끄는 동안 `data-dragging`, 비활성이면 `data-disabled` 가 붙습니다.
- 손잡이에는 `data-resize-handle`, 끄는 동안 `data-dragging` 이 붙습니다.

## 색

| 토큰                        | 쓰임                          |
| --------------------------- | ----------------------------- |
| `--ids-color-handle`        | 막대와 모서리 표시            |
| `--ids-color-handle-hover`  | 손잡이에 올렸을 때            |
| `--ids-color-handle-active` | 끄는 동안                     |

## 속성

| 속성                                  | 기본 / 동작                                           |
| ------------------------------------- | ----------------------------------------------------- |
| `direction`                           | `both`(기본) / `horizontal` / `vertical`              |
| `width` / `defaultWidth`              | px. 없으면 CSS 너비                                   |
| `height` / `defaultHeight`            | px. 없으면 CSS 높이                                   |
| `onWidthChange` / `onHeightChange`    | `(size: number) => void`                              |
| `minWidth` `maxWidth` `minHeight` `maxHeight` | px. 기본 0 과 없음                            |
| `disabled`                            | 손잡이가 흐려지고 Tab 과 포인터에서 빠진다            |
| `asChild`                             | 자식 요소 하나의 크기를 바꾼다                        |
| `className` / `style`                 | 상태를 받는 함수도 된다                               |
| 그 외 속성, `ref`                      | 요소로 간다. `id` 가 없으면 만들어 `aria-controls` 에 쓴다 |
| `Resizable.Handle`                    | `asChild`, `className`, `children`, 그 외 div 속성     |

## 알아둘 것

- `min*` 이 `max*` 보다 크면 개발 빌드에서 경고하고 최댓값을 씁니다.
- `Resizable.Handle` 을 Resizable 밖에 두면 오류입니다.
- 요소에 `overflow-hidden` 을 주면 끝 밖으로 나온 손잡이의 절반이 잘립니다. 누를 영역이 줄고 가장자리 막대가 반만 보입니다.
- 가장자리 손잡이의 누를 영역은 끝 선 안팎으로 12px 씩입니다. 끝에 붙은 안쪽 컨트롤(스크롤 막대 등)이 있으면 `Resizable.Handle` 의 `className` 으로 영역을 바꿉니다.
- 손잡이는 끌기가 필요합니다. 끌지 못하는 포인터 사용자를 위한 한 번 누르기 방법은 없습니다(WCAG 2.5.7). 키보드 조작은 있습니다.
- 모바일 스크린 리더는 separator 값을 쓸어서 바꾸지 못합니다.
- Resizable 안에 다른 Resizable 을 두고 안쪽에 `Resizable.Handle` 을 적으면, 바깥쪽도 손잡이가 적혀 있다고 보고 기본 손잡이를 그리지 않습니다. 바깥쪽에도 `Resizable.Handle` 을 적습니다.
