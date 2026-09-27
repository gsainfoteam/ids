# DateTimeField

달력과 시계를 한 팝업에 놓고 날짜와 시각을 함께 고르는 입력입니다.

- **값은 `Date` 하나.** 달력에서 날을 바꾸면 시각이, 시계에서 시각을 바꾸면 날짜가 그대로 남습니다.
- **경계는 날짜와 시각을 합친 순간.** `min` 이 15일 09:30 이면 15일에는 09:30 부터, 16일부터는 하루 종일 고를 수 있습니다. 고를 시각이 하나도 없는 날은 막힙니다.
- **폼.** 오프셋 없는 로컬 문자열 `2026-09-15T14:30` 을 FormData에 넣고, `required` 인데 비어 있으면 브라우저가 제출을 막습니다.
- **react-hook-form, TanStack Form.** `controlMode="value"` 나 `value` / `onValueChange` 로 Date 값을 그대로 주고받습니다.

```tsx
import { DateTimeField, Field } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>회의 일시</Field.Label>
  <DateTimeField name="when" value={when} onValueChange={setWhen} step={15} />
</Field>;
```

## 날짜와 시각

```tsx
<DateTimeField value={new Date(2026, 8, 15, 14, 30)} onValueChange={setWhen} />
// 달력에서 20일 → 2026-09-20 14:30
// 시계에서 9시  → 2026-09-15 09:30
// 새 날에 그 시각이 없으면(제한, 간격, 서머타임) 가장 가까운 시각으로 맞춘다

<DateTimeField value={null} today={new Date(2026, 8, 15)} />
// 비어 있으면 시계에 선택 표시가 없다. 시각부터 고르면 today 의 그 시각이 된다
```

- 고르는 동안 팝업은 열려 있습니다. `Esc` 나 바깥 클릭으로 닫습니다.
- 시계에서 `Delete` 를 누르거나 Clear 를 누르면 값 전체가 `null` 이 됩니다.

## 제한

```tsx
<DateTimeField
  min={new Date(2026, 8, 15, 9, 30)} // 날짜와 시각을 합친 경계. 양 끝 포함
  max={new Date(2026, 8, 20, 18, 0)}
  disabled={(date) => date.getDay() === 0} // 날짜별로 막는다. true 면 필드 전체
  step={30} // 고를 시각이 하나도 없는 날은 막힌다
/>
```

- 막힌 날을 보고 있으면 시계가 막히고 `고를 수 있는 날짜를 먼저 고르세요.` 가 나옵니다.

## 표시 형식

```tsx
<DateTimeField />                                              // ko-KR: 2026. 09. 15. 오후 02:30
<DateTimeField format="yyyy년 M월 d일 HH:mm" />               // 2026년 9월 15일 14:30
<DateTimeField format="EEE, MMM d 'at' h:mm a" hourCycle="12h" locale="en-US" />
```

- 날짜 토큰 `yyyy` `yy` / `MMMM` `MMM` `MM` `M` / `dd` `d` / `EEEE` `EEE` 와 시각 토큰 `HH` `H` / `hh` `h` / `mm` `m` / `ss` `s` / `a` 를 씁니다.
- 달력 옵션(`monthsToShow`, `captionLayout`, `weekStartsOn`, `month`, `today`)은 [Calendar](../../data/calendar/README.md), 시계 옵션(`precision`, `step`, `hourCycle`, `pickerVariant`)은 [TimePicker](../../data/time-picker/README.md) 와 같습니다.

## 폼

```tsx
<DateTimeField name="when" required />            {/* when=2026-09-15T14:30 */}
<DateTimeField name="when" precision="second" />  {/* when=2026-09-15T14:30:05 */}
```

- UTC로 바꾸지 않은 로컬 문자열입니다. 비어 있으면 FormData에 항목이 없습니다.
- reset 은 팝업을 닫고 `defaultValue` 로 돌아갑니다. `onValueChange` 는 부르지 않습니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="when" controlMode="value" registerOptions={{ required: '일시를 고르세요' }}>
  <Field.Label>회의 일시</Field.Label>
  <DateTimeField hourCycle="24h" />
  <Field.Error />
</Field>;
```

## 합성과 상태

- `DateTimeField.Trigger`, `Value`, `Clear`, `Content` 와 부분 규칙은 [DateField](../date-field/README.md#합성) 와 같습니다. `Content` 의 기본은 달력과 시계입니다.
- `DateTimeField.State` 와 `data-*` 는 [DateField](../date-field/README.md#상태) 와 같습니다.

## 속성

| 속성                                             | 기본 / 동작                         |
| ------------------------------------------------ | ----------------------------------- |
| `value` / `defaultValue` / `onValueChange`       | `Date \| null`. 기본 `null`         |
| `open` / `defaultOpen` / `onOpenChange`          | 팝업 열림                           |
| `min` / `max`                                    | 날짜와 시각을 합친 경계             |
| `disabled`                                       | `true` 면 필드 전체, 함수면 날짜별  |
| `format` / `hourCycle`                           | locale 형식 / locale 시간제         |
| `precision` / `step` / `pickerVariant`           | `minute` / `1` / `grid`             |
| `today`                                          | 마운트한 날. 비어 있을 때의 기준 날 |
| `locale`                                         | `ko-KR`                             |
| `placeholder`                                    | `날짜와 시간 선택`                  |
| `name` / `form` / `required`                     | 숨은 값 입력과 브라우저 검증        |
| `readOnly`                                       | 열기, 고르기, Clear 를 막는다       |
| `invalid` / `variant` / `size` / `mobileVariant` | DateField 와 같다                   |
| 그 외 native 속성, `ref`                         | Trigger `button` 으로 간다          |

## 알아둘 것

- 넓은 화면에서는 달력 옆에 시계가, 640px 보다 좁은 화면에서는 아래에 놓입니다.
- 서머타임으로 없는 시각은 고를 수 없고, 두 번 있는 시각은 `Date` 의 이른 오프셋을 씁니다. 시간대를 구분해야 하면 앱에서 따로 정합니다.
- 바깥에서 준 값은 제한에 맞춰 고치지 않습니다. 고를 때 정밀도보다 작은 단위와 밀리초는 0이 됩니다.
- 서버 렌더링 결과를 클라이언트와 맞추려면 `today` 를 고정합니다.
