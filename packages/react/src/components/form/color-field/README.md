# ColorField

- 색상 미리보기와 값을 보여주고 팝업에서 색을 고르는 필드
- 값은 `hex` / `rgb` / `hsl` 색상 문자열. `alpha`로 투명도를 포함한다
- 패널은 `default` / `compact` / `swatchOnly`, `swatches`로 팔레트를 준다
- `Field`, react-hook-form(`controlMode="value"`)과 연결된다

```tsx
import { ColorField, Field } from '@gsainfoteam/ids-react';

const [color, setColor] = useState('');

<Field>
  <Field.Label>브랜드 색상</Field.Label>
  <ColorField value={color} onChange={setColor} swatches={['#3B82F6', '#22C55E', '#F97316']} />
</Field>;
```

## 형식

```tsx
<ColorField format="hex" />          // "#3B82F6"
<ColorField format="hex" alpha />    // "#3B82F6CC", 투명도 슬라이더 표시
<ColorField format="rgb" alpha />    // "rgba(59, 130, 246, 0.8)"
<ColorField format="hsl" />          // "hsl(217, 91%, 60%)"
// 빈 문자열 = 선택 없음
// 읽는 형식: HEX 3/4/6/8자리, rgb(a), hsl(a). named color, var(), calc(), color()는 읽지 않는다
// RGB 채널은 정수, alpha는 소수 셋째 자리로 직렬화하므로 형식을 바꾸면 반올림이 생긴다
```

## 패널

```tsx
<ColorField variant="default" />                       // 채도/명도 영역 + 색조 + 텍스트 입력
<ColorField variant="compact" />                       // 채도/명도 영역 없이
<ColorField variant="swatchOnly" swatches={palette} /> // swatches만
<ColorField surfaceVariant="soft" />                   // 필드 표면: outline(기본) / soft / ghost
// 팝업 편집은 바로 onChange를 부른다. Esc, 닫기 버튼, 바깥 클릭으로 닫고 바뀐 값은 되돌리지 않는다
// 텍스트 입력은 불완전한 값을 편집 중에 유지하고, 유효한 색일 때만 onChange. blur/Enter에서 형식을 정리한다
```

## 합성

```tsx
<ColorField value={color} onChange={setColor}>
  <ColorField.Trigger>                 {/* 생략하면 Swatch + Value로 자동 생성 */}
    <ColorField.Swatch />
    <ColorField.Value />
  </ColorField.Trigger>
  <ColorField.Clear />                 {/* Trigger의 형제로 둔다. 안에 넣으면 오류 */}
  <ColorField.Content>
    <MyPicker />                       {/* children을 주면 기본 패널을 대체 */}
  </ColorField.Content>
</ColorField>
// Clear는 값이 있을 때만 보이고, 값을 비운 뒤 트리거로 포커스를 돌린다
// 모든 part는 asChild를 받는다. 자식은 props와 ref를 해당 element에 전달해야 한다
```

## 키보드

```text
↓                 트리거에서 팝업 열기
← →               채도 (Shift: 10 단위)
↑ ↓               명도 (Shift: 10 단위)
Home  End         채도 0 / 100
색조, 투명도       native range 키보드 동작
```

## React Hook Form

```tsx
import { ColorField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const methods = useForm({ defaultValues: { color: '' } });

<FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(save)}>
    <Field name="color" controlMode="value" registerOptions={{ required: '색상을 고르세요' }}>
      <Field.Label>색상</Field.Label>
      <ColorField />
      <Field.Error />                  {/* 오류 시 트리거로 포커스 */}
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                     | 기본 / 동작                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `value` / `defaultValue` | `string` / `''`                                               |
| `format`                 | `hex`(기본) / `rgb` / `hsl`                                   |
| `alpha`                  | `false`. 투명도 포함 형식과 슬라이더                          |
| `swatches`               | 팔레트 색 목록. 읽을 수 없는 항목은 건너뛴다                  |
| `variant`                | 패널: `default`(기본) / `compact` / `swatchOnly`              |
| `surfaceVariant`         | 표면: `outline`(기본) / `soft` / `ghost`                 |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`           |
| `mobileVariant`          | `popover`(기본) / `drawer`: 640px 미만에서 하단 팝업          |
| `placeholder`            | `색상 선택`                                                   |
| `invalid`                | 오류 표시. 명시한 `aria-invalid`가 우선. 읽을 수 없는 값도 오류 |
| `disabled` / `readOnly`  | 열기, 변경, 지우기를 막는다                                   |
| `name` / `form`          | 정규화한 값 하나를 hidden input으로 제출. `disabled`면 제외   |
| `required`               | ARIA 힌트만. 검증은 RHF나 앱이 한다                           |
| `className` / `style`    | 트리거와 Clear를 감싸는 컨테이너로 간다                       |
| 그 외 native 속성, `ref` | 트리거 button으로 간다                                        |

## 알아둘 것

- 외부에서 `value`, `format`, `alpha`를 바꾸면 표시와 제출 값은 정규화되지만 `onChange`는 발생하지 않는다. 부모가 가진 원본은 부모가 갱신한다.
- `onBlur`는 포커스가 트리거와 팝업을 모두 벗어날 때만 발생한다.
- 팝업은 비모달이다. 배경 스크롤을 잠그지 않는다. 위치와 폭은 Clear를 포함한 필드 전체를 기준으로 잡는다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로 되돌리고 팝업을 닫는다.
