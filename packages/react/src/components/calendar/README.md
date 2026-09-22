# Calendar

로컬 달력 날짜를 선택합니다. 공개 `Calendar`는 DateField에서도 사용합니다.

```tsx
import { useState } from 'react';
import { Calendar, type DateRange } from '@gsainfoteam/ids-react';

function TripDates() {
  const [range, setRange] = useState<DateRange | null>(null);
  return <Calendar selectionMode="range" value={range} onChange={setRange}
    locale="ko-KR" monthsToShow={2} min={new Date(2026, 0, 1)} />;
}
```

- selectionMode: single(default) Date|null, range DateRange|null, multiple Date[], none Date|null. none/readOnly는 탐색만 허용합니다. value 생략 시 defaultValue를 사용하는 uncontrolled이며 기본 null/[]입니다.
- DateRange는 `{start:Date|null,end:Date|null}`입니다. 첫 선택은 `{start:date,end:null}`, 두 번째 선택은 날짜 순으로 정렬된 범위, 완료 후 다음 클릭은 새 시작점입니다. `{start:null,end:null}`도 빈 값으로 허용합니다. 시작 없이 끝만 있거나 역순인 외부 범위는 오류입니다.
- Date는 유효한 로컬 Gregorian 날짜(년 1..9999)여야 합니다. 시간은 비교에서 무시하고 선택 콜백은 복제한 로컬 자정 Date를 전달합니다. 원본 Date를 수정하거나 UTC로 변환하지 않습니다. 네이티브 Date의 달력 연산과 Intl을 사용하며 날짜 라이브러리 의존성은 없습니다.
- min/max는 양 끝 포함이며 같은 날짜도 허용합니다. disabled=true는 전체 조작 차단, 함수는 개별 날짜 선택 차단입니다. 방향키로 비활성 날짜를 읽을 수 있지만 선택할 수 없습니다. 범위의 **끝점**을 검사하며 중간의 비활성 날짜를 포함한 범위는 허용합니다. 외부 value는 제한으로 잘라내지 않습니다.
- month/onMonthChange는 표시 시작 월을 제어합니다. defaultMonth는 초기 표시 월입니다. 기본은 첫 선택 날짜 또는 today이며 min/max로 보정합니다. 외부 value 변경은 표시 월을 강제 변경하지 않으므로 필요하면 month도 제어하세요.
- monthsToShow=1..12. 기본 1, 여러 월은 공간에 따라 줄바꿈합니다. 인접 월 간 같은 날짜를 중복 렌더링하지 않습니다. min/max 밖 월로만 이루어진 탐색을 막습니다. 표시 범위가 년 1..9999를 넘으면 오류입니다.
- locale 기본 en-US. 월/요일/날짜 접근성 이름은 Intl의 Gregorian 달력입니다. weekStartsOn=0..6, 기본 Intl.Locale의 주 시작 데이터, 미지원 브라우저에서는 일요일입니다. SSR 일치가 필요하면 weekStartsOn을 명시하세요.
- today는 오늘 강조와 초기 기준 날짜입니다. 기본은 마운트 시 로컬 날짜이며 SSR/테스트의 재현성을 위해 명시할 수 있습니다. size=standard/tiny는 Field 크기를 상속합니다. 날짜 셀 높이는 36/28px입니다.
- 자동 렌더링 또는 Header/Navigation/Grid 합성. Grid의 monthIndex로 표시할 월을 선택합니다. Grid.HeaderRow, Grid.Body가 행을 만듭니다. Body의 render prop `(date)=> <Calendar.Grid.Cell date={date}/>`로 셀을 바꿀 수 있습니다. Cell children은 `(state)=>ReactNode`도 지원하며 selected/today/disabled/outsideMonth/rangeStart/rangeEnd/rangeMiddle을 제공합니다.
- Header/Navigation/Grid/HeaderRow/Body는 asChild 단일 컨테이너를 지원합니다. Cell은 gridcell 안에 native button을 유지하며 일반 button props/ref를 받습니다. Cell은 Body 안에 있어야 합니다. root className/style/ref는 달력 컨테이너에 전달됩니다.
- ↑↓←→ 일자 이동, Home/End 주 시작/끝, PageUp/Down 월 이동, Shift+PageUp/Down 년 이동, Enter/Space 선택. 월말 이동은 마지막 날짜로 보정합니다. 달력 전체에서 날짜 버튼 하나만 Tab 순서에 포함합니다. autoFocus=true는 해당 날짜 버튼으로 포커스합니다.
- root는 group, 날짜는 grid/row/gridcell+aria-selected, 오늘은 aria-current=date입니다. application 역할로 스크린리더 탐색 모드를 강제하지 않습니다. 전환 애니메이션은 없으므로 reduced-motion에서도 동일합니다.
- Storybook: RangeAndKeyboard, Playground.

- 확정된 기간 배경은 시작 날짜의 중앙부터 종료 날짜의 중앙까지 이어져 선택 버튼의 둥근 모서리 아래에서 연결됩니다. 부분 기간·하루짜리 기간은 연결 띠를 표시하지 않습니다.
