# Select

단일 `string | null` / `selectionMode="multiple"`의 `string[]` 값을 제공합니다. value 생략 시 defaultValue를 관리하며 onChange는 값 콜백입니다.

```tsx
<Field>
  <Field.Label>관심 분야</Field.Label>
  <Select selectionMode="multiple" value={skills} onChange={setSkills}>
    <Select.SearchField />
    <Select.Group heading="개발">
      <Select.Item value="react">React</Select.Item>
      <Select.Item value="flutter">Flutter</Select.Item>
    </Select.Group>
    <Select.Empty>검색 결과 없음</Select.Empty>
  </Select>
</Field>
```

- variant: outline / filled / unstyled. size: standard / tiny, Field 크기 상속.
- Trigger/Value/Content 자동 생성 또는 명시 합성. Item/Group은 Content 또는 루트의 직접 자식이나 Fragment로 선언합니다. 임의의 사용자 컴포넌트 내부는 수집하지 않습니다.
- Item의 searchValue로 검색/선택 표시 라벨을 지정할 수 있습니다. 생략 시 자식 텍스트를 사용합니다. 값은 고유해야 합니다.
- Trigger, Value, Content, SearchField, Item, Group, Empty는 asChild를 지원합니다. 해당 DOM props/ref를 전달하는 자식을 사용하세요. Content/Group 합성에서 목록은 선언된 children을 통해 수집합니다.
- Trigger 클릭, Enter/Space/↓로 열고 ↑↓/Home/End로 이동합니다. Enter/Space로 선택, Esc로 닫고 trigger 포커스로 돌아갑니다. 검색 input에서는 Space/Home/End가 텍스트 편집을 유지합니다. Tab은 팝업을 닫고 다음 컨트롤로 이동합니다.
- 검색이 없는 trigger에서 글자를 입력하면 라벨 접두어로 이동합니다. disabled 항목은 건너뜁니다. 다중 선택은 열린 상태로 토글하며 Esc는 이미 확정한 값을 되돌리지 않습니다.
- aria-activedescendant로 활성 옵션을 연결합니다. 옵션 탐색만으로 값이 바뀌지 않습니다. Field label/id/ref/ARIA가 실제 button에 연결됩니다.
- mobileVariant="drawer"는 640px 미만에서 화면 아래에 표시하는 **비모달** 팝업입니다. 외부 클릭/포커스로 닫으며 배경을 잠그지 않습니다. 기본 popover는 trigger 위치와 뷰포트에 맞춰 배치합니다. 지원 브라우저는 native Popover top layer를 사용합니다.
- disabled/readOnly는 열기와 편집을 막습니다. name/form은 hidden input으로 제출하며 multiple은 같은 이름으로 값을 각각 제출합니다. 비어 있는 선택은 제출 항목이 없습니다. native form.reset은 uncontrolled 기본값으로 복원하고 팝업을 닫습니다.
- RHF는 선택적 `@gsainfoteam/ids-react/react-hook-form`의 Field에 `controlMode="value"`, defaultValues에 단일 null / 다중 []를 지정하세요. `registerOptions={{required:'선택하세요'}}` 또는 Zod resolver로 검증합니다. required는 ARIA 힌트이며 native button constraint validation은 제공하지 않습니다.

- 활성 옵션은 팝업 내부만 스크롤해 표시합니다. 키보드 탐색·선택·닫기 과정에서 배경 문서를 자동 스크롤하지 않습니다.
