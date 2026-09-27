# Calendar

날짜를 한 달 단위 격자로 보여 주고 하루, 기간, 여러 날을 고르게 하는 달력입니다. [react-day-picker](https://daypicker.dev) 위에 IDS 모양과 값 규칙을 얹었습니다.

- **세 가지 선택.** `single`, `range`, `multiple` 에 탐색만 하는 `none` 까지. 값은 native `Date` 입니다.
- **기간 미리 보기.** 시작을 고른 뒤에는 포인터나 키보드 포커스가 있는 날까지 기간이 미리 그려집니다.
- **빠른 이동.** `captionLayout="dropdown"` 이면 연도와 월을 목록에서 바로 고릅니다. 생년월일처럼 먼 날짜도 몇 번 만에 갑니다.
- **WAI-ARIA 격자 키보드.** react-day-picker 의 키보드 그대로입니다. 막힌 날은 건너뛰고, 오른쪽에서 왼쪽으로 쓰는 문서에서는 좌우가 뒤집힙니다.
- **date-fns locale.** 월, 요일 이름과 주 시작 요일을 date-fns `Locale` 에서 가져옵니다. 기본은 한국어입니다.
- **react-day-picker 확장.** `components`, `modifiers`, `formatters`, `labels`, `footer` 를 그대로 받습니다.

```tsx
import { Calendar } from '@gsainfoteam/ids-react';

const [date, setDate] = useState<Date | null>(null);

<Calendar value={date} onValueChange={setDate} />;
```

## 선택

```tsx
<Calendar value={date} onValueChange={setDate} />                              // single(기본): Date | null
<Calendar selectionMode="range" value={range} onValueChange={setRange} />      // DateRange | null
<Calendar selectionMode="multiple" value={dates} onValueChange={setDates} />   // Date[]
<Calendar selectionMode="none" value={meeting} />                              // 표시만. 고를 수 없다

<Calendar defaultValue={new Date(2026, 8, 15)} />                              // 비제어
```

- `onValueChange` 는 값이 바뀔 때만 부릅니다. 이미 고른 날을 다시 눌러도 부르지 않습니다.
- 새로 고른 날은 로컬 자정 `Date` 입니다. 넘겨받은 `Date` 를 고치거나 UTC로 바꾸지 않습니다.
- `multiple` 에서 고른 날을 다시 누르면 빠집니다.

## 기간

```tsx
import { Calendar, type DateRange } from '@gsainfoteam/ids-react';

const [range, setRange] = useState<DateRange | null>(null);

<Calendar selectionMode="range" value={range} onValueChange={setRange} monthsToShow={2} />;
// 첫 클릭   { start: 24일, end: null }    이후 포인터가 있는 날까지 미리 보기
// 두 번째   { start: 24일, end: 10월 2일 } 더 이른 날을 누르면 시작과 끝이 바뀐다
// 세 번째   { start: 새 날, end: null }    새 기간을 시작
```

- 미리 보기 중인 날에는 `data-range-preview` 가 붙습니다. 포인터가 달력을 벗어나면 키보드 포커스가 있는 날까지 보여 줍니다.
- 기간은 양 끝만 검사합니다. 사이에 막힌 날이 있어도 기간을 만들 수 있습니다.

## 월과 연도 이동

```tsx
<Calendar captionLayout="dropdown" />                               // 제목 대신 연도, 월 목록
<Calendar captionLayout="dropdown" min={new Date(1920, 0, 1)} max={new Date()} />
<Calendar monthsToShow={2} />                                       // 1~12. 이전은 첫 달, 다음은 마지막 달에만
<Calendar defaultMonth={new Date(2026, 8, 1)} />                    // 처음 보일 달
<Calendar month={month} onMonthChange={setMonth} />                 // 보이는 달을 제어. 그 달 1일을 준다
```

- 처음 보이는 달은 `defaultMonth`, 첫 선택 날, 오늘 순서이고 min/max 안으로 들어옵니다.
- 연도 목록은 `min` 부터 `max` 까지입니다. 없으면 오늘 기준 앞뒤 100년입니다. 한국어는 연도 목록이 먼저 옵니다.
- 범위 밖의 달은 월 목록에서 고를 수 없습니다.
- 이전/다음은 ghost [IconButton](../../action/icon-button/README.md) 입니다. 범위 끝에서는 `disabled` 대신 `aria-disabled` 가 되어 눌리지 않고, 마지막 달로 넘긴 버튼에서 포커스가 빠지지 않습니다.
- 두 번째 달의 목록에서 고른 달은 두 번째 칸에 옵니다.
- 달 제목은 `role="status"` 라서 달이 바뀌면 화면 읽기 프로그램이 새 달을 읽습니다.

## 제한

```tsx
<Calendar
  min={new Date(2026, 0, 1)}                   // 양 끝 포함. min === max 도 된다
  max={new Date(2026, 11, 31)}
  disabled={{ dayOfWeek: [0, 6] }}             // react-day-picker matcher
/>
<Calendar disabled={(date) => isHoliday(date)} />
<Calendar disabled={[new Date(2026, 8, 17), { from: start, to: end }]} />
<Calendar disabled />                          // 전체를 막는다. 이동, 선택, Tab 진입 모두
<Calendar readOnly value={date} />             // 이동은 되고 선택은 안 된다
```

- `disabled` 는 [matcher](https://daypicker.dev/api/type-aliases/Matcher) 하나나 배열입니다. 함수, 날짜, 날짜 배열, `{ from, to }`, `{ before }`, `{ after }`, `{ dayOfWeek }` 를 받습니다.
- 막힌 날은 native `disabled` 버튼이라 클릭도 키보드도 닿지 않습니다. 날짜 버튼에 `data-disabled` 가 붙습니다.

## 키보드

| 키                                | 동작                                       |
| --------------------------------- | ------------------------------------------ |
| `←` `→`                           | 하루 이동. 오른쪽에서 왼쪽 문서에서는 반대 |
| `↑` `↓`                           | 한 주 이동                                 |
| `Home` / `End`                    | 그 주의 첫날 / 마지막 날                   |
| `PageUp` / `PageDown`             | 한 달 이동. 31일에서 2월로 가면 말일       |
| `Shift+PageUp` / `Shift+PageDown` | 한 해 이동                                 |
| `Shift+←` `Shift+→`               | 한 달 이동                                 |
| `Shift+↑` `Shift+↓`               | 한 해 이동                                 |
| `Enter` / `Space`                 | 선택                                       |
| `Tab`                             | 날짜 격자에는 한 번만 들어간다             |

- 막힌 날은 건너뜁니다. 보이는 달 밖으로 나가면 그 날이 있는 달로 넘어갑니다.
- 오른쪽에서 왼쪽 방향은 `dir` 로 주거나, 주지 않으면 부모의 방향을 읽습니다.

## locale

```tsx
import { de } from 'date-fns/locale';
import { arEG, ja } from 'react-day-picker/locale';

<Calendar />                                  // 한국어: 2026년 9월, 일 월 화 ...
<Calendar locale="en-US" />                   // September 2026, Su Mo Tu ...
<Calendar locale={de} />                      // date-fns Locale. 월요일부터 시작
<Calendar locale={ja} />                      // 버튼 이름까지 번역된 react-day-picker Locale
<Calendar weekStartsOn={1} />                 // 주 시작을 직접 정한다. 0 = 일요일
<div dir="rtl">
  <Calendar locale={arEG} numerals="arab" />  // 아라비아 숫자, 좌우 반전
</div>
```

- 문자열은 `ko`, `ko-KR`, `en`, `en-US` 만 받고, 다른 태그는 오류입니다. 모든 locale 을 이름으로 찾게 하면 쓰지 않는 locale 까지 번들에 들어가서, 다른 언어는 앱이 `Locale` 을 가져와 넘깁니다. 가져오려면 `date-fns` 나 `react-day-picker` 를 앱 의존성에 더합니다.
- 버튼, 목록, 날짜 이름은 IDS 메시지(한국어)를 씁니다. `react-day-picker/locale` 의 `Locale` 은 자기 번역을 쓰고, `labels` 로 하나씩 바꿀 수도 있습니다.
- 날짜 버튼 이름은 `오늘, 2026년 9월 15일 화요일, 선택됨` 처럼 오늘과 선택 여부를 함께 읽습니다.

## 부분 바꾸기

```tsx
function EventDay(props: Calendar.DayButtonProps) {
  return (
    <Calendar.DayButton {...props}>
      {props.children}
      {props.modifiers.event && <span className="size-1 rounded-full bg-current" />}
    </Calendar.DayButton>
  );
}

<Calendar
  modifiers={{ event: eventDates }} // 날짜에 이름을 붙인다
  modifiersClassNames={{ event: 'font-bold' }} // 그 이름의 칸에 클래스
  components={{ DayButton: EventDay }} // react-day-picker 부분 교체
  formatters={{ formatDay: (date) => `${date.getDate()}` }}
  footer="일정 3개" // role="status" 알림 영역
/>;
```

- `components` 는 [react-day-picker 의 부분](https://daypicker.dev/guides/custom-components)을 바꿉니다. IDS 는 `Root`, `DayButton`, `Chevron`, `Dropdown`, `MonthGrid`, `PreviousMonthButton`, `NextMonthButton` 을 채워 두고, 넘긴 것이 그 위에 덮입니다.
- `Calendar.DayButton` 을 감싸면 IDS 날짜 모양, 상태 속성, 포커스 이동은 그대로 두고 내용만 바꿉니다.
- 부분 컴포넌트는 모듈 최상단에 선언합니다. 렌더 안에서 만들면 매번 새 컴포넌트라 날짜가 다시 마운트됩니다.

## 상태

| 날짜 버튼                                                   | 뜻                              |
| ----------------------------------------------------------- | ------------------------------- |
| `data-calendar-day`                                         | 그 날의 ISO 로컬 날짜           |
| `data-selected`                                             | 선택됨. 기간의 가운데 날도 포함 |
| `data-today`                                                | 오늘                            |
| `data-disabled`                                             | 고를 수 없음                    |
| `data-outside`                                              | 앞뒤 달의 날                    |
| `data-range-start` / `data-range-middle` / `data-range-end` | 기간의 시작 / 가운데 / 끝       |
| `data-range-preview`                                        | 끝을 고르기 전 미리 보기 안     |

- 날짜 칸(`td`)에는 react-day-picker 의 `data-day`, `data-selected`, `data-today`, `data-outside` 가 붙습니다.
- 루트의 `className` 과 `style` 은 `Calendar.State`(`value`, `month`, `disabled`, `readOnly`, `selectionMode`)를 받는 함수도 됩니다. 루트에는 `data-disabled`, `data-readonly`, `data-size`, `data-selection-mode` 가 붙습니다.

## 속성

| 속성                                                                                    | 기본 / 동작                                               |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `selectionMode`                                                                         | `single`(기본) / `range` / `multiple` / `none`            |
| `value` / `defaultValue` / `onValueChange`                                              | 모드별 타입. 기본 `null`, `multiple` 은 `[]`              |
| `min` / `max`                                                                           | 양 끝 포함                                                |
| `disabled`                                                                              | `true` 면 전체, matcher 면 날짜별                         |
| `readOnly`                                                                              | 이동만                                                    |
| `captionLayout`                                                                         | `label`(기본) / `dropdown`                                |
| `monthsToShow`                                                                          | `1`. 1~12                                                 |
| `month` / `defaultMonth` / `onMonthChange`                                              | 보이는 첫 달                                              |
| `today`                                                                                 | 오늘 표시와 첫 달의 기준                                  |
| `locale`                                                                                | `ko-KR`. 태그 또는 date-fns `Locale`                      |
| `weekStartsOn`                                                                          | locale 의 주 시작. `0`(일) ~ `6`(토)                      |
| `dir`                                                                                   | 부모 방향                                                 |
| `size`                                                                                  | `standard`(칸 36px) / `tiny`(32px). 생략하면 `Field` 크기 |
| `autoFocus`                                                                             | 선택한 날, 없으면 오늘에 포커스                           |
| `showOutsideDays`                                                                       | 한 달이면 `true`, 여러 달이면 `false`                     |
| `fixedWeeks`                                                                            | `true`. 어느 달이든 6주라 높이가 그대로다                 |
| `showWeekNumber` / `numerals`                                                           | react-day-picker 그대로                                   |
| `modifiers` / `modifiersClassNames` / `components` / `formatters` / `labels` / `footer` | react-day-picker 그대로                                   |
| `className` / `style`                                                                   | 루트. 상태를 받는 함수도 된다                             |
| 그 외 native 속성, `ref`                                                                | 루트 `div`. 기본 `role="group"`, 이름 `달력`              |

## 알아둘 것

- 날짜는 로컬 연월일이고 시간은 비교에서 빠집니다. 로컬 날짜는 `new Date(2026, 8, 15)` 로 만듭니다. `new Date('2026-09-15')` 는 UTC 자정이라 시간대에 따라 하루 전날이 됩니다.
- 바깥에서 준 `value` 는 min/max 로 자르지 않고, 바뀌어도 보이는 달을 옮기지 않습니다. 필요하면 `month` 도 함께 제어합니다.
- 서버 렌더링 결과를 클라이언트와 맞추려면 `today` 를 고정합니다.
- 앞뒤 달의 날을 누르면 그 날을 고르지만 보이는 달은 그대로입니다.
- `prefers-reduced-motion` 이면 색 전환도 하지 않습니다.
