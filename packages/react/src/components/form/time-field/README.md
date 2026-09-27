# TimeField

누르면 시계가 열리고, 고른 시각을 필드에 보여 주는 시간 입력입니다.

- **locale 시간제.** 한국어는 `오후 02:30`, 독일어는 `14:30` 처럼 보이고, 시계도 같은 시간제로 열립니다. `format` 과 `hourCycle` 로 바꿉니다.
- **간격과 범위.** `step` 으로 15분 단위처럼 끊고 `min` / `max` 밖은 고를 수 없습니다.
- **키보드.** Trigger에서 `↓` 로 열면 첫 컬럼에 포커스가 가고, 숫자를 치거나 방향키로 옮겨 Enter로 고릅니다.
- **폼.** `name` 을 주면 `14:30` 이 FormData에 들어가고, `required` 인데 비어 있으면 브라우저가 제출을 막습니다. `reset` 은 `defaultValue` 로 되돌립니다.
- **react-hook-form, TanStack Form.** `controlMode="value"` 나 `value` / `onValueChange` 로 Date 값을 그대로 주고받습니다.

```tsx
import { Field, TimeField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>알람</Field.Label>
  <TimeField name="alarm" value={time} onValueChange={setTime} step={15} />
</Field>;
```

## 값

```tsx
<TimeField value={time} onValueChange={setTime} />
// 날짜는 그대로 두고 시각만 바꾼다. Clear 나 시계의 Delete 는 null

<TimeField referenceDate={meetingDay} />   // 비어 있을 때 시각을 붙일 날. 기본 오늘
<TimeField defaultValue={new Date(2026, 8, 15, 9, 30)} />   // 비제어
```

- 시각을 골라도 팝업은 열려 있습니다. 시와 분을 이어서 고르고 `Esc` 나 바깥 클릭으로 닫습니다.

## 표시 형식

```tsx
<TimeField />                                  // ko-KR: 오후 02:30
<TimeField format="24h" />                     // 14:30. 시계도 24시간제
<TimeField format="12h" locale="en-US" />      // 02:30 PM
<TimeField format="a h:mm" hourCycle="12h" />  // 패턴은 글자만 바꾼다. 시계 시간제는 hourCycle
<TimeField format="HH'h' mm'm'" />             // 14h 30m. 영문은 작은따옴표로 감싼다
```

- 토큰은 `HH` `H`(24시간) / `hh` `h`(12시간) / `mm` `m` / `ss` `s` / `a` 입니다. 날짜 토큰은 [DateTimeField](../date-time-field/README.md) 에서만 됩니다.
- `hourCycle` 이 `format` 의 `12h` / `24h` 보다 먼저입니다. 둘 다 없으면 locale 을 따릅니다.

## 시계 옵션

```tsx
<TimeField precision="second" step={10} />                    // 시·분·초, 초는 10초 간격
<TimeField min={new Date(0, 0, 1, 9)} max={new Date(0, 0, 1, 18)} />   // 시각만 비교
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
```

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
| `value` / `defaultValue` / `onValueChange` | `Date \| null`. 기본 `null`                             |
| `open` / `defaultOpen` / `onOpenChange`    | 팝업 열림                                               |
| `format`                                   | locale 형식. `12h` / `24h` 또는 패턴                    |
| `hourCycle`                                | `format` 의 `12h` / `24h`, 없으면 locale. 시계의 시간제 |
| `precision` / `step` / `min` / `max`       | `minute` / `1`. 시계로 간다                             |
| `referenceDate`                            | 오늘. 비어 있을 때 시각을 붙일 날                       |
| `pickerVariant`                            | `grid`(기본) / `wheel`                                  |
| `locale`                                   | `ko-KR`                                                 |
| `placeholder`                              | `시간 선택`                                             |
| `name` / `form` / `required`               | 숨은 값 입력과 브라우저 검증                            |
| `disabled` / `readOnly`                    | 열기, 고르기, Clear 를 막는다                           |
| `invalid`                                  | danger 테두리와 링. Field 의 `aria-invalid` 가 우선     |
| `variant` / `size` / `mobileVariant`       | `outline` / `standard` / `popover`                      |
| `className` / `style`                      | 필드 표면. 상태를 받는 함수도 된다                      |
| 그 외 native 속성, `ref`                   | Trigger `button` 으로 간다                              |

## 알아둘 것

- 시간대 변환은 없습니다. 값은 로컬 시각입니다.
- 한국어의 오전/오후 이름은 브라우저의 CLDR 데이터를 따릅니다.
- `drawer` 는 비모달입니다. 뒤 화면 스크롤을 잠그거나 포커스를 가두지 않습니다.
