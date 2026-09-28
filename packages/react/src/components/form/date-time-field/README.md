# DateTimeField

달력과 시계를 한 팝업에 놓고 날짜와 시각을 함께 고르는 입력입니다.

- **값은 `CalendarDateTime` 하나.** [`@internationalized/date`](https://react-spectrum.adobe.com/internationalized/date/CalendarDateTime.html) 의 시간대 없는 벽시계 날짜와 시각입니다. 달력에서 날을 바꾸면 시각이, 시계에서 시각을 바꾸면 날짜가 그대로 남습니다.
- **경계는 날짜와 시각을 합친 순간.** `min` 이 15일 09:30 이면 15일에는 09:30 부터, 16일부터는 하루 종일 고를 수 있습니다. 고를 시각이 하나도 없는 날은 막힙니다.
- **폼.** 오프셋 없는 로컬 문자열 `2026-09-15T14:30` 을 FormData에 넣고, `required` 인데 비어 있으면 브라우저가 제출을 막습니다.
- **react-hook-form, TanStack Form.** `controlMode="value"` 나 `value` / `onValueChange` 로 `CalendarDateTime` 값을 그대로 주고받습니다.

```tsx
import { CalendarDateTime } from '@internationalized/date';
import { DateTimeField, Field } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>회의 일시</Field.Label>
  <DateTimeField name="when" value={when} onValueChange={setWhen} step={15} />
</Field>;
```

## 날짜와 시각

```tsx
<DateTimeField value={new CalendarDateTime(2026, 9, 15, 14, 30)} onValueChange={setWhen} />
// 달력에서 20일 → 2026-09-20T14:30
// 시계에서 9시  → 2026-09-15T09:30
// 새 날에 그 시각이 없으면(제한, 간격) 가장 가까운 허용 시각으로 맞춘다

<DateTimeField value={null} today={new CalendarDate(2026, 9, 15)} />
// 비어 있으면 시계에 선택 표시가 없다. 시각부터 고르면 today 의 그 시각이 된다
```

- 값을 만들려면 앱도 `@internationalized/date` 를 설치합니다. IDS 는 다시 내보내지 않습니다.
- 값은 모양(`year` ~ `millisecond`, `calendar.identifier`, `compare`)으로 검사합니다. 다른 버전의 패키지여도 되고, `Date` 는 오류입니다. 그레고리력만 받습니다.
- `today`, `month`, `defaultMonth`, `onMonthChange` 는 [Calendar](../../data/calendar/README.md) 와 같이 `CalendarDate` 입니다.
- 벽시계 값이라 서머타임으로 없는 시각이 없습니다. 모든 시각을 고를 수 있고, 특정 시간대의 순간이 필요하면 앱에서 `toZoned(value, timeZone)` 으로 바꿉니다.

- 고르는 동안 팝업은 열려 있습니다. `Esc` 나 바깥 클릭으로 닫습니다.
- 시계에서 `Delete` 를 누르거나 Clear 를 누르면 값 전체가 `null` 이 됩니다.

## 제한

```tsx
<DateTimeField
  min={new CalendarDateTime(2026, 9, 15, 9, 30)} // 날짜와 시각을 합친 경계. 양 끝 포함
  max={new CalendarDateTime(2026, 9, 20, 18, 0)}
  disabled={{ dayOfWeek: [0] }} // 날짜별로 막는 DateMatcher. true 면 필드 전체
  step={30} // 고를 시각이 하나도 없는 날은 막힌다
/>
```

- 막힌 날을 보고 있으면 시계가 막히고 `고를 수 있는 날짜를 먼저 고르세요.` 가 나옵니다.
- 달력에는 `min` / `max` 의 날짜(`toCalendarDate`)가 가고, 시계에는 경계일에만 `Time` 한도(`toTime`)가 갑니다. 그 사이의 날은 하루 종일입니다.
- 밀리초가 있는 `min`(09:30:00.500)은 다음 초(09:30:01)부터입니다. 그 날에 남는 시각이 없으면 그 날이 막힙니다.
- `disabled` 와 `modifiers` 는 [Calendar](../../data/calendar/README.md#제한) 의 `DateMatcher` 이고, `renderDay` 도 [Calendar](../../data/calendar/README.md#날짜-칸-꾸미기) 와 같습니다.

## 표시 형식

```tsx
<DateTimeField />                                    // ko-KR: 2026. 09. 15. 오후 2:30
<DateTimeField hourCycle="24h" />                    // 2026. 09. 15. 14:30
<DateTimeField locale="en-US" />                     // 09/15/2026, 2:30 PM
<DateTimeField locale="de-DE" />                     // 15.09.2026, 14:30
<DateTimeField format={{ dateStyle: 'long', timeStyle: 'short' }} hourCycle="24h" />  // 2026년 9월 15일 14:30
<DateTimeField format={(value, locale) => `${value.month}/${value.day} ${value.hour}시`} />  // 함수
```

- 기본 글자는 [DateField](../date-field/README.md#표시-형식) 의 날짜 옵션과 [TimeField](../time-field/README.md#표시-형식) 의 시각 옵션을 합친 한 Intl 형식입니다. 날짜와 시각을 잇는 글자(`, `)도 locale 이 정합니다.
- `format` 은 Intl 옵션이나 `(value: CalendarDateTime, locale) => string` 입니다. `format="12h"` / `"24h"` 는 받지 않고, 시간제는 `hourCycle` 입니다.
- 표시는 값을 UTC 의 같은 벽시계 시각에 놓고 `timeZone: 'UTC'` 로 그립니다. 로컬 시간대가 날짜나 시각을 밀지 못합니다.
- 달력 옵션(`monthsToShow`, `captionLayout`, `weekStartsOn`, `month`, `today`)은 [Calendar](../../data/calendar/README.md), 시계 옵션(`precision`, `step`, `hourCycle`, `pickerVariant`)은 [TimePicker](../../data/time-picker/README.md) 와 같습니다.

## 폼

```tsx
<DateTimeField name="when" required />            {/* when=2026-09-15T14:30 */}
<DateTimeField name="when" precision="second" />  {/* when=2026-09-15T14:30:05 */}
```

- 오프셋 없는 벽시계 문자열이고 precision 만큼 씁니다. 비어 있으면 FormData에 항목이 없습니다.
- reset 은 팝업을 닫고 `defaultValue` 로 돌아갑니다. `onValueChange` 는 부르지 않습니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="when" controlMode="value" registerOptions={{ required: '일시를 고르세요' }}>
  <Field.Label>회의 일시</Field.Label>
  <DateTimeField hourCycle="24h" />
  <Field.Error />
</Field>;

const schema = z.object({
  when: z.custom<CalendarDateTime>((value) => value instanceof CalendarDateTime, '일시를 고르세요'),
});
```

- 제출 값은 `CalendarDateTime` 입니다. FormData 문자열은 `name` 을 준 숨은 입력에만 들어갑니다.

## 합성과 상태

- `DateTimeField.Trigger`, `Value`, `Clear`, `Content` 와 부분 규칙은 [DateField](../date-field/README.md#합성) 와 같습니다. `Content` 의 기본은 달력과 시계입니다.
- `DateTimeField.State` 와 `data-*` 는 [DateField](../date-field/README.md#상태) 와 같습니다.

## 속성

| 속성                                             | 기본 / 동작                            |
| ------------------------------------------------ | -------------------------------------- |
| `value` / `defaultValue` / `onValueChange`       | `CalendarDateTime \| null`. 기본 `null` |
| `open` / `defaultOpen` / `onOpenChange`          | 팝업 열림                              |
| `min` / `max`                                    | `CalendarDateTime`. 합친 경계          |
| `disabled`                                       | `true` 면 필드 전체, `DateMatcher` 면 날짜별 |
| `format`                                         | locale 날짜와 시각. Intl 옵션이나 함수 |
| `hourCycle`                                      | locale 시간제. `12h` / `24h`           |
| `precision` / `step` / `pickerVariant`           | `minute` / `1` / `grid`                |
| `today`                                          | `CalendarDate`. 비어 있을 때의 기준 날 |
| `locale`                                         | `ko-KR`. BCP 47 태그                   |
| `placeholder`                                    | `날짜와 시간 선택`                     |
| `name` / `form` / `required`                     | 숨은 값 입력과 브라우저 검증           |
| `readOnly`                                       | 열기, 고르기, Clear 를 막는다          |
| `invalid` / `variant` / `size` / `mobileVariant` | DateField 와 같다                      |
| 그 외 native 속성, `ref`                         | Trigger `button` 으로 간다             |

## 알아둘 것

- 넓은 화면에서는 달력 옆에 시계가, 640px 보다 좁은 화면에서는 아래에 놓입니다.
- 시계는 값의 시각을 `Time` 으로 [TimePicker](../../data/time-picker/README.md) 에 넘깁니다.
- 바깥에서 준 값은 제한에 맞춰 고치지 않습니다. 고를 때 정밀도보다 작은 단위와 밀리초는 0이 됩니다.
- 서버 렌더링 결과를 클라이언트와 맞추려면 `today` 를 고정합니다.
