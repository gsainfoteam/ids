# ColorPicker

채도와 밝기 영역, 색조와 투명도 슬라이더, 값 입력, 팔레트로 색을 고르는 패널입니다. 팝업 필드가 필요하면 `ColorField` 를 씁니다. `ColorField` 도 안에서 이 패널을 씁니다.

- **키보드와 스크린 리더.** 영역은 채도와 밝기 두 슬라이더로 읽히고, 방향키로 두 축을 모두 움직입니다. 색조와 투명도는 IDS `Slider` 라서 키보드, 포인터, 읽히는 값이 [Slider](../../form/slider/README.md) 와 같습니다.
- **검정과 회색을 지나도 색이 남는다.** 밝기를 0 까지 내렸다 올리면 원래 색조로 돌아옵니다.
- **입력은 초안.** 값을 치는 동안은 영역이 따라 움직이지 않고, `Enter` 나 포커스를 옮길 때 반영합니다. `#` 없이 쳐도 읽습니다.
- **스포이트.** EyeDropper API 가 있는 브라우저에서는 화면의 색을 바로 집습니다.
- **복사.** 지금 값을 클립보드에 넣고 스크린 리더에 알립니다.
- **팔레트.** native 라디오의 `RadioGroup` 이라 `Tab` 한 번으로 들어가고, 방향키로 옆 색을, `Home` `End` 로 처음과 끝 색을 고릅니다.

```tsx
import { ColorPicker } from '@gsainfoteam/ids-react';

<ColorPicker defaultValue="#3B82F6" />;
```

## 크기

- **fill.** ColorPicker 는 부모의 폭을 채우고(`w-full min-w-0`), 높이는 그리는 part 만큼입니다. 폭은 ColorPicker 를 감싼 요소가 정합니다.

```tsx
<div className="w-72">
  <ColorPicker defaultValue="#3B82F6" />
</div>
```

- 영역의 높이는 `size` 로 정합니다(`standard` 160px, `tiny` 128px). 팔레트는 폭이 모자라면 다음 줄로 넘어갑니다.

## 값과 형식

```tsx
<ColorPicker value={color} onValueChange={setColor} />   // 제어. 빈 문자열은 선택 없음
<ColorPicker format="hex" />          // "#3B82F6"
<ColorPicker format="hsl" />          // "hsl(217.22, 91.22%, 59.8%)"
<ColorPicker format="oklch" />        // "oklch(0.6231 0.188 259.81)"

<ColorPicker format="hex">            // "#3B82F6CC". AlphaSlider 가 있으면 투명도가 들어간다
  <ColorPicker.Area />
  <ColorPicker.HueSlider />
  <ColorPicker.AlphaSlider />
  <ColorPicker.Input />
</ColorPicker>
```

- 투명도는 `ColorPicker.AlphaSlider` 가 자식에 있을 때만 켜집니다. 없으면 값은 늘 불투명이고, `rgb` 는 `rgba(59, 130, 246, 0.8)` 대신 `rgb(59, 130, 246)` 로 적습니다.
- 루트는 JSX 에 적힌 자식을 보고 `AlphaSlider` 를 찾습니다. 직접 만든 컴포넌트 안에 넣으면 찾지 못하고, 그 슬라이더는 그리지 않으며 개발 빌드에서 경고합니다.

- 색을 읽고 쓰는 일은 [culori](https://culori.js.org) 가 합니다. HEX 3/4/6/8자리, `rgb()`, `hsl()`, `oklch()`, `color(srgb …)`, 이름 색(`red`) 을 읽고, `var()` 와 `currentColor` 는 읽지 않습니다.
- 영역과 슬라이더는 sRGB 라서, sRGB 밖의 색은 가장 가까운 sRGB 색으로 잘립니다.
- `rgb` 채널은 정수, `hsl` 과 투명도는 소수 둘째 자리, `oklch` 의 L 과 C 는 넷째 자리로 적기 때문에 형식을 오가면 반올림이 생깁니다.
- 영역을 끌면 움직이는 동안 `onValueChange` 가 계속 불립니다.

## 키보드

| 키                  | 영역           | 색조 / 투명도 슬라이더 |
| ------------------- | -------------- | ---------------------- |
| `←` `→`             | 채도 1%        | 1도 / 1%               |
| `↑` `↓`             | 밝기 1%        | 1도 / 1%               |
| `Shift` + 방향키    | 10%            | 10도 / 10%             |
| `PageUp` `PageDown` | 밝기 10%       | 10도 / 10%             |
| `Home` `End`        | 채도 0% / 100% | 처음 / 끝              |

- 영역을 누르면 그 자리로 옮기고 포커스를 줍니다. 누른 채 끌면 포인터를 붙잡아 영역 밖으로 나가도 따라갑니다.
- 영역은 `Tab` 한 번에 들어갑니다. 스크린 리더는 채도와 밝기를 따로 읽고, 두 슬라이더 모두 `채도 60%, 밝기 80%` 처럼 두 값을 함께 알려 줍니다.
- 슬라이더는 페이지 방향과 상관없이 왼쪽이 작은 값입니다.
- 팔레트는 라디오 그룹의 키를 따릅니다. 방향키는 옆 색을 고르고 끝에서 반대편으로 돌며, `Home` `End` 는 처음과 끝 색을 고릅니다. `readOnly` 면 포커스만 옮겨집니다.

## 값 입력

- 입력은 초안입니다. `Enter` 나 포커스를 옮길 때 반영하고, 그때 형식에 맞춰 다시 적습니다.
- 읽을 수 없는 값은 `aria-invalid` 가 되고, `Enter` 는 고칠 수 있게 그대로 두며, 포커스를 옮기면 되돌립니다.
- 초안이 있을 때 `Esc` 는 초안만 버립니다. 초안이 없을 때의 `Esc` 는 둘러싼 팝업을 닫는 데 씁니다.
- 입력을 비우고 확정하면 값이 빈 문자열이 됩니다.

## 구성

```tsx
<ColorPicker defaultValue="#22C55E">
  <ColorPicker.Area />         {/* 채도와 밝기 */}
  <ColorPicker.EyeDropper />   {/* EyeDropper API 가 없으면 그리지 않는다 */}
  <ColorPicker.HueSlider />
  <ColorPicker.AlphaSlider />  {/* 있으면 값에 투명도가 들어간다 */}
  <ColorPicker.Input />
  <ColorPicker.Copy />         {/* Clipboard API 가 없으면 그리지 않는다 */}
  <ColorPicker.Swatches>       {/* 팔레트. 색마다 Swatch 하나 */}
    {palette.map((color) => (
      <ColorPicker.Swatch key={color} value={color} />
    ))}
  </ColorPicker.Swatches>
</ColorPicker>

<ColorPicker defaultValue="#22C55E">   {/* 색조와 입력만 */}
  <ColorPicker.HueSlider />
  <ColorPicker.Input />
</ColorPicker>

<ColorPicker.Swatches>
  <ColorPicker.Swatch value="#EF4444" label="빨강" />
  <ColorPicker.Swatch value="rgba(59, 130, 246, 0.5)" label="반투명 파랑" />
</ColorPicker.Swatches>

<ColorPicker.Copy aria-label="HEX 복사">   {/* 자식이 아이콘을 바꾼다 */}
  <DocumentDuplicateIcon />
</ColorPicker.Copy>
```

- 자식이 없으면 영역, 스포이트와 색조 슬라이더, 입력과 복사 순으로 그립니다. 투명도 슬라이더와 팔레트는 자식으로 둘 때만 그립니다.
- `HueSlider` 와 `AlphaSlider` 는 채운 구간 없이 그라데이션 트랙을 쓰는 `Slider` 입니다. 받은 속성은 Slider 루트로 가고, `aria-label` 은 thumb의 이름이 됩니다.
- `EyeDropper` 와 `Copy` 는 `IconButton variant="outline"` 입니다. 자식을 주면 기본 아이콘 대신 그 아이콘을 씁니다.
- `Input` 은 고정폭 글꼴의 `TextField` 입니다. `className` 과 `style` 은 테두리 상자로, 그 밖의 속성은 input으로 갑니다.
- `Swatches` 는 `RadioGroup`, `Swatch` 는 색 네모로 그린 `Radio` 입니다. 고른 색은 둘레의 고리로 보이고, `Swatch` 의 `ref` 와 속성은 라디오 input으로 갑니다.
- 팔레트의 라디오는 어느 폼에도 속하지 않습니다. 피커를 폼 안에 두어도 제출되거나 검증되지 않습니다.
- `Swatch` 의 `value` 는 색 문자열, `label` 은 스크린 리더와 툴팁의 이름입니다. 읽을 수 없는 색은 그리지 않고, 이름이 없으면 값이 이름이 됩니다. `Swatch` 가 하나도 없는 `Swatches` 는 그리지 않습니다.
- 반투명 색은 체크무늬 위에 그려서 투명도가 보입니다. 체크무늬는 `bg-base` 와 `bg-neutral-soft` 색이라 다크 모드에서도 튀지 않습니다.

## 상태

- 값은 `value` / `defaultValue` / `onValueChange` 로 읽고 바꿉니다. 빈 값은 빈 문자열입니다.
- `disabled`, `readOnly` 는 앱이 넘긴 값 그대로입니다.
- 루트의 `className` 은 `ColorPicker.State`(`{ disabled, readOnly, empty, alpha }`)를 받는 함수도 됩니다. 새 디자인을 얹을 때만 씁니다.

## 속성

| 속성                     | 기본 / 동작                                       |
| ------------------------ | ------------------------------------------------- |
| `value` / `defaultValue` | `string` / `''`                                   |
| `onValueChange`          | 값이 바뀔 때. 끄는 동안에도                       |
| `format`                 | `hex`(기본) / `rgb` / `hsl` / `oklch`             |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기        |
| `disabled` / `readOnly`  | 모든 조작을 막는다. `readOnly` 는 포커스와 읽기만 |
| 투명도와 팔레트          | `AlphaSlider`, `Swatches` part 가 있을 때         |
| `aria-label`             | 기본 `색상 선택`                                  |
| 그 외 div 속성           | 루트                                              |

## 알아둘 것

- 값이 없을 때 영역은 채도와 밝기가 가득 찬 빨강을 보여 줍니다. 조작하기 전까지 값은 빈 문자열입니다.
- 스포이트로 집은 색은 지금의 투명도를 그대로 씁니다. `Esc` 로 취소하면 아무것도 바뀌지 않습니다.
