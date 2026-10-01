# Palette

`packages/core/tokens/palette.json` 의 원시 색입니다. 시맨틱 색 토큰이 이 값을 가리킵니다.

- **직접 쓰지 않습니다.** CSS 변수로 나가지 않고, 컴포넌트와 앱은 [Color](../color/README.md) 의 `--ids-color-*` 를 씁니다.
- **neutral 과 17색.** 각 색은 50–950 의 11단계이고, neutral 만 흰색 `0` 이 더 있습니다.
- **Tailwind CSS v4 기본값.** OKLCH 값을 sRGB hex 로 옮긴 값입니다. `orange` 와 `green` 은 IDS 고유 값입니다.

```json
{
  "blue": {
    "600": { "$value": "#155dfc", "$type": "color" }
  }
}
```

```jsonc
// semantic/blue.light.json
{ "color": { "primary": { "$value": "{blue.600}", "$type": "color" } } }
```

## 색 추가

1. `palette.json` 에 50–950 을 넣습니다.
2. `semantic/<색>.light.json` 과 `semantic/<색>.dark.json` 을 만듭니다.
3. `enums.json` 의 `ids.color` 에 이름을 넣고 `pnpm codegen` 을 돌립니다.

- `tests/tokens-contrast.test.ts` 가 새 색의 대비를 검사합니다.
- Storybook `Foundations/Palette` 는 JSON 을 읽어 그리므로 따로 고칠 곳이 없습니다.
