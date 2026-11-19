# Color

IDS 색은 네 층입니다. 팔레트(`neutral-50`, 테마의 `primary-600`)는 값일 뿐이고, 시맨틱 역할(`--ids-color-<역할>`)이 팔레트 한 단계를 가리키고, scheme(`bg-scheme`, `text-on-scheme`)이 한 계열의 역할을 가리키고, 컴포넌트 토큰(`bg-panel`, `border-control-outline`)이 모드마다 역할 하나를 가리킵니다. 컴포넌트 토큰은 [ComponentTokens](../component-tokens/README.md) 에 있습니다. 브랜드 색은 앱이 `IdsProvider theme` 에 준 색에서 오고, 모든 색은 `IdsProvider` 가 붙이는 `data-mode` 에 따라 CSS 가 바꿉니다.

```tsx
<div className="bg-neutral-subtlest text-neutral-bold">
  <button className="bg-primary text-on-primary state-layer hover:state-hover active:state-press">저장</button>
  <span className="bg-danger-subtle text-on-danger-subtle">실패</span>
  <p className="text-neutral">보조 글자</p>
</div>
```

- 역할 이름은 문법으로만 짓습니다: `{속성}-{계열}[-{세기}]`, `text-on-{계열}[-{세기}]`. `surface` 같은 쓰임새 이름은 없습니다.
- 속성은 `bg`, `text`, `border` 입니다. 유틸리티 앞머리가 속성을 말합니다. `bg-*` 는 배경, `text-*` 는 글자(와 `fill-*`), `border-*` 는 선(과 `ring-*`, `inset-ring-*`, `outline-*`, `stroke-*`, `divide-*`)입니다.
- 세기는 `subtlest` < `subtler` < `subtle` < (없음) < `bold` 입니다. `bolder`, `boldest` 는 비워 둡니다. 세기는 사다리의 자리이지 팔레트 단계가 아닙니다.
- CSS 변수는 `--ids-color-{역할}` 입니다(`--ids-color-bg-primary-subtle`). 공유 `--color-*` 이름은 없어서 `bg-on-primary` 같은 클래스는 만들어지지 않습니다.
- 역할을 다른 속성으로 쓸 때만 임의 값을 씁니다: 끄는 손잡이의 `bg-(--ids-color-text-neutral)`, 차트 점 둘레의 `stroke-(--ids-color-bg-neutral-subtlest)`.
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

## 역할

모든 계열이 가지는 역할입니다.

| 역할 | 쓰임 |
| --- | --- |
| `bg-X-subtler` | 띠. subtle 보다 옅다. light 는 팔레트 50, dark 는 950 을 페이지 쪽으로 절반(OKLab) 섞은 색 |
| `bg-X-subtle` | 옅은 채움 (soft variant, soft Badge, 상태 Alert) |
| `bg-X` | 채움 (solid Button, Progress 막대, solid Badge) |
| `text-on-X-subtler` | `bg-X-subtler` 위 글자 |
| `text-on-X-subtle` | `bg-X-subtle` 위 글자 |
| `text-on-X` | `bg-X` 위 글자 |
| `text-X` | 채움 없는 바탕, `bg-X-subtler`, `bg-X-subtle` 위 글자와 아이콘 (Link, outline Badge, Rating 별) |
| `border-X` | 선. `text-X` 와 같은 단계 |

neutral 만 가지는 역할입니다.

| 역할 | light | dark | 쓰임 |
| --- | --- | --- | --- |
| `bg-neutral-subtlest` / `text-on-neutral-subtlest` | 0 / 900 | 950 / 50 | 페이지, 팝업, 카드 |
| `bg-neutral-subtler` / `text-on-neutral-subtler` | 50 / 900 | 900 / 50 | 표 머리. light 의 `bg-band`, dark 의 `bg-panel` |
| `bg-neutral-subtle` | 100 | 800 | soft 컨트롤, 흐린 행. dark 의 outline 컨트롤과 `bg-band` |
| `bg-neutral` | 300 | 700 | 손잡이, 트랙 |
| `bg-neutral-bold` / `text-on-neutral-bold` | 900 / 0 | 50 / 950 | 뒤집힌 채움: Tooltip, neutral solid Button, Badge |
| `text-neutral-bold` | 900 | 50 | 본문 글자 |
| `text-neutral` | 600 | 300 | 보조 글자 |
| `border-neutral` | 200 | 800 | 구조선 |

- hover, active 역할은 없습니다. 상태는 컴포넌트가 그리는 state layer 입니다([상태 층](#상태-층)).
- 채움 위 글자는 색을 직접 고르지 말고 `text-on-X` 로 칠합니다. 밝은 팔레트에서는 검은 글자가 됩니다.
- 배경마다 짝이 있습니다. `bg-X[-세기]` 위 글자는 언제나 `text-on-X[-세기]` 입니다. 색 글자로 강조할 때만 `text-X` 를 씁니다.
- `text-neutral-bold`, `text-neutral` 은 neutral 바탕 어디에나 놓는 본문 글자와 보조 글자입니다.
- `bg-primary` 를 글자색으로, `primary/10` 을 옅은 채움으로 쓰지 않습니다. yellow, cyan 처럼 밝은 색은 흰 배경 위에서 Lc 60 도 안 됩니다.
- 노란 `warning` 채움 위 글자도 `text-on-warning` 입니다. 흰 바탕 위 경고 글자는 `text-warning` 입니다.

### 바뀐 이름

| 예전 | 지금 |
| --- | --- |
| `surface` | `bg-neutral-subtlest` |
| `on-surface` | `text-neutral-bold` |
| `bg-X-soft` / `text-on-X-soft` | `bg-X-subtle` / `text-on-X-subtle` |
| `bg-X-hover`, `bg-X-active` | 없음. `state-layer` 와 `state-hover`, `state-press` |
| `bg-X-soft-hover`, `bg-X-soft-active` | 없음. 위와 같다 |
| `bg-neutral-hover`, `bg-neutral-active` (손잡이) | 없음. hover 와 끄는 동안 `bg-(--ids-color-text-neutral)` |
| `secondary` / `on-secondary` | `bg-primary-subtle` / `text-on-primary-subtle` |
| `accent` | `text-primary` |
| `outline` | `border-primary` |
| `muted` | `bg-neutral-subtle` |
| `on-muted` | `text-neutral` |
| `border` | `border-neutral` |
| `handle` | `bg-neutral` |
| `{상태}` / `on-{상태}` | `bg-{상태}` / `text-on-{상태}` |
| `{상태}-strong` | `text-{상태}` |
| 상태 색 10~20% 틴트 | `bg-{상태}-subtle` 와 `text-on-{상태}-subtle` |
| `chart-1` ~ `chart-5` | 없음. Chart 기본 색은 `bg-primary`, `bg-secondary`, `bg-tertiary` |

## 팔레트에서 고르기

```tsx
<IdsProvider theme={defineIdsTheme({ primary: '#0d9488', secondary: palette, neutral: 'tinted' })}>
  <App />
</IdsProvider>
```

- 앱은 브랜드 색을 50 ~ 950 의 11단계 팔레트나 색 하나로 줍니다. IDS 에는 기본 색이 없습니다.
- 대비는 APCA 의 Lc 입니다.
  - 채움은 600 에서 시작해 글자가 Lc 75 에 닿을 때까지 이웃 단계로 옮깁니다.
  - `text-on-` 글자는 Lc 75, 페이지와 subtler, subtle 위 색 글자는 Lc 60 을 넘는 첫 단계입니다.
  - 모두 쉴 때뿐 아니라 hover, press 층 아래에서도 잽니다.
  - 선은 색 글자와 같은 단계입니다. 규칙은 [IdsProvider](../../components/utility/ids-provider/README.md#팔레트에서-역할-색-고르기) 에 있습니다.
- Storybook 툴바의 Primary 는 레포 데모 팔레트 17개(Tailwind CSS v4 기본 색, `orange` 와 `green` 은 IDS 고유 값)에서 고릅니다. 패키지에는 들어 있지 않습니다.

## 중립

### 상태 층

hover 와 press 는 색 역할이 아니라 컴포넌트가 그리는 층입니다.

```tsx
<button className="bg-neutral-subtle text-on-neutral-subtle state-layer data-hovered:state-hover data-active:state-press">
  채움
</button>
<span className="bg-neutral hover:bg-(--ids-color-text-neutral) data-dragging:bg-(--ids-color-text-neutral)" />
```

| 유틸리티 | 하는 일 |
| --- | --- |
| `state-layer` | `--ids-state-color`(없으면 `currentColor`)를 `--ids-state-opacity` 만큼 `background-image` 로 덮는다 |
| `state-hover` | `--ids-state-opacity: var(--ids-state-layer-hover, var(--ids-state-hover))` |
| `state-press` | `--ids-state-opacity: var(--ids-state-layer-press, var(--ids-state-press))` |
| `state-fill` | 층을 검정으로, hover 10%, press 18% 로 둔다 |

- 비율은 `packages/core/tokens/state.json` 에 있습니다.
- 층 색은 면에 따라 다릅니다. 색 있는 컨트롤이 회색 쪽이 아니라 같은 색의 진한 쪽으로 가게 하려는 것입니다.

| 면 | 층 | hover / press |
| --- | --- | --- |
| 채움(solid Button, Chip, Badge, 고른 Calendar 날짜, 끝난 Stepper 단계) | 검정, `state-fill` | 10% / 18% |
| 색 있는 soft 면, 상태 색의 outline, ghost | 계열 채움(`bg-X`), `--ids-state-tint-*` | 8% / 12% |
| neutral, 브랜드 색의 outline, ghost | 글자색 | 6% / 10% |

- IdsProvider 는 글자 단계를 고를 때 각 면이 그리는 층 아래의 대비까지 잽니다.
- 켜진 ghost, outline Toggle, 선택한 Table 행과 Item, 현재 ghost Pagination 링크는 `state-press` 입니다. 열린 Menu 항목과 강조된 옵션은 `state-hover` 입니다.
- `transition-[…]` 에 `--ids-state-opacity` 를 넣어 층이 함께 바뀌게 합니다.
- hover 색(`hover:bg-neutral-subtle`)을 쓰거나 채운 브랜드 색을 `/90` 으로 흐리지 않습니다.
- `state-layer` 가 `background-image` 를 차지하므로, 자기 그라디언트가 있는 요소(glossy)는 층 대신 그라디언트 정지점을 옮깁니다.
- 예외:
  - 손잡이(ScrollArea thumb, Drawer 손잡이, 크기 조절 손잡이, DataTable 열 크기 조절, Carousel 점)는 2~4px 막대라 6~10% 층이 보이지 않습니다. `bg-neutral` 에서 hover 와 끄는 동안 `bg-(--ids-color-text-neutral)` 로 바뀝니다.
    - ScrollArea thumb 만 한 단계 더 있습니다: `bg-neutral/60` → hover `bg-neutral` → 끄는 동안 `bg-(--ids-color-text-neutral)`.
  - IDS 가 모르는 배경 위의 반투명 층은 그대로입니다: Image 의 hover 가림막, Chip 선, ScrollArea 트랙, DataTable 로딩 가림막, disabled 투명도, backdrop.

### 구조선

- 필드 테두리, 카드 가장자리, 구분선은 `border-neutral` 입니다. 꾸밈 선이라 대비 규칙이 없습니다.
- 선 자체가 브랜드로 읽혀야 하는 드문 자리만 `border-primary` 를 씁니다.

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
- Lab 의 역할 표는 `tokens/color-roles.ts`(core 의 `color-roles.json` 에서 생성)의 계열과 역할을 읽어 그리므로 계열이나 역할을 더하면 저절로 나타납니다.
- 테스트:
  - `tests/tokens-contrast.test.ts`: 데모 팔레트 17개 × 두 모드 × pure·tinted × harmonized·fixed 에서 모든 계열의 채움과 subtle 위 글자가 Lc 75, `text-X` 가 Lc 60, 선이 Lc 45 이상이다. hover, press 층 아래에서도 잰다. `ids.css` 에 `-hover`, `-active`, `-soft` 역할이 없다.
  - `tests/theme-roles.test.ts`: 데모 팔레트 17개가 역할 규칙을 모두 통과한다. `checkIdsTheme` 의 입력 검사.
  - `tests/theme-colors.test.ts`: harmonize, tinted neutral, `checkIdsTheme` 의 구별 검사와 그 기준값.
