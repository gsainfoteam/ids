# DateField

누르면 달력이 열리고, 고른 날짜를 필드에 보여 주는 날짜 입력입니다.

- **하루, 기간, 여러 날.** `selectionMode` 로 고르고, 값은 로컬 날짜 `Date` 입니다.
- **키보드 그대로.** Trigger에서 `↓` 로 열면 고른 날(없으면 오늘)에 포커스가 가고, 하루를 고르면 닫히며 포커스가 Trigger로 돌아옵니다.
- **글자로 입력.** `DateField.Input` 을 넣으면 `2026.09.15`, `2026년 9월 15일`, `20260915` 처럼 쳐서 넣을 수 있습니다. 읽고 쓰는 일은 date-fns 가 합니다.
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
<DateField />                                      // 2026.09.15 (locale 의 짧은 날짜, date-fns P)
<DateField locale="en-US" />                       // 09/15/2026
<DateField format="yyyy-MM-dd" />                  // 2026-09-15
<DateField format="yyyy년 M월 d일 (EEE)" />        // 2026년 9월 15일 (화)
<DateField format="PPP" locale="en-US" />          // September 15th, 2026
<DateField format="'Due' MMM d" locale="en-US" />  // Due Sep 15. 영문은 작은따옴표로 감싼다
<DateField format={(date) => longFormat.format(date)} />  // 함수. Intl 도 여기로
```

- 패턴은 [date-fns 토큰](https://date-fns.org/docs/format)입니다. 모르는 영문자나 `YYYY`, `DD` 는 date-fns 가 오류를 냅니다.
- 날짜와 시간은 [DateTimeField](../date-time-field/README.md) 를 씁니다.
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
  locale="en-US" // 달력과 표시 형식의 언어. 태그나 date-fns Locale. 기본 ko-KR
  today={new Date(2026, 8, 15)}
/>
```

- `disabled` 는 [Calendar](../../data/calendar/README.md#제한) 의 matcher 를 그대로 받습니다.
- `month` / `defaultMonth` / `onMonthChange`, `modifiers`, `components` 같은 react-day-picker 속성도 달력으로 갑니다. 팝업을 열 때마다 고른 날의 달에서 시작합니다.

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

## 글자로 입력

```tsx
<DateField value={birthday} onValueChange={setBirthday} autoComplete="bday">
  <DateField.Input /> {/* 날짜를 글자로 친다. 라벨과 combobox 역할은 여기로 간다 */}
  <DateField.Clear />
  <DateField.Trigger /> {/* 달력 버튼. 생략해도 끝에 붙는다 */}
</DateField>
```

| 치는 글자                                       | 읽는 날짜                                               |
| ----------------------------------------------- | ------------------------------------------------------- |
| 보이는 형식 그대로                              | `format` 패턴을 date-fns `parse` 로 읽는다              |
| `2026.09.15`, `2026년 9월 15일`, `Sep 15, 2026` | locale 이 날짜를 쓰는 형식(date-fns `P` `PP` `PPP`)     |
| `2026-09-15`, `2026. 9. 15.`, `2026/9/15`       | 연도가 앞이면 locale 과 상관없이                        |
| `20260915`, `260915`                            | 숫자만 쳐도 된다. 휴대폰 숫자판                         |
| `9/15/26`(en-US), `15.09.2026`(de)              | 그 밖에는 locale 의 숫자 순서. 두 자리 연도는 가까운 해 |

- 한 글자씩 친 날짜는 `Enter` 나 포커스를 떠날 때 읽고, 표시 형식으로 다시 씁니다. `2026-09-1` 도 날짜로 읽히기 때문에 치는 도중에는 읽지 않습니다.
- 없는 날짜(`2026-02-30`)는 date-fns 가 거절합니다. 요일 이름이 든 형식은 읽지 않습니다.
- 붙여넣기, 끌어다 놓기, 브라우저 자동 완성은 날짜 전체가 한 번에 들어오므로 바로 읽습니다.
- 한글 IME 로 글자를 조합하다 누른 `Enter` 는 조합을 끝낼 뿐 날짜를 읽지 않습니다.
- 못 읽거나 min/max, `disabled` 로 막힌 날짜면 글자를 그대로 두고 `aria-invalid` 로 표시합니다. `Enter` 로 폼이 제출되지도 않습니다. `Esc` 는 원래 값으로 되돌립니다.
- 글자를 다 지우면 값도 비웁니다.
- `↓` 는 친 글자를 읽고 그 날짜에서 달력을 엽니다. 달력 버튼은 Tab 순서에서 빠집니다.
- 비어 있으면 locale 의 짧은 날짜를 글자로 보여 줍니다(`YYYY.MM.DD`, `MM/DD/YYYY`). 문자열 `format` 이 있으면 그 패턴을 보여 주고, `placeholder` 로 바꿀 수 있습니다.
- `autoComplete` 은 기본 `off` 입니다. 생년월일은 `autoComplete="bday"` 를 줍니다.
- 하루(`single`)에서만 씁니다.

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
- `Trigger`, `Value`, `Clear`, `Content`, `Input` 은 `asChild` 를 받습니다. Clear 는 Trigger 안에 둘 수 없습니다.
- `Input` 이 있으면 Trigger 는 달력 아이콘 버튼이 되고, 주지 않으면 끝에 붙습니다. [글자로 입력](#글자로-입력) 을 봅니다.
- Clear 와 `Input` 옆의 달력 버튼은 ghost [IconButton](../../action/icon-button/README.md) 입니다. 필드 크기를 따르고 테두리에서 4px 안쪽에 놓입니다. `children` 에 아이콘 하나를 주면 기본 아이콘 대신 그리고, `asChild` 면 자식 요소가 IconButton 이 됩니다.
- Clear 는 Tab 순서에 남습니다. `Input` 이 없는 필드에는 지울 글자가 없고, 달력에는 값을 비우는 키가 없습니다.

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

| 속성                                                                  | 기본 / 동작                                              |
| --------------------------------------------------------------------- | -------------------------------------------------------- |
| `selectionMode`                                                       | `single`(기본) / `range` / `multiple`                    |
| `value` / `defaultValue` / `onValueChange`                            | 모드별 타입. 기본 `null`, `multiple` 은 `[]`             |
| `open` / `defaultOpen` / `onOpenChange`                               | 팝업 열림                                                |
| `format`                                                              | locale 짧은 날짜(`P`). date-fns 패턴이나 함수            |
| `placeholder`                                                         | `날짜 선택`, 기간은 `기간 선택`                          |
| `min` / `max` / `disabled`                                            | 달력으로 간다. `disabled={true}` 는 필드 전체            |
| `captionLayout` / `monthsToShow` / `weekStartsOn` / `month` / `today` | 달력으로 간다                                            |
| `modifiers` / `components` / `footer` 등 react-day-picker 속성        | 달력으로 간다                                            |
| `locale`                                                              | `ko-KR`. 태그나 date-fns `Locale`. 달력과 표시 형식      |
| `name` / `form` / `required`                                          | 숨은 값 입력과 브라우저 검증                             |
| `readOnly`                                                            | 열리지 않고 Clear 도 막힌다                              |
| `invalid`                                                             | danger 테두리와 링. Field 의 `aria-invalid` 가 우선      |
| `variant`                                                             | `outline`(기본) / `soft` / `ghost`                       |
| `size`                                                                | `standard` / `tiny`. 생략하면 `Field` 크기               |
| `mobileVariant`                                                       | `popover`(기본) / `drawer`                               |
| `className` / `style`                                                 | 필드 표면. 상태를 받는 함수도 된다                       |
| `autoComplete`                                                        | `Input` 이 있을 때 쓴다. 기본 `off`                      |
| 그 외 native 속성, `ref`                                              | Trigger `button`, `Input` 이 있으면 그 `input` 으로 간다 |

## 알아둘 것

- Trigger 는 `role="combobox"`, `aria-haspopup="dialog"` 이고 팝업은 `role="dialog"` 입니다. Field 의 라벨과 설명이 Trigger 에 붙습니다.
- 값은 로컬 날짜이고 `format` 은 표시에만 씁니다. 바깥에서 준 값을 min/max 로 자르지 않습니다.
- 팝업은 필드 전체 너비 이상으로 열리고, 화면 밖으로 나가지 않게 위아래를 고릅니다.
- `drawer` 는 modal 입니다. 뒤 화면을 어둡게 가리고 스크롤을 잠그며, 포커스를 sheet 안에 둡니다. 배경을 누르거나 Escape 로 닫으면 포커스가 필드로 돌아갑니다.
