# DateTimeField

Calendar와 TimePicker를 하나의 팝업으로 조합해 로컬 날짜·시간을 선택합니다. 단일 Date|null만 지원합니다.

```tsx
import { useState } from 'react';
import { DateTimeField, Field } from '@gsainfoteam/ids-react';
function Meeting() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <Field>
      <Field.Label>회의 일시</Field.Label>
      <DateTimeField
        value={date}
        onChange={setDate}
        format="yyyy년 M월 d일 HH:mm"
        hourCycle="24h"
        step={15}
        mobileVariant="drawer"
      />
    </Field>
  );
}
```

- value/defaultValue/onChange는 Date|null, 기본 null. Calendar 날짜를 고르면 기존 시각을 보존하고 TimePicker는 날짜를 보존합니다. 새 날짜에서 범위/간격/DST 때문에 시각을 유지할 수 없으면 가장 가까운 허용 시각으로 보정합니다. 작은 정밀도 단위와 밀리초는 0입니다.
- 빈 모델의 시간 선택은 today(기본 mount 시점 로컬 날짜)의 00:00을 기준으로 시작합니다. 표시되지 않은 초기 값은 폼에 제출하지 않습니다. today가 범위 밖이면 날짜를 먼저 선택합니다. SSR에서 일관된 기준일이 필요하면 today를 고정하세요.
- min/max는 **날짜와 시간을 포함한 전체 Date 경계**입니다. 시작일과 종료일에만 시각 제한이 적용됩니다. precision/step에 맞는 시각이 없는 날은 비활성화합니다. disabled=true는 전체 차단, 함수는 날짜별 선택 차단입니다. readOnly는 열기/변경/Clear를 차단합니다. 외부 value는 자동 보정하지 않습니다.
- Calendar의 monthsToShow, locale, weekStartsOn, month/defaultMonth/onMonthChange, today와 TimePicker의 precision, step을 지원합니다. pickerVariant=grid/wheel, hourCycle=12h/24h. Calendar의 날짜 이동은 [Calendar API](../calendar/README.md), 시간 단위는 [TimePicker API](../time-picker/README.md) 기준입니다.
- format=12h/24h 또는 표시 패턴. 기본 locale. 날짜 토큰 yyyy/yy, MMMM/MMM/MM/M, dd/d, EEEE/EEE와 시간 토큰 HH/H, hh/h, mm/m, ss/s, a. 영문 리터럴은 작은따옴표, ''는 따옴표입니다. 사용자 패턴은 표시 전용이고 시간제는 hourCycle로 지정합니다. date-fns 전체 문법·텍스트 입력·파싱은 제공하지 않습니다.
- variant=outline/filled/unstyled, size=standard/tiny. Trigger/Value/Content/Clear 합성, 실제 trigger에 id/ref/ARIA/button 속성, 표면에 className/style을 전달합니다. Clear는 Trigger의 형제입니다. Content children은 기본 Calendar/TimePicker를 대체합니다.
- 첫 날짜로 포커스해 방향키 탐색을 시작합니다. 날짜·시간 변경 후에도 팝업을 유지하며 Escape·닫기·trigger 재클릭·외부 클릭/포커스로 닫습니다. Clear와 명시적 닫기는 trigger로 돌아갑니다. 모바일 drawer는 세로 배치·비모달이며 배경 잠금/포커스 트랩은 없습니다.
- name/form은 로컬 `YYYY-MM-DDTHH[:mm[:ss]]` 또는 빈 값을 제출합니다. UTC/오프셋 문자열이 아닙니다. disabled=true는 제외합니다. native reset/uncontrolled, 부모 reset/controlled와 RHF Field(controlMode=value)를 지원합니다. required는 ARIA이므로 Zod 등에서 Date/null 검증을 적용하세요.
- DST gap은 선택 불가, 중복 시각은 native Date의 이른 오프셋입니다. 별도 시간대/오프셋 선택은 없습니다. 지역의 반복 시각을 각각 예약해야 하는 앱은 별도의 시간대 정책을 구현해야 합니다.
- Storybook: PreserveDateAndTime.
