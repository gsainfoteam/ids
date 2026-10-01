# PasswordField

비밀번호를 입력받는 필드입니다. 보기 버튼과 Caps Lock 표시가 기본으로 붙습니다.

- **보기 전환.** 같은 input의 `type` 만 바꿔서 값, 선택 범위, 자동 완성이 그대로 남습니다. 버튼 이름은 그대로 두고 `aria-pressed` 로 상태를 알립니다.
- **Caps Lock 표시.** 입력 중에 Caps Lock이 켜져 있으면 ⇪ 표시가 나타나고, 스크린 리더에 "Caps Lock이 켜져 있습니다."라고 알립니다.
- **비밀번호 관리자와 맞춤.** `name` 으로 `current-password` / `new-password` 를 고르고, 폼을 제출할 때는 보이던 비밀번호를 다시 가려서 관리자가 저장을 제안할 수 있게 합니다.
- **조립.** TextField와 같은 테두리를 씁니다. `PasswordField.Input` 앞뒤에 아이콘이나 버튼을 두고, 파트를 직접 두면 그 자리에 놓입니다.
- **react-hook-form, TanStack Form.** 실제 `<input>` 하나라 `register()` 가 그대로 되고, `onValueChange` 로 값을 바로 받습니다.

```tsx
import { Field, PasswordField } from '@gsainfoteam/ids-react';

<Field required>
  <Field.Label>비밀번호</Field.Label>
  <PasswordField name="password" />
</Field>;
```

## 값

```tsx
<PasswordField name="password" defaultValue="" />                       // 비제어
<PasswordField name="password" value={password} onValueChange={setPassword} /> // 제어
<PasswordField name="password" onChange={(e) => setPassword(e.target.value)} />  // native 이벤트
```

- `onValueChange(value)` 는 `onChange` 와 같은 때에 불립니다. 보기를 전환해도 불리지 않습니다.

## 보기 전환

```tsx
<PasswordField name="password" />                       // 뒤에 보기 버튼이 붙는다
<PasswordField name="password" hideVisibilityToggle />  // 버튼 없이

<PasswordField name="password" visible={visible} onVisibleChange={setVisible} /> // 바깥에서 제어
<PasswordField name="password" defaultVisible />        // 보이는 상태로 시작
```

| 동작                  | 결과                                                         |
| --------------------- | ------------------------------------------------------------ |
| 버튼 클릭             | 보기를 바꾸고 입력에 포커스를 둔다. 선택 범위가 그대로 남는다 |
| `Tab` 후 `Space`/`Enter` | 보기를 바꾸고 포커스는 버튼에 남는다                        |
| 폼 제출               | 다시 가린다                                                  |
| 폼 reset              | 다시 가린다                                                  |

- 버튼 이름은 항상 "비밀번호 표시"이고 `aria-pressed` 가 켜짐과 꺼짐을 알립니다. 아이콘은 눈과 가린 눈으로 바뀝니다.
- 버튼은 ghost `IconToggle` 입니다. 켜져도 배경을 채우지 않고 아이콘만 바뀝니다.
- 읽기 전용이어도 보기는 바꿀 수 있습니다. 비활성이면 바꿀 수 없습니다.

## Caps Lock

```tsx
<PasswordField name="password" />                       // 뒤에 자동으로 붙는다
<PasswordField name="password" hideCapsLock />          // 붙이지 않는다

<PasswordField name="password">
  <PasswordField.CapsLock label="Caps Lock is on" />    {/* 자리와 문구를 정한다 */}
  <PasswordField.Input />
</PasswordField>
```

- 키를 누르거나 입력을 누를 때마다 `getModifierState('CapsLock')` 으로 다시 읽습니다. 포커스가 떠나면 사라집니다.
- ⇪ 표시는 `aria-hidden` 이고 `title` 로 문구를 보여 줍니다. 알림은 항상 마운트된 `role="status"` 가 맡습니다.

## 자동 완성

```tsx
<PasswordField name="password" />         // autoComplete="current-password"
<PasswordField name="newPassword" />      // name 끝이 new-password, new_password, newPassword면 "new-password"
<PasswordField name="confirm" autoComplete="new-password" /> // 이름으로 알 수 없으면 직접 준다
```

- 기본으로 `spellCheck={false}`, `autoCapitalize="none"`, `autoCorrect="off"` 입니다.
- 브라우저가 비밀번호 입력에 그리는 자체 보기 버튼(Edge)은 숨깁니다.

## 조립

```tsx
<PasswordField name="password">
  <LockClosedIcon />                      {/* Input 앞 = 앞쪽 */}
  <PasswordField.Input />
  <PasswordField.Clear />                 {/* 값이 있을 때만. Escape도 지운다 */}
  <PasswordField.VisibilityToggle />      {/* 직접 두면 자동 버튼을 대신한다 */}
</PasswordField>

<PasswordField.VisibilityToggle asChild>
  <Button variant="ghost">보기</Button>    {/* 직접 그린 버튼은 자기 글자로 이름을 갖는다 */}
</PasswordField.VisibilityToggle>

<PasswordField.VisibilityToggle>
  {(state) => (state.visible ? <LockOpenIcon /> : <LockClosedIcon />)} {/* 아이콘 바꾸기 */}
</PasswordField.VisibilityToggle>
```

## 상태

| 속성                                          | 뜻                                           |
| --------------------------------------------- | -------------------------------------------- |
| `data-visible`                                | 비밀번호가 보인다                            |
| `data-focused`, `data-filled`                 | 포커스가 필드 안에 있다, 값이 있다           |
| `data-invalid`, `data-disabled`, `data-readonly` | 오류, 비활성, 읽기 전용                   |
| `data-size`, `data-variant`                   | 크기와 variant                               |

- 테두리 컨테이너(`data-password-field`)에 붙습니다. `className` 과 `style` 은 이 상태를 받는 함수도 됩니다.

## 속성 우선순위

```tsx
<PasswordField name="a" onChange={root}>
  <PasswordField.Input name="b" onChange={input} />
</PasswordField>
// name="b": 값은 Input > root > asChild 자식
// onChange: 자식, root, Input 순서로 모두 실행 (Field와 RHF가 root에 건 핸들러 유지)
// type과 autoComplete 기본값은 합친 결과로 계산해 마지막에 적용
```

## react-hook-form + Zod

```tsx
import { PasswordField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z
  .object({ password: z.string().min(8, '8자 이상 입력하세요.'), confirmation: z.string() })
  .refine((v) => v.password === v.confirmation, {
    path: ['confirmation'],
    message: '비밀번호가 일치하지 않습니다.',
  });

<Field name="password" required>
  <Field.Label>새 비밀번호</Field.Label>
  <PasswordField autoComplete="new-password" />
  <Field.Error />
</Field>;
```

## 속성

| 속성                                     | 기본 / 동작                                                   |
| ---------------------------------------- | ------------------------------------------------------------- |
| `value` / `defaultValue`                 | native 그대로                                                 |
| `onValueChange`                          | `(value: string) => void`                                     |
| `visible` / `defaultVisible` / `onVisibleChange` | 보기 상태. 기본 `false`                               |
| `hideVisibilityToggle` / `hideCapsLock`  | 자동 파트를 숨긴다                                            |
| `variant`                                | `outline`(기본) / `soft` / `ghost`                            |
| `size`                                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard` |
| `invalid`                                | `aria-invalid` 와 danger 테두리. 명시한 `aria-invalid` 가 우선 |
| `className` / `style`                    | 컨테이너로 간다. 상태를 받는 함수도 된다                      |
| 그 외 native 속성, ref                    | 실제 input으로 간다                                           |

## 알아둘 것

- `name` 이 없으면 개발 빌드에서 경고합니다. 비밀번호 관리자는 이름으로 필드를 알아봅니다.
- `PasswordField.Input`, `VisibilityToggle`, `CapsLock` 을 둘 이상 두면 에러가 납니다.
- RHF `reset()` 은 값만 되돌립니다. 보기 상태까지 되돌리려면 `visible` 을 제어하거나 `key` 를 바꿉니다.
