# TimePicker

시·분·초와 AM/PM을 선택하는 독립 컴포넌트입니다.

```tsx
import { useState } from 'react';
import { TimePicker } from '@gsainfoteam/ids-react';
function Alarm() {
  const [time, setTime] = useState<Date | null>(null);
  return <TimePicker value={time} onChange={setTime} format="24h" step={15} />;
}
```

- value/defaultValue는 Date|null, onChange는 Date입니다. 입력 Date의 로컬 날짜를 보존하며 시각을 바꿉니다. 비어 있을 때 기준일은 2000-01-01이고 기준 시각은 00:00에 가장 가까운 허용 시각입니다. 아직 선택하지 않은 값은 선택 상태로 표시하거나 onChange로 전달하지 않습니다. 외부 값을 자동 수정하지 않습니다.
- precision=hour/minute(default)/second. 표시보다 작은 단위와 밀리초는 선택 시 0으로 정규화합니다. step은 가장 작은 단위의 간격(1..60)이며 hour일 때 1만 허용합니다. 분·초는 각 컬럼의 0부터 간격을 적용합니다.
- format=12h/24h, 기본은 locale(en-US)의 시간제입니다. Intl로 숫자와 AM/PM을 표시합니다. min/max는 날짜를 무시한 로컬 시각의 양 끝점이며 자정을 넘기는 범위는 지원하지 않습니다. 상위 단위를 고르면 해당 시간 안에서 가장 가까운 허용 시각을 선택합니다.
- variant=grid(default)/wheel. wheel은 가운데 스냅되는 native scroll 컬럼이며 사용자 스크롤이 끝나면 가운데 값을 선택합니다. scrollend가 누락되는 엔진·경계에서는 마지막 스크롤 이후 150ms에 확정합니다. 프로그램 스크롤과 키보드 위치 이동만으로 값이 바뀌지 않습니다. 클릭·키보드 탐색은 해당 컬럼 안에서만 스크롤하며 페이지 위치를 바꾸지 않습니다. 별도 회전/부드러운 스크롤 애니메이션을 사용하지 않아 reduced-motion에서도 즉시 이동합니다.
- size=standard/tiny(Field 상속). disabled는 조작·Tab 진입을 막고 readOnly 또는 selectionMode=none은 탐색만 허용합니다.
- 각 컬럼은 listbox+aria-activedescendant, 항목은 option+aria-selected입니다. ↑↓, Home/End, PageUp/Down(5항목)은 탐색, Enter/Space는 선택, ←→는 DOM 순서의 컬럼 이동입니다. Tab으로 각 컬럼에 접근합니다. 값 변경은 사용자 선택 시 발생합니다.
- Column(unit=hour/minute/second), Period(12h 전용), Separator, Header를 직접 합성할 수 있습니다. 중복 단위와 precision/format 불일치를 진단합니다. 사용자 children이 기본 컬럼 구성을 대체합니다. asChild는 props/ref를 전달하는 단일 요소가 필요합니다. Column/Period의 사용자 children은 option 콘텐츠를 직접 대체하므로 접근성 구조도 사용자가 제공해야 합니다.
- root의 id/ref/className/style/native div 속성은 group에, Column의 속성은 listbox에 적용합니다. root aria-label과 각 Column aria-label을 지역화할 수 있습니다. 기본 컬럼 이름은 Hour/Minute/Second/AM/PM입니다.
- DST로 존재하지 않는 시각은 선택할 수 없습니다. 중복 시각은 native Date의 이른 오프셋을 사용합니다. 별도 시간대 선택, 타임존 변환, Temporal 객체는 제공하지 않습니다.
- Storybook: Keyboard, Wheel.
