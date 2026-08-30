# @gsainfoteam/ids-css

IDS 디자인 토큰을 CSS 변수와 Tailwind v4 `@theme`으로 제공하는 패키지.

## 설치

GitHub Packages에서 배포한다. 퍼블릭 패키지여도 설치에 인증이 필요하다.

### 1. 토큰 준비

`gh` 가 깔려 있으면 PAT 를 따로 만들지 않아도 된다. 이미 로그인한 토큰에
스코프만 더한다.

```bash
gh auth refresh -s read:packages          # 최초 1회
export NODE_AUTH_TOKEN=$(gh auth token)   # ~/.zshrc 에 넣어둔다
```

`gh` 를 안 쓰거나 Vercel 처럼 `gh` 가 없는 환경이면 PAT 를 만든다.
GitHub > Settings > Developer settings > Personal access tokens > **Tokens (classic)**
에서 `read:packages` 만 체크한다. fine-grained 토큰은 npm 레지스트리 지원이
제한적이라 classic 을 쓴다. 발급한 값을 `NODE_AUTH_TOKEN` 환경변수로 넣는다.

### 2. 프로젝트 루트에 `.npmrc` 를 만든다

```ini
@gsainfoteam:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

두 줄 다 필요하다. 첫 줄은 `@gsainfoteam` 스코프를 어느 레지스트리에서 받을지,
둘째 줄은 그 레지스트리에 쓸 토큰을 정한다.

**둘째 줄 앞의 `//` 는 주석이 아니다.** `https:` 를 생략한 레지스트리 주소이고,
지우면 인증이 빠져서 401 이 난다. `.npmrc` 의 주석은 `#` 다.

**`${NODE_AUTH_TOKEN}` 은 이 글자 그대로 적는다.** `gh` 로 받았든 PAT 를 만들었든
똑같다. 토큰 값으로 치환하지 않는다.

```ini
# O - 이대로 적는다
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}

# X - 토큰을 직접 적으면 커밋돼서 새어나간다
//npm.pkg.github.com/:_authToken=ghp_AbCdEf123456
```

토큰은 셸의 환경변수에 있고, npm 이 설치하는 순간 `${...}` 자리에 채워 넣는다.
그래서 `.npmrc` 에는 토큰이 남지 않고, 커밋해도 된다.

### 3. 설치

```bash
npm install @gsainfoteam/ids-css tailwindcss
```

`bun` 도 같은 `.npmrc` 를 읽는다.

```bash
bun add @gsainfoteam/ids-css tailwindcss
```

registry 줄만 두고 `_authToken` 을 빼면 npm 도 bun 도 401 로 거부한다.
퍼블릭 패키지여도 익명 설치가 안 된다.

### GitHub Actions 에서 설치할 때

토큰을 따로 발급하지 않는다. `secrets.GITHUB_TOKEN` 을 그대로 넘긴다.
`.npmrc` 는 위와 동일하다.

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
