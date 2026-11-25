# Color

IDS 색은 네 층입니다. 팔레트(계열마다 라이트와 다크의 9단계 스케일)는 값일 뿐이고, 시맨틱 역할(`--ids-color-<역할>`)이 스케일 한 단계를 가리키고, scheme(`bg-scheme-solid`, `text-on-scheme-solid`)이 한 계열의 역할을 가리키고, 컴포넌트 토큰(`bg-control-outline`, `border-field-outline`)이 모드마다 역할 하나를 가리킵니다. 컴포넌트 토큰은 [ComponentTokens](../component-tokens/README.md) 에 있습니다. 브랜드 색은 앱이 `IdsProvider theme` 에 준 색에서 오고, 모든 색은 `IdsProvider` 가 붙이는 `data-mode` 에 따라 CSS 가 바꿉니다.

```tsx
<div className="bg-base text-on-base">
  <button className="bg-primary-solid text-on-primary-solid state-layer hover:state-hover active:state-press">저장</button>
  <span className="bg-danger-soft text-on-danger-soft">실패</span>
  <p className="text-neutral">보조 글자</p>
</div>
```

- 배경은 쓰임새로 부릅니다: `bg-base`, `bg-surface`, `bg-block`, `bg-X-soft`, `bg-X-solid`.
- 선과 글자는 세기로 부릅니다: `border-X`, `border-X-strong`, `text-X`, `text-X-strong`. 세기 단어는 `strong` 하나입니다(`bold` 는 글꼴 굵기와 헷갈립니다).
- 배경 위 글자는 `text-on-{배경}` 입니다(`text-on-base`, `text-on-primary-solid`). 단계를 가리키지 않고 IdsProvider 가 APCA 로 고릅니다.
- 속성은 `bg`, `text`, `border` 입니다. `bg-*` 는 배경, `text-*` 는 글자(와 `fill-*`), `border-*` 는 선(과 `ring-*`, `inset-ring-*`, `outline-*`, `stroke-*`, `divide-*`)입니다.
- CSS 변수는 `--ids-color-{역할}` 입니다(`--ids-color-bg-primary-soft`). 공유 `--color-*` 이름은 없어서 `bg-on-primary` 같은 클래스는 만들어지지 않습니다.
- 역할을 다른 속성으로 쓸 때만 임의 값을 씁니다: 손잡이의 `bg-(--ids-color-border-neutral-strong)`, 끄는 손잡이의 `bg-(--ids-color-text-neutral)`, 차트 점 둘레의 `stroke-(--ids-color-bg-base)`.
- 두 색을 `color-mix` 로 섞은 토큰은 없습니다.
- 값은 `IdsProvider` 안에서만 정의됩니다.

## 계열

| 계열 | 색이 오는 곳 |
| --- | --- |
| `neutral` | IDS 의 회색. `neutral: 'tinted'` 면 primary 색상이 옅게 든다 |
| `primary` | 앱의 `theme.primary` (필수) |
| `secondary` | `theme.secondary`, 없으면 primary 와 같은 hue 에 채도 1/3 |
| `tertiary` | `theme.tertiary`, 없으면 primary hue 를 +60°(상태 색과 겹치면 −60°) 돌리고 채도 1/3 |
| `success`, `warning`, `danger`, `info` | 기준 green, yellow, red, sky 를 primary 쪽으로 돌린 색(`'harmonized'`), 기준 그대로(`'fixed'`), 또는 앱이 고른 색 |

## 스케일

계열마다 모드별 9단계이고, 번호가 클수록 페이지에서 멀어집니다(Radix Colors 처럼).

| 단계 | 쓰임 | 역할 | neutral light | neutral dark |
| --- | --- | --- | --- | --- |
| 1 | base | `bg-base` | `#ffffff` | `#0a0a0a` |
| 2 | surface | `bg-surface` | `#ffffff` | `#171717` |
| 3 | block | `bg-block` | `#fafafa` | `#1e1e1e` |
| 4 | soft | `bg-X-soft` | `#f5f5f5` | `#262626` |
| 5 | 선 | `border-X` | `#e5e5e5` | `#2e2e2e` |
| 6 | 진한 선 | `border-X-strong` | `#d4d4d4` | `#3a3a3a` |
| 7 | solid | `bg-X-solid` | `#a3a3a3` (역할 없음) | `#737373` (역할 없음) |
| 8 | 글자 | `text-X` | `#525252` | `#d4d4d4` |
| 9 | 진한 글자 | `text-X-strong` | `#0a0a0a` | `#fafafa` |

- neutral 값은 shadcn/ui 의 neutral 테마를 따릅니다. 다크 선 `#2e2e2e` 는 shadcn 의 10% 흰색을 카드 위에 얹은 값이고, 다크 진한 글자는 APCA 때문에 `#e5e5e5` 대신 `#fafafa` 입니다.
- neutral 의 solid 는 9단계를 읽습니다(`bg-neutral-solid`: 뒤집힌 채움, Tooltip, neutral solid Button). 7단계는 역할이 없습니다.
- base, surface, block 은 neutral 만 가집니다. 브랜드 스케일의 1~3단계는 순서를 맞추려고 있을 뿐 역할이 없습니다.
- solid 는 그 위 글자 대비로 고르므로 순서에서 벗어날 수 있습니다. 다크에서는 Lc 45 를 넘는 진한 선(6)이 흰 글자를 얹는 solid(7)보다 밝고, 노랑처럼 밝은 색은 라이트에서 solid 가 선보다 옅습니다. 글자(8, 9)는 언제나 solid 와 같거나 더 멉니다.

## 역할

| 역할 | 쓰임 |
| --- | --- |
| `bg-base` | 페이지 |
| `bg-surface` | 카드, 다이얼로그, 팝업, 토스트. 다크에서 페이지보다 한 단계 밝다 |
| `bg-block` | base 나 surface 위에서 구역을 나누는 바탕: Card, Dialog footer, Table 머리와 줄무늬, CodeBlock, soft Item, Empty, Accordion, Image placeholder, Editor 코드 |
| `bg-X-soft` | 옅은 채움: soft 컨트롤과 필드, soft Badge, 상태 Alert, Calendar 범위, Avatar, Skeleton |
| `bg-X-solid` | 채움: solid Button, Progress 막대, solid Badge |
| `border-X` | 구조선(`border-neutral`). 브랜드는 옅은 색 선 |
| `border-X-strong` | 진한 선. 브랜드는 Lc 45 를 넘는 색 선(focus ring, invalid 테두리), neutral 은 손잡이와 다크 outline 테두리 |
| `text-X` | 색 글자와 아이콘(Link, outline Badge, Rating 별). neutral 은 보조 글자 |
| `text-X-strong` | 진한 글자. neutral 은 본문 |
| `text-on-base`, `text-on-surface`, `text-on-block` | 그 바탕 위 글자 |
| `text-on-X-soft`, `text-on-X-solid` | 그 바탕 위 글자 |

- `text-on-{배경}` 은 그 배경 계열의 스케일 끝(진한 글자 쪽과 base 쪽)에서 시작해 램프, 흰색이나 neutral 950 으로 바깥쪽을 따라가며 hover, press 층 아래에서 Lc 75 를 처음 넘는 색입니다. 양쪽이 다 넘으면 Lc 가 큰 쪽입니다. 그래서 solid 위 글자도 계열 색이 섞일 수 있습니다(다크 노랑 solid 위 `#fefdec`).
- hover, active 역할은 없습니다. 상태는 컴포넌트가 그리는 state layer 입니다([상태 층](#상태-층)).
- 배경마다 짝이 있습니다. `bg-X-soft` 위 글자는 `text-on-X-soft`, `bg-X-solid` 위 글자는 `text-on-X-solid` 입니다. 색 글자로 강조할 때만 `text-X` 를 씁니다.
- `text-neutral-strong`, `text-neutral` 은 neutral 바탕 어디에나 놓는 본문 글자와 보조 글자입니다.
- `bg-primary-solid` 를 글자색으로, `primary/10` 을 옅은 채움으로 쓰지 않습니다. yellow, cyan 처럼 밝은 색은 흰 배경 위에서 Lc 60 도 안 됩니다.
- 노란 `warning` 채움 위 글자도 `text-on-warning-solid` 입니다. 흰 바탕 위 경고 글자는 `text-warning` 입니다.

### 바뀐 이름

| 예전 | 지금 |
| --- | --- |
| `bg-neutral-subtlest` / `text-on-neutral-subtlest` | `bg-base` / `text-on-base` |
| `bg-panel` (컴포넌트 토큰), `shadow-panel` | `bg-surface`, `shadow-surface` |
| `bg-band` (컴포넌트 토큰), `bg-neutral-subtler` | `bg-block` |
| `bg-X-subtle` / `text-on-X-subtle` | `bg-X-soft` / `text-on-X-soft` |
| `bg-X-subtler` / `text-on-X-subtler` | 없음. `bg-X-soft` / `text-on-X-soft` |
| `bg-X` / `text-on-X` | `bg-X-solid` / `text-on-X-solid` |
| `bg-neutral-bold` / `text-on-neutral-bold` | `bg-neutral-solid` / `text-on-neutral-solid` |
| `bg-neutral` (손잡이) | `bg-(--ids-color-border-neutral-strong)` |
| 브랜드 `border-X` (색 글자와 같은 단계) | `border-X-strong` |
| `text-neutral-bold` | `text-neutral-strong` |
| `surface` / `on-surface` | `bg-base` / `text-neutral-strong` |
| `bg-X-hover`, `bg-X-active`, `bg-X-soft-hover` | 없음. `state-layer` 와 `state-hover`, `state-press` |
| `chart-1` ~ `chart-5` | 없음. Chart 기본 색은 `bg-primary-solid`, `bg-secondary-solid`, `bg-tertiary-solid` |

## 팔레트에서 고르기

```tsx
<IdsProvider theme={defineIdsTheme({ primary: '#0d9488', secondary: palette, neutral: 'tinted' })}>
  <App />
</IdsProvider>
```

- 앱은 브랜드 색을 색 하나, 50 ~ 950 의 램프, 또는 모드별 9단계 스케일 둘로 줍니다. 앞의 둘은 IDS 가 두 스케일로 바꿉니다. IDS 에는 기본 색이 없습니다.
- 대비는 APCA 의 Lc 입니다.
  - solid 는 600 에서 시작해 흰 글자나 neutral 950 이 Lc 75 에 닿을 때까지 이웃 단계로 옮깁니다.
  - 진한 선은 300(다크 900)부터, base, surface, block, 자기 soft 위에서 Lc 45 를 넘는 첫 단계입니다.
  - 글자는 solid 단계부터 바깥으로 Lc 60 을, 진한 글자는 글자 다음 단계부터 Lc 75 를 넘는 첫 단계입니다. 그래서 둘이 같은 색이 되지 않습니다.
  - 모두 쉴 때뿐 아니라 hover, press 층 아래에서도 잽니다.
  - 다크 1~5단계는 같은 번호 neutral 의 밝기에 놓고, 램프 끝(950)의 채도를 밝기 비율의 제곱근만큼 남깁니다. 단순히 섞을 때보다 덜 칙칙합니다. 규칙은 [IdsProvider](../../components/utility/ids-provider/README.md#팔레트에서-역할-색-고르기) 에 있습니다.
- Storybook 툴바의 Primary 는 레포 데모 팔레트 17개(Tailwind CSS v4 기본 색, `orange` 와 `green` 은 IDS 고유 값)에서 고릅니다. 패키지에는 들어 있지 않습니다.

## 중립

### 상태 층

hover 와 press 는 색 역할이 아니라 컴포넌트가 그리는 층입니다.

```tsx
<button className="bg-neutral-soft text-on-neutral-soft state-layer data-hovered:state-hover data-active:state-press">
  채움
</button>
<span className="bg-(--ids-color-border-neutral-strong) hover:bg-(--ids-color-text-neutral) data-dragging:bg-(--ids-color-text-neutral)" />
```

| 유틸리티 | 하는 일 |
| --- | --- |
| `state-layer` | `--ids-state-color`(없으면 `currentColor`)를 `--ids-state-opacity` 만큼 `background-image` 로 덮는다 |
| `state-hover` | `--ids-state-opacity: var(--ids-state-layer-hover, var(--ids-state-hover))` |
| `state-press` | `--ids-state-opacity: var(--ids-state-layer-press, var(--ids-state-press))` |
| `state-fill` | 층을 검정으로, hover 10%, press 18% 로 둔다 |

- 비율은 `packages/core/tokens/state.tokens.json` 에 있습니다.
- 층 색은 면에 따라 다릅니다. 색 있는 컨트롤이 회색 쪽이 아니라 같은 색의 진한 쪽으로 가게 하려는 것입니다.

| 면 | 층 | hover / press |
| --- | --- | --- |
| 채움(solid Button, Chip, Badge, 고른 Calendar 날짜, 끝난 Stepper 단계) | 검정, `state-fill` | 10% / 18% |
| 색 있는 soft 면, 상태 색의 outline, ghost | 계열 채움(`bg-X-solid`), `--ids-state-tint-*` | 8% / 12% |
| neutral, 브랜드 색의 outline, ghost | 글자색 | 6% / 10% |

- IdsProvider 는 글자 단계를 고를 때 각 면이 그리는 층 아래의 대비까지 잽니다.
- 켜진 ghost, outline Toggle, 선택한 Table 행과 Item, 현재 ghost Pagination 링크는 `state-press` 입니다. 열린 Menu 항목과 강조된 옵션은 `state-hover` 입니다.
- `transition-[…]` 에 `--ids-state-opacity` 를 넣어 층이 함께 바뀌게 합니다.
- hover 색(`hover:bg-neutral-soft`)을 쓰거나 채운 브랜드 색을 `/90` 으로 흐리지 않습니다.
- `state-layer` 가 `background-image` 를 차지하므로, 자기 그라디언트가 있는 요소(glossy)는 층 대신 그라디언트 정지점을 옮깁니다.
- 예외:
  - 손잡이(ScrollArea thumb, Drawer 손잡이, 크기 조절 손잡이, DataTable 열 크기 조절, Carousel 점)는 2~4px 막대라 6~10% 층이 보이지 않습니다. `bg-(--ids-color-border-neutral-strong)` 에서 hover 와 끄는 동안 `bg-(--ids-color-text-neutral)` 로 바뀝니다.
    - ScrollArea thumb 만 한 단계 더 있습니다: `bg-(--ids-color-border-neutral-strong)/60` → hover `bg-(--ids-color-border-neutral-strong)` → 끄는 동안 `bg-(--ids-color-text-neutral)`.
  - IDS 가 모르는 배경 위의 반투명 층은 그대로입니다: Image 의 hover 가림막, Chip 선, ScrollArea 트랙, DataTable 로딩 가림막, disabled 투명도, backdrop.

### 구조선

- 필드 테두리, 카드 가장자리, 구분선은 `border-neutral` 입니다. 꾸밈 선이라 대비 규칙이 없습니다.
- 선 자체가 브랜드로 읽혀야 하는 드문 자리만 `border-primary-strong` 를 씁니다.

## 실시간으로 조정하기

- 툴바: Primary, Secondary, Tertiary, Neutral(`pure`, `tinted`), Status(`harmonized`, `fixed`), Corner, Mode 가 모든 스토리의 테마를 바꿉니다. Secondary 와 Tertiary 의 `derived` 는 primary 에서 만든 계열입니다.
- `Foundations/Color` 의 Lab 은 툴바가 고른 테마 하나를 한 화면에 그립니다.
  - `checkIdsTheme` 의 문제 목록.
  - 계열마다 11단계 팔레트와 출처(준 색, primary 에서 만듦, harmonized, fixed).
  - 계열 × 역할 스워치와 모든 계열 짝의 대비, 두 모드.
  - 두 모드의 컴포넌트:
    - 여덟 colorScheme × Button 다섯 variant, IconButton, 켜진 Toggle, IconToggle.
    - Badge, Chip, Link, Alert, Progress.
    - TextField(보통, invalid), Select, Checkbox, Switch, RadioGroup, Slider, Rating.
    - Tabs, Pagination, Breadcrumb, Stepper.
    - Card, Item, Avatar, Spinner, Skeleton, Kbd, Calendar, Chart(막대, 면).

## 원칙

- 구조선과 테두리는 중립입니다. 테마 색은 주요 동작과 포커스에만 씁니다.
- 색만으로 의미를 전하지 않습니다. 아이콘이나 글자를 함께 둡니다.
- 테마 하나의 대비는 Storybook `Foundations/Color` 의 Lab 에서 보고, 데모 팔레트 17개 전체는 `tests/tokens-contrast.test.ts` 가 검사합니다.
- Lab 의 역할 표는 `tokens/color-roles.ts`(core 의 `config/color-roles.json` 에서 생성)의 계열과 역할을 읽어 그리므로 계열이나 역할을 더하면 저절로 나타납니다.
- 테스트:
  - `tests/tokens-contrast.test.ts`: 데모 팔레트 17개 × 두 모드 × pure·tinted × harmonized·fixed 에서 모든 `text-on-*` 와 `text-X-strong` 이 Lc 75, `text-X` 가 Lc 60, `border-X-strong` 이 Lc 45 이상이다. hover, press 층 아래에서도 잰다. `ids.css` 에 `-hover`, `-active` 역할이 없다.
  - `tests/theme-roles.test.ts`: 데모 팔레트 17개가 역할 규칙을 모두 통과한다. `checkIdsTheme` 의 입력 검사.
  - `tests/theme-colors.test.ts`: harmonize, tinted neutral, `checkIdsTheme` 의 구별 검사와 그 기준값.
