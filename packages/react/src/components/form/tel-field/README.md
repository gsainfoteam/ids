# TelField

전화번호를 입력받는 필드입니다. 입력하는 동안 나라 형식으로 묶어 보여 주고, 값은 E.164(`+821012345678`)로 내보냅니다.

- **값은 E.164.** 화면에 `010-1234-5678` 이 보여도 `onValueChange`, 폼, react-hook-form에는 `+821012345678` 이 갑니다. 국내 형식으로 준 값도 읽습니다.
- **입력하며 묶기.** 숫자를 치는 동안 나라 형식으로 하이픈과 공백을 넣습니다. 캐럿은 같은 숫자 뒤에 머물고, 구분 기호를 지우면 앞 숫자가 함께 지워집니다.
- **붙여넣기 정리.** `tel:` 링크, `+44 (0)20 …` 의 `(0)`, `00` 으로 시작하는 번호, 전각 숫자를 번호로 읽습니다. 국제 번호를 붙여 넣으면 입력돼 있던 내용을 대신합니다.
- **국가 선택.** `TelField.CountrySelect` 는 Select 위에 만들었습니다. 나라 이름(`미국`), ISO 코드(`US`), 국가 번호(`+1`)로 찾고, `+` 로 시작하는 번호를 넣으면 그 나라로 바뀝니다.
- **검증.** 덜 입력했거나 있을 수 없는 번호는 native 검증에 걸려서 폼이 제출을 막고 `Field.Error` 가 이유를 보여 줍니다.

```tsx
import { Field, TelField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>전화번호</Field.Label>
  <TelField name="tel" value={phone} onValueChange={setPhone}>
    <TelField.CountrySelect />
    <TelField.Input />
  </TelField>
</Field>;
```

## 값

```tsx
<TelField defaultValue="+821012345678" />              // 비제어
<TelField value={phone} onValueChange={setPhone} />    // 제어. (value: string) => void, E.164
<TelField defaultValue="010-1234-5678" />              // 국내 형식도 받는다. defaultCountry로 읽는다
<TelField onChange={(e) => log(e.target.value)} />     // native 이벤트. 화면의 글자가 온다
```

| 입력                 | 화면              | 값               |
| -------------------- | ----------------- | ---------------- |
| `01012345678`        | `010-1234-5678`   | `+821012345678`  |
| `010123`             | `010-123`         | `+8210123`       |
| `+12025550123`       | `+1 202 555 0123` | `+12025550123`   |
| (비움)               |                   | `""`             |

- 덜 입력한 번호도 입력한 만큼 E.164로 내보냅니다. 완성 여부는 native 검증이 알립니다.
- 코드가 `value` 를 바꿔도 `onValueChange` 는 불리지 않습니다.

## 형식

```tsx
<TelField format="auto" />          // 기본. 국내 번호는 국내 형식, 해외 번호는 국제 형식
<TelField format="international" /> // 입력을 마치면 "+82 10 1234 5678"
<TelField format="none" />          // 묶지 않고 입력한 그대로 보인다
```

- `format` 은 화면의 모양만 정합니다. 값은 언제나 E.164입니다.
- 완성된 번호만 입력을 마칠 때 정리합니다. 덜 입력한 번호는 입력한 모양 그대로 둡니다.
- 국가 선택이 없으면 국내 숫자는 `defaultCountry` 번호로 읽고, 다른 나라 번호는 `+1 202 555 0123` 처럼 국제 형식으로 보입니다.
- 국내 형식으로 준 `value` 나 `defaultValue` 는 덜 입력된 번호라도 그 모양대로 보입니다.

## 붙여넣기

| 붙여 넣은 글자               | 값               |
| ---------------------------- | ---------------- |
| `tel:+82-10-1234-5678`       | `+821012345678`  |
| `+44 (0)20 7946 0958`        | `+442079460958`  |
| `0044 20 7946 0958`          | `+442079460958`  |
| `０１０１２３４５６７８`       | `+821012345678`  |

- 국제 번호는 입력돼 있던 내용을 통째로 바꿉니다. 실제 편집으로 넣어서 실행 취소와 `onChange` 가 그대로 됩니다.
- `00` 은 바꿨을 때 올바른 번호가 될 때만 `+` 로 읽습니다. 한국의 `001` 처럼 뒤에 통신사 번호가 오는 국제전화 번호는 그대로 둡니다.
- 일부만 붙여 넣으면 캐럿 자리에 들어갑니다.

## 국가 선택

```tsx
<TelField defaultCountry="KR" locale="ko-KR">
  <TelField.CountrySelect />                          {/* 트리거에 "KR +82" */}
  <TelField.Input />
</TelField>

<TelField.CountrySelect aria-label="Country" searchPlaceholder="Search" /> {/* 문구 바꾸기 */}
```

- 목록은 libphonenumber-js가 아는 모든 나라이고, `locale` 의 나라 이름 순서로 정렬합니다. 기본 `locale` 은 `ko-KR` 입니다.
- 나라를 바꾸면 국가 번호만 바꾸고 나머지 숫자는 둡니다. 그 번호가 새 나라에서 올바른지는 검증이 알립니다.
- 국가 선택이 있으면 국가 번호는 선택에 두고 입력에는 국내 형식만 보입니다. `+1 …` 을 입력하거나 붙여 넣으면 선택이 미국으로 바뀝니다.
- 코드가 넣은 값의 국가 번호가 고른 나라와 같으면 고른 나라를 그대로 둡니다. 미국과 캐나다는 같은 `+1` 을 씁니다.
- 국가 선택은 Select로 만들어서 검색과 키보드 탐색을 그대로 씁니다.

## 검증

```tsx
<form onSubmit={send}>
  <Field>
    <Field.Label>연락처</Field.Label>
    <TelField name="tel" required />
    <Field.Error />                    {/* "올바른 전화번호를 입력하세요." */}
  </Field>
</form>
```

- 빈 값은 `required` 에 맡깁니다.
- 폼에 `noValidate` 가 있으면 Field는 이 오류를 보여 주지 않습니다. react-hook-form에서는 resolver나 `registerOptions` 로 검증합니다.

## 상태

| 속성                                             | 뜻                                 |
| ------------------------------------------------ | ---------------------------------- |
| `data-focused`, `data-filled`                    | 포커스가 필드 안에 있다, 값이 있다 |
| `data-invalid`                                   | `invalid`, `aria-invalid`, Field의 오류 |
| `data-disabled`, `data-readonly`                 | 비활성, 읽기 전용                  |
| `data-size`, `data-variant`                      | 크기와 variant                     |

- 테두리 컨테이너(`data-tel-field`)에 붙습니다. `className` 과 `style` 은 이 상태를 받는 함수도 됩니다.

## react-hook-form

```tsx
import { TelField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="phone" controlMode="value" registerOptions={{ required: '전화번호를 입력하세요.' }}>
  <Field.Label>전화번호</Field.Label>
  <TelField />                                         {/* onValueChange로 E.164를 받는다 */}
  <Field.Error />
</Field>;
```

- `native` 모드로 묶지 않습니다. 화면의 글자가 값이 아니기 때문입니다.
- TanStack Form은 `value={field.state.value}` 와 `onValueChange={field.handleChange}` 로 연결합니다.

## 속성

| 속성                     | 기본 / 동작                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `value` / `defaultValue` | E.164 또는 국내 형식 문자열. 기본 `""`                         |
| `onValueChange`          | `(value: string) => void`. E.164                              |
| `onChange`               | native change 이벤트                                          |
| `format`                 | `auto`(기본) / `international` / `none`                       |
| `defaultCountry`         | `KR`. 지원하는 ISO alpha-2 코드                               |
| `locale`                 | `ko-KR`. 국가 이름의 언어                                     |
| `variant`                | `outline`(기본) / `soft` / `ghost`                            |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard` |
| `invalid`                | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선           |
| `disabled` / `readOnly`  | 입력과 국가 선택에 함께 적용                                  |
| `name` / `form`          | hidden input이 E.164 값 하나를 제출한다                        |
| `className` / `style`    | 컨테이너로 간다. 상태를 받는 함수도 된다                      |
| 그 외 native 속성, ref    | 실제 input으로 간다. `autoComplete="tel"`, `inputMode="tel"` 기본 |

## 알아둘 것

- IME 조합이 끝난 뒤에 묶습니다.
- native `form.reset()` 은 비제어 값과 국가를 기본값으로 되돌립니다.
- `defaultCountry` 는 서비스 locale에서 구해 넘기는 것을 권장합니다. 기본 `KR` 은 서버와 브라우저가 같은 화면을 그리게 하기 위한 값입니다.
- 지원하지 않는 `defaultCountry`, `TelField.Input` 이나 `CountrySelect` 중복은 에러가 납니다.
