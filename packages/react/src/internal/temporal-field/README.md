# temporal-field

DateField, TimeField, DateTimeField 가 함께 쓰는 필드 본체입니다. 각 필드는 `config` 로 값의 종류, 표시, 파싱, 팝업 내용만 정하고 나머지는 여기서 합니다.

| 파일                                             | 내용                                                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`index.ts`](#indexts)                           | `TemporalField`, 파트, `useInternalTemporalPicker`, `pickerPart`, `temporalFieldStyle`, 타입의 다시 내보내기 |
| [`root.tsx`](#roottsx)                           | 필드 루트 `TemporalField`                                                                                                                             |
| [`context.ts`](#contextts)                       | 루트가 파트에 주는 context 와 그 guard hook(`useInternalTemporalContext`)                                                                             |
| [`parts/`](#parts)                               | `TemporalTrigger`, `TemporalInput`, `TemporalValue`, `TemporalClear`, `TemporalContent`                                                              |
| [`style.ts`](#stylets)                           | `temporalFieldStyle`                                                                                                                                  |
| [`hooks/use-temporal-field.ts`](#hooksuse-temporal-fieldts) | 값, 열림, 입력 중인 글자, blur, 폼 reset 을 다루는 hook                                                                                               |
| [`hooks/use-temporal-field-root.ts`](#hooksuse-temporal-field-rootts) | 루트의 컨트롤, Trigger, Input props 와 파트에 줄 context 를 만드는 hook                                                              |
| [`hooks/use-temporal-picker.ts`](#hooksuse-temporal-pickerts) | picker 파트가 값과 닫기를 읽는 hook(`useInternalTemporalPicker`)                                                                                  |
| [`lib/children.ts`](#libchildrents)              | 자식을 셸 파트, Content, picker 파트로 나누기(`splitTemporalChildren`, `pickerPart`)                                                                   |
| [`lib/types.ts`](#libtypests)                    | `TemporalFieldProps`, `TemporalConfig`, `TemporalMessages`, `TemporalPickerApi`, `TemporalPicker`                                                    |
| [`lib/format.ts`](#libformatts)                         | 표시 형식(`TemporalFormat`, `formatter`, `dateOptions`, `timeOptions`)                                                                                |

## 쓰는 곳

| 필드          | 가져가는 것                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| DateField     | `TemporalField`, 파트 다섯 개, `temporalFieldStyle`, `formatter`                                        |
| TimeField     | `TemporalField`, `TemporalInput` 을 뺀 파트 네 개, `temporalFieldStyle`, `formatter`, `timeOptions`     |
| DateTimeField | TimeField 와 같은 것, 팝업 내용을 그리는 `temporalFieldStyle` 의 `panel`, `panelTime`, `panelHint` 슬롯 |

- 각 필드는 파트를 그대로 내보냅니다(`DateField.Trigger = TemporalTrigger`). `Style` 도 `temporalFieldStyle` 입니다.
- 팝업은 [field-popup](../field-popup/README.md) 의 `FieldPopup`, 폼 값은 [`FormValue`](../README.md#partsform-valuetsx) 입니다.

## index.ts

DateField, TimeField, DateTimeField 가 `internal/temporal-field` 에서 가져가는 이름을 다시 내보냅니다. `'use client'` 가 없는 모듈이고, 파트는 각자의 클라이언트 파일에서 옵니다.

## root.tsx

필드 루트 `TemporalField` 입니다. 루트 `div`, 파트를 채우는 순서, `FormValue`, Content 를 그립니다. 상태와 props 는 [hooks/use-temporal-field-root.ts](#hooksuse-temporal-field-rootts) 가 만듭니다.

### 쓰는 법

```tsx
// components/form/date-field/root.tsx
<TemporalField<CalendarValue>
  {...rest}
  value={value}
  defaultValue={defaultValue ?? empty}
  onValueChange={onValueChange as ((value: CalendarValue) => void) | undefined}
  disabled={disabled === true}
  config={{
    kind: 'date',
    empty,
    isEmpty: isEmptyDates,
    isSame: sameDates,
    display: (next) => describeDates(next, selectionMode, formatDate),
    serialize: (next) => serializeDates(next, selectionMode),
    messages: { clear: t('common.clear'), close: t('common.close') },
    icon: CalendarDaysIcon,
    preferredWidth: cell * 7 * shown + MONTH_GAP * (shown - 1) + POPUP_PADDING_AND_BORDER,
    initialFocusSelector: '[data-calendar-day][tabindex="0"]',
    parse:
      selectionMode === 'single'
        ? (text) => {
            const date = parseDateText(text, dateLocale);
            return date && !isBlocked(date, { min, max, disabled }) ? date : undefined;
          }
        : undefined,
    inputHint: dateInputHint(dateLocale),
    pickerParts: new Set([DateFieldCalendar]),
    picker: () => calendar ?? <DateFieldCalendar />, // calendar = pickerPart(children, DateFieldCalendar)
  }}
/>

// components/form/date-field/index.tsx
export namespace DateField {
  export const Trigger = TemporalTrigger;
  export const Input = TemporalInput;
  export const Value = TemporalValue;
  export const Clear = TemporalClear;
  export const Content = TemporalContent;
  export const Style = temporalFieldStyle;
}
```

| `config`               | 뜻                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `kind`                 | `'date'` / `'time'` / `'date-time'`. 루트의 `data-${kind}-field`, `data-temporal-field` |
| `empty`, `isEmpty`     | 빈 값과 그 판정                                                                         |
| `isSame`               | 같은 값이면 `onValueChange` 를 부르지 않는다                                            |
| `display`              | Trigger 와 Input 에 보일 글자                                                           |
| `serialize`            | FormData 로 보낼 문자열. `FormValue` 의 `value`                                         |
| `messages`             | `clear`, `close`, `open`(Input 옆 버튼의 이름)                                          |
| `icon`                 | Trigger 앞의 아이콘, Input 옆 버튼의 아이콘                                             |
| `picker`               | 팝업 내용. `{ value, change, close, size, name }` 를 받는다                             |
| `pickerParts`          | 필드의 자식 중 팝업 안 내용으로 갈 파트(`DateField.Calendar`). 셸 파트로 세지 않는다     |
| `preferredWidth`       | 팝업의 최소 폭                                                                          |
| `initialFocusSelector` | 팝업을 열 때 포커스를 줄 요소                                                           |
| `parse`                | 있어야 Input 파트를 쓸 수 있다. 읽을 수 없는 글자는 `undefined`                         |
| `inputHint`            | Input 의 기본 placeholder                                                               |

### 왜 이렇게

- 파트를 하나도 주지 않으면 Trigger, Clear 순서로 그립니다. 파트를 주면 준 대로 그리고 빠진 Trigger 만 채웁니다. Trigger 없이는 팝업을 열 수 없기 때문입니다. Input 이 있으면 Trigger 를 끝에, 없으면 앞에 둡니다.
- 필드의 id, 라벨, 설명, `role="combobox"` 는 포커스를 받는 컨트롤 하나(`control`)에 붙습니다. Input 이 있으면 Input, 없으면 Trigger 입니다.
- 이 컨트롤에 `data-field-input` 이 붙어 `focus-ring` 이 셸 전체에 ring 을 그립니다. Clear 는 자기 ring 을 따로 가집니다.
- Input 이 없으면 Trigger 는 필드 상자를 채우는 native `button` 입니다(`part('button', ...)`). 필드의 라벨을 가진 combobox 라서 Button 컴포넌트를 쓰지 않습니다.
- APG combobox 처럼 Down Arrow 가 팝업을 엽니다. Enter 와 Space 는 button 의 click 으로 엽니다.
- 값이 있으면 Clear 가 chevron 자리를 차지합니다(`clearInChevronsPlace`). 끝에는 아이콘이 하나만 있습니다.
- Input 이 있으면 Trigger 는 끝의 ghost IconButton 이고 이름은 `messages.open` 입니다. APG date picker combobox 처럼 Input 에서 Down Arrow 로 열므로 버튼은 Tab 순서에서 빠집니다(`tabIndex: -1`). 파트에 준 `aria-label` 이 기본 이름을 이깁니다.
- Input 은 필드 상자 안의 맨 `input` 입니다. TextField 를 쓰면 상자가 하나 더 그려집니다. `autoComplete` 는 Input 만 읽고 기본값은 `'off'` 입니다.
- Clear 는 TextField 의 Clear 와 달리 Tab 순서에 남습니다. Input 이 없는 날짜 필드에는 지울 글자가 없고, 달력에도 값을 비우는 키가 없습니다.
- Clear 와 Input 옆 버튼은 [`fieldAction.unpadded`](../README.md#field-surfacets) 입니다. Trigger 가 상자 끝까지 차서 상자에 padding 이 없습니다.
- 팝업은 `TemporalContent` 가 그립니다(`X.Content`). 그래서 좁은 화면의 모양 `narrow` 는 루트가 아니라 Content 의 prop 이고, Content 의 나머지 속성은 팝업 안 내용 상자에 붙습니다. Content 를 주지 않으면 루트가 빈 Content 를 그립니다.
- 팝업은 `role="dialog"` 이고 `data-temporal-owner` 는 `popupId` 입니다. 이름은 필드의 이름(`picker.name` 과 같은 `aria-labelledby` 나 `aria-label`)입니다. IDS 가 쓴 제목은 없습니다.
- 팝업의 `aria-labelledby` 로 컨트롤을 가리키지 않습니다. combobox 를 가리키면 이름 대신 그 값이 읽힙니다(accname 의 embedded control).
- 머리(`FieldPopupHeader`)는 닫기 버튼 하나이고, 늘 렌더하고 drawer 에서만 보입니다.
- `placeholder` 에 기본값은 없습니다. 비어 있는 Trigger 는 아무 글자도 그리지 않습니다.
- `DateField.Calendar`, `TimeField.TimePicker` 같은 picker 파트는 `useInternalTemporalPicker(part)` 로 `{ value, change, close, size, name }` 를 읽어 값을 잇습니다. 루트의 자식으로 적으면 필드 루트가 `pickerPart(children, type)` 로 찾아 `picker` 에서 그리고, `Content` 의 children 안에 적어도 같은 context 를 읽어 그 자리에 그려집니다. `pickerPart` 는 루트의 자식과 `Content` 의 children 을 함께 찾습니다. 팝업 폭(`monthsToShow`)이나 오늘(`today`)처럼 열기 전에 루트가 알아야 하는 속성이 있기 때문이고, 둘 중 한 곳만 찾으면 다른 곳에 적은 속성이 조용히 무시됩니다.
- `name` 은 필드의 이름입니다. Field 가 준 `aria-labelledby`(Field.Label 의 id), 없으면 `aria-label` 입니다. 팝업 안의 Calendar 는 이름이 필수라서 `{...picker.name}` 으로 필드 이름을 받습니다. 빼면 Calendar 가 개발 모드에서 이름이 없다고 경고합니다.
- `panel`, `panelTime`, `panelHint` 는 DateTimeField 의 팝업입니다. 달력 옆에 시계를 두고, 휴대폰에서는 위아래로 쌓습니다(`sm:flex-row`).

### 알아둘 것

- 파트는 종류마다 하나까지입니다([lib/children.ts](#libchildrents) 의 `invariant`). Clear 는 Trigger 안이 아니라 형제로 둡니다.
- Input 은 `config.parse` 가 있는 필드(DateField 의 single 모드)에서만 됩니다.

## context.ts

루트가 파트에 주는 context(`TemporalContext`)와 그 guard hook(`useInternalTemporalContext(part)`)입니다. 값은 [hooks/use-temporal-field-root.ts](#hooksuse-temporal-field-rootts) 가 만듭니다.

### 쓰는 곳

- 다섯 파트, [hooks/use-temporal-picker.ts](#hooksuse-temporal-pickerts)

### 알아둘 것

- 필드 밖에서 파트를 그리면 `${part} must be inside its field.` 로 던집니다.
- context 의 모양을 바꾸면 다섯 파트와 picker 파트가 함께 바뀝니다.

## parts/

필드의 파트입니다. 파일마다 하나이고, 모두 [context.ts](#contextts) 를 읽고 그리기만 합니다.

| 파일                 | 파트              | 그리는 것                                                                  |
| -------------------- | ----------------- | -------------------------------------------------------------------------- |
| `parts/trigger.tsx`  | `TemporalTrigger` | Input 이 없으면 필드 상자를 채우는 `button`, 있으면 끝의 ghost IconButton |
| `parts/input.tsx`    | `TemporalInput`   | 글자를 받는 `input`                                                        |
| `parts/value.tsx`    | `TemporalValue`   | Trigger 안의 값이나 placeholder 글자                                       |
| `parts/clear.tsx`    | `TemporalClear`   | 값을 지우는 ghost IconButton. 빈 값이면 그리지 않는다                      |
| `parts/content.tsx`  | `TemporalContent` | 열린 동안의 `FieldPopup`, 머리, 내용 상자                                  |

- 각 필드는 이 함수를 그대로 자기 파트로 내보냅니다(`DateField.Trigger = TemporalTrigger`).

## hooks/use-temporal-field-root.ts

`TemporalField` 의 상태와 props 를 만드는 hook(`useInternalTemporalFieldRoot`)입니다. [hooks/use-temporal-field.ts](#hooksuse-temporal-fieldts) 를 부르고, 필드 크기(`useFieldSize`), 스타일, 자식 나누기([lib/children.ts](#libchildrents)), 포커스를 받는 컨트롤의 props, Trigger 와 Input 의 props, 파트에 줄 context 를 돌려줍니다.

### 쓰는 곳

- [root.tsx](#roottsx) 의 `TemporalField`

### 왜 이렇게

- 필드의 id, 라벨, 설명, `role="combobox"`, ARIA 는 `control` 하나에 모읍니다. Input 이 있으면 Input props(`textBox`)에, 없으면 Trigger props 에 펼칩니다.
- Input 이 있으면 Trigger props 는 버튼의 것만 가집니다(`tabIndex: -1`, `aria-label` 은 `messages.open`).
- 오류 상태는 `aria-invalid` 가 정합니다. Field 안이면 Field 가 넘긴 값입니다. `aria-invalid` 가 없으면 읽을 수 없는 글자(`unreadable`)가 정합니다.

### 알아둘 것

- ref 는 `mergeRefs(controlRef, ref)` 로 렌더마다 새로 만듭니다. 이 줄은 `react-hooks/refs` lint 를 끕니다: `mergeRefs` 는 callback 을 만들 뿐 렌더 중에 ref 를 읽지 않습니다. 렌더마다 새 함수라서 소비자의 callback ref 도 렌더마다 다시 불립니다.
- 바꾸면 DateField, TimeField, DateTimeField 의 접근성 트리와 키 조작이 함께 바뀝니다.

## hooks/use-temporal-picker.ts

picker 파트(`DateField.Calendar`, `TimeField.TimePicker`, DateTimeField 의 둘)가 필드의 `{ value, change, close, size }` 를 읽는 hook(`useInternalTemporalPicker<V>(part)`)입니다.

### 쓰는 곳

- DateField 의 `parts/calendar.tsx`, TimeField 의 `parts/time-picker.tsx`, DateTimeField 의 `root.tsx`, `parts/calendar.tsx`, `parts/time-picker.tsx`

### 알아둘 것

- 필드 밖에서 부르면 [context.ts](#contextts) 의 guard 가 던집니다.
- 바꾸면 네 picker 파트가 값을 고르는 방식이 함께 바뀝니다.

## lib/children.ts

필드의 자식을 나누는 함수입니다.

- `splitTemporalChildren(children, pickerParts, readsTypedText)`: picker 파트를 뺀 자식을 셸 파트(`shell`)와 Content(`contents`)로 나누고, 파트가 종류마다 하나까지인지, Input 이 `parse` 있는 필드에만 있는지 확인합니다.
- `pickerPart(children, type)`: 루트의 자식과 Content 의 children 에서 picker 파트를 찾습니다.

### 쓰는 곳

- [hooks/use-temporal-field-root.ts](#hooksuse-temporal-field-rootts): `splitTemporalChildren`
- DateField, TimeField, DateTimeField 의 `root.tsx`: `pickerPart`

### 알아둘 것

- 셸 파트 목록은 `flattenFragments` 의 결과를 그대로 렌더합니다. key 에 Fragment 경로가 붙어서, 파트를 여러 Fragment 에 나눠 담아도 겹치지 않습니다.

## lib/types.ts

필드의 props(`TemporalFieldProps`), 필드마다의 설정(`TemporalConfig`), 문구(`TemporalMessages`), picker 가 받는 API(`TemporalPickerApi`, `TemporalPicker`)의 타입입니다. 각 필드의 props 타입이 `TemporalFieldProps` 를 넓힙니다.

## style.ts

`temporalFieldStyle` 입니다. `'use client'` 가 없는 모듈이라, 서버 컴포넌트에서 도는 DateField, TimeField, DateTimeField 의 index 가 `Style` 로 여기서 바로 가져갑니다. `index.ts` 는 같은 이름을 다시 내보냅니다.

### 알아둘 것

- 여기에 hook 이나 컴포넌트를 두지 않습니다. 클라이언트 모듈에 두면 서버 컴포넌트의 `DateField.Style` 이 client reference 가 되어 부를 수 없습니다.

## hooks/use-temporal-field.ts

### 쓰는 법

```ts
// internal/temporal-field/hooks/use-temporal-field-root.ts
const { state, input, blocked, popupId, controlRef, rootRef, change, clear, close, toggle, show, onBlur: handleBlur } =
  useInternalTemporalField<V>({
    value,
    defaultValue: defaultValue ?? config.empty,
    onValueChange,
    empty: config.empty,
    isEmpty: config.isEmpty,
    isSame: config.isSame,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
    invalid: ariaInvalid === undefined ? invalid : ariaInvalid === true || ariaInvalid === 'true',
    required,
    display: config.display,
    parse: config.parse,
    onBlur,
  });
```

### 왜 이렇게

- `controlRef` 는 필드의 포커스와 라벨을 가진 컨트롤입니다. Trigger button, 또는 글자를 받는 필드면 Input 입니다. 닫을 때 포커스를 돌려받고, `FormValue` 의 `anchor` 이고, 폼 reset 을 듣는 요소입니다.
- disabled 나 readOnly(`blocked`)면 `open` 이 `true` 여도 열리지 않습니다(`expanded`).
- 값은 `isSame` 으로 비교합니다(`commit`). 날짜는 달력의 날로 비교하므로 이미 고른 날의 새 `CalendarDate` 객체는 변경이 아닙니다.
- `draft` 는 Input 에 입력 중인 글자입니다. Enter 나 blur 에서 읽고, `null` 이면 값 자체를 보여 줍니다.
- 빈 상자는 값을 지웁니다. 읽을 수 없는 글자는 버리지 않고 입력한 그대로 둔 채 필드를 invalid 로 표시합니다(`unreadable`).
- 붙여넣기, 끌어다 놓기, 자동 완성은 날짜를 통째로 넘기므로 바로 읽습니다(`arrivedWhole`: `insertFromPaste`, `insertFromDrop`, `insertReplacementText`, `inputType` 없음). 한 글자씩 입력하는 날짜는 Enter 나 blur 까지 기다립니다. `2026-09-1` 도 이미 날짜로 읽히기 때문입니다.
- IME 음절을 확정하는 Enter 는 사용자의 Enter 가 아니므로 무시합니다(`isComposing`).
- Enter 는 글자를 읽고, 읽을 수 없으면 폼의 암묵적 제출도 막습니다. Down Arrow 는 글자를 읽고 팝업을 엽니다. 팝업이 닫힌 채 누른 Escape 는 입력 중인 글자를 버립니다.
- 포커스가 Trigger 와 팝업 사이를 오가는 동안은 필드 안입니다. blur 는 포커스가 둘 다 떠날 때만 알립니다(`withinFieldOrItsPopup`: 루트 안, 또는 `[data-temporal-owner]` 가 `popupId` 인 팝업 안).
- `onBlur` 옵션은 Trigger 용으로 타입이 적혀 있지만, 포커스가 팝업에서 떠날 때 팝업의 blur 이벤트로도 불립니다.
- native reset 은 change 이벤트 없이 기본값을 되돌립니다. input 이 reset 될 때처럼 `{ silent: true }` 로 값을 되돌리고, 입력 중인 글자와 열림도 지웁니다.

### 알아둘 것

- `change(value, { close: true })` 는 값을 넣고 닫으며 포커스를 되돌립니다. `picker` 가 받는 API 입니다.
- `change` 와 `clear` 는 blocked 면 아무것도 하지 않습니다.
- reset 의 시점 문제는 [`useInternalFormReset`](../../hooks/README.md#use-form-resetts) 을 봅니다.

## lib/format.ts

### 쓰는 법

```ts
// components/form/date-field/root.tsx
const formatDate = formatter(format, dateLocale, {
  defaults: dateOptions,
  toDate: toUtcDate,
  timeZone: 'UTC',
});

// components/form/time-field/root.tsx
const display = formatter(format, dateLocale, {
  defaults: timeOptions(precision),
  toDate: onUtcSampleDay,
  cycle: resolveHourCycle(hourCycle, dateLocale),
  timeZone: 'UTC',
});

// components/form/date-time-field/root.tsx
const display = formatter(format, dateLocale, {
  defaults: { ...dateOptions, ...timeOptions(precision) },
  toDate: toUtcDateTime,
  cycle: resolveHourCycle(hourCycle, dateLocale),
  timeZone: 'UTC',
});
```

### 왜 이렇게

- `TemporalFormat<V>` 는 `Intl.DateTimeFormatOptions` 이거나 `(value, locale) => string` 입니다. `V` 는 필드의 값 타입입니다. TimeField 는 `Time`, DateField 는 `CalendarDate`, DateTimeField 는 `CalendarDateTime` 입니다.
- `formatter` 는 둘 다 `(value) => string` 으로 바꿉니다. 옵션은 [date-locale](../README.md#date-localets) 의 `dateFormatter` 로 그리고, 함수에는 값과 풀이한 locale 태그를 그대로 넘깁니다.
- Intl 은 JS `Date` 만 그리므로 `toDate` 가 값을 UTC 의 같은 벽시계 시각으로 바꾸고, `timeZone: 'UTC'` 로 그립니다. 세 필드 모두 그렇습니다.
- `CalendarDate` 는 Calendar 의 `day-picker-bridge.ts` 에 있는 `toUtcDate` 로 그 날의 UTC 자정에 놓고 `timeZone: 'UTC'` 로 그립니다. 로컬 시간대로 그리면 UTC 보다 늦은 시간대에서 하루 전날로 보입니다.
- `CalendarDateTime` 은 DateTimeField 의 `date-time.ts` 에 있는 `toUtcDateTime`(`toDate('UTC')`)으로 그립니다.
- `Time` 은 날짜와 시간대가 없어서 `onUtcSampleDay` 로 UTC 의 한 날(2000-01-01)에 놓고 `timeZone: 'UTC'` 로 그립니다. 로컬 시간대를 쓰면 서머타임이 바뀌는 날에 없는 시각이 밀려 보입니다. `timeZone` 은 사용자 `format` 옵션보다 먼저입니다.
- 기본 옵션:

| 이름                     | 옵션                                                                  | ko-KR 14:30 의 표시 |
| ------------------------ | --------------------------------------------------------------------- | ------------------- |
| `dateOptions`            | `{ year: 'numeric', month: '2-digit', day: '2-digit' }`               | `2026. 09. 15.`     |
| `timeOptions('hour')`    | `{ hour: 'numeric' }`                                                 | `오후 2시`          |
| `timeOptions('minute')`  | `{ hour: 'numeric', minute: '2-digit' }`                              | `오후 2:30`         |
| `timeOptions('second')`  | `{ hour: 'numeric', minute: '2-digit', second: '2-digit' }`           | `오후 2:30:00`      |

- 시간제(`cycle`)는 `hour12` 로 옵션에 더합니다(`withHourCycle`). 시를 보여 주는 옵션(`hour` 나 `timeStyle`)에만 더하고, 옵션이 `hour12` 나 `hourCycle` 을 이미 정했으면 그쪽을 둡니다.
- 날짜와 시각은 한 옵션으로 합쳐 한 번에 그립니다. 둘을 잇는 글자(`, `)와 순서를 locale 이 정합니다.
- 오전/오후의 자리는 Intl 이 locale 대로 둡니다. 따로 패턴을 만들지 않습니다.

### 알아둘 것

- 패턴 문자열은 받지 않습니다. 문자열 `format` 은 타입 오류입니다.
- `hour12` 는 `@internationalized/date` 의 `DateFormatter` 가 Chrome 의 `hour12` 버그를 피해 `hourCycle` 로 바꿔 넘깁니다.
