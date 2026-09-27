# NumberField

- `number | null` 값을 다루는 숫자 입력
- 증감 버튼과 키보드 증감, `min` / `max` 범위
- `Intl.NumberFormat` 로케일 포맷 (통화, 퍼센트 등)
- `TextField`와 같은 sentinel 합성: 앞뒤에 아이콘, 단위, `Clear`를 붙인다

```tsx
import { Field, NumberField } from '@gsainfoteam/ids-react';

const [length, setLength] = useState<number | null>(0.1);

<Field>
  <Field.Label>길이</Field.Label>
  <NumberField value={length} onChange={setLength} min={-1} max={1} step={0.1} />
  <Field.Hint>cm 단위로 입력하세요.</Field.Hint>
</Field>;
```

## 값

```tsx
<NumberField defaultValue={null} />             // uncontrolled. 기본 null
<NumberField value={n} onChange={setN} />       // onChange(value: number | null). DOM 이벤트가 아니다

// 입력 중        onChange
// ""             null
// "-", "."       null (문자열은 편집이 끝날 때까지 유지)
// "1.", "1.20"   1, 1.2 (문자열은 그대로 두고 blur 또는 Enter에서 정리)
// "1e3", "1K"    거부하고 직전 값으로 돌아간다
```

## 범위와 증감

```tsx
<NumberField min={10} max={20} step={2} largeStep={5} />
// 편집 중에는 범위 밖 값도 onChange로 전달 ("12"를 치는 중의 "1")
// blur, Enter, 증감 시 범위 안으로 자른다. 범위 밖이면 aria-invalid
// Up/Down = step, Shift+Up/Down 또는 PageUp/PageDown = largeStep (기본 step * 10)
// 빈 값에서 증감하면 0에서 한 step 이동. 0이 범위 밖이면 가까운 경계로 간다
// step 배수로 반올림하지 않는다. 정수 여부 같은 검증은 스키마에서 한다
```

## 포맷

```tsx
<NumberField defaultValue={1234.567} locale="de-DE" formatOptions={{ style: 'currency', currency: 'EUR' }} />
// 표시 "1.234,57 €", focus하면 "1234,567"로 편집. 실제 값의 정밀도는 유지

<NumberField defaultValue={0.125} formatOptions={{ style: 'percent', minimumFractionDigits: 1 }} />
// 표시 "12.5%", focus하면 "0.125"로 편집. "25%"를 붙여 넣으면 0.25

<NumberField locale="ko-KR" />                  // locale 기본값은 SSR과 맞춘 en-US
```

## 합성

```tsx
<NumberField value={n} onChange={setN}>
  <CurrencyDollarIcon />                        {/* Input 앞 = leading */}
  <NumberField.Input />
  <span aria-hidden="true">cm</span>            {/* Input 뒤 = trailing */}
  <NumberField.Clear />                         {/* 값이나 입력 중 문자열이 있을 때만 보인다. 누르면 null */}
  <NumberField.Stepper />                       {/* 직접 두면 자동 Stepper를 대체 */}
</NumberField>

<NumberField>
  <span>$</span>                                {/* Input을 생략하면 자식 뒤에 자동으로 들어가고 끝에 Stepper가 붙는다 */}
</NumberField>

<NumberField hideStepper />                     {/* 자동 Stepper만 숨긴다 */}

<NumberField value={n} onChange={setN}>
  <NumberField.Input />
  <NumberField.Clear onClear={() => setN(0)} /> {/* onClear는 기본 지우기를 대체한다. 값 변경도 직접 한다 */}
</NumberField>
```

## 속성 우선순위

```tsx
<NumberField placeholder="a" onChange={setN} onBlur={rootBlur}>
  <NumberField.Input placeholder="b" onBlur={inputBlur} onChange={nativeChange} />
</NumberField>
// placeholder="b": 값은 Input > root > asChild 자식
// onBlur: child, root, input 순서로 모두 실행. preventDefault하면 뒤 핸들러는 생략
// root onChange는 숫자 콜백, Input onChange는 native ChangeEvent
// disabled, readOnly, id, aria-invalid도 root와 Input을 합친 값으로 정한다
```

## asChild

```tsx
<NumberField>
  <NumberField.Input asChild>
    <MyInput />                                 {/* props와 ref를 native input에 전달해야 한다 */}
  </NumberField.Input>
  <NumberField.Stepper asChild>
    <span />                                    {/* 버튼 두 개를 담을 비상호작용 wrapper. 기존 children은 대체된다 */}
  </NumberField.Stepper>
  <NumberField.Clear asChild>
    <button>지우기</button>                      {/* button으로 렌더되어야 한다 */}
  </NumberField.Clear>
</NumberField>
```

## React Hook Form + Zod

```tsx
import { NumberField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({
  quantity: z
    .number()
    .nullable()
    .refine((v) => v != null && Number.isInteger(v) && v >= 1 && v <= 20, '1에서 20 사이 정수를 입력하세요.'),
});
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { quantity: null as number | null } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(save)}>
    <Field name="quantity" controlMode="value" required>   {/* native register 모드로 묶지 않는다 */}
      <Field.Label>수량</Field.Label>
      <NumberField min={1} max={20} />
      <Field.Error />
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                                             | 기본 / 동작                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `value` / `defaultValue`                         | `number \| null`. 유한한 숫자만. `defaultValue` 기본 `null`       |
| `onChange`                                       | `(value: number \| null) => void`                                 |
| `min` / `max`                                    | 제한 없음. `min <= max`                                           |
| `step` / `largeStep`                             | `1` / `step * 10`. 양수                                           |
| `locale` / `formatOptions`                       | `en-US` / `Intl.NumberFormat` 옵션                                |
| `variant`                                        | `outline`(기본) / `filled` / `unstyled`. unstyled도 포커스 링 유지 |
| `size`                                           | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`             |
| `invalid`                                        | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선               |
| `hideStepper`                                    | `false`. 자동 Stepper만 숨김                                      |
| `disabled` / `readOnly`                          | 입력, Stepper, Clear의 변경을 모두 막는다                         |
| `incrementLabel`, `decrementLabel`, `clearLabel` | `Increase value` / `Decrease value` / `Clear value`               |
| `name` / `form`                                  | hidden input이 정규화된 숫자 문자열을 제출. 빈 값은 `""`          |
| `className` / `style`                            | 컨테이너로 간다. Input에 주면 input으로 간다                      |
| 그 외 native 속성, ref                           | 실제 input으로 간다                                               |

## 알아둘 것

- 실제 input은 `type="text"` + `role="spinbutton"`이다. `valueAsNumber`, `stepUp()`은 쓸 수 없고, native number 검증 대신 앱 폼 검증을 쓴다.
- 휠로 값이 바뀌지 않고 페이지 스크롤도 막지 않는다.
- 포맷은 blur 상태 표시와 `aria-valuetext`에만 적용한다. 표시용 반올림은 값에 반영하지 않는다.
- `formatOptions`를 생략하면 유효숫자 21자리까지 보여 작은 소수가 0으로 사라지지 않는다.
- 붙여 넣은 그룹 구분자, 공백, 통화/단위 기호, 회계식 괄호 음수, 현지 숫자, 전각 숫자를 정제한다. scientific/compact 포맷은 표시에만 쓰고 입력은 십진수로 한다.
- 증감은 십진 연산이라 `0.1 + 0.2` 같은 오차를 줄인다. 최종 값은 JS `number`다.
- IME 조합 중에는 정제와 방향키 증감을 하지 않는다.
- 받은 `value`/`defaultValue`를 렌더만으로 고치거나 `onChange`를 부르지 않는다.
- native `form.reset()`은 uncontrolled 값을 `defaultValue`로 되돌린다. controlled면 부모가 `value`를 바꾼다.
- Input의 `value`, `defaultValue`, `type`, `role`, 수치 ARIA는 컴포넌트가 관리한다. 값과 범위는 root에 준다.
- `NumberField.Input`이나 `Stepper`를 둘 이상 두면 에러가 난다. `min > max`, 0 이하 `step`, 유한하지 않은 숫자도 에러다.
