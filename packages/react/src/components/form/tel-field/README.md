# TelField

- 국가 선택과 입력 중 번호 포맷을 갖춘 전화번호 입력
- 값은 `string`. `auto` / `international` / `none` 포맷
- 국가 목록과 포맷은 libphonenumber-js 기반
- `TextField`와 같은 sentinel 합성: `CountrySelect`나 아이콘을 앞뒤에 붙인다

```tsx
import { Field, TelField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>전화번호</Field.Label>
  <TelField name="tel" value={phone} onChange={setPhone} />
</Field>;
```

## 값과 포맷

```tsx
<TelField onChange={setPhone} />                        // format="auto"(기본): "010-1234-5678"
<TelField format="international" onChange={setPhone} /> // "+821012345678"
<TelField format="none" onChange={setPhone} />          // 입력 그대로

<TelField defaultCountry="US" onChange={setPhone}>      {/* defaultCountry 기본 KR */}
  <TelField.CountrySelect />                            {/* 있으면 format과 관계없이 국제 값 "+1..." */}
</TelField>
// onChange(value: string). DOM 이벤트가 아니다
// 미완성 번호도 그대로 받는다. 완성도와 유효성은 앱에서 검증한다
```

## 합성

```tsx
<TelField defaultCountry="KR">
  <TelField.CountrySelect />          {/* Input 앞 = leading. 자체 트리거 스타일 그대로 */}
  <TelField.Input />
  <PhoneIcon />                       {/* Input 뒤 = trailing */}
</TelField>

<TelField>
  <TelField.CountrySelect />          {/* Input을 생략하면 자식 뒤에 자동으로 들어간다 */}
</TelField>
```

- leading/trailing 자식은 각각 span으로 감싼다
- 버튼이 없으면 muted 색, 크기에 맞는 글자와 아이콘 크기가 적용된다
- 버튼이 있으면 버튼의 패딩과 고정 크기만 없앤다
- Fragment 안의 Input도 찾지만 다른 컴포넌트 안은 찾지 않는다

## 속성 우선순위

```tsx
<TelField id="tel" placeholder="a" onChange={setPhone} onBlur={rootBlur}>
  <TelField.Input placeholder="b" onBlur={inputBlur} onChange={nativeChange} />
</TelField>
// id="tel", placeholder="b": 값은 Input > root > asChild 자식
// onBlur: child, root, input 순서로 모두 실행
// root onChange는 문자열 콜백, Input onChange는 native ChangeEvent
// value, type, 포맷 처리는 TelField가 가지므로 덮어쓸 수 없다
```

## asChild

```tsx
<TelField>
  <TelField.CountrySelect asChild>
    <button>국가</button>             {/* 트리거로 쓸 button */}
  </TelField.CountrySelect>
  <TelField.Input asChild>
    <MyInput />                       {/* props와 ref를 native input에 전달해야 한다 */}
  </TelField.Input>
</TelField>
```

## React Hook Form + Zod

```tsx
import { TelField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({ phone: z.string().min(1, '전화번호를 입력하세요.') });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { phone: '' } });

<FormProvider {...methods}>
  <Field name="phone" controlMode="value">    {/* 오류 시 실제 input에 포커스 */}
    <Field.Label>전화번호</Field.Label>
    <TelField />
    <Field.Error />
  </Field>
</FormProvider>;
```

## 속성

| 속성                     | 기본 / 동작                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `value` / `defaultValue` | 문자열. `defaultValue` 기본 `""`                             |
| `onChange`               | `(value: string) => void`                                    |
| `format`                 | `auto`(기본) / `international` / `none`                      |
| `defaultCountry`         | `KR`. 지원하는 ISO alpha-2 코드                              |
| `variant`                | `outline`(기본) / `soft` / `ghost`                      |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`        |
| `invalid`                | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선          |
| `disabled` / `readOnly`  | input과 국가 선택에 함께 적용                                |
| `name` / `form`          | hidden input이 정규화된 값 하나를 제출                       |
| `className` / `style`    | 컨테이너로 간다. Input에 주면 input으로 간다                 |
| 그 외 native 속성, ref   | 실제 input으로 간다. `autoComplete="tel"`, `inputMode="tel"` 기본 |

## 알아둘 것

- 국가를 바꾸면 국가 번호만 바꾸고 나머지 숫자는 유지한다. 번호가 그 나라에서 유효한지는 보장하지 않는다.
- 국가 목록은 libphonenumber-js가 지원하는 전체 국가이며 ISO 코드와 국가 번호로 검색한다.
- `auto`/`international`은 전각 숫자를 정규화하고 숫자와 앞의 `+`만 남긴다.
- 입력 중 커서의 숫자 위치를 유지하고, 구분자를 지우면 앞 숫자가 함께 지워진다.
- IME 조합이 끝난 뒤 포맷한다.
- native `form.reset()`은 uncontrolled 값과 국가를 기본값으로 되돌린다. controlled면 부모가 `value`를 바꾼다.
- 외부에서 `value`를 바꿔도 `onChange`는 발생하지 않는다.
- 지원하지 않는 `defaultCountry`, `TelField.Input`이나 `CountrySelect` 중복은 에러가 난다.
- `defaultCountry`는 서비스 locale에서 구해 명시하는 것을 권장한다. 기본 `KR`은 SSR과 클라이언트를 맞추기 위한 값이다.
