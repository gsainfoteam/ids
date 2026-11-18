# @gsainfoteam/ids-css

IDS 디자인 토큰을 CSS 변수와 Tailwind v4 `@theme`으로 제공하는 패키지.

## 설치

GitHub Packages 에서 배포한다. 퍼블릭 패키지여도 설치에 인증이 필요하다.

프로젝트 루트에 `.npmrc` 를 둔다.

```ini
@gsainfoteam:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` 은 `read:packages` 스코프를 가진 토큰이다. `gh` 가 있으면

```bash
gh auth refresh -s read:packages
export NODE_AUTH_TOKEN=$(gh auth token)
```

없으면 classic PAT 를 발급해 같은 환경변수에 넣는다. fine-grained 는 npm
레지스트리 지원이 제한적이다.

```bash
npm install @gsainfoteam/ids-css tailwindcss
```

## CI 설정

GitHub Actions 에서는 토큰을 따로 발급하지 않는다. `secrets.GITHUB_TOKEN` 을
그대로 쓴다. `.npmrc` 는 위와 동일하다.

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: actions/setup-node@v4
    with:
      registry-url: https://npm.pkg.github.com
      scope: '@gsainfoteam'

  - run: npm ci
    env:
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`packages: read` 를 빠뜨리면 401 이 난다. `permissions` 블록을 선언하는 순간
적지 않은 권한은 전부 `none` 이 되기 때문이다.

Vercel 처럼 `gh` 도 `GITHUB_TOKEN` 도 없는 환경은 classic PAT 를 환경변수로 넣는다.

## 사용법

```css
@import "tailwindcss";
@import "@gsainfoteam/ids-css";
```

React 앱은 `IdsProvider theme` 이 아래 변수를 루트 요소에 넣는다. CSS 만 쓰는 페이지는 직접 준다:

```html
<div
  data-mode="light"
  style="--ids-theme-light-bg-primary: #155dfc; --ids-theme-light-text-on-primary: #ffffff; /* … 계열 × 역할 × 두 모드 */"
>
  <!-- 이 하위에서 CSS 변수 활성화 -->
</div>
```

- 색은 계열 여덟 개(`neutral`, `primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`, `info`)가 같은 역할을 가진다. 이름은 `{bg|text|border}-{계열}[-{세기}]` 와 `text-on-{계열}[-{세기}]` 문법으로만 짓는다. 세기는 `subtlest` < `subtler` < `subtle` < (없음) < `bold` 다.

  | 역할 | 쓰임 |
  |---|---|
  | `bg-X` | 채움 |
  | `bg-X-subtle` | 옅은 채움 |
  | `bg-X-subtler` | 페이지와 `subtle` 사이의 띠, 트레이 |
  | `text-on-X` | 채움 위 글자 |
  | `text-on-X-subtle` | 옅은 채움 위 글자 |
  | `text-on-X-subtler` | 띠 위 글자 |
  | `text-X` | 채움 없는 바탕 위 글자와 아이콘 |
  | `border-X` | 선. 브랜드와 상태는 `text-X` 와 같은 색, `border-neutral` 은 구조선 |

- 배경마다 짝이 있다. `bg-X[-세기]` 위 글자는 언제나 `text-on-X[-세기]` 다.
- neutral 만 가진 역할: 페이지 바탕 `bg-neutral-subtlest`(light 0, dark 950)와 그 위 글자 `text-on-neutral-subtlest`, 본문 글자 `text-neutral-bold`(900 / 50), 중립 채움 `bg-neutral-bold` 와 그 위 글자 `text-on-neutral-bold`. `bg-neutral`(300 / 700)은 손잡이 회색, `text-neutral`(600 / 300)은 흐린 글자다.
- hover 와 press 역할은 없다. 컴포넌트가 [`state-layer`](#state-layer) 로 그린다.

- 역할 변수는 `--ids-color-{역할}` 이고, `--ids-theme-{light|dark}-{역할}` 에서 읽는다. `data-mode` 가 둘 중 하나를 연결한다.
- 브랜드와 상태 계열의 변수는 IdsProvider 가 모두 쓴다. 테마가 `secondary`, `tertiary` 를 생략해도 primary 에서 만든 값을 쓴다. neutral 만 변수가 없으면 IDS 의 회색으로 그린다.
- 공유 `--color-*` 이름은 없다. 유틸리티마다 이름공간이 따로라 앞머리가 속성을 말한다: `bg-primary-subtle`(배경), `text-on-primary-subtle`(글자), `border-primary`·`ring-primary`·`outline-primary`·`stroke-primary`(선), `fill-primary`(글자 역할).
- `--ids-radius-standard`, `--ids-radius-indicator`, `--ids-radius-container`, `--ids-corner-shape` 를 요소에 주면 그 아래만 바뀐다. Tailwind 유틸리티(`rounded-standard`, `font-sans`, `bg-primary`)는 `@theme inline` 이라 이 변수를 바로 읽는다.

### 폰트

IDS 글꼴은 본문 Pretendard GOV Variable, 고정폭 Geist Mono 다. `@gsainfoteam/ids-css` 가 두 글꼴의 `@font-face` 와 woff2 파일을 함께 싣는다. 따로 불러올 것은 없다.

- 파일은 패키지 안에 있어서 CDN 이나 다른 글꼴 패키지가 필요 없다. 번들러(Next.js, Vite, Astro)가 woff2 를 앱의 정적 파일로 내보낸다.
- Pretendard GOV 는 dynamic subset(woff2 120개, 5.6MB)이다. 브라우저는 화면에 쓰인 글자 범위의 파일만 받는다.
- Geist Mono 는 Fontsource 의 가변 글꼴 정체(normal)만 담는다. latin, latin-ext, cyrillic, symbols 범위다.
- 두 글꼴 모두 SIL OFL 1.1 이다. 라이선스는 `fonts/pretendard-gov/LICENSE`, `fonts/geist-mono/LICENSE` 에 있다.
- 글꼴은 고정이다. 고정폭 글꼴의 x-height 보정, Kbd 정렬, 타입 스케일의 행간과 자간을 이 두 글꼴에서 쟀다.
- 글꼴 없이 토큰만 필요하면 `@gsainfoteam/ids-css/no-fonts.css` 를 가져온다. IDS 의 브라우저 테스트가 이것을 쓴다(WebKit 이 가변 글꼴을 크기와 굵기마다 캐시해 메모리가 커진다).

- `font-sans` 와 `--ids-font-family-sans` 는 `'Pretendard GOV Variable'`, `'Pretendard GOV'`, 일반 Pretendard, `sans-serif` 순서다. Pretendard 만 불러온 앱은 Pretendard 로 보인다.
- dynamic subset 은 화면에 쓰인 글자 범위만 받는다. 전체 파일(`pretendardvariable-gov.min.css`)은 woff2 5.4MB 다.
- `font-mono` 와 `--ids-font-family-mono` 는 `'Geist Mono Variable'`(Fontsource), `'Geist Mono'`(설치하거나 직접 호스팅한 글꼴), 시스템 고정폭 글꼴, Pretendard 순서다. 한글처럼 고정폭 글꼴에 없는 글자는 Pretendard 로 그린다.
- `font-mono` 는 x-height 를 글자 크기의 0.53 으로 맞춘다(`--ids-font-size-adjust-mono`, `font-size-adjust`). Pretendard GOV 의 x-height 와 같아서 Geist Mono 는 100% 크기로 본문과 높이가 맞는다. 대체 글꼴이 쓰여도 같은 x-height 로 맞춰진다.
- Geist Mono 는 ascent 와 descent 가 대문자를 가운데에 두어서, 행간을 키운 줄에서도 글자가 줄 가운데에 선다.

## Tailwind 유틸리티

`@theme` 브리지로 클래스에서 바로 쓴다:

```html
<!-- 색상 -->
<button class="bg-primary text-on-primary state-layer hover:state-hover active:state-press">확인</button>
<span class="bg-primary-subtle text-on-primary-subtle">새 글</span>
<a class="text-primary">자세히 보기</a>
<div class="border border-neutral bg-neutral-subtlest text-neutral-bold">카드</div>

<!-- 타이포 (피그마 Text style = 크기+weight+leading+tracking 묶음) -->
<p class="text-headline-h5-semibold">제목</p>
<p class="text-body-b2-regular text-neutral">본문</p>
<button class="text-body-b3-medium">CTA</button>
<button class="text-caption-c1-medium">작은 CTA</button>

<!-- 프리미티브 -->
<span class="text-h1 font-bold tracking-tight leading-tight">48px</span>
<span class="font-semibold tracking-normal leading-snug">…</span>
```

### 타이포 스타일 이름

| 그룹 | 클래스 예 |
|---|---|
| headline | `text-headline-h1-bold` … `text-headline-h6-medium` |
| subtitle | `text-subtitle-s1-semibold`, `text-subtitle-s2-medium` |
| body | `text-body-b1-regular` … `text-body-b3-bold` |
| caption | `text-caption-c1-regular`, `text-caption-c2-medium` |

### focus-ring-visible

`focus-ring` 이 ring 을 그리는 바로 그 조건에서 맞는 variant 입니다. ring 이 옆 요소에 가리지 않게 쌓을 때 씁니다.

```html
<div class="flex [&>*]:focus-ring-visible:z-30">…</div>
```

- 조건은 `focus-ring` 과 같은 표에서 나옵니다: `:focus-visible`, `[data-focus-visible]`, 안쪽 입력(`data-field-input` 등)에 포커스가 있는 껍데기.
- `focus-visible:` 이나 `data-focus-visible:` 하나만 쓰면 다른 조건으로 그린 ring(TextField 껍데기 같은)이 옆 요소 밑에 깔립니다.

### state-layer

hover 와 press 를 배경 위에 얹는 층으로 그린다. 색 역할이 아니다.

```html
<button class="bg-primary-subtle text-on-primary-subtle state-layer data-hovered:state-hover data-active:state-press">…</button>
```

- `state-layer` 는 `--ids-state-color`(기본 `currentColor`, 요소의 글자색)를 `--ids-state-opacity` 만큼 `background-image` 로 칠한다. 쉴 때 불투명도는 0% 다.
- `state-hover` 는 불투명도를 `--ids-state-hover`(6%), `state-press` 는 `--ids-state-press`(10%)로 둔다.
- 층이 글자색이라 페이지, 띠, 카드, 색 칩 어느 바탕에서나 보인다. IdsProvider 는 press 층 아래에서도 글자 대비를 확인한다.
- 고른, 켜진, 현재 항목도 같은 층을 쓴다(`state-press`, 열린 메뉴 항목과 강조된 목록 옵션은 `state-hover`).
- 2~4px 막대(ScrollArea thumb, Drawer 손잡이, 크기 조절 손잡이)에서는 6~10% 층이 보이지 않는다. 이들은 `bg-neutral` 에서 hover 와 끌기 때 `text-neutral` 색(`bg-(--ids-color-text-neutral)`)으로 바뀐다.

### shimmer

흘러나오는 중인 글자 위로 밝은 띠가 지나가게 합니다. AI 답의 "생각하는 중" 같은 상태 줄에 씁니다.

```html
<p role="status" class="shimmer text-neutral">생각하는 중</p>
```

- 바탕은 글자색(`currentColor`)이고, 띠는 `--ids-color-text-neutral-bold` 입니다. 띠가 지나가는 동안 대비가 글자색보다 낮아지지 않습니다.
- 글자만 칠합니다(`background-clip: text`). 같은 요소 안의 아이콘은 `currentColor` 로 그대로 그려집니다.
- 쓰는 방향을 따릅니다. 오른쪽에서 왼쪽 글에서는 오른쪽에서 왼쪽으로 지나갑니다.
- `prefers-reduced-motion: reduce` 면 움직이지 않고 보통 글자로 보입니다.

| 변수 | 기본 | 뜻 |
|---|---|---|
| `--ids-shimmer-color` | `var(--ids-color-text-neutral-bold)` | 띠 색 |
| `--ids-shimmer-spread` | `3em` | 띠 가운데에서 한쪽 끝까지의 폭 |
| `--ids-shimmer-duration` | `2s` | 한 번 지나가는 시간 |

```html
<p class="shimmer [--ids-shimmer-duration:3s]">불러오는 중</p>
```

### 브랜드 색

- 이 패키지에는 브랜드 팔레트가 없다. 앱이 `IdsProvider theme` 에 `primary`(와 `secondary`, `tertiary`)를 주면 역할 색을 대비로 골라 위 변수로 넣는다.
- corner shape: Provider 아래 요소는 `corner-shape: var(--ids-corner-shape, round)` 를 받고, `::before` `::after` 는 자기 요소의 모양을 물려받는다. `rounded-full` 은 `before:`, `after:` 같은 variant 를 붙여도 언제나 `round` 다.
  - `corner-shape` 를 지원하는 브라우저에서 `--ids-radius-*` 와 `concentric-p-*` 의 radius 는 `--ids-theme-corner-radius-scale`(squircle 이면 1.84) 배가 된다. squircle 모서리가 round 만큼 깊어진다.
- 브랜드 색 글자는 배경에 따라 고른다. `bg-primary` 위는 `text-on-primary`, `bg-primary-subtle` 위는 `text-on-primary-subtle`, 채움 없는 페이지 위는 `text-primary` 다. 앞의 둘은 APCA Lc 75, `text-primary` 는 바탕과 `bg-primary-subtle` 에서 Lc 60 을 넘는다.
- `primary` 를 글자색으로, `primary/10` 을 옅은 채움으로 쓰지 않는다. 밝은 색상은 흰 바탕에서 Lc 60 도 안 된다.

`data-mode`는 `light` / `dark`.

## 빌드

`dist/ids.css`는 Style Dictionary가 생성한다. 직접 수정하지 말 것.

```bash
pnpm codegen
# 또는
pnpm --filter @gsainfoteam/ids-css build
```
