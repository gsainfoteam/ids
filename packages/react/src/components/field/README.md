# Field

한 개의 입력에 라벨, 설명, 도움말과 오류를 연결합니다. SSR에서도 첫 HTML부터
`htmlFor`, `aria-labelledby`, `aria-describedby`가 생성됩니다.

```tsx
import { Field, TextField } from '@gsainfoteam/ids-react';

<Field required invalid={!!error} size="standard">
  <Field.Label>이메일</Field.Label>
  <Field.Description>로그인에 사용합니다.</Field.Description>
  <TextField type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  <Field.Hint>회사 이메일을 권장합니다.</Field.Hint>
  <Field.Error>{error}</Field.Error>
</Field>;
```

`ThemeProvider`와 IDS CSS가 필요합니다. 입력과 anatomy는 Field의 직접 자식으로
배치하세요. Fragment는 지원하지만 임의의 DOM wrapper 내부나 사용자 컴포넌트 내부를
탐색하지는 않습니다. 직접 자식 입력은 native input/select/textarea 또는 전달받은
`id`, ARIA, 상태, 이벤트, ref를 실제 입력으로 전달하는 합성 컴포넌트여야 합니다.
복합 위젯의 그룹 라벨링은 해당 위젯이 맡습니다.

## API

| Prop                                                | 기본값 / 동작                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `variant`                                           | `vertical`; `horizontal`은 라벨을 왼쪽 열에 배치                        |
| `size`                                              | `standard`; `tiny` 지원. `useFieldSize` 컨텍스트를 통해 전달            |
| `invalid`                                           | 기본 false. 입력의 `aria-invalid=true`도 반영. 명시한 boolean이 우선    |
| `disabled`                                          | 입력 상태를 상속. 명시한 boolean이 우선                                 |
| `required`                                          | 입력 상태를 상속. 명시 시 native required + aria-required + 시각적 별표 |
| `id`                                                | 입력 ID의 기본값. 입력 자신의 id가 우선. root에는 `${id}-root` 사용     |
| `name`                                              | 일반 Field에서는 native name만 전달                                     |
| `aria-label`, `aria-labelledby`, `aria-describedby` | 입력으로 전달. 기존 ID 목록은 중복 없이 병합                            |
| 그 밖의 div 속성, ref                               | root div로 전달                                                         |

- Label이 있으면 그 ID를 입력의 `aria-labelledby`에 추가합니다. Label 대신 `aria-label`이나 `aria-labelledby`도 사용할 수 있습니다.
- `Hint`와 `Error`를 함께 선언할 수 있습니다. invalid일 때 Error, 아니면 Hint만 DOM에 남습니다.
- Description/Hint/Error가 제거되거나 교체되면 ARIA 참조도 같은 렌더에서 갱신됩니다.
- 각 anatomy는 최대 한 개씩 선언하세요. 입력 개수·이름 누락·중복 anatomy를 소스 개발 모드에서 경고합니다.
- 각 anatomy는 해당 native element 속성 및 `asChild`를 지원합니다. Label의 기본 요소는 label, 나머지는 div입니다. `asChild`에는 ref와 DOM 속성을 전달하는 요소 하나가 필요합니다. Label 클릭으로 포커스하려면 label을 유지하세요.
- Field는 입력의 value/onChange를 수동 모드에서 관리하지 않습니다. 다른 폼 라이브러리의 props를 그대로 연결할 수 있습니다.
- 현재 TextField가 size 컨텍스트를 사용합니다. 입력의 명시적 size와 TextFieldGroup의 기존 크기 규칙이 Field보다 우선합니다. 새 IDS 입력은 `useFieldSize(size)`를 사용하세요. native input의 숫자 size 속성은 변경하지 않습니다.

## 선택형 react-hook-form 연동

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';
import { TextField, Button } from '@gsainfoteam/ids-react';
import { FormProvider, useForm } from 'react-hook-form';

function Signup() {
  const methods = useForm({ defaultValues: { account: { email: '' } } });
  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(console.log)}>
        <Field name="account.email" required registerOptions={{ required: '이메일을 입력하세요.' }}>
          <Field.Label>이메일</Field.Label>
          <TextField type="email" />
          <Field.Hint>회사 이메일을 권장합니다.</Field.Hint>
          <Field.Error />
        </Field>
        <Button type="submit">제출</Button>
        <Button type="button" onClick={() => methods.reset()}>
          초기화
        </Button>
      </form>
    </FormProvider>
  );
}
```

`react-hook-form@^7.62.0`은 **optional peer**입니다. 위 subpath를 사용할 때 앱에
설치하세요. 기본 import는 RHF를 로드하지 않습니다. subpath의 Field는 FormProvider와
name이 있을 때 자동 연결하고, 없으면 일반 wrapper로 동작합니다. name만 있는 경우는
개발 중 경고합니다. 기본 export가 설치 여부를 비동기 탐지하지는 않습니다.

| controlMode     | 연결 계약                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `native` (기본) | `register(name, registerOptions)`. native 이벤트 + DOM ref. TextField, native checkbox/select/file 등. defaultValues/reset, register 변환 옵션 지원 |
| `value`         | `useController`. value + onChange(event 또는 값) + onBlur + ref. NumberField 등 값 콜백형 합성 입력에 사용                                          |
| `checked`       | `useController`. checked + onChange(event 또는 boolean) + onBlur + ref. 합성 Checkbox/Switch에 사용                                                 |

controlled 모드는 RHF가 값의 소유자입니다. 자식의 value/checked/defaultValue/defaultChecked보다
FormProvider.defaultValues와 RHF 상태가 우선합니다. 두 모드에서 자식 이벤트 핸들러를 먼저
실행하고 RHF 핸들러도 실행하며 ref는 합성합니다. 같은 입력을 다시 register하거나 Controller로
이중 등록하지 마세요. controlled의 값 변환은 콜백 또는 resolver에서 처리하며
`valueAsNumber`, `valueAsDate`, `setValueAs` 옵션은 native 모드에서만 지원합니다.

오류는 `getFieldState`/`useController`로 중첩 경로까지 읽고, 자식이 없는 Field.Error에
메시지를 표시합니다. `invalid={false}`로 자동 오류 상태를 명시적으로 덮어쓸 수 있습니다.
`disabled`는 formState.disabled가 우선하며, 그 밖에는 Field prop/registerOptions.disabled 순서로 결정됩니다.
제출 값에서 제외해야 하는 비활성 입력은 자식 대신 Field에 disabled를 지정하세요.
`required`는 접근성·native 제약 표시이며 RHF 검증은 registerOptions나 resolver에 명시합니다.

## 현재 명세와의 차이

- Notion의 Hint/Error 동시 선언 경고는 상태별 표시 전환 예제와 모순되어 경고하지 않습니다. 실제 중복 anatomy만 경고합니다.
- RHF 선택 설치와 동기 FormProvider 자동 감지를 함께 보장하기 위해 import subpath를 분리했습니다.
- size는 main의 standard/tiny를 유지합니다. 색상은 main 토큰을 사용하며 미정인 danger 토큰은 `--ids-field-danger`로 조정할 수 있습니다. 기본 fallback은 light `#b42318`, dark `#fda29b`입니다. 디자인 확정 토큰은 후속 반영합니다.
- 미병합 Slot PR을 복제하지 않고 기존 mergeProps/cloneElement를 사용합니다.
- 현 main TextField 및 native 입력과 검증했습니다. 미병합 sentinel TextField, 아직 없는 Select 등은 최종 입력으로 prop/ref를 전달하는 계약을 충족해야 합니다.

## 검증

`pnpm --filter @gsainfoteam/ids-react test`는 빌드된 배포 파일을 대상으로
SSR/ARIA, 상태 전환, native/controlled RHF, reset, ref cleanup 회귀 테스트를 실행합니다.
Storybook의 Field 예제는 클릭 포커스와 RHF 제출 play 함수를 포함합니다.

## Zod resolver

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  account: z.object({
    email: z
      .string()
      .trim()
      .min(1, '이메일을 입력하세요.')
      .email('이메일 형식을 확인하세요.')
      .transform((value) => value.toLowerCase()),
  }),
});
const methods = useForm({
  resolver: zodResolver(schema),
  defaultValues: { account: { email: '' } },
});
// FormProvider 내부: Field에 검증 규칙을 다시 지정할 필요가 없습니다.
<Field name="account.email" required>
  <Field.Label>이메일</Field.Label>
  <TextField inputMode="email" />
  <Field.Error />
</Field>;
```

위 Field는 `/react-hook-form` 경로에서 import합니다. 앱이 `zod`와
`@hookform/resolvers`를 설치해야 하며 IDS 런타임 의존성에는 추가되지 않습니다.
[공식 resolver 사용법](https://github.com/react-hook-form/resolvers#zod)에 따라
`useForm`에서 resolver를 설정합니다. 변환된 출력 타입이 입력과 다르면
`useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`로 명시할 수 있습니다.

`Components/Field/Zod` Storybook 예제와 배포 파일 대상 회귀 테스트는 중첩 native 입력,
controlled 입력의 필드 간 refine 오류, checkbox, 오류 포커스·설명, 제출 시 정규화,
reset을 검증합니다. 공백/대소문자 변환은 제출 결과에 적용되고 입력창의 원문은 유지됩니다.
검증 버전은 lockfile에 고정합니다.
