# ChipField

검색 가능한 여러 옵션을 선택하고 칩으로 표시합니다. 명세의 이전 이름 BadgeField 대신 공개 이름은 ChipField입니다.

```tsx
import { useState } from 'react';
import { ChipField, Field } from '@gsainfoteam/ids-react';

function Tags() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <Field>
      <Field.Label>기술 태그</Field.Label>
      <ChipField
        value={tags}
        onChange={setTags}
        creatable
        onCreate={(tag) => console.log(tag)}
        maxCount={5}
      >
        <ChipField.SearchField placeholder="검색하거나 새 태그 입력" />
        <ChipField.Item value="react">React</ChipField.Item>
        <ChipField.Item value="ts">TypeScript</ChipField.Item>
      </ChipField>
    </Field>
  );
}
```

- value/defaultValue/onChange는 중복 없는 string[]입니다. value를 생략하면 uncontrolled, 기본값은 []입니다. maxCount는 0 이상 정수이며 새 선택/생성만 제한합니다. 외부에서 제공한 값은 자르지 않습니다.
- Item의 value는 필수·고유합니다. 표시·검색은 searchValue 또는 자식 텍스트를 사용합니다. Group heading으로 옵션을 묶습니다. 선언된 Item/Group/Content와 Fragment를 수집하며 사용자 컴포넌트 내부를 탐색하지 않습니다.
- creatable은 기본 false입니다. true이면 onCreate가 필수이며 앞뒤 공백을 제거한 문자열로 동기 호출한 뒤 선택에 추가합니다. 옵션 값/라벨 및 선택값과 대소문자 무시 비교로 중복 생성을 막습니다. 새 값의 서버 저장·ID 변환은 앱 책임입니다. 새 값은 부모가 Item을 추가하기 전까지 값 자체로 표시합니다.
- 검색어 입력 시 열기·필터링, ↑↓로 옵션/생성 행 이동, Enter로 활성 항목 토글/생성, Esc로 닫기, Tab으로 다음 포커스 이동. 빈 검색어의 Backspace는 마지막 칩을 삭제합니다. IME 조합 중 Enter는 선택하지 않습니다. 생성 행은 일치하는 옵션 뒤에 위치합니다.
- 칩 삭제 버튼은 입력과 형제입니다. input이 실제 combobox이며 Field label/id/ref/ARIA와 이벤트를 받습니다. required는 ARIA 힌트이고 배열 검증은 앱이 합니다. disabled/readOnly는 선택·생성·삭제를 막습니다. disabled Item은 선택 및 삭제할 수 없습니다.
- Trigger는 div 표면, Value는 칩 영역, SearchField는 실제 input입니다. 자동 합성이 기본이며 직접 Trigger를 쓰면 그 안에 Value와 **정확히 한 SearchField**를 배치하세요. Content/Item/Group/Create/Empty는 팝업 영역입니다. SearchField는 팝업 안에 배치하지 않습니다. 각 part는 asChild를 지원하며 단일 자식의 props/ref 전달이 필요합니다.
- root className/style은 표면에, native input 속성과 ref는 SearchField에 전달됩니다. 개별 part className으로 세부 스타일을 지정합니다. variant=outline/filled/unstyled, size=standard/tiny이며 Field 크기를 상속합니다.
- mobileVariant 기본 drawer: 640px 미만 하단 비모달 팝업, 그 외 anchor popover. 배경 스크롤 잠금·포커스 트랩은 없습니다. 공개 Chip/Popover/List 의존 API를 추가하지 않고 필드 내부 구현을 사용합니다.
- name/form으로 선택값마다 hidden input 한 개를 제출합니다. disabled면 제외합니다. native reset은 uncontrolled 기본값과 빈 검색어로 복원합니다. controlled 값은 부모가 reset합니다.
- RHF는 optional `/react-hook-form` Field에 `controlMode="value"`, defaultValues `{tags:[]}`, registerOptions.validate 또는 Zod 배열 검증을 지정합니다. 오류 포커스는 검색 input으로 갑니다.
- Storybook: SearchCreateAndRemove, Playground.
