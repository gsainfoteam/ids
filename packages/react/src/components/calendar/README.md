# Calendar

로컬 날짜를 고르는 달력. `DateField` 팝업도 이 컴포넌트를 쓴다.

```tsx
import { useState } from 'react';
import { Calendar } from '@gsainfoteam/ids-react';

function BookingDate() {
  const [date, setDate] = useState<Date | null>(null);
  return <Calendar value={date} onChange={setDate} locale="ko-KR" />;
}
```

## 선택 모드

```tsx
<Calendar value={date} onChange={setDate} />                            // single(기본): Date | null
<Calendar selectionMode="range" value={range} onChange={setRange} />    // DateRange | null
<Calendar selectionMode="multiple" value={dates} onChange={setDates} /> // Date[], 다시 누르면 해제
<Calendar selectionMode="none" value={date} />                          // 탐색만. onChange 없음

<Calendar defaultValue={new Date(2026, 8, 15)} />                       // value를 생략하면 uncontrolled. 기본 null / []
```

## 기간

```tsx
import { Calendar, type DateRange } from '@gsainfoteam/ids-react';

const [range, setRange] = useState<DateRange | null>(null);

<Calendar selectionMode="range" value={range} onChange={setRange} monthsToShow={2} />;
// 1번째 클릭: { start: 15일, end: null }
// 2번째 클릭: { start: 15일, end: 20일 }  더 이른 날짜를 누르면 start/end가 정렬된다
// 3번째 클릭: { start: 새 날짜, end: null } 새 기간을 시작
// { start: null, end: null }도 빈 값이다. end만 있거나 start > end인 값은 오류
```

## 제한

```tsx
<Calendar
  min={new Date(2026, 0, 1)}                 // min/max는 양 끝 포함. min === max도 허용
  max={new Date(2026, 11, 31)}               // 범위 밖 달로는 이동하지 않는다
  disabled={(date) => date.getDay() === 0}   // 날짜별 선택 차단. 키보드로 지나갈 수는 있다
/>
<Calendar disabled />                        // 전체 차단: 이동, 선택 모두 불가
<Calendar readOnly value={date} />           // 탐색만 허용
```

## 표시 월

```tsx
<Calendar defaultMonth={new Date(2026, 8, 1)} />             // 처음 보일 달
<Calendar month={month} onMonthChange={setMonth} />          // 표시 달을 제어. 콜백은 그 달 1일을 준다
<Calendar monthsToShow={2} />                                // 1..12. 공간이 모자라면 줄바꿈
<Calendar today={new Date(2026, 8, 15)} />                   // 오늘 강조와 초기 달 기준. SSR, 테스트에서 고정
<Calendar locale="ko-KR" weekStartsOn={1} />                 // 기본 en-US, 주 시작은 locale 데이터
```

## 합성

```tsx
<Calendar value={date} onChange={setDate} monthsToShow={2}>
  <Calendar.Header>
    <Calendar.Navigation />                  {/* 이전/다음 달 버튼과 제목 */}
  </Calendar.Header>
  <Calendar.Grid monthIndex={1}>             {/* monthsToShow 안의 몇 번째 달인지. 기본 0 */}
    <Calendar.Grid.HeaderRow />
    <Calendar.Grid.Body>
      {(date) => (
        <Calendar.Grid.Cell date={date}>
          {(state) => (state.today ? '오늘' : date.getDate())}
        </Calendar.Grid.Cell>
      )}
    </Calendar.Grid.Body>
  </Calendar.Grid>
</Calendar>
// Cell state: selected, today, disabled, outsideMonth, rangeStart, rangeEnd, rangeMiddle
// Cell은 native button props와 ref를 받는다. Body 밖에 두면 오류
// Header, Navigation, Grid, HeaderRow, Body는 asChild를 지원한다
```

## 속성

| 속성                                   | 기본 / 동작                                              |
| -------------------------------------- | -------------------------------------------------------- |
| `selectionMode`                        | `single`(기본) / `range` / `multiple` / `none`           |
| `value` / `defaultValue` / `onChange`  | 모드별 타입. 생략하면 uncontrolled                       |
| `min` / `max`                          | 양 끝 포함                                               |
| `disabled`                             | `true`면 전체 차단, 함수면 날짜별 선택 차단              |
| `readOnly`                             | 탐색만 허용                                              |
| `month` / `defaultMonth` / `onMonthChange` | 표시 시작 달. 기본은 첫 선택 날짜 또는 `today`, min/max로 보정 |
| `monthsToShow`                         | `1`. 1..12                                               |
| `locale`                               | `en-US`. Intl Gregorian 달력                             |
| `weekStartsOn`                         | locale 주 시작 데이터, 없으면 일요일. `0..6`             |
| `today`                                | 마운트 시점의 로컬 날짜                                  |
| `size`                                 | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`      |
| `autoFocus`                            | 초점 날짜 버튼에 포커스                                  |
| `className` / `style` / `ref`          | 달력 컨테이너로 간다                                     |

## 알아둘 것

- 날짜는 로컬 Gregorian 연월일(1..9999년)이다. 비교에서 시간은 무시하고, `onChange`는 복제한 로컬 자정 `Date`를 준다. 원본을 수정하거나 UTC로 바꾸지 않는다.
- 로컬 날짜는 `new Date(year, monthIndex, day)`로 만든다. `new Date('2026-09-15')`는 UTC 자정이다.
- 기간은 양 끝만 검사한다. 중간에 비활성 날짜가 있어도 기간을 만들 수 있다.
- 외부 `value`는 min/max로 자르지 않고, 바뀌어도 표시 달을 옮기지 않는다. 필요하면 `month`도 제어한다.
- SSR과 클라이언트 결과를 맞추려면 `weekStartsOn`과 `today`를 명시한다.
- 키보드: 방향키는 하루/한 주, `Home`/`End`는 주 시작/끝, `PageUp`/`PageDown`은 한 달(`Shift`와 함께 1년), `Enter`/`Space`는 선택이다. 월말에서 달을 옮기면 그 달 마지막 날로 맞춘다.
- 날짜 라이브러리 의존성은 없다. native `Date`와 Intl만 쓴다.
