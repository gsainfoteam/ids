# DateField

Calendar 팝업에서 날짜를 선택하는 필드입니다. 직접 텍스트 입력·날짜 문자열 파싱은 제공하지 않습니다.

```tsx
import { useState } from 'react';
import { DateField, Field } from '@gsainfoteam/ids-react';

function BookingDate() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <Field>
      <Field.Label>예약 날짜</Field.Label>
      <DateField
        value={date}
        onChange={setDate}
        locale="ko-KR"
        format="yyyy년 M월 d일"
        mobileVariant="drawer"
      />
    </Field>
  );
}
```

- selectionMode: single(default) Date|null, range DateRange|null, multiple Date[]. DateRange는 `{start:Date|null,end:Date|null}`이며 첫 날짜 선택 후 end=null입니다. value 생략 시 defaultValue로 uncontrolled 동작, 기본 null/[]입니다.
- single은 선택 시 닫기, range/multiple은 열린 상태를 유지합니다. Escape·닫기 버튼·트리거 재클릭·외부 클릭/포커스로 닫으며 이미 선택한 값을 취소하지 않습니다. Clear는 빈 값으로 바꾸고 닫은 후 trigger로 포커스합니다.
- Calendar의 min/max, disabled(전체 boolean 또는 날짜 함수), readOnly, monthsToShow, locale, weekStartsOn, month/defaultMonth/onMonthChange, today를 전달합니다. disabled=true/readOnly는 열기·선택·Clear를 차단합니다. autoFocus는 trigger에 적용합니다. [Calendar의 날짜·범위·키보드 계약](../calendar/README.md)을 따릅니다.
- 날짜는 로컬 Gregorian 연·월·일입니다. 선택 콜백은 Date 모델, 표시 형식은 UI 전용입니다. 외부 값을 파싱하거나 제한에 맞춰 자르지 않습니다. `new Date('YYYY-MM-DD')`의 UTC 의미와 구분해 로컬 날짜는 `new Date(year, monthIndex, day)`로 만드세요.
- format 기본은 locale의 숫자 연·월·일. 문자열 토큰은 yyyy/yy, MMMM/MMM/MM/M, dd/d, EEEE/EEE입니다. 한글·구두점은 그대로, 영문 리터럴은 작은따옴표로 감싸며 ''는 따옴표 하나입니다. date-fns 전체 토큰 문법은 제공하지 않습니다. 예: `yyyy-MM-dd`, `yyyy년 M월 d일`, `EEE, MMM d`.
- format에 Intl.DateTimeFormatOptions(예: `{dateStyle:'long'}`)도 전달할 수 있습니다. Gregorian 달력을 사용하며 timeZone 또는 시·분·초 형식은 허용하지 않습니다. 잘못된 패턴은 빈 선택 상태에서도 오류로 알립니다.
- variant=outline/filled/unstyled, size=standard/tiny(Field 상속). root className/style은 표면에, id/ref/ARIA/native button props는 실제 Trigger에 전달합니다. Trigger는 button+combobox/aria-haspopup=dialog입니다. 열 때 선택 날짜/오늘로 포커스하고 Calendar의 방향키·PageUp/Down·Home/End·Enter/Space를 사용합니다.
- Trigger/Value/Content/Clear를 직접 합성할 수 있습니다. Clear는 Trigger의 형제여야 합니다. Content의 사용자 children은 기본 Calendar를 대체합니다. asChild 단일 자식은 해당 DOM props/ref를 전달해야 합니다.
- mobileVariant=drawer는 640px 미만 하단 비모달 팝업입니다. 기본은 anchor popover. 배경 스크롤 잠금·포커스 트랩은 없습니다. 공개 범용 Popover를 추가하지 않고 기존 FieldPopup을 재사용합니다.
- name/form의 native 제출: single `YYYY-MM-DD` 또는 빈 문자열, range `시작/끝`(중간 상태 `YYYY-MM-DD/`), multiple은 날짜마다 같은 이름으로 반복됩니다. ISO 문자열은 UTC 변환 없이 날짜 부분만 만듭니다. disabled=true이면 제외합니다.
- native reset은 uncontrolled 기본값으로 복원하고 팝업을 닫습니다. controlled reset은 부모가 처리합니다. required는 ARIA 힌트이며 native button constraint validation은 사용하지 않습니다.
- RHF는 optional `/react-hook-form` Field의 `controlMode="value"`로 연결합니다. defaultValues는 null/[]이며 단일 날짜는 `z.date().nullable().refine(Boolean)` 등으로, 범위는 start/end 모두 존재하는지 검증하세요. 오류 시 trigger로 포커스합니다.
- Storybook: SelectAndClear, Range, Multiple.
