# Calendar

날짜를 한 달 단위 격자로 보여 주고 하루, 기간, 여러 날을 고르게 하는 달력입니다. [react-day-picker](https://daypicker.dev) 위에 IDS 모양과 값 규칙을 얹었습니다.

- **세 가지 선택.** `single`, `range`, `multiple` 에 탐색만 하는 `none` 까지. 값은 [`@internationalized/date`](https://react-spectrum.adobe.com/internationalized/date/CalendarDate.html) 의 `CalendarDate` 입니다. 시간과 시간대가 없어서 로컬 시간대가 날짜를 하루 밀지 못합니다.
- **기간 미리 보기.** 시작을 고른 뒤에는 포인터나 키보드 포커스가 있는 날까지 기간이 미리 그려집니다.
- **빠른 이동.** `captionLayout="dropdown"` 이면 연도와 월을 목록에서 바로 고릅니다. 생년월일처럼 먼 날짜도 몇 번 만에 갑니다.
- **WAI-ARIA 격자 키보드.** react-day-picker 의 키보드 그대로입니다. 막힌 날은 건너뛰고, 오른쪽에서 왼쪽으로 쓰는 문서에서는 좌우가 뒤집힙니다.
- **Intl locale.** 월, 요일 이름, 날짜 숫자, 주 시작 요일을 브라우저의 `Intl` 로 그립니다. `locale` 은 BCP 47 태그이고, 어떤 언어든 import 없이 됩니다. 기본은 한국어입니다.
- **날짜 칸 꾸미기.** `modifiers` 로 날짜에 이름을 붙이고 `renderDay` 로 칸의 내용을 바꿉니다. 모양, 포커스, 상태 속성은 IDS 가 그립니다.

```tsx
import { CalendarDate } from '@internationalized/date';
import { Calendar } from '@gsainfoteam/ids-react';

const [date, setDate] = useState<CalendarDate | null>(null);

<Calendar value={date} onValueChange={setDate} />;
```

## 선택

```tsx
<Calendar value={date} onValueChange={setDate} />                              // single(기본): CalendarDate | null
<Calendar selectionMode="range" value={range} onValueChange={setRange} />      // DateRange | null
<Calendar selectionMode="multiple" value={dates} onValueChange={setDates} />   // CalendarDate[]
<Calendar selectionMode="none" value={meeting} />                              // 표시만. 고를 수 없다

<Calendar defaultValue={new CalendarDate(2026, 9, 15)} />                      // 비제어. 월은 1부터
```

- 값을 만들려면 앱도 `@internationalized/date` 를 설치합니다. IDS 는 다시 내보내지 않습니다. 오늘은 `today(getLocalTimeZone())` 입니다.
- 값은 `instanceof` 가 아니라 모양(`year`, `month`, `day`, `calendar.identifier`, `compare`)으로 검사합니다. 다른 버전의 패키지여도 되고, `Date` 나 문자열은 오류입니다.
- 그레고리력(`gregory`)만 받습니다. 다른 달력의 날짜는 `toCalendar(date, new GregorianCalendar())` 로 바꿔 넘깁니다. 다른 달력으로 보여 주기만 하려면 `locale="ja-JP-u-ca-japanese"` 처럼 태그에 적습니다.
- `onValueChange` 는 값이 바뀔 때만 부릅니다. 이미 고른 날을 다시 눌러도 부르지 않습니다.
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
<Calendar captionLayout="dropdown" min={new CalendarDate(1920, 1, 1)} max={today(getLocalTimeZone())} />
<Calendar monthsToShow={2} />                                       // 1~12. 이전은 첫 달, 다음은 마지막 달에만
<Calendar defaultMonth={new CalendarDate(2026, 9, 1)} />            // 처음 보일 달
<Calendar month={month} onMonthChange={setMonth} />                 // 보이는 달을 제어. 그 달 1일의 CalendarDate
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
  min={new CalendarDate(2026, 1, 1)}           // 양 끝 포함. min === max 도 된다
  max={new CalendarDate(2026, 12, 31)}
  disabled={{ dayOfWeek: [0, 6] }}             // DateMatcher
/>
<Calendar disabled={(date) => isHoliday(date)} />
<Calendar disabled={[new CalendarDate(2026, 9, 17), { start, end }]} />
<Calendar disabled />                          // 전체를 막는다. 이동, 선택, Tab 진입 모두
<Calendar readOnly value={date} />             // 이동은 되고 선택은 안 된다
```

| `DateMatcher`                               | 막는 날                                     |
| ------------------------------------------- | ------------------------------------------- |
| `CalendarDate` / `CalendarDate[]`           | 그 날 / 그 날들                             |
| `{ start, end }`                            | 양 끝을 포함한 기간                         |
| `{ before }` / `{ after }`                  | 그 날보다 앞 / 뒤. 그 날은 빠진다           |
| `{ after, before }`                         | 둘 사이. 두 조건을 모두 채우는 날           |
| `{ dayOfWeek: 0 }` / `{ dayOfWeek: [0, 6] }` | 요일. `0` 이 일요일                         |
| `(date: CalendarDate) => boolean`           | `true` 를 돌려준 날                         |
| `true` / `false`                            | 모두 / 없음                                 |

- `disabled` 는 `DateMatcher` 하나나 배열입니다. 배열이면 하나라도 맞는 날을 막습니다.
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
<Calendar />                                   // 한국어: 2026년 9월, 일 월 화 ...
<Calendar locale="en-US" />                    // September 2026, S M T ...
<Calendar locale="de-DE" />                    // 월요일부터 시작
<Calendar locale="en-US-u-fw-mon" />           // -u-fw- 확장으로 주 시작을 바꾼 태그
<Calendar locale="ja-JP" />                    // 2026年9月
<Calendar weekStartsOn={1} />                  // 주 시작을 직접 정한다. 0 = 일요일
<div dir="rtl">
  <Calendar locale="ar-EG" numerals="arab" />  // 아랍 숫자(١٥), 좌우 반전
</div>
```

| 그리는 것                    | Intl                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| 제목, 격자 이름              | `{ year: 'numeric', month: 'long' }`                        |
| 요일 머리글 / 요일 이름      | `{ weekday: 'narrow' }` / `{ weekday: 'long' }`             |
| 날짜 숫자, 연도 목록         | `day` / `year` 부분만(`formatToParts`)                      |
| 월 목록                      | `{ month: 'long' }`                                         |
| 날짜 버튼 이름               | `{ dateStyle: 'full' }` 에 IDS 메시지(`오늘`, `선택됨`)     |
| 주차                         | 두 자리 숫자                                                |

- 잘못된 태그(`'de_DE'`, date-fns `Locale` 객체)는 오류입니다.
- `numerals` 는 Intl 의 `numberingSystem` 입니다. 날짜, 제목, 주차, 이름 모두 그 숫자로 그립니다.
- 주 시작은 locale 에서 구합니다(`@internationalized/date` 의 `getDayOfWeek`). `weekStartsOn` 이 있으면 그쪽이 먼저입니다.
- 이전/다음 달 버튼, 연도/월 목록, 주차 이름은 IDS 메시지(한국어)입니다. 날짜, 격자, 요일 이름은 locale 을 따르고 영어로 새지 않습니다.
- 날짜 버튼 이름은 `오늘, 2026년 9월 15일 화요일, 선택됨` 처럼 오늘과 선택 여부를 함께 읽습니다.

## 날짜 칸 꾸미기

```tsx
<Calendar
  modifiers={{ event: eventDates, weekend: { dayOfWeek: [0, 6] } }} // 이름: DateMatcher
  modifiersClassNames={{ event: 'font-bold' }} // 그 이름의 칸(td)에 클래스
  renderDay={(day, state) => (
    <>
      {day.day}
      {state.modifiers.event && <span className="size-1 rounded-full bg-current" />}
    </>
  )}
  footer="일정 3개" // role="status" 알림 영역
/>
```

- `renderDay` 는 날짜 버튼의 내용만 바꿉니다. 버튼 모양, 포커스 이동, `data-*` 상태, 이름(`aria-label`)은 IDS 가 그대로 그립니다.
- `renderDay` 를 주면 날짜 숫자도 직접 그립니다. `numerals` 를 따르려면 `Intl.NumberFormat(locale, { numberingSystem })` 로 씁니다.

| `Calendar.DayState`                        | 뜻                                               |
| ------------------------------------------ | ------------------------------------------------ |
| `selected`                                 | 선택됨. 기간의 가운데 날도 포함                  |
| `today` / `outside` / `disabled`           | 오늘 / 앞뒤 달의 날 / 고를 수 없음               |
| `rangeStart` / `rangeMiddle` / `rangeEnd`  | 기간의 시작 / 가운데 / 끝                        |
| `modifiers`                                | `modifiers` 로 준 이름마다 그 날이 맞는지(`boolean`) |

- 이름, 요일, 제목 글자는 Intl 로 그립니다([locale](#locale)). react-day-picker 의 `components`, `formatters`, `labels` 는 받지 않습니다.

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
| `min` / `max`                                                                           | `CalendarDate`. 양 끝 포함                                |
| `disabled`                                                                              | `true` 면 전체, `DateMatcher` 면 날짜별                   |
| `readOnly`                                                                              | 이동만                                                    |
| `captionLayout`                                                                         | `label`(기본) / `dropdown`                                |
| `monthsToShow`                                                                          | `1`. 1~12                                                 |
| `month` / `defaultMonth` / `onMonthChange`                                              | 보이는 첫 달. 그 달 1일의 `CalendarDate`                  |
| `today`                                                                                 | `today(getLocalTimeZone())`. 오늘 표시와 첫 달의 기준     |
| `locale`                                                                                | `ko-KR`. BCP 47 태그. 루트의 `lang` 이 된다               |
| `weekStartsOn`                                                                          | locale 의 주 시작. `0`(일) ~ `6`(토)                      |
| `dir`                                                                                   | 부모 방향                                                 |
| `size`                                                                                  | `standard`(칸 36px) / `tiny`(32px). 생략하면 `Field` 크기 |
| `autoFocus`                                                                             | 선택한 날, 없으면 오늘에 포커스                           |
| `showOutsideDays`                                                                       | 한 달이면 `true`, 여러 달이면 `false`                     |
| `fixedWeeks`                                                                            | `true`. 어느 달이든 6주라 높이가 그대로다                 |
| `showWeekNumber`                                                                        | react-day-picker 그대로                                   |
| `numerals`                                                                              | locale 의 숫자. Intl `numberingSystem`                    |
| `modifiers` / `modifiersClassNames`                                                     | 이름별 `DateMatcher` / 이름별 칸 클래스                   |
| `renderDay`                                                                             | 날짜 버튼의 내용. `(day, state) => ReactNode`             |
| `footer`                                                                                | 달력 아래 `role="status"` 알림 영역                       |
| `className` / `style`                                                                   | 루트. 상태를 받는 함수도 된다                             |
| 그 외 native 속성, `ref`                                                                | 루트 `div`. 기본 `role="group"`, 이름 `달력`              |

## 알아둘 것

- 값은 시간대가 없는 달력 날짜입니다. react-day-picker 에는 `day-picker-bridge.ts` 에서만 로컬 자정 `Date` 로 바꿔 넘기고, 받는 즉시 되돌립니다. 로컬 시간대를 바꿔도 고른 날은 그대로입니다.
- 바깥에서 준 `value` 는 min/max 로 자르지 않고, 바뀌어도 보이는 달을 옮기지 않습니다. 필요하면 `month` 도 함께 제어합니다.
- 서버 렌더링 결과를 클라이언트와 맞추려면 `today` 를 고정합니다.
- 앞뒤 달의 날을 누르면 그 날을 고르지만 보이는 달은 그대로입니다.
- `prefers-reduced-motion` 이면 색 전환도 하지 않습니다.
- 이름과 숫자는 런타임의 `Intl` 데이터입니다. 서버(Node)와 브라우저의 ICU 가 다르면 글자가 조금 다를 수 있습니다.
