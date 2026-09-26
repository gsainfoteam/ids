# OTPField

인증 코드를 한 칸에 한 글자씩 나눠 입력하는 필드. 값은 전체 코드 `string` 하나다.

```tsx
import { Field, OTPField } from '@gsainfoteam/ids-react';

const [code, setCode] = useState('');

<Field>
  <Field.Label>인증 코드</Field.Label>
  <OTPField length={6} name="code" value={code} onChange={setCode} onComplete={verify} />
  <Field.Hint>6자리 코드를 입력하세요.</Field.Hint>
</Field>;
```

## 허용 문자

```tsx
<OTPField length={6} />                          // pattern="numeric": ASCII 숫자, inputMode="numeric"
<OTPField length={8} pattern="alphanumeric" />   // ASCII 영숫자, 대소문자 보존
<OTPField length={4} pattern={/[A-F0-9]/} />     // 한 글자에 적용. g / y 플래그는 무시
// 입력, 붙여넣기, value 모두 NFKC 정규화 후 허용 문자만 남기고 length로 자른다 (전각 숫자 입력 가능)
```

## 편집

```text
// 값 "123456", 세 번째 칸에 포커스
Delete     // "12456"  뒤 문자를 왼쪽으로 당긴다. 빈 자리를 남기지 않는다
Backspace  // 현재 문자를 지우고 이전 칸으로. 현재 칸이 비었으면 앞 문자를 지운다
"9"        // 현재 칸을 덮어쓰고 다음 칸으로. 비어 있는 뒤쪽 칸에 입력하면 첫 빈 칸부터 채운다
←  →  Home  End  // 칸 이동. Tab은 그룹을 벗어난다

// 붙여넣기 / 자동완성
"123-456"  // 허용 문자가 length 이상이면 어느 칸에서든 전체 코드를 교체
"78"       // 짧으면 현재 위치부터 덮어쓴다
```

## onComplete

```tsx
<OTPField
  length={6}
  onComplete={(code) => verify(code)} // 사용자 편집으로 값이 바뀌면서 모든 칸이 찼을 때
/>
// 같은 완성 코드를 다시 붙여넣기, 첫 렌더, 외부 value 설정, reset에서는 호출하지 않는다
// 서버 검증, 중복 요청 방지, 재시도는 앱이 맡는다
```

## Slot과 Separator

```tsx
<OTPField length={6} value={code} onChange={setCode}>
  <OTPField.Slot index={0} />
  <OTPField.Slot index={1} />
  <OTPField.Slot index={2} />
  <OTPField.Separator />               {/* 기본 "−", aria-hidden 장식 */}
  <OTPField.Slot index={3} />
  <OTPField.Slot index={4} />
  <OTPField.Slot index={5} />
</OTPField>
// 자식을 생략하면 Slot을 length개 자동 생성한다
// Slot은 정확히 length개, index는 DOM 순서대로 0부터. 직접 자식이나 Fragment 안만 인식한다
```

## asChild

```tsx
<OTPField length={4}>
  <OTPField.Slot index={0} asChild>
    <MyInput />                        {/* props와 ref를 native input에 전달해야 한다 */}
  </OTPField.Slot>
  {/* ... */}
  <OTPField.Separator asChild>
    <span>/</span>                     {/* 장식만. 상호작용 요소를 넣지 않는다 */}
  </OTPField.Separator>
</OTPField>
// type, value, id, tabIndex, 위치 라벨 같은 입력 속성은 OTPField가 관리한다
```

## 속성 우선순위

```tsx
<OTPField length={6} onKeyDown={root} onChange={setCode}>
  <OTPField.Slot index={0} onKeyDown={slot} onChange={nativeChange} />
  {/* ... */}
</OTPField>
// native 속성: root > Slot > asChild 자식
// 이벤트: child, Slot, root 순서로 모두 실행
// root onChange는 전체 문자열, Slot onChange는 native 이벤트. 키보드 편집은 root onChange로 구독한다
```

## React Hook Form + Zod

칸마다 `register`하지 말고 `controlMode="value"`로 전체 문자열을 바인딩한다.

```tsx
import { OTPField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({ code: z.string().length(6, '6자리 코드를 입력하세요.') });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { code: '' } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(verify)}>
    <Field name="code" controlMode="value" required>
      <Field.Label>인증 코드</Field.Label>
      <OTPField length={6} />
      <Field.Error />
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                         | 기본 / 동작                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `length`                     | 필수. 정수 1-12                                                  |
| `value` / `defaultValue`     | `string` / `''`                                                  |
| `onChange` / `onComplete`    | 전체 문자열 콜백                                                 |
| `pattern`                    | `numeric`(기본) / `alphanumeric` / `RegExp`                      |
| `variant`                    | `outline`(기본) / `filled` / `underline`                         |
| `size`                       | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`              |
| `mask`                       | `false`. 각 칸을 `type="password"`로 가린다                      |
| `disabled` / `readOnly`      | `readOnly`는 편집만 막고 칸 이동과 복사는 허용                   |
| `invalid`                    | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선              |
| `aria-label`                 | 그룹 이름. 기본 `인증 코드`, `Field.Label`로도 지정              |
| `id` / `ref`                 | 첫 번째 칸의 native input                                        |
| `name` / `form`              | 전체 문자열을 hidden input 하나로 제출. `disabled`면 제외        |
| `autoComplete` / `inputMode` | 첫 칸 `one-time-code`, 나머지 `off`. 명시하면 우선               |
| `className` / `style`        | 그룹으로 간다. 칸별 스타일은 `Slot`에                            |

## 알아둘 것

- `ref.current.value`는 첫 칸의 한 글자다. 전체 코드는 `value`/`onChange`나 FormData로 읽는다.
- `onBlur`는 그룹 밖으로 나갈 때만 발생한다. 칸 사이 이동은 RHF touched를 만들지 않는다.
- IME 조합 중에는 콜백과 칸 이동을 미루고, 조합이 끝나면 정규화한다.
- `length`나 `pattern`이 바뀌면 값을 다시 정규화한다. uncontrolled에서 잘린 문자는 설정을 되돌려도 돌아오지 않는다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로 복원하고 `onChange`/`onComplete`를 부르지 않는다. 취소된 reset은 무시한다.
- `mask`는 화면에서만 가린다. 제출 값을 암호화하지 않는다.
- SMS 자동완성은 HTML 힌트(`one-time-code`)만 제공한다. WebOTP API는 쓰지 않으므로 실제 동작은 기기에서 확인한다.
