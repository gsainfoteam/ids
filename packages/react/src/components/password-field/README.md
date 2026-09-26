# PasswordField

비밀번호 입력과 표시 전환 버튼.

```tsx
import { Field, PasswordField } from '@gsainfoteam/ids-react';

<Field required>
  <Field.Label>비밀번호</Field.Label>
  <PasswordField name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
</Field>;
```

## 자동완성

```tsx
<PasswordField name="password" />       // autoComplete="current-password"
<PasswordField name="newPassword" />    // name 끝이 new-password / new_password / newPassword면 "new-password"
<PasswordField name="confirm" autoComplete="new-password" /> // 이름으로 알 수 없으면 직접 지정
```

## 합성

```tsx
<PasswordField name="password">
  <LockClosedIcon />                  {/* Input 앞 = leading */}
  <PasswordField.Input />
  <PasswordField.VisibilityToggle />  {/* 직접 두면 자동 토글을 대체 */}
  <span>필수</span>                   {/* Input 뒤 = trailing */}
</PasswordField>

<PasswordField name="password">
  <LockClosedIcon />                  {/* Input을 생략하면 자식 뒤에 자동으로 들어간다 */}
</PasswordField>

<PasswordField name="password" hideVisibilityToggle /> {/* 자동 토글만 숨긴다 */}
```

## 속성 우선순위

```tsx
<PasswordField name="a" onChange={root}>
  <PasswordField.Input name="b" onChange={input} />
</PasswordField>
// name="b": 값은 Input > root > asChild 자식
// onChange: child, root, input 순서로 모두 실행 (Field와 RHF가 root에 건 핸들러 유지)
// type, autoComplete 기본값, aria-invalid는 병합 결과로 계산해 마지막에 적용
```

## asChild

```tsx
<PasswordField name="password">
  <PasswordField.Input asChild>
    <MyInput />                       {/* props와 ref를 native input에 전달해야 한다 */}
  </PasswordField.Input>
  <PasswordField.VisibilityToggle asChild>
    <button>보기</button>              {/* 역할, 라벨, aria-pressed, 클릭 동작이 연결된다 */}
  </PasswordField.VisibilityToggle>
</PasswordField>
```

## React Hook Form + Zod

```tsx
import { PasswordField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z
  .object({ password: z.string().min(8, '8자 이상 입력하세요.'), confirmation: z.string() })
  .refine((v) => v.password === v.confirmation, {
    path: ['confirmation'],
    message: '비밀번호가 일치하지 않습니다.',
  });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { password: '', confirmation: '' } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(save)}>
    <Field name="password" required>
      <Field.Label>새 비밀번호</Field.Label>
      <PasswordField autoComplete="new-password" />
      <Field.Error />
    </Field>
    <Field name="confirmation" required>
      <Field.Label>비밀번호 확인</Field.Label>
      <PasswordField autoComplete="new-password" />
      <Field.Error />
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                   | 기본 / 동작                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `variant`              | `outline`(기본) / `filled` / `unstyled`                      |
| `size`                 | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`          |
| `invalid`              | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선          |
| `hideVisibilityToggle` | `false`. 자동 토글만 숨김                                    |
| `className` / `style`  | 컨테이너로 간다                                              |
| 그 외 native 속성      | 실제 input으로 간다                                          |

## 알아둘 것

- 표시 전환은 같은 input의 `type`만 바꾼다. 값, 선택 범위, 자동완성이 유지되고 `onChange`는 발생하지 않는다.
- `readOnly`는 편집만 막고 표시 전환은 허용한다. `disabled`는 둘 다 막는다.
- `form.reset()`은 값과 숨김 상태를 복원한다. RHF `reset()`은 값만 복원하므로 표시 상태까지 되돌리려면 `key`를 바꾼다.
- 기본으로 `spellCheck={false}`, `autoCapitalize="none"`이다.
- `name`이 없으면 개발 빌드에서 경고한다.
