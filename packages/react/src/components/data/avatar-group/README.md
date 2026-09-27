# AvatarGroup

```tsx
import { AvatarGroup, Avatar } from '@gsainfoteam/ids-react';

<AvatarGroup max={3} aria-label="회의 참석자">
  {members.map((m) => (
    <Avatar key={m.id} src={m.avatar} name={m.name} />
  ))}
</AvatarGroup>;
```

여러 `Avatar`를 겹치거나 나란히 놓는 컨테이너다. `variant`는 `stack`(기본, 겹침)
`inline`(간격), `size`는 `standard`(기본) `tiny`.

`max`를 넘기면 앞의 N개만 그리고 마지막에 `+N` 표시가 붙는다. 생략하면 전부 그린다.
`max`가 1 미만이면 `IdsError`를 던진다.

`size`는 자식 `Avatar`로 전파된다. 자식이 자기 `size`를 명시하면 그쪽이 이긴다.

자식은 `Avatar`여야 한다. 다른 걸 넣으면 `IdsError`를 던진다 — 겹침 간격과 테두리가
Avatar의 치수를 전제로 계산되기 때문이다.

`stack`일 때 각 Avatar에 배경색 링이 붙어 겹친 경계가 보인다. 배경이 `--ids-color-surface`가
아닌 곳에 놓으면 `className`으로 링 색을 맞춘다.

`role="group"`이라 `aria-label`로 무슨 그룹인지 알려주는 게 좋다.
