# temporal-field

DateField, TimeField, DateTimeField 가 함께 쓰는 필드 본체입니다. 각 필드는 `config` 로 값의 종류, 표시, 파싱, 팝업 내용만 정하고 나머지는 여기서 합니다.

| 파일                                             | 내용                                                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| [`index.tsx`](#indextsx)                         | `TemporalField`, 파트(`TemporalTrigger`, `TemporalInput`, `TemporalValue`, `TemporalClear`, `TemporalContent`), `temporalFieldStyle` |
| [`use-temporal-field.ts`](#use-temporal-fieldts) | 값, 열림, 입력 중인 글자, blur, 폼 reset 을 다루는 hook                                                                              |
| [`format.ts`](#formatts)                         | 표시 형식(`TemporalFormat`, `formatter`, `timePattern`)                                                                              |

## 쓰는 곳

| 필드          | 가져가는 것                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| DateField     | `TemporalField`, 파트 다섯 개, `temporalFieldStyle`, `formatter`                                        |
| TimeField     | `TemporalField`, `TemporalInput` 을 뺀 파트 네 개, `temporalFieldStyle`, `formatter`, `timePattern`     |
| DateTimeField | TimeField 와 같은 것, 팝업 내용을 그리는 `temporalFieldStyle` 의 `panel`, `panelTime`, `panelHint` 슬롯 |

- 각 필드는 파트를 그대로 내보냅니다(`DateField.Trigger = TemporalTrigger`). `Style` 도 `temporalFieldStyle` 입니다.
- 팝업은 [field-popup](../field-popup/README.md) 의 `FieldPopup`, 폼 값은 [`FormValue`](../README.md#form-valuetsx) 입니다.

## index.tsx

### 쓰는 법

```tsx
// components/form/date-field/index.tsx
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
    messages: messages.dateField,               // range 모드면 placeholder, title 만 바꾼다
    icon: CalendarDaysIcon,
    preferredWidth: cell * 7 * shown + MONTH_GAP * (shown - 1) + POPUP_PADDING_AND_BORDER,
    initialFocusSelector: '[data-calendar-day][tabindex="0"]',
    parse:
      selectionMode === 'single'
        ? (text) => {
            const date = parseDateText(text, dateLocale, typeof format === 'string' ? format : undefined);
            return date && !isBlocked(date, { min, max, disabled }) ? date : undefined;
          }
        : undefined,
    inputHint: typeof format === 'string' ? format : dateInputHint(dateLocale),
    picker: ({ value: current, change, close, size }) => <Calendar /* ... */ />,
  }}
/>

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
| `messages`             | `placeholder`, `title`, `clear`, `close`, `open`(Input 옆 버튼의 이름)                  |
| `icon`                 | Trigger 앞의 아이콘, Input 옆 버튼의 아이콘                                             |
| `picker`               | 팝업 내용. `{ value, change, close, size }` 를 받는다                                   |
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
- 팝업은 `role="dialog"` 이고 이름은 `messages.title`, `data-temporal-owner` 는 `popupId` 입니다. 머리(`FieldPopupHeader`)는 늘 렌더하고 drawer 에서만 보입니다.
- `panel`, `panelTime`, `panelHint` 는 DateTimeField 의 팝업입니다. 달력 옆에 시계를 두고, 휴대폰에서는 위아래로 쌓습니다(`sm:flex-row`).

### 알아둘 것

- 파트는 종류마다 하나까지입니다(`invariant`). Clear 는 Trigger 안이 아니라 형제로 둡니다.
- Input 은 `config.parse` 가 있는 필드(DateField 의 single 모드)에서만 됩니다.
- `aria-invalid` prop 이 `invalid` 보다 우선합니다. 둘 다 없으면 읽을 수 없는 글자(`unreadable`)가 invalid 를 정합니다.
- ref 는 `mergeRefs(controlRef, ref)` 로 렌더마다 새로 만듭니다. 이 줄은 `react-hooks/refs` lint 를 끕니다: `mergeRefs` 는 callback 을 만들 뿐 렌더 중에 ref 를 읽지 않습니다. 렌더마다 새 함수라서 소비자의 callback ref 도 렌더마다 다시 불립니다.
- 파트 목록(`shell`)은 `flattenParts` 의 결과를 그대로 렌더합니다. 파트를 여러 Fragment 에 나눠 담으면 key 가 겹칠 수 있습니다([field-popup](../field-popup/README.md#partsts)).

## use-temporal-field.ts

### 쓰는 법

```ts
// internal/temporal-field/index.tsx
const { state, input, blocked, popupId, controlRef, rootRef, change, clear, close, toggle, show, onBlur: handleBlur } =
  useTemporalField<V>({
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
- 값은 `isSame` 으로 비교합니다(`commit`). 날짜는 달력의 날로 비교하므로 이미 고른 날의 새 `Date` 는 변경이 아닙니다.
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
- reset 의 시점 문제는 [`useFormReset`](../../hooks/README.md#use-form-resetts) 을 봅니다.

## format.ts

### 쓰는 법

```ts
// components/form/time-field/index.tsx
const display = formatter(
  format === undefined || formatNamesHourCycle
    ? timePattern(dateLocale, precision, resolveTimeFormat(cycle, dateLocale))
    : format,
  dateLocale,
);
```

### 왜 이렇게

- `TemporalFormat` 은 date-fns 패턴(`'yyyy-MM-dd HH:mm'`)이거나, 패턴으로 쓸 수 없는 형식을 위한 함수입니다. `formatter` 는 둘 다 `(date) => string` 으로 바꿉니다.
- `timePattern` 은 locale 이 이미 그 시간제를 쓰면 locale 자신의 짧은 시각(`p`, 초까지면 `pp`)을 씁니다(`localesOwnTime`). 아니면 시각을 직접 적고, 12시간제의 오전/오후는 locale 이 쓰는 쪽에 둡니다([`periodFirst`](../README.md#date-localets)).

| locale, 시간제 | 패턴     | 14:30 의 표시 |
| -------------- | -------- | ------------- |
| `ko`, `12h`    | `a h:mm` | 오후 2:30     |
| `ko`, `24h`    | `p`      | 14:30         |
| `en-US`, `12h` | `p`      | 2:30 PM       |

- `ko` 의 기본 시간제는 `Intl` 에서 12시간제지만 date-fns `ko` 의 `p` 는 `HH:mm` 입니다. 그래서 `ko` 의 12시간제는 `p` 를 쓰지 않고 직접 적습니다.
