# ChipField

검색 가능한 여러 옵션을 선택하고 칩으로 표시합니다. 명세의 이전 이름 BadgeField 대신 공개 이름은 ChipField입니다.

`<ChipField>`는 칩과 입력을 감싸는 컨테이너이고, `<ChipField.Input>`은 실제 검색 `<input>`을 렌더링하는 sentinel입니다. 구조는 TextField와 같습니다.

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
        placeholder="검색하거나 새 태그 입력"
      >
        <ChipField.Item value="react">React</ChipField.Item>
        <ChipField.Item value="ts">TypeScript</ChipField.Item>
      </ChipField>
    </Field>
  );
}
```

## 구성

```tsx
<ChipField value={tags} onChange={setTags}>
  <TagIcon /> {/* leading adornment: 칩 앞 */}
  <ChipField.Input placeholder="분야 검색" /> {/* 칩은 자동으로 Input 바로 앞에 렌더링 */}
  <ClearButton /> {/* trailing adornment: Input 뒤, 기본 chevron 앞 */}
  <ChipField.Item value="react">React</ChipField.Item>
</ChipField>
```

- 컨테이너 안의 순서는 `leading adornment → 칩 → Input → trailing adornment → chevron`입니다. 칩과 chevron은 자동으로 렌더링됩니다.
- 옵션 part(`Item`, `Group`, `Create`, `Empty`, `Content`)는 팝업으로 모이고, 나머지 children은 Input을 기준으로 leading/trailing adornment로 나뉩니다. 각 adornment는 `data-chip-field-adornment` span으로 감싸 TextField와 같은 스타일을 받습니다.
- `ChipField.Input`은 최대 한 개입니다. 생략하면 children 뒤에 `<ChipField.Input />`을 자동으로 넣습니다. Fragment 안의 Input도 찾지만 사용자 컴포넌트 내부는 탐색하지 않습니다.
- `<ChipField.Input asChild>`는 input 하나, 또는 input props와 ref를 전달하는 컴포넌트를 자식으로 받습니다.
- 목록 컨테이너에 props를 주려면 옵션을 `ChipField.Content`로 감쌉니다. Content를 쓰면 옵션을 루트에 직접 둘 수 없습니다. `Create`로 생성 행 내용을, `Empty`로 빈 결과 문구를 바꿉니다. 옵션 part는 asChild를 지원합니다.

## Props

- `className`/`style`은 컨테이너에 적용됩니다. `value`/`defaultValue`/`onChange`/`creatable`/`onCreate`/`maxCount`/`variant`/`size`/`invalid`/`mobileVariant`/`name`/`form`/`required`를 제외한 루트 props(id, placeholder, aria-\*, onKeyDown, onBlur, readOnly, ref 등)는 Input으로 전달됩니다.
- 값 props는 Input의 것이 루트보다 우선하고, 이벤트 핸들러는 루트와 Input 모두 실행됩니다. 컨테이너의 disabled/readOnly/invalid 상태는 루트와 Input props를 합친 결과로 정해집니다. combobox role, `aria-expanded`/`aria-controls`/`aria-activedescendant`, 검색어 값과 키보드 처리는 ChipField가 마지막에 적용합니다. 사용자 핸들러가 먼저 실행되고, `preventDefault()`하면 내장 처리를 건너뜁니다.
- 루트 `onChange`는 선택값(`string[]`) 콜백이고, `ChipField.Input`의 `onChange`는 검색어 입력 이벤트입니다.
- variant=outline/filled/unstyled, size=standard/tiny이며 Field 크기를 상속합니다.

## 동작

- value/defaultValue/onChange는 중복 없는 string[]입니다. value를 생략하면 uncontrolled, 기본값은 []입니다. maxCount는 0 이상 정수이며 새 선택/생성만 제한합니다. 외부에서 제공한 값은 자르지 않습니다.
- Item의 value는 필수·고유합니다. 표시·검색은 searchValue 또는 자식 텍스트를 사용합니다. Group heading으로 옵션을 묶습니다.
- creatable은 기본 false입니다. true이면 onCreate가 필수이며 앞뒤 공백을 제거한 문자열로 동기 호출한 뒤 선택에 추가합니다. 옵션 값/라벨 및 선택값과 대소문자 무시 비교로 중복 생성을 막습니다. 새 값의 서버 저장·ID 변환은 앱 책임입니다. 새 값은 부모가 Item을 추가하기 전까지 값 자체로 표시합니다.
- 검색어 입력 시 열기·필터링, ↑↓로 옵션/생성 행 이동, Enter로 활성 항목 토글/생성, Esc로 닫기, Tab으로 다음 포커스 이동. 빈 검색어의 Backspace는 마지막 칩을 삭제합니다. IME 조합 중 Enter는 선택하지 않습니다. 생성 행은 일치하는 옵션 뒤에 위치합니다.
- 컨테이너에서 버튼·링크·입력이 아닌 곳을 클릭하면 Input에 포커스하고 팝업을 엽니다.
- 칩 삭제 버튼은 입력과 형제입니다. Input이 실제 combobox이며 Field label/id/ref/ARIA와 이벤트를 받습니다. required는 ARIA 힌트이고 배열 검증은 앱이 합니다. disabled/readOnly는 선택·생성·삭제를 막습니다. disabled Item은 선택 및 삭제할 수 없습니다.
- mobileVariant 기본 drawer: 640px 미만 하단 비모달 팝업, 그 외 anchor popover. 배경 스크롤 잠금·포커스 트랩은 없습니다. 활성 옵션은 팝업 내부만 스크롤해 표시하며 배경 문서를 자동 스크롤하지 않습니다.
- name/form으로 선택값마다 hidden input 한 개를 제출합니다. disabled면 제외합니다. native reset은 uncontrolled 기본값과 빈 검색어로 복원합니다. controlled 값은 부모가 reset합니다.
- RHF는 optional `/react-hook-form` Field에 `controlMode="value"`, defaultValues `{tags:[]}`, registerOptions.validate 또는 Zod 배열 검증을 지정합니다. 오류 포커스는 Input으로 갑니다.
- Storybook: SearchCreateAndRemove, WithAdornments, Playground.
