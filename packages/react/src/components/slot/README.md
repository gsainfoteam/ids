# Slot

```tsx
import { Slot } from '@gsainfoteam/ids-react';

<Slot className="rounded-xl px-4 py-2" onClick={track}>
  <a href="/dashboard">Dashboard</a>
</Slot>;

// asChild 패턴의 기반
function Card({ asChild, ...rest }: Card.Props) {
  const Root = asChild ? Slot : 'div';
  return <Root {...rest} />;
}
```

wrapper element를 하나 더 만드는 대신, 받은 prop을 자식 element에 병합해서 자식 하나만
렌더한다. 컴포넌트의 스타일과 동작은 그대로 두고 실제로 그려지는 태그만 바꿀 때 쓴다.

자식은 React element 하나여야 한다. 텍스트나 여러 개를 넘기면 `IdsError`를 던진다.

병합 규칙은 `mergeProps`를 따른다.

- `className`은 `cn`으로 합쳐지고 `style`은 shallow merge한다.
- `ref`는 양쪽 다 같은 node를 가리킨다.
- `on*` 핸들러는 **자식 먼저, 그 다음 Slot** 순서로 실행한다. 자식이
  `event.preventDefault()`를 부르면 Slot 쪽 핸들러는 건너뛴다.
- 나머지 prop은 Slot이 이긴다. 위 예시에서 `aria-label`을 양쪽에 주면 Slot 값이 남는다.
