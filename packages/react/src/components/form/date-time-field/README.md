# DateTimeField

- `Calendar`와 `TimePicker`를 한 팝업에 놓고 로컬 날짜와 시각을 고르는 필드
- 값은 `Date | null` 하나. 날짜를 바꾸면 시각을, 시각을 바꾸면 날짜를 유지한다
- 오프셋 없는 로컬 문자열(`2026-09-15T14:30`)로 제출한다
- `Field`, react-hook-form(`controlMode="value"`)과 연결된다

```tsx
import { useState } from 'react';
import { DateTimeField, Field } from '@gsainfoteam/ids-react';

function Meeting() {
  const [when, setWhen] = useState<Date | null>(null);
  return (
    <Field>
      <Field.Label>회의 일시</Field.Label>
      <DateTimeField name="when" value={when} onChange={setWhen} hourCycle="24h" step={15} />
    </Field>
  );
}
```

## 날짜와 시각 보존

```tsx
<DateTimeField value={new Date(2026, 8, 15, 14, 30)} onChange={setWhen} />
// 달력에서 20일을 고르면 2026-09-20 14:30. 시각을 유지한다
// 시계에서 9시를 고르면 2026-09-15 09:30. 날짜를 유지한다
// 새 날짜에서 그 시각이 제한, 간격, DST 때문에 안 되면 가장 가까운 허용 시각으로 맞춘다

<DateTimeField value={null} today={new Date(2026, 8, 15)} />
// 빈 값에서 시각부터 고르면 today의 00:00을 기준으로 시작한다. today가 범위 밖이면 날짜를 먼저 고른다
```

## 제한

```tsx
<DateTimeField
  min={new Date(2026, 8, 15, 9, 30)}        // 날짜와 시각을 포함한 전체 경계. 양 끝 포함
  max={new Date(2026, 8, 20, 18, 0)}        // 시각 제한은 첫날과 마지막 날에만 걸린다
  disabled={(date) => date.getDay() === 0}  // 날짜별 선택 차단. true면 전체 차단
  precision="minute"
  step={15}                                 // 허용 시각이 하나도 없는 날은 비활성화된다
/>
```

- 달력 옵션(`monthsToShow`, `weekStartsOn`, `month`/`defaultMonth`/`onMonthChange`, `today`)은 [Calendar](../calendar/README.md)와 같다
- 시각 단위는 [TimePicker](../time-picker/README.md)와 같다

## 표시 형식

```tsx
<DateTimeField locale="ko-KR" />                          // 기본: locale의 숫자 연월일과 시각
<DateTimeField format="24h" />                            // 09/15/2026, 14:30
<DateTimeField format="yyyy년 M월 d일 HH:mm" />           // 2026년 9월 15일 14:30
<DateTimeField format="EEE, MMM d 'at' h:mm a" hourCycle="12h" /> // 패턴은 표시 전용. picker 시간제는 hourCycle로
// 날짜 토큰 yyyy yy / MMMM MMM MM M / dd d / EEEE EEE, 시간 토큰 HH H / hh h / mm m / ss s / a
```

## 폼 제출

```tsx
<DateTimeField name="when" />                       // "2026-09-15T14:30". 값이 없으면 ""
<DateTimeField name="when" precision="second" />    // "2026-09-15T14:30:05"
<DateTimeField name="when" disabled />              // 제출에서 빠진다
// 오프셋 없는 로컬 문자열이다. UTC로 바꾸지 않는다
```

## 합성

```tsx
<DateTimeField value={when} onChange={setWhen}>
  <DateTimeField.Trigger>
    <CalendarDaysIcon />
    <DateTimeField.Value />         {/* 선택 값 또는 placeholder("날짜와 시간 선택") */}
  </DateTimeField.Trigger>
  <DateTimeField.Clear />           {/* Trigger의 형제로 둔다. 값이 없으면 렌더링하지 않는다 */}
  <DateTimeField.Content />         {/* children을 주면 기본 Calendar + TimePicker를 대체한다 */}
</DateTimeField>
```

## React Hook Form + Zod

```tsx
import { DateTimeField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({ when: z.date().nullable().refine(Boolean, '일시를 선택하세요.') });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { when: null } });

<Field name="when" controlMode="value" required>
  <Field.Label>회의 일시</Field.Label>
  <DateTimeField hourCycle="24h" />
  <Field.Error />                   {/* 오류 시 Trigger로 포커스 */}
</Field>;
```

## 속성

| 속성                                  | 기본 / 동작                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `value` / `defaultValue` / `onChange` | `Date \| null`. 생략하면 uncontrolled                |
| `min` / `max`                         | 날짜와 시각을 포함한 전체 경계                       |
| `disabled`                            | `true`면 전체 차단, 함수면 날짜별 선택 차단          |
| `readOnly`                            | 열기, 변경, Clear 차단                               |
| `format`                              | locale 형식. `12h` / `24h` 또는 표시 패턴            |
| `hourCycle`                           | `format`의 `12h`/`24h`, 없으면 locale. picker 시간제 |
| `precision` / `step`                  | `minute` / `1`                                       |
| `pickerVariant`                       | `grid`(기본) / `wheel`                               |
| `today`                               | 마운트 시점. 빈 값의 기준 날짜                       |
| `locale`                              | `en-US`                                              |
| `mobileVariant`                       | `popover`(기본) / `drawer`. 모바일에서 세로 배치     |
| `variant`                             | `outline`(기본) / `soft` / `ghost`              |
| `size`                                | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`  |
| `invalid`                             | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선  |
| `className` / `style`                 | 필드 표면으로 간다                                   |
| 그 외 native 속성, `ref`, `autoFocus` | 실제 Trigger 버튼으로 간다                           |

## 알아둘 것

- 날짜나 시각을 골라도 팝업은 열려 있다. Escape, 닫기 버튼, Trigger 재클릭, 바깥 클릭으로 닫아도 고른 값은 유지된다. Clear는 값을 비우고 Trigger로 포커스를 돌린다.
- 외부 `value`는 제한에 맞춰 고치지 않는다. 고를 때 정밀도보다 작은 단위와 밀리초는 0이 된다.
- DST로 존재하지 않는 시각은 고를 수 없고, 두 번 있는 시각은 native `Date`의 이른 오프셋을 쓴다. 시간대, 오프셋 선택은 없으므로 반복 시각을 구분해야 하면 앱에서 시간대 정책을 따로 둔다.
- SSR과 클라이언트의 기준 날짜를 맞추려면 `today`를 고정한다.
- `drawer`는 비모달이다. 배경 스크롤 잠금과 포커스 트랩이 없다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로 되돌리고 팝업을 닫는다. controlled 값은 부모가 되돌린다.
- `required`는 ARIA 표시만 한다. native constraint validation은 없으므로 스키마로 검증한다.
