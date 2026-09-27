# Button

```tsx
import { Button } from '@gsainfoteam/ids-react';

<Button onClick={save}>저장</Button>
<Button variant="outline" size="tiny">취소</Button>
<Button variant={(state) => (state.hovered ? 'solid' : 'ghost')}>호버로 바뀌는 버튼</Button>
```

native `<button>`에 IDS control surface를 적용한다. `variant`는 `solid`(기본), `soft`,
`outline`, `ghost`이고 `size`는 `standard`(기본, 높이 44px) 또는 `tiny`(32px)다.
`type`을 생략하면 `button`이 되어 폼 안에서 의도치 않게 제출되지 않는다. 제출 버튼에는
`type="submit"`을 명시한다.

hover, active, focus-visible, pressed, disabled 상태는 컴포넌트가 직접 추적해
`data-hovered` 같은 속성으로 DOM에 올린다. 상태별 배경색이 서로 덮어쓰지 않도록 셋 중
하나만 올라가며 우선순위는 pressed, active, hovered 순이다. 스타일을 덮어쓸 때는
`:hover` 대신 이 data 속성을 쓴다.

이벤트 핸들러와 `ref`, `disabled`를 제외한 대부분의 prop은 `(state) => 값` 함수로도
줄 수 있고 children도 마찬가지다. 부모가 상태를 알아야 하면 `onInteractionChange`로
받는다. 컴포넌트가 가진 상태를 부모에 그대로 전달할 뿐 controlled prop이 아니다.

그룹 안에서는 `size`를 생략하거나 그룹과 같은 값을 줘야 하며, 값이 어긋나면 개발 중에
에러를 던진다. 아이콘만 있는 버튼은 IconButton을 쓴다.
