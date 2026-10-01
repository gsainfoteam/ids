# TimeField

누르면 시계가 열리고, 고른 시각을 필드에 보여 주는 시간 입력입니다.

- **locale 시간제.** 한국어는 `오후 2:30`, 미국 영어는 `2:30 PM`, 독일어는 `14:30` 처럼 브라우저의 `Intl`(CLDR)을 따라 보이고, 시계도 같은 시간제로 열립니다. `hourCycle` 로 바꿉니다. `locale` 은 BCP 47 태그라 어떤 언어든 import 없이 됩니다.
- **간격과 범위.** `step` 으로 15분 단위처럼 끊고 `min` / `max` 밖은 고를 수 없습니다.
- **키보드.** Trigger에서 `↓` 로 열면 첫 컬럼에 포커스가 가고, 숫자를 치거나 방향키로 옮겨 Enter로 고릅니다.
- **폼.** `name` 을 주면 `14:30` 이 FormData에 들어가고, `required` 인데 비어 있으면 브라우저가 제출을 막습니다. `reset` 은 `defaultValue` 로 되돌립니다.
- **react-hook-form, TanStack Form.** `controlMode="value"` 나 `value` / `onValueChange` 로 `Time` 값을 그대로 주고받습니다.

```tsx
import { Time } from '@internationalized/date';
import { Field, TimeField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>알람</Field.Label>
  <TimeField name="alarm" value={time} onValueChange={setTime} step={15} />
</Field>;
```

## 값

```tsx
<TimeField value={time} onValueChange={setTime} />   // Time | null. Clear 나 시계의 Delete 는 null
<TimeField defaultValue={new Time(9, 30)} />         // 비제어
```

- 값은 [`@internationalized/date`](https://react-spectrum.adobe.com/internationalized/date/Time.html) 의 `Time` 입니다. 앱도 이 패키지를 설치해 값을 만듭니다. IDS 는 다시 내보내지 않습니다.
- 값은 모양(`hour`, `minute`, `second`, `millisecond`, `compare`)으로 검사합니다. 다른 버전의 패키지여도 되고, `Date` 는 오류입니다.

- 시각을 골라도 팝업은 열려 있습니다. 시와 분을 이어서 고르고 `Esc` 나 바깥 클릭으로 닫습니다.

## 표시 형식

```tsx
<TimeField />                                   // ko-KR: 오후 2:30
<TimeField hourCycle="24h" />                   // 14:30. 시계도 24시간제
<TimeField locale="en-US" />                    // 2:30 PM
<TimeField locale="ja-JP" hourCycle="12h" />    // 午後2:30
<TimeField precision="hour" />                  // 오후 2시
<TimeField format={{ hour: '2-digit', minute: '2-digit' }} />   // Intl 옵션. 오후 02:30
<TimeField format={{ timeStyle: 'short' }} hourCycle="24h" />   // hourCycle 이 옵션에도 간다
<TimeField format={(time, locale) => `${time.hour}시`} />       // 함수
```

- 기본 글자는 precision 에 맞춘 `{ hour: 'numeric', minute: '2-digit', second: '2-digit' }` 에 시간제를 더한 Intl 형식입니다.
- `format` 은 [`Intl.DateTimeFormatOptions`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options) 나 `(time, locale) => string` 입니다. date-fns 패턴 문자열과 `format="12h"` / `"24h"` 는 받지 않습니다.
- 시간제는 `hourCycle` 하나로 정합니다. 없으면 locale 의 CLDR 시간제입니다.
- `hourCycle` 은 시(`hour`, `timeStyle`)를 보여 주면서 `hour12` / `hourCycle` 을 정하지 않은 `format` 옵션에도 들어갑니다.

## 시계 옵션

```tsx
<TimeField precision="second" step={10} />                    // 시·분·초, 초는 10초 간격
<TimeField min={new Time(9)} max={new Time(18)} />           // 양 끝 포함
<TimeField pickerVariant="wheel" />                          // 스크롤해서 멈춘 자리를 고르는 휠
```

- 단위, 간격, 키보드는 [TimePicker](../../data/time-picker/README.md) 와 같습니다.

## 폼

```tsx
<form>
  <TimeField name="alarm" required /> {/* alarm=14:30 */}
  <TimeField name="alarm" precision="hour" /> {/* alarm=14 */}
  <TimeField name="alarm" precision="second" /> {/* alarm=14:30:05 */}
  <button type="reset">초기화</button>
</form>
```

- 비어 있으면 FormData에 항목이 없고, `required` 면 브라우저가 제출을 막은 뒤 Trigger로 포커스를 옮깁니다.
- reset 은 팝업을 닫고 `defaultValue` 로 돌아갑니다. `onValueChange` 는 부르지 않습니다.
- `disabled` 면 제출에서 빠집니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="alarm" controlMode="value" registerOptions={{ required: '시간을 고르세요' }}>
  <Field.Label>알람</Field.Label>
  <TimeField hourCycle="24h" />
  <Field.Error /> {/* 오류가 나면 Trigger 로 포커스가 간다 */}
</Field>;

const schema = z.object({
  alarm: z.custom<Time>((value) => value instanceof Time, '시간을 고르세요'),
});
```

- 제출 값은 `Time` 입니다. FormData 문자열(`14:30`)은 `name` 을 준 숨은 입력에만 들어갑니다.

## 합성

```tsx
<TimeField value={time} onValueChange={setTime}>
  <TimeField.Trigger>
    <ClockIcon />
    <TimeField.Value /> {/* 값이나 placeholder(시간 선택) */}
  </TimeField.Trigger>
  <TimeField.Clear />
  <TimeField.Content>{/* 기본은 TimePicker */}</TimeField.Content>
</TimeField>
```

- 부분 규칙과 `asChild` 는 [DateField](../date-field/README.md#합성) 와 같습니다.

## 상태

- `TimeField.State` 는 `value`, `open`, `empty`, `invalid`, `disabled`, `readOnly`, `required` 입니다. `className` 과 `style` 은 이 상태를 받는 함수도 됩니다.
- 필드 표면에는 `data-open`, `data-empty`, `data-invalid`, `data-disabled`, `data-readonly`, `data-required`, `data-size`, `data-variant` 가 붙습니다.

## 속성

| 속성                                       | 기본 / 동작                                             |
| ------------------------------------------ | ------------------------------------------------------- |
| `value` / `defaultValue` / `onValueChange` | `Time \| null`. 기본 `null`                             |
| `open` / `defaultOpen` / `onOpenChange`    | 팝업 열림                                               |
| `format`                                   | locale 시각. Intl 옵션이나 `(time, locale) => string`   |
| `hourCycle`                                | locale 시간제. `12h` / `24h`. 표시와 시계 모두          |
| `precision` / `step` / `min` / `max`       | `minute` / `1`. `min` / `max` 는 `Time`. 시계로 간다    |
| `pickerVariant`                            | `grid`(기본) / `wheel`                                  |
| `locale`                                   | `ko-KR`. BCP 47 태그                                    |
| `placeholder`                              | `시간 선택`                                             |
| `name` / `form` / `required`               | 숨은 값 입력과 브라우저 검증                            |
| `disabled` / `readOnly`                    | 열기, 고르기, Clear 를 막는다                           |
| `invalid`                                  | danger 테두리와 링. Field 의 `aria-invalid` 가 우선     |
| `variant` / `size` / `mobileVariant`       | `outline` / `standard` / `popover`                      |
| `className` / `style`                      | 필드 표면. 상태를 받는 함수도 된다                      |
| 그 외 native 속성, `ref`                   | Trigger `button` 으로 간다                              |

## 알아둘 것

- 시간대 변환은 없습니다. 값은 날짜 없는 벽시계 시각이고, 표시는 UTC 의 한 날에 놓고 `timeZone: 'UTC'` 로 그려서 로컬 시간대가 글자를 바꾸지 못합니다.
- 오전/오후 이름과 표시 글자는 런타임의 `Intl` 데이터입니다. 서버(Node)와 브라우저의 ICU 가 다르면 글자가 조금 다를 수 있습니다.
- BCP 47 태그가 아닌 `locale`(date-fns `Locale` 객체, `'de_DE'`)은 오류입니다.
- `drawer` 는 modal 입니다. 뒤 화면을 어둡게 가리고 스크롤을 잠그며, 포커스를 sheet 안에 둡니다. 배경을 누르거나 Escape 로 닫으면 포커스가 필드로 돌아갑니다.
- 팝업이 남은 화면보다 길면 안에서 스크롤하고, 위나 아래에 내용이 더 남은 가장자리를 흐립니다([ScrollArea `fade="y"`](../../layout/scroll-area/README.md#가장자리-흐림)).
