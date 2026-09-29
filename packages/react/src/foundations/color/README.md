# Color

IDS 색은 이름이 역할을 말하는 시맨틱 토큰입니다. 값은 `IdsProvider` 가 붙이는 `data-color` 와 `data-mode` 에 따라 CSS가 바꿉니다.

```tsx
<div className="bg-(--ids-color-surface) text-(--ids-color-on-surface)">
  <button className="bg-(--ids-color-primary) text-(--ids-color-on-primary)">저장</button>
</div>
```

- 이름은 `--ids-color-{역할}` 이고, Tailwind에서는 `bg-(--ids-color-primary)` 처럼 씁니다. `bg-primary` 같은 `@theme` 이름도 있습니다.
- 값은 `IdsProvider` 안에서만 정의됩니다.

## 브랜드

`data-color` 와 `data-mode` 둘 다에 따라 바뀝니다.

| 토큰                         | 쓰임                                     |
| ---------------------------- | ---------------------------------------- |
| `primary` / `on-primary`     | 주요 동작의 채움과 그 위 글자. 포커스 링 |
| `secondary` / `on-secondary` | 옅은 브랜드 채움과 그 위 글자            |
| `outline`                    | 브랜드 색을 띠어야 하는 드문 선          |

### 17색

```tsx
<IdsProvider color="emerald">
  <App />
</IdsProvider>
```

- `red` `orange` `amber` `yellow` `lime` `green` `emerald` `teal` `cyan` `sky` `blue` `indigo` `violet` `purple` `fuchsia` `pink` `rose`.
- 팔레트는 Tailwind CSS v4 기본 색을 hex 로 옮긴 값입니다. `orange` 와 `green` 은 IDS 고유 값입니다.
- 모든 색이 같은 단계를 씁니다.

| 토큰           | light | dark  |
| -------------- | ----- | ----- |
| `primary`      | 600   | 600   |
| `secondary`    | 100   | 950   |
| `on-secondary` | 700   | 400   |
| `outline`      | 200   | 800   |

- `on-secondary` 는 `secondary` 위 글자로 4.5:1 을 넘는 단계입니다. `orange` 만 light 에서 800 을 씁니다.
- `on-primary` 는 흰 글자(`neutral.0`)가 기본입니다. 흰 글자로 4.5:1 이 안 되는 밝은 색은 검은 글자(`neutral.950`)입니다.
  - 검은 글자: `orange` `amber` `yellow` `lime` `emerald` `teal` `cyan` `sky`.
  - 흰 글자: 나머지 9색.
- 채움 위 글자와 아이콘은 색을 직접 고르지 말고 `on-primary` 로 칠합니다. 그래야 밝은 색에서도 읽힙니다.

## 중립

`data-mode` 에만 따릅니다.

| 토큰            | 쓰임                                               |
| --------------- | -------------------------------------------------- |
| `surface`       | 페이지와 카드 배경                                 |
| `on-surface`    | 본문 글자                                          |
| `muted`         | 옅은 채움 (soft 필드, 투명 컨트롤의 hover, 트랙)   |
| `muted-hover`   | 채운 컨트롤의 hover, 투명 컨트롤을 누를 때         |
| `muted-active`  | 채운 컨트롤을 누를 때                              |
| `on-muted`      | 보조 글자 (설명, 힌트, 자리 표시)                  |
| `border`        | 필드 테두리, 카드 가장자리, 구분선                 |
| `handle`        | 잡아 끄는 손잡이 (ScrollArea thumb, Drawer 손잡이) |
| `handle-hover`  | 손잡이에 올렸을 때                                 |
| `handle-active` | 손잡이를 끄는 동안                                 |

### 상태 사다리

중립 상태는 한 단계씩 오릅니다.

```tsx
<button className="hover:bg-(--ids-color-muted) active:bg-(--ids-color-muted-hover)">투명</button>
<button className="bg-(--ids-color-muted) hover:bg-(--ids-color-muted-hover) active:bg-(--ids-color-muted-active)">
  채움
</button>
<span className="bg-(--ids-color-handle) hover:bg-(--ids-color-handle-hover) data-dragging:bg-(--ids-color-handle-active)" />
```

- 투명 컨트롤: 쉼 → hover `muted` → press `muted-hover`.
- 채운 컨트롤: `muted` → hover `muted-hover` → press `muted-active`.
- 손잡이: `handle` → hover `handle-hover` → 끄는 동안 `handle-active`.
- 눌린 토글은 press 단계로 칠합니다.
- 사다리를 따르지 않는 것:
  - 배경을 모르는 겹침층: Item, Card 의 `on-surface` 겹침, Chip 의 `currentColor` 층, Kbd.
  - 브랜드 상태: `/90`, `/80`, `/10`~`/20`.
  - 테두리 링, disabled 투명도, backdrop.

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
- `tests/tokens-contrast.test.ts` 가 17색 × 두 모드의 `on-primary` / `primary`, `on-secondary` / `secondary` 와 상태 짝이 4.5:1 을 넘는지 검사합니다.
