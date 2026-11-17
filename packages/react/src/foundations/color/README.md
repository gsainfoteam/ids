# Color

IDS 색은 계열 여덟 개가 같은 역할 열 개를 가지는 시맨틱 토큰입니다. 브랜드 색은 앱이 `IdsProvider theme` 에 준 색에서 오고, 모든 색은 `IdsProvider` 가 붙이는 `data-mode` 에 따라 CSS 가 바꿉니다.

```tsx
<div className="bg-surface text-on-surface">
  <button className="bg-primary text-on-primary hover:bg-primary-hover">저장</button>
  <span className="bg-danger-soft text-on-danger-soft">실패</span>
  <p className="text-neutral">보조 글자</p>
</div>
```

- 유틸리티 앞머리가 속성을 말합니다. `bg-*` 는 배경, `text-*` 는 글자(와 `fill-*`), `border-*` 는 선(과 `ring-*`, `inset-ring-*`, `outline-*`, `stroke-*`, `divide-*`)입니다.
- CSS 변수는 `--ids-color-{역할}` 입니다(`--ids-color-bg-primary-soft`). 공유 `--color-*` 이름은 없어서 `bg-on-primary` 같은 클래스는 만들어지지 않습니다.
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

| 역할 | 쓰임 |
| --- | --- |
| `bg-X` | 채움 (solid Button, Progress 막대, solid Badge) |
| `bg-X-hover`, `bg-X-active` | 채움의 hover, press. 글자에서 먼 쪽으로 10%, 20% |
| `bg-X-soft` | 옅은 채움 (soft variant, 선택된 행) |
| `bg-X-soft-hover`, `bg-X-soft-active` | 옅은 채움의 hover, press. 채움을 6%, 12% 섞는다 |
| `text-on-X` | `bg-X` 와 그 hover, press 위 글자 |
| `text-on-X-soft` | `bg-X-soft` 와 그 hover, press 위 글자 |
| `text-X` | 채움 없는 바탕 위 글자와 아이콘 (Link, outline Badge, Rating 별) |
| `border-X` | 선. 브랜드와 상태는 `text-X` 와 같은 색 |

바탕 층은 따로 둘입니다.

| 토큰 | 쓰임 |
| --- | --- |
| `surface` | 페이지와 카드 배경 (`bg-surface`) |
| `on-surface` | 본문 글자 (`text-on-surface`) |

- 채움 위 글자는 색을 직접 고르지 말고 `text-on-X` 로 칠합니다. 밝은 팔레트에서는 검은 글자가 됩니다.
- `bg-primary` 를 글자색으로, `primary/10` 을 옅은 채움으로 쓰지 않습니다. yellow, cyan 처럼 밝은 색은 흰 배경 위에서 Lc 60 도 안 됩니다.
- 노란 `warning` 채움 위 글자도 `text-on-warning` 입니다. 흰 바탕 위 경고 글자는 `text-warning` 입니다.

### 바뀐 이름

| 예전 | 지금 |
| --- | --- |
| `secondary` / `on-secondary` | `bg-primary-soft` / `text-on-primary-soft` |
| `accent` | `text-primary` |
| `outline` | `border-primary` |
| `muted`, `muted-hover`, `muted-active` | `bg-neutral-soft`, `-hover`, `-active` |
| `on-muted` | `text-neutral` |
| `border` | `border-neutral` |
| `handle`, `handle-hover`, `handle-active` | `bg-neutral`, `-hover`, `-active` |
| `{상태}` / `on-{상태}` | `bg-{상태}` / `text-on-{상태}` |
| `{상태}-strong` | `text-{상태}` |
| 상태 색 10~20% 틴트 | `bg-{상태}-soft` 와 `text-on-{상태}-soft` |
| `chart-1` ~ `chart-5` | 없음. Chart 기본 색은 `bg-primary`, `bg-secondary`, `bg-tertiary` |

## 팔레트에서 고르기

```tsx
<IdsProvider theme={defineIdsTheme({ primary: '#0d9488', secondary: palette, neutral: 'tinted' })}>
  <App />
</IdsProvider>
```

- 앱은 브랜드 색을 50 ~ 950 의 11단계 팔레트나 색 하나로 줍니다. IDS 에는 기본 색이 없습니다.
- 대비는 APCA 의 Lc 입니다. 채움은 600 에서 시작해 글자가 Lc 75 에 닿을 때까지 이웃 단계로 옮기고, 채움과 soft 위 글자는 Lc 75, 페이지 위 색 글자는 Lc 60 을 넘는 첫 단계이고, 선은 페이지 위 색 글자와 같은 단계입니다. 규칙은 [IdsProvider](../../components/utility/ids-provider/README.md#팔레트에서-역할-색-고르기) 에 있습니다.
- Storybook 툴바의 Primary 는 레포 데모 팔레트 17개(Tailwind CSS v4 기본 색, `orange` 와 `green` 은 IDS 고유 값)에서 고릅니다. 패키지에는 들어 있지 않습니다.

## 중립

### 상태 사다리

중립 상태는 한 단계씩 오릅니다.

```tsx
<button className="hover:bg-neutral-soft active:bg-neutral-soft-hover">투명</button>
<button className="bg-neutral-soft hover:bg-neutral-soft-hover active:bg-neutral-soft-active">
  채움
</button>
<span className="bg-neutral hover:bg-neutral-hover data-dragging:bg-neutral-active" />
```

- 투명 컨트롤: 쉼 → hover `bg-neutral-soft` → press `bg-neutral-soft-hover`.
- 채운 컨트롤: `bg-neutral-soft` → hover `bg-neutral-soft-hover` → press `bg-neutral-soft-active`.
- 손잡이(ScrollArea thumb, Drawer 손잡이): `bg-neutral` → hover `bg-neutral-hover` → 끄는 동안 `bg-neutral-active`.
- 눌린 토글은 press 단계로 칠합니다.
- 사다리를 따르지 않는 것:
  - 배경을 모르는 겹침층: Item, Card 의 `on-surface` 겹침, Chip 의 `currentColor` 층, Kbd.
  - 브랜드 상태.
  - 테두리 링, disabled 투명도, backdrop.

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
  - `tests/tokens-contrast.test.ts`: 데모 팔레트 17개 × 두 모드 × pure·tinted × harmonized·fixed 에서 모든 계열의 채움과 soft 위 글자가 Lc 75, `text-X` 가 Lc 60, 선이 Lc 45 이상이다.
  - `tests/theme-roles.test.ts`: 역할 규칙이 이전 고정 표(Flutter 가 쓰는 표)와 같은 단계를 고른다.
  - `tests/theme-colors.test.ts`: harmonize, tinted neutral, `checkIdsTheme` 의 구별 검사와 그 기준값.
