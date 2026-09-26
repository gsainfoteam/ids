# Toggle

```tsx
import { Toggle } from '@gsainfoteam/ids-react';

<Toggle defaultPressed>굵게</Toggle>
<Toggle pressed={muted} onPressedChange={setMuted} variant="soft">음소거</Toggle>
```

눌린 상태를 유지하는 버튼이다. Button과 같은 표면을 쓰되 `variant` 기본값은 `outline`이고
`aria-pressed`로 상태를 노출한다. Button이 갖는 상태 추적, data 속성, `(state) => 값`
prop, 그룹 `size` 규칙은 그대로 적용된다.

혼자 쓸 때는 `defaultPressed`로 비제어 상태를 두거나 `pressed`와 `onPressedChange`로 제어한다.
ToggleGroup 안에서는 선택을 그룹이 소유하므로 이 세 prop을 쓸 수 없고 대신 `value`가
필수다. 이 규칙을 어기면 개발 중에 에러를 던진다. 그룹의 `disabled`는 개별 Toggle로 내려온다.

토글은 상태를 바꿀 뿐 그 자체로는 아무 동작도 하지 않는다. 눌림에 따라 실제로 무언가
일어나야 하면 `onPressedChange`나 그룹의 `onValueChange`에서 처리한다. 서로 배타적인
선택지를 고르는 UI라면 Toggle 여러 개보다 `<ToggleGroup type="single">`이 맞다.
