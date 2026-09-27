# Field

입력 하나에 라벨, 설명, 도움말, 오류를 붙이고 그 입력의 상태를 한곳에 모으는 래퍼입니다.

- **자동 연결.** `Field.Label` 은 `htmlFor` 와 `aria-labelledby` 로, `Description` · `Hint` · `Error` 는 `aria-describedby` 로 입력에 붙습니다. SSR 첫 HTML부터 들어갑니다.
- **입력 상태.** 포커스, 값 유무, 변경 여부, 한 번 떠났는지를 루트와 모든 파트에 `data-*` 로 붙입니다. `className` · `style` · `children` 은 이 상태를 받는 함수도 됩니다.
- **브라우저 검증 메시지.** `Field.Error` 에 내용이 없으면 입력의 `validationMessage` 를 보여 줍니다. 제출하려 할 때나 값을 바꾸고 떠날 때 나타나고, 고치는 즉시 사라집니다.
- **상태 상속.** `size`, `disabled`, `required`, `invalid` 가 안의 입력으로 내려갑니다.
- **react-hook-form, TanStack Form.** `/react-hook-form` 의 `Field` 는 `name` 하나로 등록까지 합니다. TanStack Form은 값과 상태를 props로 넘깁니다.

```tsx
import { Field, TextField } from '@gsainfoteam/ids-react';

<Field required>
  <Field.Label>이메일</Field.Label>
  <Field.Description>로그인에 사용합니다.</Field.Description>
  <TextField type="email" name="email" />
  <Field.Hint>회사 이메일을 권장합니다.</Field.Hint>
  <Field.Error />
</Field>;
```

## 구성

```tsx
<Field>
  <Field.Label>이름</Field.Label>        {/* htmlFor, aria-labelledby 자동 연결. required면 * 가 붙는다 */}
  <Field.Description>실명</Field.Description> {/* 항상 보인다 */}
  <TextField />                          {/* 직접 자식 또는 Fragment 안. div로 감싸면 찾지 못한다 */}
  <Field.Hint>...</Field.Hint>           {/* invalid가 아닐 때만 */}
  <Field.Error>...</Field.Error>         {/* invalid이고 보여 줄 내용이 있을 때만 */}
</Field>

<Field aria-label="검색">                {/* Label 대신 aria-label, aria-labelledby도 된다 */}
  <input type="search" />                {/* native input, select, textarea도 된다 */}
</Field>
```

- 입력은 native 요소이거나, 받은 `id`, ARIA, 상태, 이벤트, ref를 실제 입력으로 넘기는 컴포넌트여야 합니다.
- `aria-describedby` 에는 화면에 보이는 설명과 오류만 들어갑니다.
- `Field.Label` 은 `Label` 로 그립니다. 크기, 필수 `*`, 비활성, 오류 색을 Field에서 받고, 누르면 RadioGroup 같은 커스텀 컨트롤로도 포커스가 갑니다.

## 상태

```tsx
<Field className={(state) => (state.focused ? 'bg-muted' : undefined)}>
  <Field.Label>닉네임</Field.Label>
  <TextField />
  <Field.Description>{(state) => (state.dirty ? '저장하지 않은 변경' : '')}</Field.Description>
</Field>
```

| 속성                            | 뜻                                                                   |
| ------------------------------- | -------------------------------------------------------------------- |
| `data-focused`                  | 포커스가 입력 안에 있다                                              |
| `data-filled`                   | 값이 있다. 체크박스와 라디오는 체크, 커스텀 컨트롤은 hidden input 값 |
| `data-dirty`                    | 처음 렌더된 값에서 바뀌었다                                          |
| `data-touched`                  | 포커스가 입력을 한 번 떠났다                                         |
| `data-invalid`                  | 오류 상태                                                            |
| `data-disabled`                 | 비활성                                                               |
| `data-required`                 | 필수                                                                 |
| `data-orientation`, `data-size` | 배치와 크기                                                          |

- 루트(`data-field`)와 모든 파트(`data-field-part`)에 같은 속성이 붙습니다.
- `dirty`, `touched` 를 props로 주면 그 값을 씁니다. react-hook-form Field는 RHF의 `isDirty`, `isTouched` 를 넘깁니다.
- 폼의 native reset은 `dirty`, `touched`, 표시 중인 브라우저 오류를 지웁니다.
- 커스텀 컨트롤은 `useFieldState()` 로 같은 상태를 읽습니다. Field 밖에서는 `null` 입니다.

## 브라우저 검증

```tsx
<form onSubmit={save}>
  <Field>
    <Field.Label>이메일</Field.Label>
    <TextField type="email" name="email" required />
    <Field.Error />                      {/* 브라우저가 만든 문구를 그대로 보여 준다 */}
  </Field>
</form>

<Field>
  <Field.Label>이메일</Field.Label>
  <TextField type="email" required />
  <Field.Error match="valueMissing">이메일을 입력하세요.</Field.Error>
  <Field.Error match="typeMismatch">이메일 형식이 아닙니다.</Field.Error>
</Field>
```

| 때                           | 동작                                          |
| ---------------------------- | --------------------------------------------- |
| 제출 시도, `checkValidity()` | 잘못된 입력마다 오류를 보여 준다              |
| 값을 바꾸고 포커스가 떠날 때 | 그 값을 검사한다                              |
| 비워 둔 채 지나갈 때         | 아무것도 보여 주지 않는다 (제출 때 보여 준다) |
| 오류가 보이는 동안 입력할 때 | 다시 검사해서 올바르면 바로 지운다            |

- 내용 우선순위는 `children` > react-hook-form 오류 > 브라우저 문구입니다.
- `match` 는 `ValidityState` 항목 이름입니다. 그 항목이 참일 때만 보이고, children이 없으면 브라우저 문구를 씁니다. `Field.Error` 는 여러 개 둘 수 있습니다.
- `setCustomValidity()` 로 건 오류도 `customError` 로 잡힙니다.
- `<form noValidate>` 이면 브라우저 검증을 쓰지 않는다는 뜻이라 Field도 검사하지 않습니다.
- `invalid` 를 직접 주면 그 값이 이깁니다. `invalid={false}` 면 브라우저 오류를 보여 주지 않습니다.
- 제출할 때 브라우저 말풍선도 첫 번째 잘못된 입력 옆에 함께 뜹니다. 포커스를 그 입력으로 옮기는 것도 브라우저가 합니다.

## 배치

```tsx
<Field orientation="horizontal">          {/* 라벨을 왼쪽 열에, 나머지를 오른쪽 열에 둔다 */}
  <Field.Label>이름</Field.Label>
  <TextField />
</Field>
```

- 라벨은 입력과 같은 줄에 맞춰집니다. 설명이 있으면 설명 아래의 입력 줄로 내려갑니다.

## 상태 상속

```tsx
<Field size="tiny" disabled required>
  <Field.Label>이름</Field.Label>
  <TextField />                          {/* tiny, disabled, required + aria-required */}
</Field>

<Field size="tiny" disabled={false}>
  <Field.Label>이름</Field.Label>
  <TextField size="standard" disabled /> {/* size는 입력이, disabled는 Field에 명시한 값이 이긴다 */}
</Field>

<Field>
  <Field.Label>이름</Field.Label>
  <TextField aria-invalid disabled />    {/* Field에 명시하지 않으면 입력 상태를 따른다 */}
</Field>

<Field id="email">
  <Field.Label>이메일</Field.Label>
  <TextField />                          {/* input id="email", 루트 id="email-root". 입력 자신의 id가 우선 */}
</Field>
```

## asChild

```tsx
<Field required>
  <Field.Label asChild>
    <label id="custom-label">이름</label> {/* 그 요소의 id를 그대로 쓰고 필수 별표도 붙는다 */}
  </Field.Label>
  <TextField />
</Field>
```

- Label은 `label`, 나머지 파트는 `div` 로 렌더합니다. Label의 `asChild` 자식은 `label` 이 아니어도 누르면 입력으로 포커스가 갑니다.

## react-hook-form

```tsx
import { Button, TextField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';

const methods = useForm({ defaultValues: { account: { email: '' } } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(save)}>
    <Field name="account.email" required registerOptions={{ required: '이메일을 입력하세요.' }}>
      <Field.Label>이메일</Field.Label>
      <TextField type="email" />           {/* register()가 자동으로 연결된다 */}
      <Field.Error />                      {/* children이 없으면 RHF 오류 메시지 */}
    </Field>
    <Button type="submit">제출</Button>
  </form>
</FormProvider>;
```

```tsx
<Field name="quantity" controlMode="value">   {/* 값을 콜백으로 알리는 입력 */}
  <NumberField />
</Field>
<Field name="agree" controlMode="checked">    {/* checked를 알리는 입력 */}
  <Checkbox />
</Field>
<Field name="email" invalid={false}>          {/* 자동 오류 상태를 덮어쓴다 */}
  <TextField />
</Field>
```

- `value` 모드는 컴포넌트에 `value` 와 `onValueChange` 를, `checked` 모드는 `checked` 와 `onCheckedChange` 를 연결합니다. 값을 먼저 넘기는 `onChange(value)` 도 받습니다.
- 컴포넌트가 넘기는 change 이벤트는 값으로 쓰지 않습니다. 화면의 글자(`1,234`)와 값(`1234`)이 다를 수 있기 때문입니다.
- native `input` 과 `select` 는 `onChange` 이벤트에서 값을 읽습니다.

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

## TanStack Form

```tsx
import { Field, TextField } from '@gsainfoteam/ids-react';
import { useForm } from '@tanstack/react-form';

const form = useForm({ defaultValues: { email: '' }, onSubmit: ({ value }) => save(value) });

<form.Field
  name="email"
  validators={{
    onBlur: ({ value }) => (value.includes('@') ? undefined : '이메일 형식을 확인하세요.'),
  }}
>
  {(field) => (
    <Field
      invalid={!field.state.meta.isValid}
      touched={field.state.meta.isTouched}
      dirty={field.state.meta.isDirty}
    >
      <Field.Label>이메일</Field.Label>
      <TextField
        name={field.name}
        value={field.state.value}
        onValueChange={field.handleChange}
        onBlur={field.handleBlur}
      />
      <Field.Error>{field.state.meta.errors.join(', ')}</Field.Error>
    </Field>
  )}
</form.Field>;
```

- 값과 검증은 TanStack Form이 갖고, Field는 라벨과 오류 연결, 상태 표시를 맡습니다.

## 속성

| 속성                                                | 기본 / 동작                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `orientation`                                       | `vertical`(기본) / `horizontal`                                      |
| `size`                                              | `standard`(기본) / `tiny`. 입력이 크기를 명시하지 않으면 이를 따른다 |
| `invalid`                                           | 입력의 `aria-invalid` 와 브라우저 검증을 따른다. 명시하면 우선       |
| `disabled`                                          | 입력 상태를 따른다. 명시하면 우선                                    |
| `required`                                          | 입력 상태를 따른다. native `required`, `aria-required`, 별표         |
| `dirty` / `touched`                                 | 생략하면 입력을 보고 정한다                                          |
| `id`                                                | 입력 id 기본값. 루트는 `${id}-root`                                  |
| `name`                                              | 입력의 `name`. RHF Field에서는 등록 경로                             |
| `aria-label`, `aria-labelledby`, `aria-describedby` | 입력으로 간다. 기존 id 목록과 중복 없이 합친다                       |
| `className` / `style`                               | 루트로 간다. 상태를 받는 함수도 된다                                 |
| 그 외 div 속성, ref                                 | 루트 div로 간다                                                      |
| `Field.Error` `match`                               | 이 `ValidityState` 항목이 참일 때만 보인다                           |
| 파트 `asChild`                                      | 파트 대신 자식 요소에 속성을 합친다                                  |
| `controlMode` (RHF)                                 | `native`(기본) / `value` / `checked`                                 |
| `registerOptions` (RHF)                             | `register` / `useController` 규칙                                    |

## 알아둘 것

- 입력이 하나가 아니거나, 라벨이 없거나, Label · Description · Hint가 중복되면 개발 빌드에서 경고합니다.
- 일반 Field는 `value` 나 `onChange` 를 건드리지 않습니다. 다른 폼 라이브러리의 props를 그대로 연결할 수 있습니다.
- `variant="horizontal"` 은 `orientation` 의 예전 이름입니다. 다음 버전에서 빠집니다.
- `react-hook-form@^7.62.0` 은 optional peer입니다. `/react-hook-form` 경로를 쓸 때만 설치하고, 기본 import는 RHF를 불러오지 않습니다.
- RHF Field는 `FormProvider` 와 `name` 이 모두 있을 때만 등록합니다. `name` 만 있으면 개발 빌드에서 경고하고 일반 Field로 동작합니다.
- `value` / `checked` 모드에서는 RHF가 값의 주인입니다. 자식의 `value`, `defaultValue` 보다 `defaultValues` 와 RHF 상태가 우선합니다.
- 자식 핸들러가 먼저 실행되고 RHF 핸들러도 항상 실행됩니다. ref는 합성됩니다. 같은 입력을 다시 `register` 하거나 `Controller` 로 감싸지 않습니다.
- `valueAsNumber`, `valueAsDate`, `setValueAs` 는 `native` 모드에서만 됩니다. 다른 모드의 변환은 콜백이나 resolver에서 합니다.
- `disabled` 는 `formState.disabled` > Field `disabled` > `registerOptions.disabled` 순입니다. 제출 값에서 빼려면 자식이 아닌 Field에 `disabled` 를 줍니다.
- `required` 는 접근성과 native 제약 표시일 뿐입니다. RHF 검증은 `registerOptions` 나 resolver에 적습니다.
- resolver의 출력 타입이 입력과 다르면 `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>` 로 적습니다.
