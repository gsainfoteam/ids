# DateField

누르면 달력이 열리고, 고른 날짜를 필드에 보여 주는 날짜 입력입니다.

- **하루, 기간, 여러 날.** `selectionMode` 로 고르고, 값은 로컬 날짜 `Date` 입니다. 날짜 라이브러리가 필요 없습니다.
- **키보드 그대로.** Trigger에서 `↓` 로 열면 고른 날(없으면 오늘)에 포커스가 가고, 하루를 고르면 닫히며 포커스가 Trigger로 돌아옵니다.
- **폼.** `name` 을 주면 ISO 날짜가 FormData에 들어가고, `required` 인데 비어 있으면 브라우저가 제출을 막고 Trigger로 포커스를 옮깁니다. `reset` 은 `defaultValue` 로 되돌립니다.
- **react-hook-form, TanStack Form.** `controlMode="value"` 나 `value` / `onValueChange` 로 Date 값을 그대로 주고받습니다.
- **달력 기능 그대로.** 제한, 연월 목록, 여러 달, locale, 기간 미리 보기는 [Calendar](../../data/calendar/README.md) 와 같습니다.

```tsx
import { DateField, Field } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>예약 날짜</Field.Label>
  <DateField name="date" value={date} onValueChange={setDate} />
</Field>;
```

## 선택 모드

```tsx
<DateField value={date} onValueChange={setDate} />                              // single(기본): 고르면 닫힌다
<DateField selectionMode="range" value={range} onValueChange={setRange} />      // DateRange | null. 열린 채 고른다
<DateField selectionMode="multiple" value={dates} onValueChange={setDates} />   // Date[]. 열린 채 고른다
<DateField defaultValue={new Date(2026, 8, 15)} />                              // 비제어
```

- 이미 고른 날을 다시 눌러도 닫힙니다. 값이 그대로라 `onValueChange` 는 부르지 않습니다.
- 기간은 "시작 – 끝", 끝을 고르기 전에는 "시작 – …" 로 보입니다. 여러 날은 두 개까지 보이고 나머지는 "+n" 입니다.

## 표시 형식

```tsx
<DateField />                                   // 2026. 09. 15. (locale 기본 연월일)
<DateField format="yyyy-MM-dd" />               // 2026-09-15
<DateField format="yyyy년 M월 d일 (EEE)" />     // 2026년 9월 15일 (화)
<DateField format="'Due' MMM d" locale="en-US" />  // Due Sep 15. 영문은 작은따옴표로 감싼다
<DateField format={{ dateStyle: 'long' }} />    // Intl.DateTimeFormatOptions
```

- 토큰은 `yyyy` `yy` / `MMMM` `MMM` `MM` `M` / `dd` `d` / `EEEE` `EEE` 입니다. 그 밖의 영문자는 오류입니다.
- 시간이나 `timeZone` 이 든 Intl 옵션은 오류입니다. 날짜와 시간은 [DateTimeField](../date-time-field/README.md) 를 씁니다.
- 비어 있으면 `placeholder`(기본 `날짜 선택`, 기간은 `기간 선택`)를 흐린 색으로 보입니다.

## 달력 옵션

```tsx
<DateField
  min={new Date(2026, 0, 1)}
  max={new Date(2026, 11, 31)}
  disabled={(date) => date.getDay() === 0} // 날짜별로 막는다. true 면 필드 전체를 막는다
  captionLayout="dropdown" // 연도와 월을 목록에서 고른다. 생년월일에
  monthsToShow={2} // 기간은 두 달을 나란히
  weekStartsOn={1}
  locale="en-US" // 달력과 표시 형식의 언어. 기본 ko-KR
  today={new Date(2026, 8, 15)}
/>
```

- `month` / `defaultMonth` / `onMonthChange` 도 달력으로 갑니다. 팝업을 열 때마다 고른 날의 달에서 시작합니다.

## 열기와 닫기

| 동작                           | 결과                     |
| ------------------------------ | ------------------------ |
| Trigger 클릭, `Enter`, `Space` | 열고 닫는다              |
| `↓`                            | 연다                     |
| 하루 고르기(`single`)          | 닫고 Trigger 로 포커스   |
| `Esc`, 바깥 클릭               | 닫는다. 고른 값은 그대로 |
| Clear                          | 비우고 Trigger 로 포커스 |

```tsx
<DateField open={open} onOpenChange={setOpen} />   // 열림도 제어할 수 있다
<DateField mobileVariant="drawer" />              // 640px 보다 좁으면 아래에서 올라오는 판
```

- 달력 안의 키보드는 [Calendar](../../data/calendar/README.md#키보드) 와 같습니다.
- `onBlur` 는 포커스가 필드와 팝업을 모두 벗어날 때만 부릅니다.
- 판(drawer)에서는 제목과 닫기 버튼이 위에 붙습니다.

## 폼

```tsx
<form>
  <DateField name="date" required /> {/* date=2026-09-15 */}
  <DateField name="trip" selectionMode="range" /> {/* trip=2026-09-15/2026-09-20 */}
  <DateField name="days" selectionMode="multiple" /> {/* days=... 날마다 한 줄 */}
  <button type="reset">초기화</button> {/* defaultValue 로 돌아간다 */}
</form>
```

- 제출 값은 UTC로 바꾸지 않은 로컬 날짜입니다. 비어 있으면 FormData에 항목이 없습니다.
- 끝을 고르지 않은 기간은 비어 있는 것으로 칩니다. FormData에 없고 `required` 를 통과하지 못합니다.
- `required` 인데 비어 있으면 브라우저가 제출을 막고 말풍선을 필드에 띄운 뒤 Trigger로 포커스를 옮깁니다.
- reset은 `onValueChange` 를 부르지 않습니다. native input 과 같습니다.
- `disabled` 면 제출에서 빠지고 `required` 도 걸리지 않습니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({ date: z.date().nullable().refine(Boolean, '날짜를 고르세요.') });

<Field name="date" controlMode="value" required>
  <Field.Label>예약 날짜</Field.Label>
  <DateField />
  <Field.Error /> {/* 오류가 나면 Trigger 로 포커스가 간다 */}
</Field>;
```

- 기간의 기본값은 `null`, 여러 날은 `[]` 입니다.

## TanStack Form

```tsx
<form.Field name="date">
  {(field) => (
    <DateField
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
    />
  )}
</form.Field>
```

## 합성

```tsx
<DateField value={date} onValueChange={setDate}>
  <DateField.Trigger>
    <DateField.Value className="font-medium" /> {/* 값이나 placeholder */}
  </DateField.Trigger>
  <DateField.Clear aria-label="마감일 지우기" /> {/* 값이 없으면 그리지 않는다 */}
  <DateField.Content>{/* 기본은 Calendar */}</DateField.Content>
</DateField>
```

- 부분을 하나도 주지 않으면 Trigger 와 Clear 를 그립니다. 하나라도 주면 준 것만 그리고, Trigger 가 없으면 Trigger 만 채웁니다.
- `Trigger`, `Value`, `Clear`, `Content` 는 `asChild` 를 받습니다. Clear 는 Trigger 안에 둘 수 없습니다.

## 상태

| `DateField.State`                    | 뜻                            |
| ------------------------------------ | ----------------------------- |
| `value`                              | 현재 값                       |
| `open`                               | 팝업이 열려 있다              |
| `empty`                              | 값이 없다                     |
| `invalid`                            | `invalid` 또는 `aria-invalid` |
| `disabled` / `readOnly` / `required` | 같은 이름의 속성              |

- 필드 표면에는 `data-open`, `data-empty`, `data-invalid`, `data-disabled`, `data-readonly`, `data-required`, `data-size`, `data-variant` 가 붙고, `className` 과 `style` 은 상태를 받는 함수도 됩니다.
- Value 는 비어 있을 때 `data-placeholder` 가 붙습니다.

## 속성

| 속성                                                                  | 기본 / 동작                                                       |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `selectionMode`                                                       | `single`(기본) / `range` / `multiple`                             |
| `value` / `defaultValue` / `onValueChange`                            | 모드별 타입. 기본 `null`, `multiple` 은 `[]`                      |
| `open` / `defaultOpen` / `onOpenChange`                               | 팝업 열림                                                         |
| `format`                                                              | locale 숫자 연월일. 패턴이나 Intl 옵션                            |
| `placeholder`                                                         | `날짜 선택`, 기간은 `기간 선택`                                   |
| `min` / `max` / `disabled`                                            | 달력으로 간다. `disabled={true}` 는 필드 전체                     |
| `captionLayout` / `monthsToShow` / `weekStartsOn` / `month` / `today` | 달력으로 간다                                                     |
| `locale`                                                              | `ko-KR`. 달력과 표시 형식                                         |
| `name` / `form` / `required`                                          | 숨은 값 입력과 브라우저 검증                                      |
| `readOnly`                                                            | 열리지 않고 Clear 도 막힌다                                       |
| `invalid`                                                             | danger 테두리와 링. Field 의 `aria-invalid` 가 우선               |
| `variant`                                                             | `outline`(기본) / `soft` / `ghost`                                |
| `size`                                                                | `standard` / `tiny`. 생략하면 `Field` 크기                        |
| `mobileVariant`                                                       | `popover`(기본) / `drawer`                                        |
| `className` / `style`                                                 | 필드 표면. 상태를 받는 함수도 된다                                |
| 그 외 native 속성, `ref`                                              | Trigger `button` 으로 간다(`id`, `aria-*`, `onBlur`, `autoFocus`) |

## 알아둘 것

- Trigger 는 `role="combobox"`, `aria-haspopup="dialog"` 이고 팝업은 `role="dialog"` 입니다. Field 의 라벨과 설명이 Trigger 에 붙습니다.
- 값은 로컬 날짜이고 `format` 은 표시에만 씁니다. 바깥에서 준 값을 min/max 로 자르지 않습니다.
- 팝업은 필드 전체 너비 이상으로 열리고, 화면 밖으로 나가지 않게 위아래를 고릅니다.
- `drawer` 는 비모달입니다. 뒤 화면 스크롤을 잠그거나 포커스를 가두지 않습니다.
