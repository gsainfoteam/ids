# @gsainfoteam/ids-core

토큰 소스 + Style Dictionary codegen. **배포하지 않음** — 빌드 타임 전용.

## 역할

`packages/core/tokens/`의 JSON 토큰을 읽어 아래 파일을 생성한다.

| 출력 파일 | 설명 |
|---|---|
| `packages/css/dist/ids.css` | CSS 변수 + Tailwind `@theme` |
| `packages/react/src/tokens/types.ts` | TypeScript 타입 (`IdsMode`, `IdsSize` 등). `IdsColor` 는 Dart 에만 나간다 |
| `packages/flutter/lib/tokens/*.dart` | Dart 토큰 클래스 |
| `packages/react/src/tokens/palette-model.ts` | 17색에 맞춘 팔레트 모델의 계수와 상태 색의 기준 넷. `palette-model.js` 가 쓴다 |
| `packages/flutter/lib/tokens/ids_palette_model.dart` | 같은 계수와 상태 색 넷의 Dart 판. `palette-model.js` 가 쓴다 |

## 토큰 구조

```
tokens/
  palette.json          # 원시 색상 팔레트. neutral 과 상태 색의 기준 넷(red, yellow, green, sky)
  spacing.json          # 간격 원시값 (xs, sm, md, ...)
  typography.json       # 폰트 패밀리·사이즈·웨이트·행간 원시값
  motion.json           # 애니메이션 지속시간 원시값
  enums.json            # IdsColor(Dart 전용)·IdsMode·IdsSize·IdsVariant 열거값
  semantic/
    neutral.{light,dark}.json  # 중립 계열과 바탕 층의 단계. CSS fallback 과 tokens/color-roles.ts 로 나간다
    status.{light,dark}.json   # 상태 색(예전 이름). Dart 생성에만 쓴다
    [color].light.json  # hue 별 역할 색(예전 이름). Dart 생성에만 쓴다 (Flutter 가 런타임 팔레트로 옮기면 지운다)
    [color].dark.json
    typography.json     # 텍스트 스타일. text 는 CSS 와 Dart, flutter-only(버튼)는 Dart 생성에만 쓴다
color-roles.json        # 색 계열과 역할 이름의 표. CSS 브리지와 React 의 tokens/color-roles.ts 를 만든다
```

시맨틱 색상 파일에서 `{blue.600}` 형태로 팔레트를 참조한다.

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
- Dart 포매터는 이 표를 읽지 않는다. `packages/flutter/lib/tokens` 는 예전 이름 그대로 나오고, CI 가 바뀌지 않았는지 확인한다. `ids_palette_model.dart` 는 이 확인에서 빠진다.

## 팔레트 모델

`palette-model.json` 이 IdsProvider 와 `IdsPalette.fromSeed` 가 색 하나로 11단계를 만들 때 읽는 모델의 계수다. `palette-model.js` 는 Style Dictionary 다음에 돌며, 이 계수와 `palette.json` 의 상태 색 넷을 `react/src/tokens/palette-model.ts` 와 `flutter/lib/tokens/ids_palette_model.dart` 로 옮긴다.

- 단계마다 500 의 hue 를 받는 푸리에 급수 셋이다: 밝기, sRGB 최대 채도에 대한 채도 비율, 500 에서의 hue 회전. 한 줄이 한 단계이고, 값은 `[a0, a1, b1, a2, b2, …]` 순서다.
- 계수는 데모 팔레트 17색에 맞춰 구한 뒤 고정했다. 17색과 맞추던 코드는 지웠다. 다시 맞추려면 `f3b8fc4b` 커밋의 `palette-model.js` 와 17색이 있던 `tokens/palette.json` 을 꺼낸다.
- 계수를 바꾸면 Storybook `Foundations/Palette` 의 Model 스토리로 hue 한 바퀴와 시드 고정을 눈으로 확인한다.
- 모델의 동작은 [IdsProvider README](../react/src/components/utility/ids-provider/README.md#색-하나로-팔레트-만들기) 에 적는다.

## codegen 실행

```bash
# 루트에서
pnpm codegen

# 또는 이 패키지 직접
pnpm build
```

생성된 파일은 직접 편집하지 않는다. `pnpm codegen` 실행 시 덮어쓴다.
