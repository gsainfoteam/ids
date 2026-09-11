# ToggleGroup

```tsx
import { ToggleGroup, Toggle } from '@gsainfoteam/ids-react';

<ToggleGroup defaultValue="left" onValueChange={setAlign}>
  <Toggle value="left">왼쪽</Toggle>
  <Toggle value="center">가운데</Toggle>
  <Toggle value="right">오른쪽</Toggle>
</ToggleGroup>

<ToggleGroup type="multiple" defaultValue={['bold']} onValueChange={setMarks}>
  <Toggle value="bold">굵게</Toggle>
  <Toggle value="italic">기울임</Toggle>
</ToggleGroup>
```

ButtonGroup과 같은 방식으로 Toggle을 붙이면서 선택 상태까지 그룹이 소유한다.
`orientation`, `size`, `Separator`, 자식 `size`가 그룹과 같아야 하는 규칙은 ButtonGroup과
같다. `disabled`는 그룹 전체와 자식 Toggle에 함께 걸린다.

`type`이 `single`(기본)이면 `value`와 `defaultValue`는 문자열이고, 선택된 항목을 다시
누르면 빈 문자열이 되어 선택이 풀린다. `multiple`이면 `Set<string>` 또는 `string[]`을
받지만 `onValueChange`로 넘어오는 값은 항상 `Set<string>`이다. 타입에 맞지 않는 값을
주면 개발 중에 에러를 던진다.

자식 Toggle에는 `value`가 필수이고, 선택은 그룹이 관리하므로 `pressed`, `defaultPressed`,
`onPressedChange`는 쓸 수 없다. 항상 하나는 선택돼 있어야 하는 UI라면 해제까지 허용하는
이 동작이 맞지 않으므로 `onValueChange`에서 빈 값을 걸러내거나 라디오 버튼을 쓴다.
