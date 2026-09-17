# NumberField

숫자 상태(`number | null`), 증감, 포맷을 제공하는 입력입니다. `ThemeProvider`, IDS CSS와
Tailwind 설정이 필요합니다. 빈 입력과 아직 숫자가 완성되지 않은 `-`, `.`는 숫자 값으로 null을 전달하고,
입력 문자열은 편집이 끝날 때까지 유지합니다.

```tsx
import { Field, NumberField } from '@gsainfoteam/ids-react';

const [length, setLength] = useState<number | null>(0.1);
<Field>
  <Field.Label>길이</Field.Label>
  <NumberField value={length} onChange={setLength} min={-1} max={1} step={0.1} largeStep={0.5}>
    <NumberField.Input />
    <span aria-hidden="true">cm</span>
    <NumberField.Clear />
    <NumberField.Stepper />
  </NumberField>
  <Field.Hint>cm 단위로 입력하세요.</Field.Hint>
</Field>;
```

## 값과 범위

- `value`를 지정하면 controlled, 생략하면 `defaultValue`(기본 null)를 사용하는 uncontrolled입니다. NaN/Infinity는 받지 않습니다.
- `onChange`는 숫자 또는 null을 받습니다. `onChange`의 인자는 DOM 이벤트가 아닙니다.
- `1.`, `-0.`, `1.20`처럼 편집 중인 문자열을 보존합니다. 포커스를 잃거나 Enter를 누르면 포맷을 정리합니다.
- `min`/`max` 밖의 숫자도 **편집 중에는 onChange로 전달**됩니다. blur, Enter, 증감 시 범위 안으로 제한합니다. 즉시 자르면 `min={10}`에서 `12`를 입력하는 과정의 `1`을 유지할 수 없기 때문입니다.
- `step`은 증감량이며 기본 1입니다. 입력값을 step 배수에 맞춰 반올림하지 않습니다. 정수 여부 등의 검증은 폼 스키마에서 처리합니다.
- ↑/↓는 step, Shift+↑/↓ 및 PageUp/PageDown은 largeStep(기본 step × 10)입니다. Home/End, 선택·복사·붙여넣기 같은 기본 텍스트 편집 키는 유지합니다.
- 빈 값에서 증감하면 0에서 시작해 한 step을 이동합니다. 0이 범위 밖이면 먼저 가까운 경계값으로 이동합니다.
- 증감과 기본 largeStep 계산은 십진 표현으로 처리하여 `0.1 + 0.2`, `0.07 × 10`의 추가 연산 오차를 줄입니다. 최종 값은 JS number이므로 JS 숫자 정밀도 한계는 그대로 적용됩니다.
- 전달된 controlled/default 값은 렌더만으로 임의 수정하거나 onChange를 발생시키지 않습니다. 범위 제한은 위의 사용자 동작 시점에 적용합니다.

## 포맷과 입력

`formatOptions`는 Intl.NumberFormat 옵션을 받습니다. `locale` 기본값은 SSR 환경과 일치하도록
명시적인 `en-US`입니다. 한국어 표기는 `locale="ko-KR"`를 지정합니다.

```tsx
<NumberField
  defaultValue={1234.567}
  locale="de-DE"
  formatOptions={{ style: 'currency', currency: 'EUR' }}
/>;
// 표시 1.234,57 € → focus 시 1234,567; 실제 숫자의 정밀도는 유지

<NumberField
  defaultValue={0.125}
  min={0}
  max={1}
  step={0.01}
  formatOptions={{ style: 'percent', minimumFractionDigits: 1 }}
/>;
// 표시 12.5% → focus 시 원래 값 0.125로 편집
```

- 포맷은 blur 상태의 표시와 aria-valuetext에 적용합니다. 표시용 반올림은 실제 값에 반영하지 않습니다.
- 옵션을 생략하면 최대 21자리 유효숫자로 표시해 작은 소수가 기본 포맷에서 0으로 사라지지 않게 합니다. 옵션을 지정하면 Intl의 기본 정밀도와 지정 옵션을 따릅니다.
- 입력 중에는 구분선/통화 없이 원래 숫자를 편집합니다. 현재 locale의 소수 구분자를 사용합니다. 백분율도 원래 숫자(예: 0.125)로 편집합니다.
- 그룹 구분자, 공백, 현재 포맷의 통화·단위 기호, 회계식 음수 괄호, 현지 숫자 및 전각 숫자를 정제합니다. 백분율 포맷에서는 `25%`를 붙여 넣으면 0.25가 됩니다.
- `1e3`, `1K`, 임의의 문자, 여러 소수점 등 의미를 확정할 수 없는 문자열은 거부하고 직전 숫자로 돌아갑니다. scientific/compact 옵션은 **표시**에 사용할 수 있지만 입력은 완전한 십진수로 합니다. 알 수 없는 글자를 무조건 제거해 `1e3`을 13으로 바꾸지 않습니다.
- 조합 중인 IME 문자열은 그대로 유지하고 조합 종료 후 정제합니다. 조합 중 방향키를 증감으로 가로채지 않습니다.

## 합성 및 props

| 속성                                             | 기본값 / 동작                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------------- |
| `variant`                                        | outline / filled / unstyled. unstyled도 키보드 포커스 표시 유지             |
| `size`                                           | 명시 값 → Field → standard. standard / tiny                                 |
| `min`, `max`                                     | 제한 없음. 둘 다 있으면 min ≤ max                                           |
| `step`, `largeStep`                              | 1 / step × 10. 양수이면서 유한한 숫자                                       |
| `hideStepper`                                    | false. 자동 Stepper만 숨김; 명시적인 Stepper는 선언 위치에 표시             |
| `disabled`, `readOnly`                           | 입력·Stepper·Clear의 변경 동작 차단                                         |
| `invalid`                                        | standalone 상태. 명시적인 aria-invalid(Field 포함)가 우선                   |
| `incrementLabel`, `decrementLabel`, `clearLabel` | Increase value / Decrease value / Clear value. 앱 언어에 맞춰 변경 가능     |
| `className`, `style`                             | 바깥 표면. 입력 자체의 스타일은 NumberField.Input에 지정                    |
| `ref`, `id`, ARIA 및 native 이벤트               | 실제 HTMLInputElement에 전달                                                |
| `name`, `form`                                   | 숨김 입력이 정규화된 숫자 문자열을 제출. 빈 값은 빈 문자열, disabled는 제외 |

- 자식이 없으면 Input과 자동 Stepper를 생성합니다. 자식이 있으면 직접 자식 또는 Fragment에 Input을 정확히 하나 배치합니다.
- Input 앞은 lead, 뒤는 trail입니다. 임의의 DOM/사용자 컴포넌트 내부는 탐색하지 않습니다.
- 직접 선언한 Stepper는 자동 Stepper를 대체합니다. Stepper도 한 번만 직접 선언합니다.
- root의 native 속성이 Input/asChild보다 우선합니다. 이벤트/ref는 asChild → Input → root 순서로 합성하며, preventDefault된 이벤트의 후속 핸들러는 생략합니다.
- Input의 value/defaultValue/type/role/수치 ARIA는 컴포넌트가 관리합니다. 숫자 값·범위·상태는 root에 선언하세요. Input의 onChange는 native 이벤트용이며 root onChange와 다릅니다.
- Input asChild는 props/ref를 실제 input으로 전달하는 한 개의 input 또는 사용자 컴포넌트를 받습니다.
- Stepper asChild는 생성된 두 버튼을 담을 한 개의 비상호작용 wrapper를 받습니다. 기존 wrapper children은 생성 버튼으로 대체합니다.
- Clear는 값 또는 중간 문자열이 있을 때만 표시합니다. 기본은 null로 지우고 입력에 다시 포커스합니다. `onClear`를 제공하면 기본 지우기를 대체하므로 값 변경도 호출자가 수행합니다. Clear asChild는 button으로 렌더되는 자식을 받습니다.

## 실제 DOM과 폼

포맷된 문자열, 소수 구분자 및 중간 문자열을 담기 위해 실제 입력은 **type="text" + role="spinbutton"**입니다.
휠 이벤트로 숫자가 변하지 않으며 페이지의 휠 스크롤을 막지 않습니다. aria-valuenow/min/max/valuetext를 제공합니다.
텍스트 입력의 valueAsNumber나 native stepUp/stepDown은 숫자 API로 사용할 수 없습니다.
`required`, `maxLength`, `autoComplete`, `onBlur`, `onInput` 등은 텍스트 입력의 native 동작을 따릅니다.
HTML number의 stepMismatch/rangeOverflow 검증 대신 컴포넌트의 보정·ARIA와 앱 폼 검증을 사용하세요.

숫자용 name은 숨김 입력에만 있으므로 네이티브 FormData가 `1.234,50 €` 같은 표시 문자열을 제출하지 않습니다.
RHF는 아래 값 콜백 어댑터를 사용합니다. native register 모드로 직접 바인딩하지 마세요.
Uncontrolled 네이티브 form.reset은 defaultValue로 복원합니다. Controlled reset은 부모가 value를 변경해야 합니다.
직접 input.value를 대입하는 방식보다 value/onChange로 제어하세요.

## React Hook Form + Zod

```tsx
import { NumberField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  quantity: z
    .number()
    .nullable()
    .refine(
      (value) => value != null && Number.isInteger(value) && value >= 1 && value <= 20,
      '1–20 사이 정수를 입력하세요.',
    ),
});
const methods = useForm({
  resolver: zodResolver(schema),
  defaultValues: { quantity: null as number | null },
});

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(save)}>
    <Field name="quantity" controlMode="value" required>
      <Field.Label>수량</Field.Label>
      <NumberField min={1} max={20} />
      <Field.Error />
    </Field>
    <button type="submit">제출</button>
    <button type="button" onClick={() => methods.reset()}>
      초기화
    </button>
  </form>
</FormProvider>;
```

RHF defaultValues는 **number 또는 null**로 지정하세요. 기본 Field export는 RHF를 불러오지 않습니다.
value 모드에서 rules 또는 resolver로 검증하며 valueAsNumber 변환은 필요하지 않습니다.

설계 참고: [WAI-ARIA Spinbutton 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/),
[Intl formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/formatToParts).
