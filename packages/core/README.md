# @gsainfoteam/ids-core

토큰과 문구의 원본, 그리고 그것을 각 패키지 파일로 바꾸는 codegen 이다. **배포하지 않는다.** 빌드할 때만 쓴다.

## 흐름

```
tokens/*.tokens.json (DTCG)  ─┐
config/*.json                ─┼─ src/sources ─→ src/ir ─→ out/ir.json ─→ 타깃 emitter ─→ 각 패키지 파일
package.json, pubspec.yaml   ─┘   (valibot 검사)   (IR + ir.schema.json)
```

- `src/sources/`: 원본을 읽고 검사한다.
  - 토큰은 `@terrazzo/parser` 가 DTCG 2025.10 규칙으로 읽는다. 별칭(`{font-family.sans}`)을 풀고, 틀린 토큰은 파일과 줄을 짚어 실패한다.
  - Terrazzo 는 토큰을 이름순으로 돌려준다. `loadTokens` 가 파일 순서와 파일 안 위치로 다시 정렬하므로 출력 순서는 원본에 적힌 순서다.
  - `config/*.json` 과 두 manifest 는 `src/sources/config.ts` 의 valibot 스키마로 검사한다. 오류는 `config/neutral-roles.json: bg-base: …` 처럼 파일과 키를 짚는다.
- `src/ir/`: 원본을 타입 있는 IR 하나로 합친다.
  - `build.ts` 가 값을 계산하고(역할, fallback, Flutter 행간과 자간, 상태 불투명도의 백분율) 서로 가리키는 이름을 확인한다. 없는 역할, 없는 slot, 맞지 않는 hex 는 여기서 실패한다.
  - 이름은 segment 배열이다. `naming.ts` 가 타깃과 쓰임마다 철자를 만든다(아래 "이름").
  - `schema.ts` 가 IR 의 valibot 스키마다. `build.ts` 는 결과를 이 스키마로 다시 검사한다.
  - 실행마다 `out/ir.json`(git 에서 제외)과 `ir.schema.json`(커밋)을 쓴다. Dart 쪽 IR 모델은 `ir.schema.json` 에서 만든다.
- 타깃 emitter: IR 만 읽는다. 이름을 다시 만들지 않고 IR 의 철자를 그대로 쓴다.
  - `src/targets/css/`: `css/dist/ids.css`(아래 "CSS 타깃").
  - `src/targets/ts/foundations.ts`: 스토리가 읽는 `react/src/tokens/foundations.json`. JSON 을 Prettier 로 정리해 쓴다.
  - `src/targets/output.ts`: `targets.json` 의 `outputs` 에서 출력 경로를 찾고, 그 파일 자리의 Prettier 설정으로 정리해 쓴다.
  - `src/fonts/copy.ts`: IR 의 `fonts.bundled` 대로 Flutter 글꼴을 복사한다.
  - `src/legacy/`: 이전 Style Dictionary 포매터를 IR 에서 먹인다. `from-ir.ts` 가 IR 을 이전 입력 모양으로 바꾸고, 출력은 이전 파이프라인과 바이트가 같다. TS, Dart emitter 가 차례로 이 폴더를 대신한다.
- 문구는 아직 `messages.build.mjs` 가 따로 만든다(아래 "문구 카탈로그").

## 원본

```
tokens/
  palette.tokens.json     neutral 의 light, dark 9단계와 상태 색 램프 넷(red, yellow, green, sky, 50~950)
  spacing.tokens.json     이름 붙은 간격(xs, sm, md, …)
  size.tokens.json        컨트롤 높이와 아이콘 크기(standard, tiny)
  radius.tokens.json      standard 10px, indicator 4px, container 16px, full
  motion.tokens.json      전환 시간 세 단계
  state.tokens.json       state layer 비율과 채움 층 색
  shadow.tokens.json      그림자 단계 0, 1, 2
  typography.tokens.json  글꼴, 크기, 굵기, 행간, 자간, font-size-adjust
  text.tokens.json        텍스트 스타일(typography 합성 토큰)
config/
  targets.json            이름 접두사, 타깃별 manifest 경로, 이름 철자 규칙, symbols, outputs
  color-roles.json        색 계열과 역할 slot, scheme, Tailwind 이름공간
  neutral-roles.json      neutral 역할마다 읽는 스케일 단계
  component-tokens.json   컴포넌트 토큰. 모드마다 역할 하나 또는 그림자 단계 하나
  enums.json              IdsMode, IdsSize, IdsVariant. 타깃마다 더하는 값(`extend.dart: ["system"]`)
  fonts.json              함께 싣는 글꼴, npm 경로, 라이선스
  palette-model.json      팔레트 모델 계수와 상태 팔레트 이름
  css.json                CSS 타깃이 쓰는 속성 이름, 변형, concentric 패딩, Tailwind 이름공간, 배율
tests/fixtures/theme-roles.json  ids-react 가 쓴 역할 색. Flutter 테스트가 같은 값을 내는지 비교한다
```

- 토큰 값은 DTCG 모양으로 쓴다.
  - 색 `{ "colorSpace": "srgb", "components": [r, g, b], "alpha": a, "hex": "#rrggbb" }`. IR 이 8비트로 반올림하고 `hex` 와 맞는지 확인한다.
  - 길이 `{ "value": 4, "unit": "px" }`, 시간 `{ "value": 150, "unit": "ms" }`.
  - 비율은 숫자다(`0.06`). CSS 의 `6%` 는 IR 이 `decimal.js` 로 계산한다.
- 파일은 Prettier `--object-wrap collapse` 로 정리한다.
- hue 별 역할 표는 없다. 역할 색은 두 플랫폼이 앱의 팔레트에서 런타임에 고른다.

## 이름

- 이름은 segment 배열이다(`["color", "bg", "primary", "soft"]`). `config/targets.json` 이 타깃의 쓰임마다 철자(`case`)와 접두사(`prefixed`)를 정한다.

| 타깃 | 쓰임 | 예 |
|---|---|---|
| css | `identifier`, `customProperty`, `themeProperty` | `bg-primary-soft`, `--ids-color-bg-primary-soft`, `--background-color-primary-soft` |
| ts | `constant`, `member`, `type`, `key` | `IDS_COLOR_BG_BASE`, `bgPrimarySoft`, `IdsMode`, `bg-primary-soft` |
| dart | `member`, `type`, `key` | `bgPrimarySoft`, `IdsMode`, `bg-primary-soft` |

- 하위 이름은 `name(segments, sub)` 로 만든다. CSS 는 `subSeparator`(`--`)로 잇고(`--ids-text-body-b1-regular--font-weight`), TS 와 Dart 는 segment 를 이어 철자를 만든다(`textBodyB1RegularFontWeight`).
- 토큰의 `tailwind` 는 그 토큰을 잇는 Tailwind 이름이다. 이름공간은 `config/css.json` 의 `theme` 이 정하고, 없는 종류는 빈 배열이다.
- 접두사는 `targets.json` 의 `prefix`(`["ids"]`)다. 패키지 이름과 경로는 `react/package.json`, `css/package.json`, `flutter/pubspec.yaml` 에서 읽는다.
- emitter 가 쓰는 고정 이름(클래스, 상수)은 `symbols` 에 segment 배열로 적는다. IR 이 같은 규칙으로 철자를 만든다.
- emitter 가 쓰는 파일 경로는 `outputs` 에 적는다. 경로는 그 타깃 패키지 기준이다.

## 생성 파일

| 출력 파일 | 원본 |
|---|---|
| `css/dist/ids.css` | 모든 토큰, color-roles, component-tokens |
| `react/src/tokens/types.ts` | enums |
| `react/src/tokens/color-roles.ts` | color-roles, neutral-roles, state, palette 의 neutral |
| `react/src/tokens/component-tokens.ts` | component-tokens, shadow |
| `react/src/tokens/palette-model.ts` | palette-model, palette 의 상태 색 |
| `react/src/tokens/foundations.json` | spacing, size, radius, motion, typography. Foundations 스토리가 읽는다 |
| `flutter/lib/tokens/*.dart` | 위와 같은 표의 Dart 판(`IdsColors`, `IdsStateOpacity`, `IdsComponentColors`, `IdsTypography`, `IdsPaletteModel` …) |
| `flutter/fonts/*` | fonts, `node_modules` 의 글꼴 패키지 |
| `core/ir.schema.json` | IR 스키마 |

생성된 파일은 직접 고치지 않는다. `pnpm codegen` 이 덮어쓴다.

## 색 역할

`config/color-roles.json` 이 색 이름을 정한다.

```json
{
  "families": { "neutral": ["neutral"], "brand": ["primary", "secondary", "tertiary"], "status": ["success", "warning", "danger", "info"] },
  "slots": [["bg", "base"], ["bg", "$family", "soft"], ["text", "on", "$family", "solid"], ["border", "$family", "strong"]],
  "scheme": {
    "family": "scheme",
    "redirects": [{ "family": "neutral", "from": ["text", "$family"], "to": ["text", "$family", "strong"] }],
    "stateLayer": {
      "default": { "color": { "role": ["bg", "$family", "solid"] }, "opacity": ["state", "tint"] },
      "families": { "neutral": { "color": { "keyword": "currentColor" }, "opacity": ["state"] } }
    }
  },
  "tailwindNamespaces": { "bg": ["background-color"], "text": ["text-color", "fill"], "border": ["border-color", "ring-color", "outline-color", "stroke"], "shadow": ["shadow"] }
}
```

- slot 은 segment 배열이고 `$family` 자리에 계열이 들어간다. 첫 segment 가 속성이다(`["bg", "$family", "soft"]` → `bg-primary-soft`).
- `$family` 가 없는 slot 은 neutral 에만 있다(`bg-base`, `text-on-surface`).
- 배경은 쓰임새(`base`, `surface`, `block`, `soft`, `solid`)로, 선과 글자는 세기(없음, `strong`)로 부른다.
- 역할 변수는 `--ids-color-{역할}` 이다. hover, active 역할은 없다.
- `[data-mode]` 블록은 역할마다 `--ids-theme-{mode}-{역할}` 을 읽는다.
  - 브랜드와 상태 계열은 fallback 이 없다(IdsProvider 가 모두 쓴다).
  - neutral 은 없으면 `neutral-roles.json` 이 가리키는 스케일 단계를 읽는다. `text-on-*` 는 neutral 도 fallback 이 없다.
- Tailwind 이름공간은 `tailwindNamespaces` 에 적힌 것만 만든다. `--color-primary` 나 `--background-color-on-primary-solid` 는 없다.
- `scheme-{계열}` utility 는 `$family` 가 있는 역할을 `--ids-color-*-scheme[-…]` 로 다시 가리킨다.
  - `redirects` 는 한 계열이 다른 역할을 가리키는 자리다. neutral 의 `text-scheme` 은 `text-neutral-strong` 이다.
  - `stateLayer` 가 층 색과 불투명도를 정한다. 계열 채움(`bg-X-solid`)에 tint 비율, neutral 은 `currentColor` 에 기본 비율이다. 비율 이름은 `state.tokens.json` 에 있어야 한다.

## 컴포넌트 토큰

- `config/component-tokens.json` 의 토큰은 모드마다 `{ "role": "bg-base" }` 또는 `{ "shadow": "1" }` 하나를 갖는다. 한 토큰은 모든 모드가 역할이거나 모든 모드가 그림자다.
- 이름은 `{속성}-{그룹}[-{부분}][-{변형}]` 이다(`bg-control-outline`, `shadow-surface`).
- CSS 는 `[data-mode]` 마다 `--ids-color-{토큰}: var(--ids-color-{역할})`, `--ids-shadow-{토큰}: var(--ids-shadow-{단계})` 를 쓴다. 그림자 단계 `0` 은 `0 0 #0000` 이다.
- 이름 규칙과 대비는 `react/tests/component-tokens.test.ts` 가, Flutter 와 같은 색인지는 parity fixture 의 `components` 가 확인한다.

## state layer

`tokens/state.tokens.json` 이 hover 와 press 의 비율, 채움 층의 색을 정한다.

| 토큰 | 값 | CSS | React | Dart |
|---|---|---|---|---|
| `state.hover` | 0.06 | `--ids-state-hover: 6%` | `IDS_STATE_OPACITY.hover` | `IdsStateOpacity.hover` |
| `state.press` | 0.1 | `--ids-state-press` | `IDS_STATE_OPACITY.press` | `IdsStateOpacity.press` |
| `state.tint.hover` | 0.08 | `--ids-state-tint-hover` | `IDS_STATE_OPACITY.tintHover` | `IdsStateOpacity.tintHover` |
| `state.tint.press` | 0.12 | `--ids-state-tint-press` | `IDS_STATE_OPACITY.tintPress` | `IdsStateOpacity.tintPress` |
| `state.fill.color` | `#000000` | `--ids-state-fill-color` | `IDS_STATE_FILL_COLOR` | `IdsStateLayer.fillColor` |
| `state.fill.hover` | 0.1 | `--ids-state-fill-hover` | `IDS_STATE_OPACITY.fillHover` | `IdsStateOpacity.fillHover` |
| `state.fill.press` | 0.18 | `--ids-state-fill-press` | `IDS_STATE_OPACITY.fillPress` | `IdsStateOpacity.fillPress` |

- `state-layer` 는 `--ids-state-color`(없으면 `currentColor`)를 `--ids-state-opacity` 만큼 `background-image` 로 덮는다.
- `@property --ids-state-opacity` 는 상속하지 않는다. 그래서 채움 버튼 안의 요소가 바깥 층을 물려받지 않는다.
- IdsProvider(`theme-roles.ts`)와 Flutter(`theme_roles.dart`)는 같은 값으로 층 아래의 글자 대비를 잰다. 값을 바꾸면 parity fixture 를 다시 쓴다.

## 팔레트 모델

- `config/palette-model.json` 은 IdsProvider 와 `IdsRamp.fromSeed` 가 색 하나로 50~950 램프를 만들 때 읽는 모델의 계수다.
- 단계마다 500 의 hue 를 받는 푸리에 급수 셋이다: `lightness`, `chroma`(sRGB 최대 채도에 대한 비율), `hue-shift`. 한 줄이 한 단계이고, 값은 `[a0, a1, b1, a2, b2, …]` 순서다.
- `statusPalettes` 는 `palette.tokens.json` 에서 상태 색으로 옮길 램프 이름이다.
- 계수는 데모 팔레트 17색에 맞춰 구한 뒤 고정했다. 다시 맞추려면 `f3b8fc4b` 커밋의 `palette-model.js` 와 17색이 있던 `tokens/palette.json` 을 꺼낸다.
- 모델의 동작은 [IdsProvider README](../react/src/components/utility/ids-provider/README.md#색-하나로-팔레트-만들기) 에 적는다.

## Flutter 글꼴

`config/fonts.json` 이 함께 싣는 글꼴을 정한다.

```json
{
  "bundled": {
    "Pretendard GOV Variable": {
      "aliases": ["Pretendard GOV", "Pretendard Variable", "Pretendard"],
      "font": "pretendard-gov/dist/public/variable/PretendardGOVVariable.ttf",
      "license": { "from": "pretendard-gov/dist/LICENSE.txt", "to": "fonts/PretendardGOV-LICENSE.txt" }
    }
  },
  "flutter": { "unnamedGenericFamilies": ["sans-serif", "ui-monospace"] }
}
```

- 글꼴 파일이 놓일 자리는 `flutter/pubspec.yaml` 의 `flutter.fonts` 에서 읽는다. `fonts.json` 의 글꼴과 pubspec 의 family 가 하나씩 맞아야 한다.
- `aliases` 는 글꼴 스택에서 같은 글꼴을 부르는 이름이다. Flutter 의 fallback 에서는 함께 싣는 family 하나로 바뀐다.
- `unnamedGenericFamilies` 는 Flutter 가 이름으로 부를 수 없는 CSS 일반 family 다. Flutter fallback 에서 빠진다.
- 웹은 같은 글꼴을 `pretendard-gov` 와 `@fontsource-variable/geist-mono`(woff2)로 싣는다. Flutter 는 TTF 가 필요해서 Geist Mono 는 Vercel 의 `geist` 에서 가져온다.
- 글꼴을 올리려면 `packages/core/package.json` 의 버전을 바꾸고 `pnpm codegen` 을 돌린다. ids-css 의 `pretendard-gov` 와 같은 버전으로 맞춘다.

## CSS 타깃

`src/targets/css/emit.ts` 가 IR 에서 postcss 노드를 만들고 Prettier 로 정리해 `css/dist/ids.css` 를 쓴다.

```
src/targets/css/
  emit.ts       구역마다 노드를 만든다. 색 bridge, :root 토큰, 변형, scheme utility, concentric, 글자, 배율, [data-mode] 역할
  selectors.ts  postcss-selector-parser 노드(속성, 클래스, :where, :has, :not)
  values.ts     postcss-value-parser 노드(var(), calc(), round(), 곱, 쉼표 목록)
  literals.ts   CSS 가 적는 값의 철자(10px, 6%, 150ms, #0000, 글꼴 이름 따옴표)
  static/*.css  토큰에서 나오지 않는 손으로 쓴 CSS(keyframes, state-layer, document-text, focus-ring utility, corner-shape, @property)
```

- 토큰과 config 에서 나오는 것은 emitter 가 만든다.
  - 색, 그림자, 컴포넌트 토큰의 `@theme inline` bridge, `[data-mode="…"]` 역할 블록
  - `dark` 변형(`modeVariants`)과 `focus-ring-visible` 변형의 trigger(`focusRing.triggers`)
  - `scheme-{계열}` utility, concentric 의 `:has()` 중첩 규칙(`concentric.pads`, `overlayDepths`)
  - 글자 토큰과 텍스트 스타일의 `:root` 값과 Tailwind 이름, `[data-mode]` 반지름과 `[data-scale]` 배율 길이(`scale`)
- `static/*.css` 는 손으로 쓴 CSS 다. 토큰 이름을 바꾸면 이 파일들도 고친다. focus-ring utility 셋은 `@variant focus-ring-visible` 로 trigger 를 읽는다.
- `src/targets/**` 는 문자열을 잇지 않는다. ESLint(`eslint.config.js`)가 식이 든 템플릿 문자열, 문자열 `+`, `replace`, `replaceAll`, `concat`, `padStart`, `padEnd` 를 막는다. 철자는 `literals.ts` 에만 둔다. 오류 메시지는 예외다.

## 토큰 종류 더하기

1. `tokens/<종류>.tokens.json` 을 DTCG 로 쓴다. 그룹에 `$type` 을 둔다.
2. `src/ir/schema.ts` 에 그 종류의 스키마를 더하고 `IrSchema` 에 넣는다. 값은 타깃 철자가 아니라 구조로 둔다(`{ value, unit }`, `milliseconds`).
3. `src/ir/build.ts` 에서 `tokensIn(tokens, ['<종류>'], ['<$type>'])` 로 읽어 IR 을 만든다. 이름은 `variableToken` 으로 만든다.
4. `pnpm codegen` 으로 `ir.schema.json` 을 다시 쓰고 커밋한다.
5. 그 값을 내보낼 타깃 emitter 에서 읽는다.

## 타깃 더하기

1. `config/targets.json` 의 `targets` 에 manifest 경로, `names`(쓰임마다 `case`, `prefixed`), `symbols`, `outputs` 를 적는다.
2. `src/sources/config.ts` 의 `TargetsConfigSchema` 와 `src/ir/schema.ts` 의 `NameSchema`, `TargetsSchema`, `PackagesSchema` 에 그 타깃을 더한다.
3. `src/targets/<타깃>/` 에 emitter 를 둔다. IR 만 읽고, 문자열을 이어 붙이지 않고 그 언어의 AST 나 builder 로 만든다.
4. `src/codegen.ts` 에서 부르고, CI 의 생성 파일 diff 목록에 출력 경로를 더한다.

## 테스트

```bash
pnpm --filter @gsainfoteam/ids-core test       # vitest(tests/) 와 문구 생성기 테스트
pnpm --filter @gsainfoteam/ids-core typecheck  # tsc6
```

- `tests/ir.test.ts`:
  - IR 이 커밋된 `ir.schema.json` 과 같은 스키마로 만들어지고, `ir.json` 이 그 JSON Schema 를 통과하는지(ajv) 본다.
  - IR 에서 만든 모든 생성 파일이 커밋된 파일과 바이트가 같은지 본다.
  - 원본 오류가 파일과 키, 토큰을 짚는지 본다.
- `tests/css.test.ts`:
  - 생성된 `ids.css` 를 Tailwind(`@tailwindcss/node`, 버전 고정)로 컴파일한 결과가 `tests/__snapshots__/ids.compiled.css` 와 같은지 본다. utility 목록은 테스트와 IR(scheme, concentric)에서 온다.
  - 컴파일 결과를 Lightning CSS 가 경고 없이 읽는지, 텍스트 스타일의 하위 이름 철자를 본다.
  - CSS 를 고치려고 스냅샷이 바뀌면 `vitest run -u` 로 다시 쓰고 diff 를 확인한다.

## codegen 실행

```bash
pnpm codegen                                    # 루트에서
pnpm --filter @gsainfoteam/ids-core build       # 이 패키지만
```

## 데모 팔레트

- 스토리와 테스트의 17색은 `packages/react/.storybook/palettes.ts` 의 seed 로 만든다. core 에는 없다.
- seed 를 바꾸거나 더하면 parity fixture 를 다시 쓴다. Flutter 테스트가 같은 seed 로 같은 역할 색을 내는지 비교한다.

```bash
pnpm codegen
pnpm --filter @gsainfoteam/ids-react exec vitest run --project node tests/flutter-parity.test.ts -u
```

## 문구 카탈로그

`messages/ko.json`과 `messages/en.json`이 IDS 자체 문구의 원본이다. 서비스의 문구는 포함하지 않는다. `pnpm codegen`이 React의 `src/internal/messages-catalog.ts`와 `messages/en.json`을 생성한다. 한국어는 단순 `{name}` 인자만 사용한다.

같은 명령은 Flutter의 `lib/messages/ids_messages.dart`와 `messages/ko.i18n.json`도 생성한다. Dart에는 nullable `IdsMessages` mixin과 모든 문구를 가진 `IdsMessages.ko`가 들어간다. `dialog.close`는 `dialogClose`로, `{label}`은 필수 named parameter `Object label`로 바뀐다. 중첩 경로가 같은 Dart 이름이 되거나 한국어에 지원하지 않는 ICU 구문이 있으면 생성이 실패한다.

생성기 테스트: `node --test packages/core/dart-messages.test.mjs`.
