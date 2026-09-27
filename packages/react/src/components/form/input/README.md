# Input

- 스키마의 `type` 하나로 알맞은 IDS 필드를 고르는 편의 컴포넌트
- `TextField`, `PasswordField`, `NumberField`, `TelField`에 위임한다
- `type="search"`에는 지우기 버튼이 붙는다

```tsx
import { Field, Input } from '@gsainfoteam/ids-react';

<Field required>
  <Field.Label>이메일</Field.Label>
  <Input type="email" name="email" autoComplete="email" />
</Field>;
```

## type별 위임

```tsx
<Input />                                   // TextField type="text". onChange는 ChangeEvent
<Input type="email" />                      // email, url도 TextField
<Input type="search" aria-label="검색" />   // TextField + 검색어 지우기 버튼
<Input type="password" name="password" />   // PasswordField. onChange는 ChangeEvent
<Input type="number" value={quantity} onValueChange={setQuantity} min={1} /> // NumberField. number | null
<Input type="tel" value={phone} onChange={setPhone} />                   // TelField. string
```

- props, ref, `disabled`/`readOnly`, `Field` 크기와 ARIA 연결은 위임한 필드로 그대로 간다
- `variant`도 해당 필드의 것을 쓴다

## 합성

```tsx
<Input type="number" value={n} onValueChange={setN}>
  <NumberField.Input />                     {/* 전용 필드의 compound children도 그대로 전달된다 */}
  <NumberField.Clear />
</Input>

<TextField aria-label="검색">               {/* 아이콘이나 버튼을 붙이려면 TextField를 직접 쓴다 */}
  <MagnifyingGlassIcon />
  <TextField.Input />
</TextField>
```

## 오류 상태

```tsx
<Input type="email" invalid />                        // 텍스트 계열에서 aria-invalid로 바뀐다
<Input type="email" invalid aria-invalid={false} />   // 명시한 aria-invalid가 우선
```

## React Hook Form + Zod

```tsx
import { Input } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({ email: z.string().email(), quantity: z.number().nullable(), phone: z.string() });
const methods = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', quantity: null, phone: '' }, // number는 number | null, tel은 string
});

<FormProvider {...methods}>
  <Field name="email">
    <Field.Label>이메일</Field.Label>
    <Input type="email" />
    <Field.Error />
  </Field>
  <Field name="quantity" controlMode="value">   {/* number, tel은 controlMode="value" */}
    <Field.Label>수량</Field.Label>
    <Input type="number" min={1} />
    <Field.Error />
  </Field>
  <Field name="phone" controlMode="value">
    <Field.Label>전화번호</Field.Label>
    <Input type="tel" />
    <Field.Error />
  </Field>
</FormProvider>;
```

## 속성

| 속성                    | 기본 / 동작                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| `type`                  | `text`(기본) / `email` / `url` / `search` / `number` / `password` / `tel` |
| `invalid`               | 텍스트 계열은 `aria-invalid`로 변환. 나머지는 해당 필드의 `invalid` |
| 그 외                   | 위임한 필드의 속성을 그대로 받는다                               |

## 알아둘 것

- search의 지우기 버튼은 값이 없어도 자리를 차지해 너비와 탭 순서가 바뀌지 않는다. 브라우저 기본 지우기 아이콘은 숨긴다.
- 지우기는 native `input` 이벤트를 발생시키므로 `onChange`와 RHF native 등록이 모두 받는다. 포커스는 input에 남는다.
- `disabled`나 `readOnly`면 지우기 버튼이 비활성화된다.
- `type`을 동적으로 바꿀 때는 `key={type}`으로 상태를 초기화하거나 새 타입에 맞는 값을 함께 넘긴다.
- OTP, file, color, date, time, datetime-local은 전용 필드를 쓴다. TypeScript는 이런 `type`을 거부하고, 런타임에 들어오면 개발 빌드에서 경고한 뒤 text로 표시한다.
