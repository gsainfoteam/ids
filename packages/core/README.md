# @gsainfoteam/ids-core

토큰·문구 소스 + Style Dictionary 및 문구 codegen. **배포하지 않음** — 빌드 타임 전용.

## 역할

`packages/core/tokens/`의 JSON 토큰을 읽어 아래 파일을 생성한다.

| 출력 파일 | 설명 |
|---|---|
| `packages/css/dist/ids.css` | CSS 변수 + Tailwind `@theme`. `state.json` 에서 `--ids-state-hover`, `--ids-state-press`, `--ids-state-tint-*`, `--ids-state-fill-*`, `state-layer`·`state-hover`·`state-press`·`state-fill`·`state-scheme` 유틸리티, `color-roles.json` 에서 `scheme-{계열}`·`focus-ring-scheme` 유틸리티, `@property --ids-state-opacity`·`--ids-state-color`·`--ids-state-layer-hover`·`--ids-state-layer-press` |
| `packages/react/src/tokens/types.ts` | TypeScript 타입 (`IdsMode`, `IdsSize` 등) |
| `packages/react/src/tokens/color-roles.ts` | 계열 목록, `IDS_FAMILY_SLOTS`, `IDS_NEUTRAL_ONLY_SLOTS`, `IDS_STATE_OPACITY`(`hover`, `press`, `tintHover`, `tintPress`, `fillHover`, `fillPress`), `IDS_STATE_FILL_COLOR`, `IDS_NEUTRAL_PALETTE`, `IDS_NEUTRAL_STEPS` |
| `packages/flutter/lib/tokens/*.dart` | Dart 토큰 클래스. `ids_color_roles.dart` 는 `color-roles.json` 에서 `IdsColors`, `IdsColorRoles`(계열, `familySlots`, `neutralOnlySlots`, `slotsOf`, `neutralSteps`), `state.json` 에서 `IdsStateOpacity`(`hover`, `press`, `tintHover`, `tintPress`, `fillHover`, `fillPress`), `IdsStateLayer.fillColor` 를 만든다 |
| `packages/react/src/tokens/component-tokens.ts` | `component.json`, `shadow.json` 에서 `IDS_COMPONENT_COLORS`, `IDS_COMPONENT_SHADOWS`, `IDS_SHADOWS` |
| `packages/flutter/lib/tokens/ids_component_tokens.dart` | 같은 표의 Dart 판. `IdsComponentColors`, `IdsComponentShadows`, `IdsShadows`, `IdsComponentTokens` |
| `packages/react/src/tokens/palette-model.ts` | 17색에 맞춘 팔레트 모델의 계수와 상태 색의 기준 넷. `palette-model.js` 가 쓴다 |
| `packages/flutter/lib/tokens/ids_palette_model.dart` | 같은 계수와 상태 색 넷의 Dart 판. `palette-model.js` 가 쓴다 |
| `packages/flutter/fonts/*` | Flutter 패키지에 넣는 글꼴과 라이선스. `fonts.build.mjs` 가 npm 패키지에서 복사한다 |

## 토큰 구조

```
tokens/
  palette.json          # 원시 색상 팔레트. neutral 과 상태 색의 기준 넷(red, yellow, green, sky)
  spacing.json          # 간격 원시값 (xs, sm, md, ...)
  typography.json       # 폰트 패밀리·사이즈·웨이트·행간 원시값
  motion.json           # 애니메이션 지속시간 원시값
  component.json        # 컴포넌트 토큰. 모드마다 역할 하나(`bg-panel`: light `bg-neutral-subtlest`, dark `bg-neutral-subtler`)
  shadow.json           # 그림자 원시 단계 0, 1, 2. sm/md 이름은 없다
  state.json            # state layer 의 불투명도와 채움 층 색. hover 6%, press 10%, tint 8% / 12%, fill 검정 10% / 18%
  enums.json            # IdsMode·IdsSize·IdsVariant 열거값. color 는 데모 hue 이름 목록(스토리 전용)이라 어디에도 나가지 않는다
  semantic/
    neutral.{light,dark}.json  # neutral 역할의 단계(`bg-neutral-subtlest` 0 / 950 …). CSS fallback, tokens/color-roles.ts, Dart 의 neutralSteps 로 나간다
    typography.json     # 텍스트 스타일. CSS 와 Dart 가 같은 이름으로 받는다
color-roles.json        # 색 계열과 역할 이름의 표. CSS 브리지, React 의 tokens/color-roles.ts, Dart 의 IdsColors 를 만든다
tests/fixtures/theme-roles.json  # ids-react 가 데모 seed 17개 × 조합별로 쓴 역할 색. Flutter 테스트가 같은 값을 내는지 비교한다
```

hue 별 역할 표는 없다. 역할 색은 두 플랫폼이 앱의 팔레트에서 런타임에 고른다.

## 색 역할 표

`color-roles.json` 하나가 색 이름을 정한다.

```json
{
  "families": { "neutral": ["neutral"], "brand": ["primary", "secondary", "tertiary"], "status": ["success", "warning", "danger", "info"] },
  "slots": {
    "bg": ["{family}-subtlest", "{family}-subtler", "{family}-subtle", "{family}", "{family}-bold"],
    "text": ["on-{family}-subtlest", "on-{family}-subtler", "on-{family}-subtle", "on-{family}", "on-{family}-bold", "{family}", "{family}-bold"],
    "border": ["{family}"]
  },
  "scheme": { "neutral": { "bg-{family}": "bg-{family}-bold", "text-on-{family}": "text-on-{family}-bold", "text-{family}": "text-{family}-bold" } },
  "neutralOnly": ["bg-{family}-subtlest", "text-on-{family}-subtlest", "bg-{family}-bold", "text-on-{family}-bold", "text-{family}-bold"],
  "namespaces": { "bg": ["--background-color"], "text": ["--text-color", "--fill"], "border": ["--border-color", "--ring-color", "--outline-color", "--stroke"] }
}
```

- `slots` 는 `{family}` 를 넣는 틀이다. 역할은 `{속성}-{틀}` 이다(`bg-{family}-subtle` → `bg-primary-subtle`).
- `neutralOnly` 의 역할은 neutral 에만 있다. 다른 계열은 `bg-X-subtler`, `bg-X-subtle`, `bg-X`, `text-on-X-subtler`, `text-on-X-subtle`, `text-on-X`, `text-X`, `border-X` 여덟 개다.
- `bg` 틀마다 같은 세기의 `text-on` 틀이 있다. 그래서 `bg-X[-세기]` 위 글자는 언제나 `text-on-X[-세기]` 다.
- 역할 변수는 `--ids-color-{역할}` 이다. 앞머리 없는 역할(`surface`)이나 hover, active 역할은 없다.
- 세기는 `subtlest` < `subtler` < `subtle` < (없음) < `bold` 다.
- Tailwind 이름공간은 `namespaces` 에 적힌 것만 만든다. `--background-color-primary-subtle` 은 있고 `--color-primary` 나 `--background-color-on-primary` 는 없다.
- `[data-mode]` 블록은 역할마다 `--ids-theme-{mode}-{역할}` 을 읽는다. 브랜드와 상태 계열은 fallback 이 없다(IdsProvider 가 모두 쓴다). neutral 은 없으면 `neutral.*.json` 의 단계를 읽는다.
- `scheme-{계열}` utility 는 모든 계열에 있는 여덟 역할을 `--ids-color-*-scheme[-세기]` 로 다시 가리킨다(`bg-scheme-subtle` → `bg-primary-subtle`). 이름공간도 같은 규칙으로 만든다(`bg-scheme`, `text-on-scheme`, `inset-ring-scheme`).
  - `scheme.neutral` 은 neutral 이 다른 역할을 가리키는 자리다. `bg-scheme` 은 `bg-neutral-bold`, `text-on-scheme` 은 `text-on-neutral-bold`, `text-scheme` 은 `text-neutral-bold` 다.
  - scheme 은 층 색도 정한다. `--ids-state-layer-scheme` 은 계열 채움(`bg-X`)에 tint 불투명도, neutral 은 `currentColor` 에 기본 불투명도다. `state-scheme` 이 그것을 `--ids-state-color`, `--ids-state-layer-*` 에 넣는다.
  - `focus-ring-scheme` 은 `focus-ring` 과 같은 trigger 로 ring 을 `border-scheme` 으로 칠한다. `focus-ring-current` 는 글자색으로 칠한다(채움 위의 닫기 버튼).
- Dart 포매터도 이 표를 읽는다. `--ids-color-bg-primary-subtle` 은 `IdsColors.bgPrimarySubtle` 이 되고, `colors['bg-primary-subtle']` 로도 읽는다.
- `ids_palette_model.dart` 는 아래 팔레트 모델의 계수를 옮긴 것이라, 계수가 바뀌면 함께 바뀐다.

## 컴포넌트 토큰

- `component.json` 의 토큰은 `$value` 에 `light`, `dark` 두 역할을 갖는다. 그림자 토큰은 `{shadow.N}` 단계를 가리킨다.
- 이름은 `{속성}-{그룹}[-{부분}][-{변형}]` 이다. 속성 `bg` 는 배경, `text` 는 글자와 `fill`, `border` 는 선과 `ring`·`outline`·`stroke` 이름공간에 붙는다(`bg-panel`, `inset-ring-control-outline`, `fill-qr-code-light`).
- CSS 는 `[data-mode]` 마다 `--ids-color-{토큰}: var(--ids-color-{역할})`, `--ids-shadow-{토큰}: var(--ids-shadow-{단계})` 를 쓴다. 단계 `0` 은 `0 0 #0000` 이라 Tailwind 의 그림자 목록 안에서도 합쳐진다.
- 이름 규칙과 대비는 `packages/react/tests/component-tokens.test.ts` 가, Flutter 와 같은 색인지는 `tests/fixtures/theme-roles.json` 의 `components` 가 확인한다.

## state layer

`tokens/state.json` 이 hover 와 press 의 불투명도, 채움 층의 색을 정한다.

| 토큰 | 값 | CSS | React | Dart |
|---|---|---|---|---|
| `state.hover` | 6% | `--ids-state-hover` | `IDS_STATE_OPACITY.hover` (0.06) | `IdsStateOpacity.hover` |
| `state.press` | 10% | `--ids-state-press` | `IDS_STATE_OPACITY.press` (0.1) | `IdsStateOpacity.press` |
| `state.tint.hover` | 8% | `--ids-state-tint-hover` | `IDS_STATE_OPACITY.tintHover` | `IdsStateOpacity.tintHover` |
| `state.tint.press` | 12% | `--ids-state-tint-press` | `IDS_STATE_OPACITY.tintPress` | `IdsStateOpacity.tintPress` |
| `state.fill.color` | `#000000` | `--ids-state-fill-color` | `IDS_STATE_FILL_COLOR` | `IdsStateLayer.fillColor` |
| `state.fill.hover` | 10% | `--ids-state-fill-hover` | `IDS_STATE_OPACITY.fillHover` | `IdsStateOpacity.fillHover` |
| `state.fill.press` | 18% | `--ids-state-fill-press` | `IDS_STATE_OPACITY.fillPress` | `IdsStateOpacity.fillPress` |

- `ids.css` 의 `state-layer` 는 `--ids-state-color`(없으면 `currentColor`)를 `--ids-state-opacity` 만큼 `background-image` 로 덮는다.
- `state-hover`, `state-press` 는 `--ids-state-layer-hover`, `--ids-state-layer-press` 를 먼저 읽고, 없으면 `--ids-state-hover`, `--ids-state-press` 를 쓴다. `state-fill` 은 층 색과 그 둘을 채움 값으로 둔다.
- tint 는 `state-scheme` 으로 쓴다. `scheme-{계열}` 이 층 색(`bg-X`)과 tint 불투명도를 `--ids-state-layer-scheme[-hover|-press]` 에 둔다.
- `@property --ids-state-opacity`(`<percentage>`, 0%, 상속 안 함)라서 transition 으로 바뀐다. `--ids-state-color`, `--ids-state-layer-hover`, `--ids-state-layer-press` 도 상속하지 않는다. 그래서 채움 버튼 안의 요소가 바깥 층을 물려받지 않는다.
- IdsProvider(`theme-roles.ts`)와 Flutter(`theme_roles.dart`)는 같은 값으로 층 아래의 글자 대비를 잰다. 값을 바꾸면 parity fixture 를 다시 쓴다.

## 팔레트 모델

`palette-model.json` 이 IdsProvider 와 `IdsPalette.fromSeed` 가 색 하나로 11단계를 만들 때 읽는 모델의 계수다. `palette-model.js` 는 Style Dictionary 다음에 돌며, 이 계수와 `palette.json` 의 상태 색 넷을 `react/src/tokens/palette-model.ts` 와 `flutter/lib/tokens/ids_palette_model.dart` 로 옮긴다.

- 단계마다 500 의 hue 를 받는 푸리에 급수 셋이다: 밝기, sRGB 최대 채도에 대한 채도 비율, 500 에서의 hue 회전. 한 줄이 한 단계이고, 값은 `[a0, a1, b1, a2, b2, …]` 순서다.
- 계수는 데모 팔레트 17색에 맞춰 구한 뒤 고정했다. 17색과 맞추던 코드는 지웠다. 다시 맞추려면 `f3b8fc4b` 커밋의 `palette-model.js` 와 17색이 있던 `tokens/palette.json` 을 꺼낸다.
- 모델의 동작은 [IdsProvider README](../react/src/components/utility/ids-provider/README.md#색-하나로-팔레트-만들기) 에 적는다.

## codegen 실행

```bash
# 루트에서
pnpm codegen

# 또는 이 패키지 직접
pnpm build
```

생성된 파일은 직접 편집하지 않는다. `pnpm codegen` 실행 시 덮어쓴다.

## Flutter 글꼴

`fonts.build.mjs` 는 Style Dictionary 와 문구 생성 다음에 돌며, core 의 devDependency 에서 글꼴을 복사한다.

| npm 패키지 | 원본 | `packages/flutter/fonts/` |
|---|---|---|
| `pretendard-gov` | `dist/public/variable/PretendardGOVVariable.ttf`, `dist/LICENSE.txt` | `PretendardGOVVariable.ttf`, `PretendardGOV-LICENSE.txt` |
| `geist` (Vercel) | `dist/fonts/geist-mono/GeistMono-Variable.ttf`, `LICENSE.txt` | `GeistMonoVariable.ttf`, `GeistMono-LICENSE.txt` |

- 웹은 같은 글꼴을 `pretendard-gov` 와 `@fontsource-variable/geist-mono`(woff2)로 싣는다. Flutter 는 TTF 가 필요해서 Geist Mono 는 Vercel 의 `geist` 에서 가져온다.
- 글꼴을 올리려면 `packages/core/package.json` 의 버전을 바꾸고 `pnpm codegen` 을 돌린다. ids-css 의 `pretendard-gov` 와 같은 버전으로 맞춘다.

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
