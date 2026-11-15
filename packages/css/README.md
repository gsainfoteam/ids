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
  style="--ids-theme-light-primary: #155dfc; --ids-theme-light-on-primary: #ffffff; /* … 역할 6개 × 두 모드 */"
>
  <!-- 이 하위에서 CSS 변수 활성화 -->
</div>
```

- 브랜드 역할 `primary`, `on-primary`, `secondary`, `on-secondary`, `accent`, `outline` 은 `--ids-theme-{light|dark}-{역할}` 에서 읽는다. `data-mode` 가 둘 중 하나를 `--ids-color-{역할}` 로 연결한다.
- neutral, status, chart 는 이 패키지가 정하고 `data-mode` 에만 따른다.
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
<button class="bg-primary text-on-primary">확인</button>
<span class="bg-secondary text-on-secondary">새 글</span>
<a class="text-accent">자세히 보기</a>

<!-- 타이포 (피그마 Text style = 크기+weight+leading+tracking 묶음) -->
<p class="text-headline-h5-semibold">제목</p>
<p class="text-body-b2-regular text-on-muted">본문</p>
<button class="text-button-standard">CTA</button>
<button class="text-button-tiny">작은 CTA</button>

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
| button | `text-button-standard`, `text-button-tiny` |

### shimmer

흘러나오는 중인 글자 위로 밝은 띠가 지나가게 합니다. AI 답의 "생각하는 중" 같은 상태 줄에 씁니다.

```html
<p role="status" class="shimmer text-on-muted">생각하는 중</p>
```

- 바탕은 글자색(`currentColor`)이고, 띠는 `--ids-color-on-surface` 입니다. 띠가 지나가는 동안 대비가 글자색보다 낮아지지 않습니다.
- 글자만 칠합니다(`background-clip: text`). 같은 요소 안의 아이콘은 `currentColor` 로 그대로 그려집니다.
- 쓰는 방향을 따릅니다. 오른쪽에서 왼쪽 글에서는 오른쪽에서 왼쪽으로 지나갑니다.
- `prefers-reduced-motion: reduce` 면 움직이지 않고 보통 글자로 보입니다.

| 변수 | 기본 | 뜻 |
|---|---|---|
| `--ids-shimmer-color` | `var(--ids-color-on-surface)` | 띠 색 |
| `--ids-shimmer-spread` | `3em` | 띠 가운데에서 한쪽 끝까지의 폭 |
| `--ids-shimmer-duration` | `2s` | 한 번 지나가는 시간 |

```html
<p class="shimmer [--ids-shimmer-duration:3s]">불러오는 중</p>
```

### 브랜드 색

- 이 패키지에는 브랜드 팔레트가 없다. 앱이 `IdsProvider theme` 에 팔레트를 주면 역할 색을 대비로 골라 위 변수로 넣는다.
- corner shape: Provider 아래 요소는 `corner-shape: var(--ids-corner-shape, round)` 를 받는다. `rounded-full` 은 언제나 `round` 다.
- 브랜드 색 글자는 배경에 따라 고른다. `primary` 채움 위는 `on-primary`, `secondary` 위는 `on-secondary`, 채움 없는 페이지 위는 `accent` 다. 셋 다 두 모드에서 4.5:1 을 넘는다.

`data-mode`는 `light` / `dark`.

## 빌드

`dist/ids.css`는 Style Dictionary가 생성한다. 직접 수정하지 말 것.

```bash
pnpm codegen
# 또는
pnpm --filter @gsainfoteam/ids-css build
```
