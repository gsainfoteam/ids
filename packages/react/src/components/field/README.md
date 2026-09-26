# Field

- 입력 하나에 라벨, 설명, 도움말, 오류를 연결하는 래퍼
- `id`, ARIA, `size` / `disabled` / `required` / `invalid` 상태를 입력에 전달한다
- `vertical` / `horizontal` 배치
- `/react-hook-form` 경로의 `Field`는 `FormProvider` 아래에서 `name`으로 RHF에 등록한다

```tsx
import { Field, TextField } from '@gsainfoteam/ids-react';

<Field required invalid={!!error}>
  <Field.Label>이메일</Field.Label>
  <Field.Description>로그인에 사용합니다.</Field.Description>
  <TextField type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  <Field.Hint>회사 이메일을 권장합니다.</Field.Hint>
  <Field.Error>{error}</Field.Error>
</Field>;
```

## 구성

```tsx
<Field variant="horizontal">                {/* 라벨을 왼쪽 열에 둔다 */}
  <Field.Label>이름</Field.Label>            {/* label htmlFor와 aria-labelledby가 자동으로 연결된다 */}
  <Field.Description>실명</Field.Description>
  <TextField />                             {/* 직접 자식 또는 Fragment 안. div로 감싸면 찾지 못한다 */}
  <Field.Hint>...</Field.Hint>              {/* invalid가 아닐 때만 렌더 */}
  <Field.Error>...</Field.Error>            {/* invalid일 때만 렌더 */}
</Field>

<Field aria-label="검색">                   {/* Label 대신 aria-label, aria-labelledby도 된다 */}
  <input type="search" />                   {/* native input/select/textarea도 된다 */}
</Field>
```

- 입력은 native 요소이거나, 받은 `id`, ARIA, 상태, 이벤트, ref를 실제 입력으로 전달하는 컴포넌트여야 한다

## 상태 상속

```tsx
<Field size="tiny" disabled required>
  <Field.Label>이름</Field.Label>
  <TextField />                             {/* tiny, disabled, required + aria-required, 라벨에 별표 */}
</Field>

<Field size="tiny" disabled={false}>
  <Field.Label>이름</Field.Label>
  <TextField size="standard" disabled />    {/* size는 입력 쪽이, disabled는 Field에 명시한 값이 이긴다 */}
</Field>

<Field>
  <Field.Label>이름</Field.Label>
  <TextField aria-invalid disabled />       {/* Field에 명시하지 않으면 입력 상태를 따른다 */}
</Field>

<Field id="email">
  <Field.Label>이메일</Field.Label>
  <TextField />                             {/* input id="email", root div id="email-root". 입력 자신의 id가 우선 */}
</Field>
```

## asChild

```tsx
<Field required>
  <Field.Label asChild>
    <label id="custom-label">이름</label>   {/* 실제 id를 그대로 쓰고 필수 별표도 붙는다 */}
  </Field.Label>
  <TextField />
</Field>
```

- Label은 label, 나머지 파트는 div로 렌더한다
- 클릭 포커스가 필요하면 Label의 `asChild` 자식도 label 요소로 둔다

## React Hook Form

```tsx
import { Button, TextField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';

const methods = useForm({ defaultValues: { account: { email: '' } } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(save)}>
    <Field name="account.email" required registerOptions={{ required: '이메일을 입력하세요.' }}>
      <Field.Label>이메일</Field.Label>
      <TextField type="email" />              {/* register가 자동으로 연결된다 */}
      <Field.Error />                         {/* children이 없으면 RHF 오류 메시지를 표시 */}
    </Field>
    <Button type="submit">제출</Button>
  </form>
</FormProvider>;
```

```tsx
<Field name="quantity" controlMode="value">   {/* NumberField, TelField처럼 값 콜백을 쓰는 입력 */}
  <NumberField />
</Field>
<Field name="agree" controlMode="checked">    {/* 합성 Checkbox, Switch */}
  <Checkbox />
</Field>
<Field name="email" invalid={false}>          {/* 자동 오류 상태를 덮어쓴다 */}
  <TextField />
</Field>
```

## Zod

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  account: z.object({
    email: z.string().trim().min(1, '이메일을 입력하세요.').email('이메일 형식을 확인하세요.'),
  }),
});
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { account: { email: '' } } });

<Field name="account.email" required>         {/* 검증은 resolver가 한다. registerOptions 불필요 */}
  <Field.Label>이메일</Field.Label>
  <TextField inputMode="email" />
  <Field.Error />
</Field>;
```

## 속성

| 속성                                                | 기본 / 동작                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `variant`                                           | `vertical`(기본) / `horizontal`                                    |
| `size`                                              | `standard`(기본) / `tiny`. 입력이 크기를 명시하지 않으면 이를 따른다 |
| `invalid`                                           | 입력의 `aria-invalid`를 따른다. 명시하면 우선                      |
| `disabled`                                          | 입력 상태를 따른다. 명시하면 우선                                  |
| `required`                                          | 입력 상태를 따른다. native `required`, `aria-required`, 별표       |
| `id`                                                | 입력 id 기본값. root는 `${id}-root`                                |
| `name`                                              | 입력의 `name`. RHF Field에서는 등록 경로                           |
| `aria-label`, `aria-labelledby`, `aria-describedby` | 입력으로 간다. 기존 id 목록과 중복 없이 합친다                     |
| 그 외 div 속성, ref                                 | root div로 간다                                                    |
| `controlMode` (RHF)                                 | `native`(기본) / `value` / `checked`                               |
| `registerOptions` (RHF)                             | `register` / `useController` 규칙                                  |

## 알아둘 것

- SSR 첫 HTML부터 `htmlFor`, `aria-labelledby`, `aria-describedby`가 들어간다.
- 입력이 하나가 아니거나, 라벨이 없거나, 파트가 중복되면 개발 빌드에서 경고한다.
- 일반 Field는 `value`/`onChange`를 건드리지 않는다. 다른 폼 라이브러리의 props를 그대로 연결할 수 있다.
- `react-hook-form@^7.62.0`은 optional peer다. `/react-hook-form` 경로를 쓸 때만 설치한다. 기본 import는 RHF를 불러오지 않는다.
- RHF Field는 `FormProvider`와 `name`이 모두 있을 때만 등록한다. `name`만 있으면 개발 빌드에서 경고하고 일반 Field로 동작한다.
- `value`/`checked` 모드에서는 RHF가 값의 주인이다. 자식의 `value`, `defaultValue`보다 `defaultValues`와 RHF 상태가 우선한다.
- 자식 핸들러가 먼저 실행되고 RHF 핸들러도 항상 실행된다. ref는 합성된다. 같은 입력을 다시 `register`하거나 `Controller`로 감싸지 않는다.
- `valueAsNumber`, `valueAsDate`, `setValueAs`는 `native` 모드에서만 된다. 다른 모드의 변환은 콜백이나 resolver에서 한다.
- `disabled`는 `formState.disabled` > Field `disabled` > `registerOptions.disabled` 순이다. 제출 값에서 빼려면 자식이 아닌 Field에 `disabled`를 준다.
- `required`는 접근성과 native 제약 표시일 뿐이다. RHF 검증은 `registerOptions`나 resolver에 적는다.
- resolver의 출력 타입이 입력과 다르면 `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`로 적는다.
