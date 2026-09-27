# Color

IDS 색은 이름이 역할을 말하는 시맨틱 토큰입니다. 값은 `ThemeProvider` 가 붙이는 `data-color` 와 `data-mode` 에 따라 CSS가 바꿉니다.

```tsx
<div className="bg-(--ids-color-surface) text-(--ids-color-on-surface)">
  <button className="bg-(--ids-color-primary) text-(--ids-color-on-primary)">저장</button>
</div>
```

- 이름은 `--ids-color-{역할}` 이고, Tailwind에서는 `bg-(--ids-color-primary)` 처럼 씁니다. `bg-primary` 같은 `@theme` 이름도 있습니다.
- 값은 `ThemeProvider` 안에서만 정의됩니다.

## 브랜드

`data-color`(blue, orange, green)와 `data-mode` 둘 다에 따라 바뀝니다.

| 토큰                         | 쓰임                                     |
| ---------------------------- | ---------------------------------------- |
| `primary` / `on-primary`     | 주요 동작의 채움과 그 위 글자. 포커스 링 |
| `secondary` / `on-secondary` | 옅은 브랜드 채움과 그 위 글자            |
| `outline`                    | 브랜드 색을 띠어야 하는 드문 선          |

## 중립

`data-mode` 에만 따릅니다.

| 토큰         | 쓰임                               |
| ------------ | ---------------------------------- |
| `surface`    | 페이지와 카드 배경                 |
| `on-surface` | 본문 글자                          |
| `muted`      | 옅은 채움 (soft 필드, 호버, 트랙)  |
| `on-muted`   | 보조 글자 (설명, 힌트, 자리 표시)  |
| `border`     | 필드 테두리, 카드 가장자리, 구분선 |

## 상태

`data-mode` 에만 따릅니다. `success`, `warning`, `danger`, `info` 마다 세 톤이 있습니다.

| 토큰            | 쓰임                                                        |
| --------------- | ----------------------------------------------------------- |
| `{상태}`        | 채움 (Progress 막대, solid Alert 배경)                      |
| `on-{상태}`     | `{상태}` 채움 위 글자                                       |
| `{상태}-strong` | 흰(또는 검은) 배경 위 글자와 아이콘. 대비 4.5:1을 지키는 톤 |

- 노란 `warning` 은 흰 배경 위 글자로 쓰면 대비가 모자랍니다. 글자에는 `warning-strong` 을 씁니다.

## 원칙

- 구조선과 테두리는 중립입니다. 테마 색은 주요 동작과 포커스에만 씁니다.
- 색만으로 의미를 전하지 않습니다. 아이콘이나 글자를 함께 둡니다.
- 대비는 Storybook `Foundations/Color` 의 Contrast에서 모드와 테마마다 확인합니다.
