# PasswordField

Native input과 비밀번호 표시 전환 버튼을 합성합니다. IDS CSS, Tailwind 설정과 ThemeProvider가 필요합니다.

```tsx
import { Field, PasswordField } from '@gsainfoteam/ids-react';

<Field required>
  <Field.Label>로그인 비밀번호</Field.Label>
  <PasswordField name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
  <Field.Hint>비밀번호를 입력하세요.</Field.Hint>
</Field>;
```

## 값·표시·포커스

- native value/defaultValue/onChange와 ref를 실제 input에 전달합니다. onChange는 DOM 이벤트입니다.
- 기본 type은 password이고 토글 시 같은 DOM의 type만 text로 전환합니다. 값, name, 자동완성 속성과 선택 범위를 유지하며 onChange나 submit을 발생시키지 않습니다.
- 포인터 클릭은 입력에 포커스를 두고 커서 선택을 유지합니다. Tab으로 버튼에 이동한 뒤 Space/Enter로 전환하면 버튼 포커스가 유지됩니다.
- 버튼은 type=button, aria-controls, aria-pressed 및 상태에 따른 `비밀번호 표시` / `비밀번호 숨기기` 라벨을 가집니다.
- disabled는 입력과 토글을 비활성화합니다. readOnly는 값 편집만 막고 표시 전환은 허용합니다.
- native form.reset은 기본값으로 복원하고 숨김 상태로 돌아갑니다. 취소한 reset은 유지합니다. RHF reset은 값을 복원하며, 표시 상태도 초기화하려면 앱에서 컴포넌트 key를 변경할 수 있습니다.
- 브라우저의 자동완성과 비밀번호 매니저가 사용할 수 있도록 native input/name/autoComplete를 유지합니다. 개별 매니저의 실제 동작은 환경에 따라 별도 확인해야 합니다.

## 자동완성과 합성

명시한 autoComplete가 우선입니다. 생략하면 name의 마지막 경로가 new-password, new_password 또는 newPassword일 때 new-password, 나머지는 current-password입니다.
가입/확인 입력처럼 이름만으로 의도를 알 수 없는 경우 `autoComplete="new-password"`를 지정하세요.
name이 없으면 개발 빌드에서 진단 메시지를 표시합니다. 폼 의도를 DOM 주변 문구로 추측하지 않습니다.

```tsx
<PasswordField name="new-password">
  <LockIcon />
  <PasswordField.Input />
  <PasswordField.VisibilityToggle />
</PasswordField>;

<PasswordField name="password" hideVisibilityToggle />;
```

자식이 없으면 Input과 VisibilityToggle을 자동 생성합니다. 자식이 있으면 직접 자식 또는 Fragment에 Input을 정확히 하나 선언합니다. 앞은 lead, 뒤는 trail입니다.
직접 선언한 VisibilityToggle은 자동 토글을 대체합니다. hideVisibilityToggle은 자동 토글만 숨기므로 명시한 토글도 숨기려면 조건부 렌더하세요.
임의의 DOM이나 사용자 컴포넌트 내부를 탐색하지 않습니다.

Input asChild는 props/ref를 실제 input으로 전달하는 한 개의 자식을 받습니다. type은 내부에서 관리합니다.
VisibilityToggle asChild는 button으로 렌더되는 자식을 받습니다. 자식 내용은 유지하며 버튼 역할·라벨·pressed·클릭 동작을 연결합니다.
root native 속성이 Input/asChild 속성보다 우선합니다. 이벤트와 ref는 child → Input → root 순서로 합성합니다. 토글의 사용자 onClick에서 preventDefault하면 전환을 취소합니다.

## 속성

| 속성                                   | 기본 / 동작                                                    |
| -------------------------------------- | -------------------------------------------------------------- |
| variant                                | outline / filled / unstyled, 기본 outline                      |
| size                                   | 명시 값 → Field → standard. standard / tiny                    |
| invalid                                | standalone 오류 상태, 명시적인 aria-invalid(Field 포함)가 우선 |
| hideVisibilityToggle                   | false. 자동 버튼만 숨김                                        |
| className / style                      | 바깥 표면. 실제 입력 스타일은 Input에 지정                     |
| id / ref / name / ARIA / native 이벤트 | 실제 input에 전달                                              |
| Input props                            | native input에서 type/size 제외, asChild 추가                  |
| VisibilityToggle props                 | native button 및 asChild. type/ARIA 상태는 내부 관리           |

전역 size와 기존 danger fallback 계약을 유지합니다. 강도 추정은 앱에서 계산해 Field.Hint와 합성하세요.

## React Hook Form + Zod

```tsx
import { PasswordField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z
  .object({
    password: z.string().min(8, '8자 이상 입력하세요.'),
    confirmation: z.string(),
  })
  .refine((v) => v.password === v.confirmation, {
    path: ['confirmation'],
    message: '비밀번호가 일치하지 않습니다.',
  });
const methods = useForm({
  resolver: zodResolver(schema),
  defaultValues: { password: '', confirmation: '' },
});

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
    <button type="submit">제출</button>
  </form>
</FormProvider>;
```

기본 native 등록 모드를 사용합니다. 값 변환이나 controlMode=value는 필요하지 않습니다.
기본 패키지 export는 RHF를 로드하지 않습니다. 위 길이/일치 규칙은 예제이며 앱의 비밀번호 정책은 앱에서 정합니다.
