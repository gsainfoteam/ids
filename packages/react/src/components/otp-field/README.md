# OTPField

인증 코드를 여러 native input에 나누어 표시합니다. 전체 값과 onChange는 **string**입니다.
IDS CSS, Tailwind 설정과 ThemeProvider가 필요합니다.

```tsx
import { Field, OTPField } from '@gsainfoteam/ids-react';

const [code, setCode] = useState('');
<Field>
  <Field.Label>인증 코드</Field.Label>
  <OTPField length={6} name="code" value={code} onChange={setCode} onComplete={verify} />
  <Field.Hint>6자리 코드를 입력하세요.</Field.Hint>
</Field>;
```

## 문자열과 편집 규칙

- length는 1–12 사이 정수이며 필수입니다. 기본 값은 빈 문자열입니다.
- value를 지정하면 controlled, 생략하면 defaultValue를 사용하는 uncontrolled입니다.
- numeric은 ASCII 숫자, alphanumeric은 ASCII 영숫자(대소문자 보존), RegExp는 한 문자에 적용합니다. 정규식의 g/y 상태는 사용하지 않습니다.
- 입력, 붙여넣기와 전달된 값은 NFKC 정규화 후 허용 문자를 추려 길이를 제한합니다. 전각 숫자를 입력할 수 있습니다. 문자의 위치는 Unicode code point 단위입니다.
- 일반 문자 입력은 현재 자리를 덮어쓰고 다음 칸으로 이동합니다. 값 앞에 빈 칸을 만들지 않으므로 아직 비어 있는 뒤쪽 칸에 입력하면 첫 빈 자리부터 채웁니다.
- **중간 삭제 시 뒤 문자를 왼쪽으로 당깁니다.** 예를 들어 `123456`의 세 번째 칸에서 Delete를 누르면 `12456`입니다. 공백 자리까지 보존하는 배열 모델은 아닙니다.
- Backspace는 현재 문자를 지우고 이전 칸으로 이동합니다. 현재 칸이 비어 있으면 바로 앞 문자를 지웁니다. Delete는 현재 칸을 지우고 포커스를 유지합니다.
- ←/→는 인접 칸, Home/End는 첫/마지막 칸입니다. Tab은 그룹을 나갑니다. 단일 Tab 진입점을 현재 칸으로 이동하는 방식입니다.
- 허용 문자 개수가 length 이상인 붙여넣기/자동완성은 **어느 칸에서든 전체 코드를 교체**합니다. 짧은 문자열은 현재 위치부터 덮어씁니다. 공백과 구분자 등 허용하지 않는 문자는 걸러냅니다.
- IME 조합 중에는 임시 문자열을 유지하고 값 콜백·이동을 보류합니다. 조합 종료 후 정규화합니다.
- onComplete는 사용자 편집으로 값이 달라지면서 모든 칸이 채워질 때 호출합니다. 동일한 완성 코드를 다시 붙이거나, 첫 렌더·외부 value 설정·reset을 할 때는 호출하지 않습니다. 완성 값을 편집해 다른 완성 코드가 되면 다시 호출합니다.
- onComplete는 후보 코드를 전달합니다. 서버 검증·중복 요청 방지·취소·재시도는 앱이 담당합니다.
- length/pattern 변경은 표시 값을 다시 정규화합니다. uncontrolled에서 잘린 문자는 설정을 되돌려도 되살아나지 않습니다. controlled 원본의 정리는 부모가 담당합니다.

## Slot과 Separator

```tsx
<OTPField length={6} value={code} onChange={setCode}>
  <OTPField.Slot index={0} />
  <OTPField.Slot index={1} />
  <OTPField.Slot index={2} />
  <OTPField.Separator />
  <OTPField.Slot index={3} />
  <OTPField.Slot index={4} />
  <OTPField.Slot index={5} />
</OTPField>
```

자식이 없으면 Slot을 자동 생성합니다. 명시 합성은 직접 자식 또는 Fragment의 Slot/Separator만 받습니다.
Slot은 정확히 length개, index는 DOM 순서대로 0부터 length−1까지 한 번씩 선언합니다.
임의의 wrapper 내부를 탐색하지 않습니다.

Slot asChild는 props/ref를 실제 input으로 전달하는 한 개의 자식을 받습니다. type/value/id/ARIA 위치 이름/tabIndex 등 입력 계약은 OTPField가 관리합니다.
Separator는 기본 `−`이고 aria-hidden 장식입니다. children/asChild로 외형을 바꿀 수 있습니다. 상호작용 요소로 만들지 마세요.
root native 속성은 Slot/asChild보다 우선하며 이벤트/ref는 child → Slot → root 순서로 합성합니다.
Slot onChange는 native 이벤트용이고 root onChange는 전체 문자열용입니다. 키보드로 처리되는 편집은 root onChange를 기준으로 구독하세요.

## 접근성·폼·자동완성

- role=group과 그룹 이름을 제공하고, 각 칸은 native input입니다. 기본 그룹 이름은 `인증 코드`이며 aria-label 또는 Field.Label로 바꿀 수 있습니다.
- Field.Label은 첫 input의 id와 연결되어 클릭 시 포커스를 옮깁니다. 각 칸에는 그룹 라벨과 `1 / 6` 같은 위치 이름을 연결하고 설명·오류·required를 전달합니다.
- ref는 **첫 번째 HTMLInputElement**입니다. RHF 오류 포커스 등에 사용할 수 있지만 `.value`는 첫 칸 문자 하나입니다. 전체 코드는 value/onChange 또는 FormData를 사용하세요.
- name은 전체 문자열을 담는 hidden input에만 지정하므로 네이티브 FormData가 코드 한 개를 제출합니다. disabled면 제외합니다.
- onBlur는 그룹 밖으로 나갈 때 호출합니다. 칸 사이 이동으로 RHF touched 상태를 만들지 않습니다.
- 첫 input의 기본 autoComplete는 one-time-code, 나머지는 off입니다. numeric에는 inputMode=numeric을 제공합니다. autoComplete/inputMode를 명시하면 우선합니다.
- SMS 자동완성을 위한 HTML 힌트와 전체 값 입력 이벤트를 처리합니다. WebOTP API로 SMS를 요청하지 않으며 실제 OS·자동완성 제공자의 동작은 기기에서 확인해야 합니다.
- mask는 type=password로 각 칸을 가립니다. 값 자체나 폼 제출 내용을 암호화하는 기능이 아닙니다.
- disabled는 편집·이동을 막습니다. readOnly는 편집을 막되 칸 이동과 복사는 허용합니다.
- uncontrolled native form.reset은 defaultValue로 복원합니다. 취소한 reset은 유지합니다. controlled reset은 부모의 value 갱신을 따릅니다.

## 속성

| 속성                       | 기본 / 동작                                                    |
| -------------------------- | -------------------------------------------------------------- |
| length                     | 필수, 정수 1–12                                                |
| value / defaultValue       | string / 빈 문자열                                             |
| onChange / onComplete      | 전체 문자열 콜백                                               |
| pattern                    | numeric / alphanumeric / RegExp, 기본 numeric                  |
| variant                    | outline / filled / underline, 기본 outline                     |
| size                       | 명시 값 → Field → standard. standard 40px/18px, tiny 32px/14px |
| mask / disabled / readOnly | false                                                          |
| invalid                    | 명시적인 aria-invalid(Field 포함)가 우선                       |
| className / style          | 그룹 표면, 개별 입력 스타일은 Slot에 지정                      |
| id / ref                   | 첫 native input의 id/ref                                       |
| name / form                | 전체 문자열의 네이티브 폼 제출                                 |
| Slot props                 | index 필수, native input에서 관리 속성 제외, asChild           |
| Separator props            | native span 속성, children, asChild                            |

기존 전역 standard/tiny와 danger fallback을 유지합니다. 12칸 등 넓은 입력은 가용 너비에 따라 줄바꿈합니다.

## React Hook Form + Zod

각 input을 register로 개별 바인딩하지 말고 **controlMode="value"**를 사용하세요.

```tsx
import { OTPField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ code: z.string().length(6, '6자리 코드를 입력하세요.') });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { code: '' } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(verify)}>
    <Field name="code" controlMode="value" required>
      <Field.Label>인증 코드</Field.Label>
      <OTPField length={6} />
      <Field.Error />
    </Field>
    <button type="submit">검증</button>
    <button type="button" onClick={() => methods.reset()}>
      초기화
    </button>
  </form>
</FormProvider>;
```

이 방식은 전체 문자열의 Zod 검증, 오류 초점, setValue/reset과 disabled 제출 제외를 지원합니다.
기본 패키지 export는 RHF를 로드하지 않습니다.
