# Spinner

```tsx
import { Spinner, Button } from '@gsainfoteam/ids-react';

<Spinner label="불러오는 중" />

<Button disabled>
  <Spinner size="tiny" decorative />
  저장 중
</Button>
```

진행률을 모르는 로딩 표시다. 색은 `currentColor`라 주변 글자색을 그대로 따라가고,
`size`는 `standard`(20px) 또는 `tiny`(16px)로 IDS control의 아이콘 크기와 맞는다.

기본값은 `role="status"`에 `label`(기본 `'Loading'`)을 시각적으로 숨긴 텍스트로 넣는
방식이다. Spinner 옆에 이미 "저장 중" 같은 문구가 있으면 `decorative`를 켠다. 같은 사실을
두 번 읽어주지 않도록 요소를 접근성 트리에서 통째로 숨긴다.

`prefers-reduced-motion`에서는 회전이 멈춘다. 애니메이션만 꺼질 뿐 요소는 그대로 남아
있으므로 로딩 여부는 `role="status"`나 주변 텍스트로 전달된다. children, `role`,
`aria-hidden`은 받지 않으며 나머지 native span 속성은 전달한다.
