# Calendar

날짜를 한 달 단위 격자로 보여 주고 하루, 기간, 여러 날을 고르게 하는 달력입니다.

- **세 가지 선택.** `single`, `range`, `multiple` 에 탐색만 하는 `none` 까지. 값은 native `Date` 이고 날짜 라이브러리가 필요 없습니다.
- **기간 미리 보기.** 시작을 고른 뒤에는 포인터나 키보드 포커스가 있는 날까지 기간이 미리 그려집니다.
- **빠른 이동.** `captionLayout="dropdown"` 이면 월과 연도를 목록에서 바로 고릅니다. 생년월일처럼 먼 날짜도 몇 번 만에 갑니다.
- **WAI-ARIA 격자 키보드.** 방향키, Home/End, PageUp/PageDown, Shift+PageUp/PageDown. 오른쪽에서 왼쪽으로 쓰는 문서에서는 좌우가 뒤집힙니다.
- **locale 그대로.** 월, 요일, 숫자 이름과 주 시작 요일을 `Intl` 에서 가져옵니다. 기본은 한국어입니다.
- **높이가 변하지 않습니다.** 어느 달이든 6주를 그려서 달을 넘겨도 버튼이 포인터 밑에서 움직이지 않습니다.

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
- 넘겨주는 `Date` 는 새로 만든 로컬 자정입니다. 원본을 고치거나 UTC로 바꾸지 않습니다.
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
<Calendar captionLayout="dropdown" />                               // 제목 대신 월, 연도 목록
<Calendar captionLayout="dropdown" min={new Date(1920, 0, 1)} max={new Date()} />
<Calendar monthsToShow={2} />                                       // 1~12. 이전은 첫 달, 다음은 마지막 달에만
<Calendar defaultMonth={new Date(2026, 8, 1)} />                    // 처음 보일 달
<Calendar month={month} onMonthChange={setMonth} />                 // 보이는 달을 제어. 그 달 1일을 준다
```

- 연도 목록은 `min` 부터 `max` 까지입니다. 없으면 오늘 기준 앞뒤 100년입니다.
- 범위 밖의 달은 월 목록에서 고를 수 없고, 이전/다음 버튼은 눌리지 않습니다. 버튼은 `disabled` 대신 `aria-disabled` 라서 끝에 닿아도 포커스가 그대로 남습니다.
- 두 번째 달의 목록에서 고른 달은 두 번째 칸에 옵니다.
- 버튼이나 목록으로 달이 바뀌면 화면 밖 `aria-live` 영역이 새 달을 읽어 줍니다.

## 제한

```tsx
<Calendar
  min={new Date(2026, 0, 1)}                   // 양 끝 포함. min === max 도 된다
  max={new Date(2026, 11, 31)}
  disabled={(date) => date.getDay() === 0}     // 날짜별로 막는다
/>
<Calendar disabled />                          // 전체를 막는다. 이동, 선택, Tab 진입 모두
<Calendar readOnly value={date} />             // 이동은 되고 선택은 안 된다
```

- 막힌 날도 키보드로는 지나갈 수 있습니다. `aria-disabled` 로 읽히고 선택만 되지 않습니다.

## 키보드

| 키                                | 동작                                       |
| --------------------------------- | ------------------------------------------ |
| `←` `→`                           | 하루 이동. 오른쪽에서 왼쪽 문서에서는 반대 |
| `↑` `↓`                           | 한 주 이동                                 |
| `Home` / `End`                    | 그 주의 첫날 / 마지막 날                   |
| `PageUp` / `PageDown`             | 한 달 이동. 31일에서 2월로 가면 말일       |
| `Shift+PageUp` / `Shift+PageDown` | 한 해 이동                                 |
| `Enter` / `Space`                 | 선택                                       |
| `Tab`                             | 날짜 격자에는 한 번만 들어간다             |

- 보이는 달 밖으로 나가면 그 날이 보이도록 달이 넘어갑니다.

## locale

```tsx
<Calendar />                                  // 한국어: 2026년 9월, 일 월 화 ...
<Calendar locale="en-US" />                   // September 2026, Sun Mon Tue ...
<Calendar locale="de-DE" />                   // 월요일부터 시작
<Calendar locale="ko-KR" weekStartsOn={1} />  // 주 시작을 직접 정한다. 0 = 일요일
<div dir="rtl">
  <Calendar locale="ar-EG" />                 // 아라비아 숫자, 토요일 시작, 좌우 반전
</div>
```

- 주 시작 요일은 브라우저의 locale 주 정보를 씁니다. 주 정보가 없는 브라우저(Firefox)에서도 CLDR 지역표로 같은 결과를 냅니다.
- 요일 이름이 너무 긴 locale(아랍어, 히브리어)은 한 글자 이름을 씁니다. 전체 이름은 `aria-label` 로 읽힙니다.

## 합성

```tsx
<Calendar value={date} onValueChange={setDate}>
  <Calendar.Header className="flex items-center gap-2">
    <Calendar.Title /> {/* 2026년 9월 */}
    <Button onClick={goToday}>오늘</Button>
    <Calendar.Previous /> {/* aria-label 로 이름을 바꿀 수 있다 */}
    <Calendar.Next />
  </Calendar.Header>
  <Calendar.Grid>
    <Calendar.Grid.HeaderRow />
    <Calendar.Grid.Body>
      {(date) => (
        <Calendar.Grid.Cell date={date}>
          {(cell) => (cell.today ? '오늘' : date.getDate())}
        </Calendar.Grid.Cell>
      )}
    </Calendar.Grid.Body>
  </Calendar.Grid>
</Calendar>
```

| 부분                                           | 기본                                          |
| ---------------------------------------------- | --------------------------------------------- |
| `Calendar.Month index`                         | 한 달. `Header` + `Grid`                      |
| `Calendar.Header`                              | `Navigation` 을 감싼다                        |
| `Calendar.Navigation`                          | 이전 + 제목(또는 월, 연도 목록) + 다음        |
| `Calendar.Previous` / `Calendar.Next`          | 달 이동 버튼                                  |
| `Calendar.Title`                               | 달 이름. `Month` 밖에서는 보이는 달 전체 범위 |
| `Calendar.MonthSelect` / `Calendar.YearSelect` | native select. 속성은 select 로 간다          |
| `Calendar.Grid monthIndex`                     | 한 달의 격자. `Month` 안에서는 그 달          |
| `Calendar.Grid.HeaderRow` / `Body` / `Cell`    | 요일 줄 / 6주 / 하루                          |

- 부분을 생략하면 기본 구성을 씁니다. 자식이 없는 `<Calendar />` 는 `monthsToShow` 만큼 `Month` 를 그립니다.
- `Header`, `Navigation`, `Month`, `Grid`, `HeaderRow`, `Body`, `Previous`, `Next`, `Title` 은 `asChild` 를 받습니다.
- `Cell` 의 속성은 날짜 `button` 으로 가고, `className`, `style`, `children` 은 날짜 상태를 받는 함수도 됩니다.

## 상태

| `Calendar.CellState`                      | 뜻                              |
| ----------------------------------------- | ------------------------------- |
| `date`                                    | 그 날                           |
| `selected`                                | 선택됨. 기간의 가운데 날도 포함 |
| `today`                                   | 오늘                            |
| `disabled`                                | 고를 수 없음                    |
| `outsideMonth`                            | 앞뒤 달의 날                    |
| `rangeStart` / `rangeEnd` / `rangeMiddle` | 기간의 시작 / 끝 / 가운데       |
| `preview`                                 | 끝을 고르기 전 미리 보기 안     |
| `focused`                                 | Tab 으로 들어갈 날              |

- 날짜 버튼에는 같은 상태가 `data-selected`, `data-today`, `data-disabled`, `data-outside-month`, `data-range-start`, `data-range-end`, `data-range-middle`, `data-range-preview` 로 붙습니다. 기간 띠는 칸의 `data-band="start | middle | end"` 입니다.
- 루트의 `className` 과 `style` 은 `Calendar.State`(`value`, `month`, `months`, `focusedDate`, `disabled`, `readOnly`, `selectionMode`)를 받는 함수도 됩니다. 루트에는 `data-disabled`, `data-readonly`, `data-size`, `data-selection-mode` 가 붙습니다.

## 속성

| 속성                                       | 기본 / 동작                                               |
| ------------------------------------------ | --------------------------------------------------------- |
| `selectionMode`                            | `single`(기본) / `range` / `multiple` / `none`            |
| `value` / `defaultValue` / `onValueChange` | 모드별 타입. 기본 `null`, `multiple` 은 `[]`              |
| `min` / `max`                              | 양 끝 포함                                                |
| `disabled`                                 | `true` 면 전체, 함수면 날짜별                             |
| `readOnly`                                 | 이동만                                                    |
| `captionLayout`                            | `label`(기본) / `dropdown`                                |
| `monthsToShow`                             | `1`. 1~12                                                 |
| `month` / `defaultMonth` / `onMonthChange` | 보이는 첫 달. 기본은 첫 선택 날 또는 오늘, min/max 안으로 |
| `today`                                    | 마운트한 날. 오늘 표시와 첫 달의 기준                     |
| `locale`                                   | `ko-KR`. 월, 요일, 숫자 이름                              |
| `weekStartsOn`                             | locale 의 주 시작. `0`(일) ~ `6`(토)                      |
| `size`                                     | `standard`(칸 36px) / `tiny`(32px). 생략하면 `Field` 크기 |
| `autoFocus`                                | 포커스 날짜에 포커스                                      |
| `className` / `style`                      | 루트. 상태를 받는 함수도 된다                             |
| 그 외 native 속성, `ref`                   | 루트 `div`. 기본 `role="group"`, 이름 `달력`              |

## 알아둘 것

- 날짜는 로컬 그레고리력 연월일(1~9999년)이고 시간은 비교에서 빠집니다. 로컬 날짜는 `new Date(2026, 8, 15)` 로 만듭니다. `new Date('2026-09-15')` 는 UTC 자정이라 시간대에 따라 하루 전날이 됩니다.
- 바깥에서 준 `value` 는 min/max 로 자르지 않고, 바뀌어도 보이는 달을 옮기지 않습니다. 필요하면 `month` 도 함께 제어합니다.
- 서버 렌더링 결과를 클라이언트와 맞추려면 `today` 를 고정합니다.
- 여러 달을 보일 때 다른 격자에 이미 있는 앞뒤 달의 날은 비워 둡니다. 날짜마다 포커스할 버튼이 하나뿐입니다.
- `prefers-reduced-motion` 이면 색 전환도 하지 않습니다.
