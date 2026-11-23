# Resizable

요소 하나의 크기를 손잡이로 바꿉니다. `<textarea>` 의 크기 조절 손잡이를 아무 요소에나 붙인 것입니다.

- **키보드로도.** 손잡이는 `role="separator"` 라 Tab 으로 가서 방향키로 16px, `Shift` 와 함께 64px 씩 바꿉니다.
- **손잡이는 방향에 따라 하나.** `both` 는 모서리 손잡이 하나(Tab 한 칸), `horizontal` 은 끝 가장자리, `vertical` 은 아래 가장자리입니다.
- **한 가족의 모양.** 가장자리 손잡이는 가장자리 선 위의 짧은 막대이고, 모서리 손잡이는 같은 두께, 색, 자리의 막대를 요소의 모서리를 따라 휘어 그린 호입니다. iPadOS, visionOS 창의 모서리 손잡이와 같은 모양입니다.
- **끄는 동안 다시 렌더하지 않습니다.** 한 프레임에 한 번 DOM 에 크기를 쓰고, 놓을 때 한 번 알립니다.
- **누를 영역은 24px.** 보이는 선과 표시가 얇아도 손잡이를 잡을 영역은 24px 입니다.
- **쓰는 방향을 따릅니다.** RTL 에서는 손잡이가 왼쪽에 서고 `←` 가 넓힙니다.
- 여러 패널을 나누는 경계는 이 컴포넌트가 아니라 `Splitter` 입니다.

```tsx
import { Card, Resizable, useResizable } from '@gsainfoteam/ids-react';

const resizable = useResizable({ width: { defaultValue: 320 }, height: { defaultValue: 180 } });

<Resizable resizable={resizable} asChild>
  <Card>내용</Card>
</Resizable>;
```

- Resizable 은 모양이 없습니다. 테두리와 면은 크기를 바꿀 요소(`Card` 나 앱의 요소)가 그립니다.

## 방향

```tsx
<Resizable />                            // both(기본): 모서리 손잡이. 두 축을 함께 끈다
<Resizable direction="horizontal" />     // 끝 가장자리(LTR 오른쪽). 너비만
<Resizable direction="vertical" />       // 아래 가장자리. 높이만
```

| `direction`  | 손잡이                            | 스크린 리더                                                 |
| ------------ | --------------------------------- | ----------------------------------------------------------- |
| `both`       | 끝 아래 모서리를 따라 휜 호       | group "크기 조절" 안에 separator 둘(너비 `vertical`, 높이 `horizontal`, Tab 한 칸) |
| `horizontal` | 끝 가장자리 가운데의 세로 막대    | separator "크기 조절"(`aria-orientation="vertical"`)        |
| `vertical`   | 아래 가장자리 가운데의 가로 막대  | separator "크기 조절"(`aria-orientation="horizontal"`)      |

## 모서리 손잡이

```tsx
<Resizable asChild><div className="rounded-none border" /></Resizable>    // 반지름 0: 끝이 살짝 둥근 ㄴ 자
<Resizable asChild><Card /></Resizable>                                   // 16px 모서리와 같은 중심의 호
<Resizable asChild><div className="rounded-full border" /></Resizable>    // 알약 모양이면 높이의 절반 반지름의 호
```

- 아래 가장자리를 따라 짧게 오다가, 모서리와 같은 중심의 4분의 1 원을 돌아, 끝 가장자리를 따라 짧게 올라가는 선입니다. 두께는 가장자리 막대와 같은 4px 이고 양 끝이 둥급니다.
- 선은 가장자리 막대처럼 요소의 테두리 안쪽 선(padding 상자의 가장자리) 위에 섭니다. 반지름은 요소의 `border-end-end-radius`(LTR 오른쪽 아래, RTL 왼쪽 아래)에서 테두리 두께를 뺀 값입니다.
- 반지름은 마운트할 때, 요소의 크기가 바뀔 때(ResizeObserver), 손잡이가 다시 렌더될 때 읽습니다. `%` 반지름과 `rounded-full` 도 따라갑니다.
- 직선은 호와 두 직선을 합한 길이가 가장자리 막대와 같은 32px 이 되도록 늘고 줄며, 적어도 4px 입니다. 반지름이 크면 호만으로 32px 을 넘습니다.
- 누를 영역은 선을 따라 폭 24px(선의 양쪽 12px)의 띠입니다. 띠 밖의 내용은 모서리 가까이에서도 그대로 누를 수 있습니다.
- 포커스는 호를 따라 그립니다. 선이 `primary` 가 되고 둘레에 3px 의 `primary` 40% 띠가 생깁니다. 누를 영역에 사각형 링을 두르지 않습니다.
- 서버 렌더에는 호가 없고 separator 만 있습니다. 반지름을 읽은 뒤 그립니다.

## 크기

- `asChild` 가 없으면 부모가 준 너비와 높이를 채우고, 부모보다 작아질 수 있습니다(`min-h-0 min-w-0`).
- `asChild` 면 자식 요소의 크기를 그대로 씁니다.
- 처음 크기, 한계, 칸 단위는 `useResizable()` 의 데이터입니다. 한 번 바꾸면 그때부터 px 크기가 부모와 CSS 의 크기를 이깁니다.

```tsx
<div className="h-60 w-100">
  <Resizable>내용</Resizable>                            {/* 처음 크기는 부모의 크기 */}
</div>

const resizable = useResizable({
  width: { defaultValue: 400 },                          // 비제어. px 숫자
  height: { value: height, onValueChange: setHeight },   // 제어
});
<Resizable resizable={resizable} />
```

- 크기 말고 다른 것이 필요 없으면 훅 없이 씁니다. 처음에는 부모의 크기(`asChild` 면 자식의 CSS 크기)를 따르고, 처음 바꿀 때부터 px 크기를 가집니다.
- 처음 크기를 숫자로 정하거나, 크기를 앱 상태로 들거나, 한계와 칸 단위를 줄 때는 `useResizable()` 의 결과를 `resizable` 로 넘깁니다. 축마다 `{ value, defaultValue, onValueChange, min, max }` 입니다.
- 크기는 px 숫자이고 요소의 `style.width` `style.height` 로 들어갑니다.
- `onValueChange` 는 끌기가 끝날 때 한 번, 키를 누를 때마다 부릅니다. 끄는 도중에는 부르지 않습니다.
- `Enter` 와 손잡이 두 번 누르기는 처음 크기로 돌아갑니다: `defaultValue`, 없으면 처음 받은 `value`, 둘 다 없으면 CSS 크기. CSS 크기로 돌아갈 때는 그 크기를 잰 값을 알립니다.

## 한계

```tsx
const resizable = useResizable({
  width: { min: 240, max: 640 },
  height: { min: 120, max: 480 },
});
<Resizable resizable={resizable} />
```

- 한계는 축마다 `min` `max`(px)입니다. 기본은 최소 0, 최대 없음입니다.
- Resizable 은 CSS `min-width` 같은 크기 제한을 읽지 않습니다. 한계는 `useResizable()` 에만 적습니다. CSS 로 막으면 화면의 크기는 멈추지만 손잡이의 값과 `aria-valuemin` `aria-valuemax` 는 모릅니다.
- 한계는 서버 HTML 의 `aria-valuemin` `aria-valuemax` 에도 그대로 들어갑니다.
- 최대가 없으면 `End` 키는 동작하지 않고 `aria-valuemax` 도 붙지 않습니다.
- 개발 중에 최소가 최대보다 크면 경고하고, 최대가 이깁니다.

## 칸 단위와 값 글자

```tsx
const resizable = useResizable({
  height: { defaultValue: 96 },
  step: 12,                                     // 높이가 12px 의 배수에 맞는다
  getValueLabel: (size) => `${size / 48}시간`,  // aria-valuetext 를 "1.5시간"으로
});
<Resizable resizable={resizable} direction="vertical" />
```

- `step` 을 주면 끄는 크기가 가장 가까운 `step` 의 배수에 맞춰집니다. 방향키는 다음 배수로, `Shift` 와 함께면 네 칸을 옮깁니다. 없으면 1px 단위로 끌고 방향키는 16px, 64px 입니다.
- `min` `max` 가 배수가 아니면 한계가 이깁니다. 한계 바로 앞의 배수에서 한계로 갑니다.
- `getValueLabel(size, dimension)` 이 separator 의 `aria-valuetext` 가 됩니다. 없으면 "416px" 입니다. `aria-valuenow` 는 늘 px 입니다.

## 손잡이 바꾸기

```tsx
<Resizable>
  내용
  <Resizable.Handle>
    <MyGripIcon />                       {/* 호 대신 이 표시를 16px 상자에 그린다 */}
  </Resizable.Handle>
</Resizable>

<Resizable>
  내용
  <Resizable.Handle aria-label="창 크기" />
</Resizable>
```

- `Resizable.Handle` 을 적으면 기본 손잡이를 그리지 않습니다. 손잡이의 종류는 `direction` 이 정합니다.
- 모서리 손잡이에 `children` 이나 `asChild` 를 주면 호 대신 그 표시를 모서리 안쪽 16px 상자에 그리고, 누를 영역은 그 상자 둘레 24px 입니다.
- 모서리 손잡이의 호는 글자색(`currentColor`)으로 그립니다. 올렸을 때와 끄는 동안은 손잡이 색(`text-neutral`)을 따릅니다.
- `aria-label` 을 주면 기본 이름("크기 조절") 대신 씁니다. 너비인지 높이인지는 `aria-orientation` 이 알립니다.
- 손잡이의 자리, 색, 막대 모양을 바꾸는 것은 IDS 밖의 디자인입니다. 스토리 `DesignYourOwnHandle`(`custom-design`)이 그 예입니다.

## 다른 요소를 그대로

```tsx
<Resizable resizable={resizable} asChild>
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
| `step` 이 있으면        | 방향키 한 칸, `Shift` 네 칸 | 같음                                            |
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

- 크기는 `useResizable()` 의 축마다 `value` 와 `onValueChange` 로 읽습니다. 끌기가 끝날 때와 키를 누를 때 알립니다.
- `className` 과 `style` 은 아래 상태를 받는 함수도 됩니다. IDS 밖의 디자인에만 씁니다.

| 상태        | 뜻                                                     |
| ----------- | ------------------------------------------------------ |
| `direction` | 넘긴 방향                                              |
| `width`     | 지금 너비(px). 서버 렌더에서 크기가 없으면 `undefined` |
| `height`    | 지금 높이(px)                                          |
| `dragging`  | 포인터로 끄는 중                                       |
| `disabled`  | 비활성                                                 |

## 색

| 토큰                       | 쓰임                               |
| -------------------------- | ---------------------------------- |
| `--ids-color-border-neutral-strong`   | 가장자리 막대와 모서리의 호        |
| `--ids-color-text-neutral` | 손잡이에 올렸을 때와 끄는 동안     |

## 속성

| 속성                                  | 기본 / 동작                                           |
| ------------------------------------- | ----------------------------------------------------- |
| `direction`                           | `both`(기본) / `horizontal` / `vertical`              |
| `resizable`                           | `useResizable()` 의 결과. 없으면 CSS 크기, 한계 없음  |
| `disabled`                            | 손잡이가 흐려지고 Tab 과 포인터에서 빠진다            |
| `asChild`                             | 자식 요소 하나의 크기를 바꾼다                        |
| `className` / `style`                 | 모양에만 쓴다. 상태를 받는 함수도 된다                |
| 그 외 속성, `ref`                      | 요소로 간다. `id` 가 없으면 만들어 `aria-controls` 에 쓴다 |
| `Resizable.Handle`                    | `asChild`, `className`, `children`, 그 외 div 속성     |

| `useResizable` 옵션        | 뜻                                                        |
| -------------------------- | --------------------------------------------------------- |
| `width` / `height`         | `{ value, defaultValue, onValueChange, min, max }`, px    |
| `step`                     | px. 끌기와 방향키가 이 배수에 맞는다                      |
| `getValueLabel`            | `(size, dimension) => string`. `aria-valuetext`           |

## 알아둘 것

- `Resizable.Handle` 을 Resizable 밖에 두면 오류입니다.
- 요소에 `overflow-hidden` 을 주면 끝 밖으로 나온 손잡이의 절반이 잘립니다. 누를 영역이 줄고 가장자리 막대와 모서리의 호가 반만 보입니다.
- 가장자리 손잡이의 누를 영역은 끝 선 안팎으로 12px 씩입니다. 끝에 붙은 안쪽 컨트롤(스크롤 막대 등)과 겹칩니다.
- 손잡이는 끌기가 필요합니다. 끌지 못하는 포인터 사용자를 위한 한 번 누르기 방법은 없습니다(WCAG 2.5.7). 키보드 조작은 있습니다.
- 모바일 스크린 리더는 separator 값을 쓸어서 바꾸지 못합니다.
- Resizable 안에 다른 Resizable 을 두고 안쪽에 `Resizable.Handle` 을 적으면, 바깥쪽도 손잡이가 적혀 있다고 보고 기본 손잡이를 그리지 않습니다. 바깥쪽에도 `Resizable.Handle` 을 적습니다.
