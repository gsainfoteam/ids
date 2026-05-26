# @infoteam/ids-css

IDS 디자인 토큰을 CSS 변수와 Tailwind v4 `@theme`으로 제공하는 패키지.

## 설치

```bash
npm install @infoteam/ids-css
```

Tailwind v4가 peerDependency다.

```bash
npm install tailwindcss
```

## 사용법

CSS 파일 또는 Tailwind 엔트리포인트에서 import:

```css
@import "@infoteam/ids-css";
@import "tailwindcss";
```

그 다음 루트 요소에 `data-color`와 `data-mode` 속성을 설정한다:

```html
<div data-color="blue" data-mode="light">
  <!-- 이 하위에서 CSS 변수 활성화 -->
</div>
```

## 제공하는 것

### CSS 변수

| 변수 | 예시 |
|---|---|
| `--ids-color-*` | `--ids-color-primary`, `--ids-color-on-primary` |
| `--ids-spacing-*` | `--ids-spacing-xs`, `--ids-spacing-md` |
| `--ids-text-*` | `--ids-text-body`, `--ids-text-display` |
| `--ids-motion-*` | `--ids-motion-fast`, `--ids-motion-normal` |

### Tailwind @theme 브리지

Tailwind 유틸리티 클래스에서 토큰을 바로 사용할 수 있다:

```html
<button class="bg-[--ids-color-primary] text-[--ids-color-on-primary]">
  버튼
</button>
```

### 지원 색상 테마

`data-color` 속성에 아래 값을 사용할 수 있다:

| 값 | 설명 |
|---|---|
| `blue` | 기본 블루 테마 |
| `orange` | 오렌지 테마 |

`data-mode`는 `light` / `dark`.

## 직접 편집 금지

`dist/ids.css`는 `pnpm codegen`이 생성한다. 직접 수정하면 다음 codegen 시 덮어쓴다.
