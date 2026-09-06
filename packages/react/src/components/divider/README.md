# Divider

```tsx
import { Divider } from '@gsainfoteam/ids-react';

<Divider />
<div className="flex h-10 items-center gap-4">
  <span>왼쪽</span>
  <Divider orientation="vertical" decorative />
  <span>오른쪽</span>
</div>
```

- `orientation`: `horizontal`(기본) 또는 `vertical`.
- `decorative`: 기본 `false`. 의미 있는 구분선은 `role="separator"`로 노출하고,
  장식용 구분선은 `true`로 지정해 접근성 트리에서 숨긴다.
- 두께는 1px, 색상은 기존 outline 토큰. 두께·색상 변경은 className/style로 한다.
- 세로선은 flex 부모의 높이에 맞춰 늘어난다. 일반 block 안에서는 `className="h-10"`
  등의 명시적 높이가 필요하다. 주변 간격은 부모 레이아웃에서 지정한다.
- native div 속성과 ref를 전달한다. 리사이즈 핸들이 아니며 포커스를 받지 않는다.
