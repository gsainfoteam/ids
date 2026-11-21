# ComponentTokens

컴포넌트 토큰은 모드마다 시맨틱 역할 하나를 가리키는 이름입니다. 라이트와 다크에서 다른 역할을 써야 하는 면은 `dark:` 클래스 대신 이 토큰으로 그립니다.

```tsx
<div className="bg-surface shadow-surface inset-ring-1 inset-ring-neutral">카드</div>
<button className="bg-control-outline inset-ring-1 inset-ring-control-outline">취소</button>
<input className="bg-field-outline inset-ring-1 inset-ring-field-outline" />
```

- 이름은 `{속성}-{그룹}[-{부분}][-{변형}]` 입니다. 속성은 `bg`, `text`, `border`, `shadow` 입니다.
- 그룹 이름은 계열(`primary`, `neutral` …), `scheme`, 쓰임새(`base`, `surface`, `block`, `soft`, `solid`), 세기(`strong`)와 겹치지 않습니다.
- `fill`, `tint`, `strong`, `accent`, `on`, `line`, `quiet`, `glyph`, `foreground`, `background` 는 이름에 쓰지 않습니다. `soft` 는 변형 자리에만 옵니다.
- 원본은 `packages/core/tokens/component.json` 과 `shadow.json` 이고, `pnpm codegen` 이 `ids.css`, `src/tokens/component-tokens.ts`, Flutter 의 `IdsComponentColors`, `IdsComponentShadows` 를 씁니다.
- CSS 변수는 `--ids-color-{토큰}`, `--ids-shadow-{토큰}` 이고, Tailwind 유틸리티는 속성의 namespace 에 붙습니다(`inset-ring-control-outline`, `fill-qr-code`, `shadow-surface`).
- 카드와 팝업의 면(`bg-surface`), 면 안의 구역(`bg-block`)은 컴포넌트 토큰이 아니라 시맨틱 역할입니다. 두 모드가 같은 단계를 읽어서 토큰이 필요 없습니다. [Color](../color/README.md#역할) 를 봅니다.

## 토큰

| 토큰 | light | dark | 쓰는 곳 |
| --- | --- | --- | --- |
| `shadow-surface` | `shadow-1` | `shadow-0` (없음) | outline Card |
| `bg-control-outline`, `border-control-outline` | `bg-base`, `border-neutral` | `bg-block`, `border-neutral-strong` | outline 버튼, Checkbox, Radio, pill Tabs |
| `bg-field-outline`, `border-field-outline` | `bg-base`, `border-neutral` | `bg-block`, `border-neutral-strong` | outline 입력 상자 |
| `border-field-bar` | `border-neutral` | `border-neutral-strong` | TextArea, Editor 막대의 구분선 |
| `bg-field-code-outline` | `bg-neutral-soft` | `bg-surface` | outline Editor 의 코드와 코드 블록 |
| `bg-switch-thumb` | `bg-base` | `bg-neutral-solid` | 꺼진 Switch 의 thumb |
| `bg-segment` | `bg-base` | `border-neutral-strong` | SegmentedControl 과 segmented Tabs 에서 `bg-neutral-soft` 트랙 위의 고른 칸 |
| `bg-qr-code`, `text-qr-code` | `bg-base`, `text-neutral-strong` | `bg-neutral-solid`, `text-on-neutral-solid` | QRCode `inverted={false}`: 밝은 바탕, 어두운 모듈 |
| `bg-qr-code-inverse`, `text-qr-code-inverse` | `bg-neutral-solid`, `text-on-neutral-solid` | `bg-base`, `text-neutral-strong` | QRCode `inverted`: 어두운 바탕, 밝은 모듈 |

- 다크의 outline 컨트롤과 필드는 `bg-block` 바탕에 `border-neutral-strong` 테두리입니다. 진한 테두리라 `bg-block` 구역 위에서도 구별됩니다.

## 놓인 면의 색

- Badge cutout, ColorPicker 선택 ring 의 offset, Bubble 반응 ring, enclosed Tabs 의 선택 탭, ghost Table 머리글, Chart 점과 조각 테두리, Sidebar 끌어 놓기 표시는 놓인 면의 색을 흉내 냅니다.
- 이 부분은 `--ids-bg-current` 를 읽습니다(`ring-(--ids-bg-current)`).
- `ids.css` 가 값을 정합니다.
  - 가장 바깥 provider 와 `bg-base` 를 칠한 `[data-mode]` 요소(자기 페이지를 칠하는 Scope): `bg-base`
  - `bg-surface`, `bg-block` 클래스가 붙은 요소: 그 역할
- 그래서 다크 모드의 Card 나 팝업 안에서도 바탕과 같은 색이 됩니다.

## 그림자

`shadow.json` 은 단계 세 개(`0`, `1`, `2`)만 둡니다. `sm`, `md` 같은 이름은 없고, 컴포넌트는 `shadow-surface` 같은 토큰으로 단계를 고릅니다. `0` 은 `0 0 #0000` 이라 Tailwind 의 그림자 목록 안에서도 그대로 합쳐집니다.

## 테스트

- `tests/component-tokens.test.ts` 가 이름 규칙, 다크 모드에서 `bg-surface` 과 페이지의 차이, `bg-surface` 과 `bg-block` 위 outline 컨트롤의 구분, 토큰 바탕 위 글자의 APCA 대비를 17개 팔레트에서 확인합니다.
- `tests/current-background.test.tsx` 가 페이지, Card, 모드를 바꾼 Scope 위의 ghost Table 머리글이 그 면과 같은 색인지 확인합니다.
- `tests/color-rules.test.ts` 가 컴포넌트 코드에 `dark:`, 역할을 가리키는 자체 변수, `color-mix`, IDS 색의 opacity modifier(의도한 반투명 층 제외), `ids.css` 에 없는 `--ids-*` 변수가 없는지 확인합니다.
