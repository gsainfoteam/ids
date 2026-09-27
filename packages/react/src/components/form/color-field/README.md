# ColorField

색을 보여 주는 트리거와, 누르면 열리는 `ColorPicker` 팝업으로 된 필드입니다.

- **팝업은 ColorPicker.** 채도와 밝기 영역, 색조와 투명도 슬라이더, 값 입력, 스포이트, 복사, 팔레트를 그대로 씁니다. `ColorField.Content` 에 ColorPicker part 를 골라 넣으면 팔레트만 두는 식으로 줄일 수 있습니다.
- **키보드.** 트리거에서 `↓` 나 `Enter` 로 열면 포커스가 첫 컨트롤로 갑니다. `Esc` 는 닫고 트리거로 돌아옵니다.
- **스크린 리더.** 트리거는 `브랜드 색상 #3B82F6` 처럼 이름과 값을 함께 읽힙니다. 읽을 수 없는 값은 그대로 보이고 `aria-invalid` 가 됩니다.
- **폼.** `name` 으로 형식에 맞춘 값 하나가 제출되고, `required` 는 브라우저 검증이 막습니다. `<button type="reset">` 은 `defaultValue` 로 되돌립니다.
- **팝업.** 아래 공간이 모자라면 위로 열리고, 트리거가 보이는 동안은 화면 밖으로 나가지 않습니다. 좁은 화면에서는 모달 하단 시트로 열 수 있습니다.

```tsx
import { ColorField, Field } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>브랜드 색상</Field.Label>
  <ColorField name="brand" defaultValue="#3B82F6" swatches={['#EF4444', '#22C55E', '#3B82F6']} />
</Field>;
```

## 값과 형식

```tsx
<ColorField defaultValue="#3B82F6" />                  // 비제어
<ColorField value={color} onValueChange={setColor} />  // 제어. 빈 문자열은 선택 없음

<ColorField format="hex" />          // "#3B82F6"
<ColorField format="hex" alpha />    // "#3B82F6CC", 팝업에 투명도 슬라이더가 생긴다
<ColorField format="rgb" />          // "rgb(59, 130, 246)"
<ColorField format="hsl" alpha />    // "hsla(217.22, 91.22%, 59.8%, 0.8)"
<ColorField format="oklch" />        // "oklch(0.6231 0.188 259.81)"
```

- 트리거와 제출 값은 `format` 에 맞춰 다시 적은 값입니다. `#3b82f6` 이나 `red` 를 받아도 `#3B82F6`, `#FF0000` 으로 보이고 그렇게 제출됩니다.
- 팝업에서 조작하면 바로 `onValueChange` 가 불립니다. 닫아도 되돌리지 않습니다.
- 바깥에서 `value` 를 바꿔도 `onValueChange` 는 불리지 않습니다. 부모가 가진 원래 문자열은 부모가 고칩니다.
- 읽는 형식과 반올림은 [ColorPicker](../../data/color-picker/README.md) 와 같습니다.

## 키보드

| 키              | 트리거           | 팝업                                                        |
| --------------- | ---------------- | ----------------------------------------------------------- |
| `↓`             | 열고 첫 컨트롤로 | ColorPicker 의 키 그대로                                    |
| `Enter` `Space` | 열거나 닫는다    |                                                             |
| `Esc`           |                  | 닫고 트리거로 포커스. 값 입력에 초안이 있으면 초안만 버린다 |
| `Tab`           |                  | 팝업 안에서 다음 컨트롤로. 팝업 밖으로 나가면 닫힌다        |

- 첫 컨트롤은 채도와 밝기 영역입니다. 팔레트만 두면 고른 색에, 색이 없으면 첫 색에 포커스가 갑니다.
- 하단 시트에서는 `Tab` 이 시트 안에서만 돕니다.

## 구성

```tsx
<ColorField defaultValue="#22C55E" swatches={palette}>
  {/* Trigger 를 생략하면 Swatch + Value */}
  <ColorField.Trigger>
    <ColorField.Swatch />   {/* 비어 있으면 사선, 반투명이면 체크무늬 위 */}
    <ColorField.Value />    {/* 비어 있으면 placeholder */}
  </ColorField.Trigger>
  <ColorField.Clear />      {/* Trigger 의 형제. 값이 있을 때만 보인다 */}
  {/* Content 를 생략하면 ColorPicker 기본 구성 */}
  <ColorField.Content>
    <ColorPicker.Swatches />
  </ColorField.Content>
</ColorField>

<ColorField defaultValue="#F97316">
  <ColorField.Content>      {/* 색조와 입력만 */}
    <ColorPicker.HueSlider />
    <ColorPicker.Input />
  </ColorField.Content>
</ColorField>
```

- `Content` 는 필드 값에 묶인 `ColorPicker` 입니다. 자식은 ColorPicker part 이고, `format`, `alpha`, `swatches`, `size`, `disabled`, `readOnly` 는 필드에서 받습니다.
- 지운 뒤에는 트리거로 포커스가 갑니다. `readOnly` 면 지우기 버튼이 보이지 않습니다.
- `Clear` 는 필드 안 버튼 크기(28px, tiny 24px)의 `IconButton variant="ghost"` 입니다. 자식은 아이콘이고, `asChild` 면 자식 요소가 그 버튼이 됩니다. 트리거로는 지울 수 없어서 `Tab` 순서에 남습니다.
- `Trigger`, `Clear`, `Content` 는 각각 하나까지입니다. `Clear` 를 `Trigger` 안에 넣으면 오류입니다.
- 모든 part 가 `asChild` 를 받습니다. 자식은 props 와 ref 를 해당 element 에 전달해야 합니다.

## 상태와 data 속성

| 요소   | 속성                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 루트   | `data-open`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-empty`, `data-size`, `data-variant` |
| 트리거 | `aria-expanded`, `data-placeholder`, `data-readonly`                                                                      |
| Swatch | `data-empty`                                                                                                              |
| 팝업   | `role="dialog"`, `data-presentation` (`popover` / `drawer`), `data-side` (`top` / `bottom`)                               |

- 루트와 Trigger 의 `className` 은 `ColorField.State` 를 받는 함수도 됩니다.

## 열림 상태

```tsx
<ColorField open={open} onOpenChange={setOpen} />   // 제어
<ColorField defaultOpen />                          // 처음부터 열림
<ColorField mobileVariant="drawer" />               // 640px 미만에서 하단 시트
```

- `Esc`, 바깥 클릭, 포커스가 나갈 때도 `onOpenChange(false)` 가 불립니다.
- `disabled` 나 `readOnly` 면 `open` 이어도 열리지 않습니다.
- 하단 시트는 모달입니다. 제목과 닫기 버튼이 붙고, 배경이 어두워지며 페이지 스크롤이 잠깁니다. 닫기 버튼이나 배경을 누르면 닫히고 트리거로 포커스가 돌아갑니다.

## 폼

```tsx
<form onSubmit={submit}>
  <ColorField name="color" required /> {/* FormData: color=#22C55E */}
  <button type="reset">초기화</button> {/* defaultValue 로 */}
</form>
```

- `required` 인데 비어 있으면 브라우저가 제출을 막고, 검증 메시지를 필드에 붙인 뒤 트리거로 포커스를 보냅니다.
- 비어 있으면 아무것도 제출되지 않습니다. `disabled` 면 제출되지 않고, `readOnly` 면 제출되지만 검증하지 않습니다.
- 초기화는 값을 `defaultValue` 로 되돌리고 팝업을 닫습니다.

## react-hook-form, TanStack Form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const methods = useForm({ defaultValues: { color: '' } });

<Field name="color" controlMode="value" registerOptions={{ required: '색을 고르세요' }}>
  <Field.Label>포인트 색</Field.Label>
  <ColorField />
  <Field.Error />   {/* 오류가 나면 트리거로 포커스 */}
</Field>

<form.Field name="color">
  {(field) => <ColorField value={field.state.value} onValueChange={field.handleChange} />}
</form.Field>
```

## 크기와 variant

```tsx
<ColorField variant="soft" />   // outline(기본) / soft / ghost
<ColorField size="tiny" />      // standard(36px) / tiny(32px). 생략하면 Field 를 따른다
<ColorField invalid />          // 테두리와 포커스 링이 danger 색
```

## 속성

| 속성                     | 기본 / 동작                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| `value` / `defaultValue` | `string` / `''`                                                     |
| `onValueChange`          | 팝업에서 바꾸거나 지울 때                                           |
| `format`                 | `hex`(기본) / `rgb` / `hsl` / `oklch`                               |
| `alpha`                  | 투명도를 포함하고 슬라이더를 그린다                                 |
| `swatches`               | 팝업의 팔레트                                                       |
| `open` / `defaultOpen`   | 열림 상태                                                           |
| `onOpenChange`           | 열리고 닫힐 때                                                      |
| `placeholder`            | `색상 선택`                                                         |
| `variant`                | `outline`(기본) / `soft` / `ghost`                                  |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기                          |
| `mobileVariant`          | `popover`(기본) / `drawer`: 640px 미만에서 모달 하단 시트           |
| `invalid`                | `aria-invalid` 와 danger 색. 명시한 `aria-invalid` 가 우선          |
| `disabled` / `readOnly`  | 열기, 변경, 지우기를 막는다                                         |
| `name` / `form`          | 형식에 맞춘 값 하나를 hidden input 으로                             |
| `required`               | 브라우저 검증                                                       |
| `className` / `style`    | 루트. `className` 은 상태를 받는 함수도 된다                        |
| `ref`, 그 외 native 속성 | 트리거 button (`id`, `aria-*`, `autoFocus`, `onFocus`, `onBlur` 등) |

## 알아둘 것

- 이름은 `Field.Label` 이나 `aria-label` 로 줍니다. 팝업도 같은 이름으로 읽히고, 이름이 없으면 `색상 선택` 입니다.
- `Field` 안에서는 값이 바뀌거나 팝업이 열리고 닫힐 때마다 `Field` 가 `data-filled` 와 `data-dirty` 를 다시 읽습니다.
- `onBlur` 는 포커스가 트리거와 팝업을 모두 벗어날 때만 불립니다.
- 팝업 위치와 폭은 지우기 버튼을 포함한 필드 전체를 기준으로 잡습니다.
