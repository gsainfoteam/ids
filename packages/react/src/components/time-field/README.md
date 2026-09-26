# TimeField

`TimePicker` 팝업으로 시각을 고르는 필드. 텍스트 입력과 파싱은 없다.

```tsx
import { useState } from 'react';
import { Field, TimeField } from '@gsainfoteam/ids-react';

function Alarm() {
  const [time, setTime] = useState<Date | null>(null);
  return (
    <Field>
      <Field.Label>알람</Field.Label>
      <TimeField name="alarm" value={time} onChange={setTime} hourCycle="24h" step={15} />
    </Field>
  );
}
```

## 값과 제한

```tsx
<TimeField value={time} onChange={setTime} />
// value의 날짜는 유지하고 시각만 바꾼다. 빈 값이면 2000-01-01 기준. Clear는 null

<TimeField precision="second" step={10} />                             // precision, step은 TimePicker와 같다
<TimeField min={new Date(0, 0, 1, 9)} max={new Date(0, 0, 1, 18)} />   // 로컬 시각만 비교, 자정을 넘는 범위는 불가
<TimeField selectionMode="none" />                                     // 팝업을 열어 탐색만
```

단위와 간격 규칙은 [TimePicker](../time-picker/README.md)를 본다.

## 표시 형식

```tsx
<TimeField locale="ko-KR" />                      // 기본: locale 형식과 시간제
<TimeField format="24h" />                        // 14:30
<TimeField format="12h" />                        // 02:30 PM
<TimeField format="a h:mm" hourCycle="12h" />     // 문자열 패턴은 표시에만 쓴다. picker 시간제는 hourCycle로
<TimeField format="HH'h' mm'm'" />                // 영문 리터럴은 작은따옴표. ''는 따옴표 하나
<TimeField format="24h" hourCycle="12h" />        // hourCycle이 우선한다
// 토큰: HH H(24시간) / hh h(12시간) / mm m / ss s / a. 날짜 토큰은 DateTimeField에서만
```

## 폼 제출

```tsx
<TimeField name="alarm" precision="hour" />     // "14"
<TimeField name="alarm" />                      // "14:30"
<TimeField name="alarm" precision="second" />   // "14:30:05". 값이 없으면 ""
<TimeField name="alarm" disabled />             // 제출에서 빠진다
```

## 합성

```tsx
<TimeField value={time} onChange={setTime} pickerVariant="wheel">
  <TimeField.Trigger>
    <ClockIcon />
    <TimeField.Value />             {/* 선택 값 또는 placeholder("시간 선택") */}
  </TimeField.Trigger>
  <TimeField.Clear />               {/* Trigger의 형제로 둔다. 값이 없으면 렌더링하지 않는다 */}
  <TimeField.Content />             {/* children을 주면 기본 TimePicker를 대체한다 */}
</TimeField>
// Trigger, Value, Content, Clear는 asChild를 지원한다. 각각 하나까지
```

## React Hook Form + Zod

```tsx
import { TimeField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({ alarm: z.date().nullable().refine(Boolean, '시간을 선택하세요.') });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { alarm: null } });

<Field name="alarm" controlMode="value" required>
  <Field.Label>알람</Field.Label>
  <TimeField hourCycle="24h" />
  <Field.Error />                   {/* 오류 시 Trigger로 포커스 */}
</Field>;
```

## 속성

| 속성                                  | 기본 / 동작                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `value` / `defaultValue` / `onChange` | `Date \| null`. 생략하면 uncontrolled                |
| `format`                              | locale 형식. `12h` / `24h` 또는 표시 패턴            |
| `hourCycle`                           | `format`의 `12h`/`24h`, 없으면 locale. picker 시간제 |
| `precision` / `step` / `min` / `max`  | `minute` / `1`. `TimePicker`로 전달                  |
| `locale`                              | `en-US`                                              |
| `pickerVariant`                       | `grid`(기본) / `wheel`                               |
| `selectionMode`                       | `single`(기본) / `none`                              |
| `placeholder`                         | `시간 선택`                                          |
| `mobileVariant`                       | `popover`(기본) / `drawer`. 640px 미만에서 하단 팝업 |
| `variant`                             | `outline`(기본) / `filled` / `unstyled`              |
| `size`                                | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`  |
| `invalid`                             | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선  |
| `disabled` / `readOnly`               | 열기, 변경, Clear 차단                               |
| `className` / `style`                 | 필드 표면으로 간다                                   |
| 그 외 native 속성, `ref`, `autoFocus` | 실제 Trigger 버튼으로 간다                           |

## 알아둘 것

- 시각을 골라도 팝업은 열려 있다. Escape, 닫기 버튼, Trigger 재클릭, 바깥 클릭으로 닫아도 고른 값은 유지된다. Clear는 값을 비우고 Trigger로 포커스를 돌린다.
- Trigger에서 `ArrowDown`으로도 연다. 열리면 첫 컬럼에 포커스한다.
- `onBlur`는 포커스가 팝업 안으로 옮겨갈 때는 발생하지 않는다.
- 시간대 변환은 없다. 값은 로컬 시각이다.
- `drawer`는 비모달이다. 배경 스크롤 잠금과 포커스 트랩이 없다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로 되돌리고 팝업을 닫는다. controlled 값은 부모가 되돌린다.
- `required`는 ARIA 표시만 한다. native constraint validation은 없으므로 스키마로 검증한다.
