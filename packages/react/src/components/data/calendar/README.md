# Calendar

날짜를 한 달 단위 격자로 보여 주고 하루, 기간, 여러 날을 고르게 하는 달력입니다. [react-day-picker](https://daypicker.dev) 위에 IDS 모양과 값 규칙을 얹었습니다.

- **세 가지 선택.** `single`, `range`, `multiple`. 고르지 않고 보여 주기만 하려면 `readOnly` 입니다. 값은 [`@internationalized/date`](https://react-spectrum.adobe.com/internationalized/date/CalendarDate.html) 의 `CalendarDate` 입니다. 시간과 시간대가 없어서 로컬 시간대가 날짜를 하루 밀지 못합니다.
- **기간 미리 보기.** 시작을 고른 뒤에는 포인터나 키보드 포커스가 있는 날까지 기간이 미리 그려집니다.
- **빠른 이동.** `<Calendar.Caption layout="dropdown" />` 을 넣으면 연도와 월을 목록에서 바로 고릅니다. 생년월일처럼 먼 날짜도 몇 번 만에 갑니다.
- **WAI-ARIA 격자 키보드.** react-day-picker 의 키보드 그대로입니다. 막힌 날은 건너뛰고, 오른쪽에서 왼쪽으로 쓰는 문서에서는 좌우가 뒤집힙니다.
- **Intl locale.** 월, 요일 이름, 날짜 숫자, 주 시작 요일을 브라우저의 `Intl` 로 그립니다. locale 은 `IdsProvider` 의 `locale`(BCP 47 태그)을 따르고, 어떤 언어든 import 없이 됩니다. 기본은 한국어입니다.
- **날짜 칸 꾸미기.** `Calendar.Day` part 가 날짜에 이름을 붙이고(`modifiers`) 칸의 내용을 바꿉니다. 모양, 포커스, 상태 속성은 IDS 가 그립니다.

```tsx
import { CalendarDate } from '@internationalized/date';
import { Calendar } from '@gsainfoteam/ids-react';

const [date, setDate] = useState<CalendarDate | null>(null);

<Calendar aria-label="달력" value={date} onValueChange={setDate} />;
```

## 선택

```tsx
<Calendar aria-label="달력" value={date} onValueChange={setDate} />                             // single(기본): CalendarDate | null
<Calendar aria-label="달력" selectionMode="range" value={range} onValueChange={setRange} />     // DateRange | null
<Calendar aria-label="달력" selectionMode="multiple" value={dates} onValueChange={setDates} />  // CalendarDate[]
<Calendar aria-label="달력" readOnly value={meeting} />                                         // 표시만. 고를 수 없다

<Calendar aria-label="달력" defaultValue={new CalendarDate(2026, 9, 15)} />                     // 비제어. 월은 1부터
```

- 값을 만들려면 앱도 `@internationalized/date` 를 설치합니다. IDS 는 다시 내보내지 않습니다. 오늘은 `today(getLocalTimeZone())` 입니다.
- 값은 `instanceof` 가 아니라 모양(`year`, `month`, `day`, `calendar.identifier`, `compare`)으로 검사합니다. 다른 버전의 패키지여도 되고, `Date` 나 문자열은 오류입니다.
- 그레고리력(`gregory`)만 받습니다. 다른 달력의 날짜는 `toCalendar(date, new GregorianCalendar())` 로 바꿔 넘깁니다. 다른 달력으로 보여 주기만 하려면 `IdsProvider` locale 의 태그에 적습니다(`tag: 'ja-JP-u-ca-japanese'`).
- `onValueChange` 는 값이 바뀔 때만 부릅니다. 이미 고른 날을 다시 눌러도 부르지 않습니다.
- 고른 날은 primary 로 채웁니다. 오늘은 `text-primary` 글자에 primary 테두리를 두르고, 고른 날이 오늘이면 채움만 보입니다. `Calendar.Day` 로 칸 안에 점을 그려도 오늘 표시와 겹치지 않습니다.
- `multiple` 에서 고른 날을 다시 누르면 빠집니다.

## 기간

```tsx
import { Calendar, type DateRange } from '@gsainfoteam/ids-react';

const [range, setRange] = useState<DateRange | null>(null);

<Calendar aria-label="달력" selectionMode="range" value={range} onValueChange={setRange} monthsToShow={2} />;
// 첫 클릭   { start: 24일, end: null }    이후 포인터가 있는 날까지 미리 보기
// 두 번째   { start: 24일, end: 10월 2일 } 더 이른 날을 누르면 시작과 끝이 바뀐다
// 세 번째   { start: 새 날, end: null }    새 기간을 시작
```

- 기간 안의 날은 `bg-primary-soft` 위에 `text-on-primary-soft` 입니다. 끝을 고르기 전 미리 보기는 `bg-neutral-soft` 이라 확정된 기간과 구분됩니다.
- 미리 보기는 포인터가 가리키는 날까지이고, 포인터가 달력을 벗어나면 키보드 포커스가 있는 날까지입니다.
- 기간은 양 끝만 검사합니다. 사이에 막힌 날이 있어도 기간을 만들 수 있습니다.

## 월과 연도 이동

```tsx
<Calendar aria-label="달력">
  <Calendar.Caption layout="dropdown" />                                    // 제목 대신 연도, 월 목록
</Calendar>
<Calendar aria-label="달력" min={new CalendarDate(1920, 1, 1)} max={today(getLocalTimeZone())}>
  <Calendar.Caption layout="dropdown" />
</Calendar>
<Calendar aria-label="달력" monthsToShow={2} />                             // 1~12. 이전은 첫 달, 다음은 마지막 달에만
<Calendar aria-label="달력" defaultMonth={new CalendarDate(2026, 9, 1)} />  // 처음 보일 달
<Calendar aria-label="달력" month={month} onMonthChange={setMonth} />       // 보이는 달을 제어. 그 달 1일의 CalendarDate
```

- 처음 보이는 달은 `defaultMonth`, 첫 선택 날, 오늘 순서이고 min/max 안으로 들어옵니다.
- 연도 목록은 `min` 부터 `max` 까지입니다. 없으면 오늘 기준 앞뒤 100년입니다. 한국어는 연도 목록이 먼저 옵니다.
- 범위 밖의 달은 월 목록에서 고를 수 없습니다.
- 이전/다음은 ghost [IconButton](../../action/icon-button/README.md) 입니다. 범위 끝에서는 `disabled` 대신 `aria-disabled` 가 되어 눌리지 않고, 마지막 달로 넘긴 버튼에서 포커스가 빠지지 않습니다.
- 두 번째 달의 목록에서 고른 달은 두 번째 칸에 옵니다.
- `Calendar.Caption` 의 `className` 은 달 제목 줄에 붙습니다. part 가 없으면 `layout="label"` 입니다.
- 달 제목은 `role="status"` 라서 달이 바뀌면 화면 읽기 프로그램이 새 달을 읽습니다.

## 제한

```tsx
<Calendar
  aria-label="달력"
  min={new CalendarDate(2026, 1, 1)}           // 양 끝 포함. min === max 도 된다
  max={new CalendarDate(2026, 12, 31)}
  disabled={{ dayOfWeek: [0, 6] }}             // DateMatcher
/>
<Calendar aria-label="달력" disabled={(date) => isHoliday(date)} />
<Calendar aria-label="달력" disabled={[new CalendarDate(2026, 9, 17), { start, end }]} />
<Calendar aria-label="달력" disabled />               // 전체를 막는다. 이동, 선택, Tab 진입 모두
<Calendar aria-label="달력" readOnly value={date} />  // 이동은 되고 선택은 안 된다
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
- 막힌 날은 native `disabled` 버튼이라 클릭도 키보드도 닿지 않습니다.

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

locale 은 가장 가까운 `IdsProvider` 의 `locale` 입니다. 달력 하나만 다른 언어로 그리려면 그 둘레에 `IdsProvider.Scope` 를 둡니다.

```tsx
<Calendar aria-label="달력" />                                                                 // 한국어: 2026년 9월, 일 월 화 ...
<IdsProvider.Scope locale={en}>
  <Calendar aria-label="달력" />                                                               // September 2026, S M T ...
</IdsProvider.Scope>
<IdsProvider.Scope locale={{ ...en, language: 'de', tag: 'de-DE' }}><Calendar aria-label="달력" /></IdsProvider.Scope>           // 월요일부터 시작
<IdsProvider.Scope locale={{ ...ko, tag: 'ko-KR-u-fw-mon' }}><Calendar aria-label="달력" /></IdsProvider.Scope>  // -u-fw- 확장으로 주 시작을 바꾼다
<IdsProvider.Scope locale={{ ...en, language: 'ja', tag: 'ja-JP' }}><Calendar aria-label="달력" /></IdsProvider.Scope>           // 2026年9月
<div dir="rtl">
  <IdsProvider.Scope locale={{ ...en, language: 'ar', tag: 'ar-EG-u-nu-arab' }}><Calendar aria-label="달력" /></IdsProvider.Scope> // -u-nu- 확장으로 아랍 숫자(١٥), 좌우 반전
</div>
```

| 그리는 것                    | Intl                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| 제목, 격자 이름              | `{ year: 'numeric', month: 'long' }`                        |
| 요일 머리글 / 요일 이름      | `{ weekday: 'narrow' }` / `{ weekday: 'long' }`             |
| 날짜 숫자, 연도 목록         | `day` / `year` 부분만(`formatToParts`)                      |
| 월 목록                      | `{ month: 'long' }`                                         |
| 날짜 버튼 이름               | `{ dateStyle: 'full' }`, 오늘이면 앞에 `RelativeTimeFormat` |
| 주차                         | 두 자리 숫자                                                |
| 이전/다음 달 버튼            | `RelativeTimeFormat` 의 -1 / +1 month(`지난달`, `다음 달`)  |
| 연도/월 목록, 주차 머리글    | `DisplayNames` 의 `year` / `month` / `weekOfYear`           |

- 잘못된 태그(`'de_DE'`, date-fns `Locale` 객체)는 오류입니다.
- 숫자 체계는 태그의 `-u-nu-` 확장입니다. 날짜, 제목, 주차, 이름 모두 그 숫자로 그립니다.
- 주 시작은 locale 에서 구합니다(`@internationalized/date` 의 `getDayOfWeek`). 태그의 `-u-fw-` 확장이 있으면 그쪽을 따릅니다.
- 버튼, 목록, 날짜, 격자, 요일 이름은 모두 locale 을 따르고 메시지 카탈로그를 거치지 않습니다.
- 날짜 버튼 이름은 `오늘, 2026년 9월 15일 화요일` 처럼 오늘을 함께 읽습니다. 선택 여부는 `aria-selected` 가 알립니다.

## 날짜 칸 꾸미기

날짜에 이름을 붙이고(`modifiers`), 그 이름으로 날짜 버튼의 내용을 그립니다(children 함수).

```tsx
<Calendar aria-label="달력">
  <Calendar.Day modifiers={{ event: eventDates, weekend: { dayOfWeek: [0, 6] } }}>
    {(day, state) => (
      <>
        {day.day}
        {state.modifiers.event && <span aria-hidden className="size-1 rounded-full bg-current" />}
      </>
    )}
  </Calendar.Day>
  <Calendar.WeekNumber />                    // 있으면 주차 열을 그린다
  <Calendar.Footer>일정 3개</Calendar.Footer> // role="status" 알림 영역
</Calendar>
```

- `Calendar.Day` 는 날짜 버튼 하나하나의 틀입니다. 그 자리에 그려지지 않고, 달력이 날마다 읽습니다.
- `modifiers` 는 이름마다 `DateMatcher` 하나나 배열입니다. 그 날이 맞는지는 `state.modifiers.<이름>` 으로 읽습니다.
- children 함수는 날짜 버튼의 내용만 바꿉니다. 버튼 모양, 포커스 이동, 이름(`aria-label`)은 IDS 가 그대로 그립니다. 함수를 주면 날짜 숫자도 직접 그립니다. 숫자 체계를 따르려면 `Intl.NumberFormat(locale)` 로 씁니다.
- `Calendar.WeekNumber` 의 `className` 은 주차 칸과 머리글에 붙습니다.
- `Calendar.Footer` 는 `role="status"` 인 `div` 이고 `asChild` 를 받습니다.

| `Calendar.DayState`                        | 뜻                                               |
| ------------------------------------------ | ------------------------------------------------ |
| `selected`                                 | 선택됨. 기간의 가운데 날도 포함                  |
| `today` / `outside` / `disabled`           | 오늘 / 앞뒤 달의 날 / 고를 수 없음               |
| `rangeStart` / `rangeMiddle` / `rangeEnd`  | 기간의 시작 / 가운데 / 끝                        |
| `modifiers`                                | `Calendar.Day` 의 `modifiers` 이름마다 그 날이 맞는지(`boolean`) |

- 이름, 요일, 제목 글자는 Intl 로 그립니다([locale](#locale)). react-day-picker 의 `components`, `formatters`, `labels` 는 받지 않습니다.

## 상태

앱은 상태를 값으로 읽습니다.

- 고른 날: `value` / `onValueChange`. 보이는 달: `month` / `onMonthChange`.
- 날짜 하나의 상태: `Calendar.Day` 의 children 함수가 받는 `Calendar.DayState`([날짜 칸 꾸미기](#날짜-칸-꾸미기)).
- 루트의 `className` 과 `style` 은 `Calendar.State`(`value`, `month`, `disabled`, `readOnly`, `selectionMode`)를 받는 함수도 됩니다. `className` 처럼 IDS 위에 새 디자인을 지을 때만 씁니다.

## 크기

- 내용 너비(hug)입니다. 달 수와 `size` 가 너비를 정하고, 부모 너비로 늘어나지 않습니다.
- 자리는 부모가 정합니다. 여백은 부모의 `gap` 으로 둡니다.

```tsx
<div className="flex justify-center">
  <Calendar aria-label="달력" />
</div>
```

## 속성

| 속성                                       | 기본 / 동작                                               |
| ------------------------------------------ | --------------------------------------------------------- |
| `selectionMode`                            | `single`(기본) / `range` / `multiple`                     |
| `value` / `defaultValue` / `onValueChange` | 모드별 타입. 기본 `null`, `multiple` 은 `[]`              |
| `min` / `max`                              | `CalendarDate`. 양 끝 포함                                |
| `disabled`                                 | `true` 면 전체, `DateMatcher` 면 날짜별                   |
| `readOnly`                                 | 이동만                                                    |
| `monthsToShow`                             | `1`. 1~12. 한 달이면 앞뒤 달의 날도 보이고, 여러 달이면 숨긴다 |
| `month` / `defaultMonth` / `onMonthChange` | 보이는 첫 달. 그 달 1일의 `CalendarDate`                  |
| `today`                                    | `today(getLocalTimeZone())`. 오늘 표시와 첫 달의 기준     |
| `dir`                                      | 부모 방향                                                 |
| `size`                                     | `standard`(칸 36px) / `tiny`(32px). 생략하면 `Field` 크기 |
| `autoFocus`                                | 선택한 날, 없으면 오늘에 포커스                           |
| `aria-label` / `aria-labelledby`           | 필수. 달력의 이름. 없으면 개발 모드에서 경고              |
| `className` / `style`                      | 루트. 상태를 받는 함수도 된다                             |
| 그 외 native 속성, `ref`                   | 루트 `div`. 기본 `role="group"`                           |

| part                  | 하는 일                                                        |
| --------------------- | -------------------------------------------------------------- |
| `Calendar.Day`        | `modifiers`, 날짜 버튼의 `className`, 내용 함수 `(day, state)` |
| `Calendar.Caption`    | `layout`: `label`(기본) / `dropdown`, 달 제목 줄의 `className` |
| `Calendar.WeekNumber` | 있으면 주차 열. 칸의 `className`                               |
| `Calendar.Footer`     | 달력 아래 `role="status"` 알림 영역                            |

- 어느 달이든 6주를 그려서 달을 넘겨도 높이가 그대로입니다.
- 루트의 locale 은 `IdsProvider` 의 `locale` 이고, 루트의 `lang` 이 됩니다.

## 알아둘 것

- 값은 시간대가 없는 달력 날짜입니다. react-day-picker 에는 `day-picker-bridge.ts` 에서만 로컬 자정 `Date` 로 바꿔 넘기고, 받는 즉시 되돌립니다. 로컬 시간대를 바꿔도 고른 날은 그대로입니다.
- 바깥에서 준 `value` 는 min/max 로 자르지 않고, 바뀌어도 보이는 달을 옮기지 않습니다. 필요하면 `month` 도 함께 제어합니다.
- 서버 렌더링 결과를 클라이언트와 맞추려면 `today` 를 고정합니다.
- 앞뒤 달의 날을 누르면 그 날을 고르지만 보이는 달은 그대로입니다.
- `prefers-reduced-motion` 이면 색 전환도 하지 않습니다.
- 이름과 숫자는 런타임의 `Intl` 데이터입니다. 서버(Node)와 브라우저의 ICU 가 다르면 글자가 조금 다를 수 있습니다.
