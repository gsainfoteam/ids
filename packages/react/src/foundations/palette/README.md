# Palette

`packages/core/tokens/palette.json` 의 원시 색입니다. IDS 가 직접 가진 팔레트는 neutral 과 상태 색의 기준 넷(green, yellow, red, sky)뿐입니다. 브랜드 팔레트는 앱이 주거나, 색 하나에서 팔레트 모델로 만듭니다([색 하나로 팔레트 만들기](../../components/utility/ids-provider/README.md#색-하나로-팔레트-만들기)).

- **직접 쓰지 않습니다.** CSS 변수로 나가지 않고, 컴포넌트와 앱은 [Color](../color/README.md) 의 `--ids-color-*` 를 씁니다.
- **neutral.** 50–950 의 11단계와 흰색 `0` 입니다. 중립 토큰이 가리킵니다.
- **상태 색 넷.** 각 색은 50–950 의 11단계입니다. `status: 'fixed'` 가 그대로 쓰고, `'harmonized'` 는 hue 만 돌립니다. red, yellow, sky 는 Tailwind CSS v4 기본값이고 green 은 IDS 고유 값입니다.
- **스토리와 테스트의 팔레트.** `.storybook/palettes.ts` 가 시드 hex 17개를 `createIdsPalette` 로 펼칩니다. Storybook 의 Palette 툴바와 테스트가 씁니다.
- **Model 스토리.** 모델이 hue 한 바퀴에서 내는 팔레트와, 500 이 아닌 단계에 놓이는 시드를 보여 줍니다.

```ts
// .storybook/palettes.ts 가 시드 hex 로 팔레트를 만든다
import { palettes } from '~story-kit';

<IdsProvider.Scope theme={{ primary: palettes.blue }}>…</IdsProvider.Scope>;
```

## 알아둘 것

- 앱 색은 앱이 `defineIdsTheme({ palette })` 로 줍니다. IDS 에 색을 더하지 않습니다.
- `semantic/<색>.light.json` 과 `.dark.json` 은 Flutter 의 Dart 토큰 생성에만 남아 있습니다. 지운 색을 가리키던 값은 hex 로 적혀 있습니다. Flutter 가 런타임 팔레트로 옮기면 지웁니다.
- Storybook `Foundations/Palette` 의 Scales 는 JSON 을 읽어 그리므로 따로 고칠 곳이 없습니다.
