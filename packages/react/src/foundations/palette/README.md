# Palette

`packages/core/tokens/palette.json` 의 원시 색입니다. 패키지에는 neutral 과 상태 색의 기준 넷(green, yellow, red, sky)만 값 그대로 나갑니다. 17색은 레포 안에서만 쓰고, 패키지에는 17색에 맞춘 팔레트 모델의 계수가 대신 들어갑니다([색 하나로 팔레트 만들기](../../components/utility/ids-provider/README.md#색-하나로-팔레트-만들기)).

- **직접 쓰지 않습니다.** CSS 변수로 나가지 않고, 컴포넌트와 앱은 [Color](../color/README.md) 의 `--ids-color-*` 를 씁니다.
- **neutral.** 50–950 의 11단계와 흰색 `0` 입니다. 중립 토큰이 가리킵니다.
- **데모 팔레트 17색.** 각 색은 50–950 의 11단계입니다. Storybook 의 Palette 툴바, 테스트, 역할 규칙의 회귀 테스트, 팔레트 모델의 codegen 이 씁니다.
- **Tailwind CSS v4 기본값.** OKLCH 값을 sRGB hex 로 옮긴 값입니다. `orange` 와 `green` 은 IDS 고유 값입니다.

```json
{
  "blue": {
    "600": { "$value": "#155dfc", "$type": "color" }
  }
}
```

```ts
// .storybook/palettes.ts 가 앱 팔레트 모양으로 바꾼다
import { palettes } from '~story-kit';

<IdsProvider.Scope theme={{ primary: palettes.blue }}>…</IdsProvider.Scope>;
```

## 알아둘 것

- 앱 색은 앱이 `defineIdsTheme({ palette })` 로 줍니다. IDS 에 색을 더하지 않습니다.
- `semantic/<색>.light.json` 과 `.dark.json` 은 Flutter 의 Dart 토큰 생성에만 남아 있습니다. Flutter 가 런타임 팔레트로 옮기면 지웁니다.
- `tests/theme-roles.test.ts` 가 17색에서 역할 규칙이 그 파일들과 같은 값을 내는지 검사합니다.
- Storybook `Foundations/Palette` 는 JSON 을 읽어 그리므로 따로 고칠 곳이 없습니다.
