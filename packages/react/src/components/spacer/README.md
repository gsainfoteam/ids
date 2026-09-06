# Spacer

```tsx
import { Spacer } from '@gsainfoteam/ids-react';

<div className="flex items-center">
  <span>제목</span>
  <Spacer />
  <button>더보기</button>
</div>
```

`flex`는 남는 공간의 배분 비율이며 기본값은 1이다. 여러 Spacer의 `flex`가
1과 2라면 남은 공간을 1:2로 나눈다. 유한한 양수만 허용한다.
Flutter `IdsSpacer.flex`와 같은 의미이며 행/열 방향은 flex 부모를 따른다.
세로 방향에서는 부모에 높이가 있어야 남는 공간이 생긴다.

고정 간격은 부모의 `gap`으로 설정한다. Spacer는 콘텐츠를 받지 않고 접근성
트리에서도 숨긴다. native div 속성, className/style/ref를 전달할 수 있으며
명시한 style은 내부 flexGrow보다 우선한다.
