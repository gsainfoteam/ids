# DateField

- `Calendar` 팝업으로 날짜를 고르는 필드. 텍스트 입력과 파싱은 없다
- 값은 로컬 날짜 `Date`. `range` / `multiple` 선택도 된다
- `format` 패턴이나 Intl 옵션으로 표시 형식을 정한다
- `Field`, react-hook-form(`controlMode="value"`)과 연결된다

```tsx
import { useState } from 'react';
import { DateField, Field } from '@gsainfoteam/ids-react';

function BookingDate() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <Field>
      <Field.Label>예약 날짜</Field.Label>
      <DateField name="date" value={date} onChange={setDate} locale="ko-KR" />
    </Field>
  );
}
```

## 선택 모드

```tsx
<DateField value={date} onChange={setDate} />                           // single(기본): 고르면 닫힌다
<DateField selectionMode="range" value={range} onChange={setRange} />   // DateRange | null. 열린 채 유지
<DateField selectionMode="multiple" value={dates} onChange={setDates} /> // Date[]. 열린 채 유지
// range 표시는 "시작 – 끝"(end 전이면 "시작 – …"), multiple은 두 개까지 보이고 나머지는 "+n"
```

- 기간, 제한, 표시 월은 [Calendar](../calendar/README.md)와 같다

```tsx
<DateField
  min={new Date(2026, 0, 1)}
  max={new Date(2026, 11, 31)}
  disabled={(date) => date.getDay() === 0} // true면 열기, 선택, Clear 모두 차단
  monthsToShow={2}
  weekStartsOn={1}
  today={new Date(2026, 8, 15)}
/>
```

## 표시 형식

```tsx
<DateField locale="ko-KR" />                    // 기본: locale의 숫자 연월일
<DateField format="yyyy-MM-dd" />               // 2026-09-15
<DateField format="yyyy년 M월 d일" />           // 한글, 구두점은 그대로
<DateField format="EEE, MMM d" />               // Tue, Sep 15
<DateField format="'Due' MMM d" />              // 영문 리터럴은 작은따옴표로 감싼다. ''는 따옴표 하나
<DateField format={{ dateStyle: 'long' }} />    // Intl.DateTimeFormatOptions. 시간, timeZone 옵션은 오류
// 토큰: yyyy yy / MMMM MMM MM M / dd d / EEEE EEE. 그 밖의 영문자는 오류
```

## 폼 제출

```tsx
<DateField name="date" />                          // "2026-09-15" 또는 ""
<DateField name="trip" selectionMode="range" />    // "2026-09-15/2026-09-20", end 전이면 "2026-09-15/"
<DateField name="days" selectionMode="multiple" /> // 날짜마다 같은 name으로 반복
<DateField name="date" disabled />                 // 제출에서 빠진다
```

## 합성

```tsx
<DateField value={date} onChange={setDate}>
  <DateField.Trigger>
    <CalendarDaysIcon />
    <DateField.Value />                  {/* 선택 값 또는 placeholder */}
  </DateField.Trigger>
  <DateField.Clear />                    {/* Trigger의 형제로 둔다. 값이 없으면 렌더링하지 않는다 */}
  <DateField.Content />                  {/* children을 주면 기본 Calendar를 대체한다 */}
</DateField>
// Trigger, Value, Content, Clear는 asChild를 지원한다. 각각 하나까지
```

## React Hook Form + Zod

```tsx
import { DateField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({
  date: z.date().nullable().refine(Boolean, '날짜를 선택하세요.'),
});
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { date: null } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(save)}>
    <Field name="date" controlMode="value" required> {/* Date 값을 그대로 연결 */}
      <Field.Label>예약 날짜</Field.Label>
      <DateField />
      <Field.Error />                                 {/* 오류 시 Trigger로 포커스 */}
    </Field>
  </form>
</FormProvider>;
// range는 start와 end가 모두 있는지 검증한다. multiple의 defaultValues는 []
```

## 속성

| 속성                                  | 기본 / 동작                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `selectionMode`                       | `single`(기본) / `range` / `multiple`                |
| `value` / `defaultValue` / `onChange` | 모드별 타입. 생략하면 uncontrolled, 기본 `null` / `[]` |
| `format`                              | locale 숫자 연월일. 패턴 문자열 또는 Intl 옵션       |
| `placeholder`                         | `날짜 선택`                                          |
| `mobileVariant`                       | `popover`(기본) / `drawer`. 640px 미만에서 하단 팝업 |
| `variant`                             | `outline`(기본) / `soft` / `ghost`              |
| `size`                                | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`  |
| `invalid`                             | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선  |
| `readOnly`                            | 열기, 선택, Clear 차단                               |
| `min` / `max` / `disabled` 등         | `Calendar`로 전달                                    |
| `className` / `style`                 | 필드 표면으로 간다                                   |
| 그 외 native 속성, `ref`, `autoFocus` | 실제 Trigger 버튼으로 간다                           |

## 알아둘 것

- 값은 로컬 날짜 `Date`이고 `format`은 표시에만 쓴다. 외부 값을 파싱하거나 min/max로 자르지 않는다.
- 제출 문자열은 UTC 변환 없이 로컬 날짜로 만든다.
- Escape, 닫기 버튼, Trigger 재클릭, 바깥 클릭으로 닫아도 이미 고른 값은 유지된다. Clear는 값을 비우고 Trigger로 포커스를 돌린다.
- Trigger에서 `ArrowDown`으로도 연다. 열리면 선택한 날짜(없으면 오늘)에 포커스하고 키보드는 `Calendar`와 같다.
- `drawer`는 비모달이다. 배경 스크롤 잠금과 포커스 트랩이 없다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로 되돌리고 팝업을 닫는다. controlled 값은 부모가 되돌린다.
- `required`는 ARIA 표시만 한다. native constraint validation은 없으므로 스키마로 검증한다.
