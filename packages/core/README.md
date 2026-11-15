# @gsainfoteam/ids-core

토큰·문구 소스 + Style Dictionary 및 문구 codegen. **배포하지 않음** — 빌드 타임 전용.

## 역할

`packages/core/tokens/`의 JSON 토큰을 읽어 아래 파일을 생성한다.

| 출력 파일 | 설명 |
|---|---|
| `packages/css/dist/ids.css` | CSS 변수 + Tailwind `@theme` |
| `packages/react/src/tokens/types.ts` | TypeScript 타입 (`IdsMode`, `IdsSize` 등) |
| `packages/flutter/lib/tokens/*.dart` | Dart 토큰 클래스. `ids_color_roles.dart` 는 `color-roles.json` 에서 `IdsColors` 와 계열·역할 목록을 만든다 |
| `packages/react/src/tokens/palette-model.ts` | 17색에 맞춘 팔레트 모델의 계수와 상태 색의 기준 넷. `palette-model.js` 가 쓴다 |
| `packages/flutter/lib/tokens/ids_palette_model.dart` | 같은 계수와 상태 색 넷의 Dart 판. `palette-model.js` 가 쓴다 |

## 토큰 구조

```
tokens/
  palette.json          # 원시 색상 팔레트. neutral 과 레포 데모 팔레트 17색
  spacing.json          # 간격 원시값 (xs, sm, md, ...)
  typography.json       # 폰트 패밀리·사이즈·웨이트·행간 원시값
  motion.json           # 애니메이션 지속시간 원시값
  enums.json            # IdsMode·IdsSize·IdsVariant 열거값. color 는 데모 hue 이름 목록(스토리 전용)이라 어디에도 나가지 않는다
  semantic/
    neutral.{light,dark}.json  # 중립 계열과 바탕 층의 단계. CSS fallback, tokens/color-roles.ts, Dart 의 neutralSteps 로 나간다
    typography.json     # 텍스트 스타일. CSS 와 Dart 가 같은 이름으로 받는다
color-roles.json        # 색 계열과 역할 이름의 표. CSS 브리지, React 의 tokens/color-roles.ts, Dart 의 IdsColors 를 만든다
tests/fixtures/theme-roles.json  # ids-react 가 쓴 17색 × 조합별 역할 색. Flutter 테스트가 같은 값을 내는지 비교한다
```

hue 별 역할 표는 없다. 역할 색은 두 플랫폼이 앱의 팔레트에서 런타임에 고른다.

## 색 역할 표

`color-roles.json` 하나가 색 이름을 정한다.

```json
{
  "families": { "neutral": ["neutral"], "brand": ["primary", "secondary", "tertiary"], "status": ["success", "warning", "danger", "info"] },
  "slots": { "bg": ["{family}", "{family}-hover", "…"], "text": ["on-{family}", "on-{family}-soft", "{family}"], "border": ["{family}"] },
  "namespaces": { "bg": ["--background-color"], "text": ["--text-color", "--fill"], "border": ["--border-color", "--ring-color", "--outline-color", "--stroke"] }
}
```

- 역할 변수는 `--ids-color-{bg|text|border}-{이름}` 이다. 바탕 층(`surface`, `on-surface`)만 앞머리가 없다.
- Tailwind 이름공간은 `namespaces` 에 적힌 것만 만든다. `--background-color-primary-soft` 는 있고 `--color-primary` 나 `--background-color-on-primary` 는 없다.
- `[data-mode]` 블록은 역할마다 `--ids-theme-{mode}-{역할}` 을 읽는다. 브랜드와 상태 계열은 fallback 이 없다(IdsProvider 가 모두 쓴다). neutral 과 바탕 층은 없으면 `neutral.*.json` 의 단계를 읽는다.
- Dart 포매터도 이 표를 읽는다. `--ids-color-bg-primary-soft` 는 `IdsColors.bgPrimarySoft` 가 되고, `colors['bg-primary-soft']` 로도 읽는다.

## 팔레트 모델

`palette-model.js` 는 Style Dictionary 다음에 돈다. IdsProvider 와 `IdsPalette.fromSeed` 가 색 하나로 11단계를 만들 때 읽는 모델이다.

- 단계마다 500 의 hue 를 받는 푸리에 급수 셋을 맞춘다: 밝기, sRGB 최대 채도에 대한 채도 비율, 500 에서의 hue 회전.
- 가중치는 OKLab 거리다. 밝기는 그대로, 채도 비율은 최대 채도, hue 회전은 그 단계의 채도를 곱한다.
- 고조파 수(1–7)와 매끄러움 벌점은 계열마다 leave-one-out 오차가 가장 작은 조합을 고른다. 1% 안의 차이면 단순한 쪽을 고른다.
- 실행하면 고른 조합과 17색을 다시 만든 오차를 출력한다.
- 계수와 고르는 규칙은 [IdsProvider README](../react/src/components/utility/ids-provider/README.md#색-하나로-팔레트-만들기) 에 적는다.

## codegen 실행

```bash
# 루트에서
pnpm codegen

# 또는 이 패키지 직접
pnpm build
```

생성된 파일은 직접 편집하지 않는다. `pnpm codegen` 실행 시 덮어쓴다.

## 새 데모 팔레트 추가

- `tokens/palette.json` 에 11단계를 넣고 `pnpm codegen` 을 돌린다. 팔레트 모델이 새 색까지 맞춰 다시 나온다.
- fixture 를 다시 쓴다. Flutter 의 parity 테스트가 새 색도 비교한다.

```bash
pnpm codegen
pnpm --filter @gsainfoteam/ids-react exec vitest run --project node tests/flutter-parity.test.ts -u
```

## 문구 카탈로그

`messages/ko.json`과 `messages/en.json`이 IDS 자체 문구의 원본이다. 서비스의 문구는 포함하지 않는다. `pnpm codegen`이 React의 `src/internal/messages-catalog.ts`와 `messages/en.json`을 생성한다. 한국어는 단순 `{name}` 인자만 사용한다.

같은 명령은 Flutter의 `lib/messages/ids_messages.dart`와 `messages/ko.i18n.json`도 생성한다. Dart에는 nullable `IdsMessages` mixin과 모든 문구를 가진 `IdsMessages.ko`가 들어간다. `dialog.close`는 `dialogClose`로, `{label}`은 필수 named parameter `Object label`로 바뀐다. 중첩 경로가 같은 Dart 이름이 되거나 한국어에 지원하지 않는 ICU 구문이 있으면 생성이 실패한다.

생성기 테스트: `node --test packages/core/dart-messages.test.mjs`.
