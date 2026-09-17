# TimeField

TimePicker를 팝업으로 여는 시간 선택 필드입니다. 직접 문자열 입력·파싱은 제공하지 않습니다.

```tsx
import { useState } from 'react';
import { Field, TimeField } from '@gsainfoteam/ids-react';
function Alarm() {
  const [time, setTime] = useState<Date | null>(null);
  return (
    <Field>
      <Field.Label>알람</Field.Label>
      <TimeField
        value={time}
        onChange={setTime}
        format="HH:mm"
        hourCycle="24h"
        step={15}
        mobileVariant="drawer"
      />
    </Field>
  );
}
```

- value/defaultValue: Date|null, onChange: Date|null. 생략 시 uncontrolled. Clear는 null입니다. 시간 선택은 입력 Date의 날짜를 유지하며, 빈 모델의 기준 날짜는 2000-01-01입니다.
- precision=hour/minute(default)/second, step=1, min/max, locale=en-US는 [TimePicker](../time-picker/README.md)에 전달합니다. min/max는 로컬 시각 기준으로 날짜를 무시합니다. 시간대 변환과 자정을 가로지르는 범위는 지원하지 않습니다.
- format=12h/24h 또는 표시 문자열. 기본은 locale입니다. 문자열 토큰 HH/H(24시간), hh/h(12시간), mm/m, ss/s, a. 영문 리터럴은 작은따옴표, ''는 따옴표입니다. 문자열 패턴은 표시 전용이며 picker의 시간제는 hourCycle=12h/24h로 지정합니다. hourCycle이 명시되면 format의 12h/24h보다 우선합니다.
- variant=outline/filled/unstyled, size=standard/tiny(Field 상속). pickerVariant=grid/wheel은 내부 TimePicker 변형입니다. disabled/readOnly는 열기·변경·Clear를 막습니다. selectionMode=none은 picker 탐색만 허용합니다.
- Trigger/Value/Content/Clear 합성 및 asChild를 제공합니다. Clear는 Trigger 형제입니다. Content children은 기본 picker를 대체합니다. root className/style은 표면, id/ref/ARIA/native button 속성은 실제 button+combobox에 적용합니다. autoFocus도 trigger입니다.
- 클릭·Enter·Space·ArrowDown으로 열며 첫 시간 컬럼에 포커스합니다. 컬럼별 방향키 탐색과 Enter/Space 선택 후에도 팝업은 유지됩니다. Escape·닫기·trigger 재클릭·외부 클릭/포커스로 닫으며 이미 선택한 값은 유지합니다. Clear/명시 닫기는 trigger로 포커스를 돌립니다.
- mobileVariant=drawer는 640px 미만에서 하단 비모달 팝업입니다. 포커스 트랩·배경 스크롤 잠금은 없습니다.
- name/form은 hidden input에 precision별 HH, HH:mm, HH:mm:ss(또는 빈 문자열)를 제출합니다. disabled는 제출에서 제외합니다. uncontrolled native reset은 defaultValue로 돌아가고 팝업을 닫습니다. controlled reset은 부모가 값을 변경합니다.
- required는 ARIA이며 button에 native constraint validation은 없습니다. RHF optional entry의 Field(controlMode=value), defaultValues의 null, `z.date().nullable().refine(Boolean)` 등으로 검증하세요. blur는 picker 내부 이동을 제외하고 전달합니다.
- Storybook: SelectAndClear.

- 팝업 위치·폭은 Clear를 포함한 필드 전체를 기준으로 계산합니다. 내부 목록 스크롤은 팝업 위치를 다시 계산하지 않으며, 모바일 drawer는 하단 safe area를 확보합니다.
