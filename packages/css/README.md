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

루트에 `data-color` / `data-mode`를 설정한다:

```html
<div data-color="blue" data-mode="light">
  <!-- 이 하위에서 CSS 변수 활성화 -->
</div>
```

## Tailwind 유틸리티

`@theme` 브리지로 클래스에서 바로 쓴다:

```html
<!-- 색상 -->
<button class="bg-primary text-on-primary">확인</button>

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

### 지원 색상 테마

| `data-color` | 설명 |
|---|---|
| `blue` | 기본 블루 |
| `orange` | 오렌지 (지글) |
| `green` | 그린 (팟쥐) |

`data-mode`는 `light` / `dark`.

## 빌드

`dist/ids.css`는 Style Dictionary가 생성한다. 직접 수정하지 말 것.

```bash
pnpm codegen
# 또는
pnpm --filter @gsainfoteam/ids-css build
```
