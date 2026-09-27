# Input

`type` 하나로 그 입력에 맞는 IDS 필드를 골라 주는 컴포넌트입니다. 스키마에서 필드를 그리는 폼 빌더처럼 `type` 만 아는 곳에서 씁니다.

- **알맞은 필드로.** `number` 는 NumberField, `password` 는 PasswordField, `tel` 은 TelField, `text` · `email` · `url` · `search` 는 TextField로 그립니다. 값과 콜백은 고른 필드의 것을 그대로 씁니다.
- **검색 입력.** `search` 에는 돋보기 아이콘과 지우기 버튼이 붙습니다. 지우기는 값이 있을 때만 보이고 Escape도 입력을 비웁니다. 모바일 키보드의 확인 키는 "검색"이 됩니다.
- **주소 입력.** `email` 과 `url` 은 모바일 키보드가 첫 글자를 대문자로 바꾸거나 맞춤법을 고치지 않게 합니다.
- **Field 그대로.** 라벨, 설명, 오류 연결과 `size`, `disabled`, `required` 상속은 고른 필드가 받습니다.

```tsx
import { Field, Input } from '@gsainfoteam/ids-react';

<Field required>
  <Field.Label>이메일</Field.Label>
  <Input type="email" name="email" autoComplete="email" />
</Field>;
```

## type

```tsx
<Input />                                                        // TextField type="text"
<Input type="email" />                                           // TextField. 대문자, 자동 수정 끔
<Input type="url" />                                             // TextField. 대문자, 자동 수정 끔
<Input type="search" aria-label="검색" />                        // TextField + 돋보기 + 지우기
<Input type="password" name="password" />                        // PasswordField
<Input type="number" value={quantity} onValueChange={setQuantity} min={1} /> // NumberField. number | null
<Input type="tel" value={phone} onValueChange={setPhone} />              // TelField. E.164 string
```

- 모든 type에서 `onChange` 는 native 이벤트이고, 값은 `onValueChange` 가 필드마다의 타입으로 넘깁니다.
- `variant`, `size`, `invalid` 와 그 외 속성도 고른 필드의 것을 씁니다.

## 조립

```tsx
<Input type="number" value={n} onValueChange={setN}>
  <NumberField.Input />                     {/* 고른 필드의 파트도 그대로 넘어간다 */}
  <NumberField.Clear />
</Input>

<Input type="search" aria-label="검색">
  <TextField.Input />                       {/* children을 주면 기본 아이콘과 지우기 대신 쓴다 */}
  <Kbd>⌘K</Kbd>
</Input>
```

## react-hook-form

```tsx
import { Input } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="email">
  <Field.Label>이메일</Field.Label>
  <Input type="email" />                    {/* text 계열과 password는 register()로 */}
  <Field.Error />
</Field>
<Field name="quantity" controlMode="value">  {/* number와 tel은 값으로 */}
  <Field.Label>수량</Field.Label>
  <Input type="number" min={1} />
  <Field.Error />
</Field>
```

## 속성

| 속성   | 기본 / 동작                                                               |
| ------ | ------------------------------------------------------------------------- |
| `type` | `text`(기본) / `email` / `url` / `search` / `number` / `password` / `tel` |
| 그 외  | 고른 필드의 속성을 그대로 받는다                                           |

## 알아둘 것

- `type` 을 바꾸면 다른 컴포넌트가 그려집니다. 바꿀 때는 `key={type}` 로 상태를 새로 시작하거나 새 type에 맞는 값을 함께 넘깁니다.
- `date`, `time`, `datetime-local`, `color`, `file` 과 OTP는 전용 필드(DateField, TimeField, DateTimeField, ColorField, FileField, OTPField)를 씁니다. TypeScript는 이런 `type` 을 받지 않고, 런타임에 들어오면 개발 빌드에서 경고한 뒤 text로 그립니다.
