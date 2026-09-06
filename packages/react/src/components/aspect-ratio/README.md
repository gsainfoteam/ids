# AspectRatio

```tsx
import { AspectRatio } from '@gsainfoteam/ids-react';

<div className="w-80 max-w-full">
  <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl">
    <img src="/cover.jpg" alt="표지" className="h-full w-full object-cover" />
  </AspectRatio>
</div>
```

`ratio`는 가로/세로 비율이며 기본값은 1(정사각형)이다. 유한한 양수만 허용한다.
부모 폭이 바뀌면 CSS가 높이를 계산하며 JS 크기 측정이나 외부 컴포넌트는 필요 없다.
자식은 내부 absolute 영역에 배치되므로 콘텐츠의 원래 크기가 바깥 비율을 늘리지 않는다.

미디어 크기와 자르기 방식은 자식의 className으로 지정한다. 넘치는 콘텐츠는 기본적으로
보이며, 잘라야 할 때만 루트에 `overflow-hidden`을 추가한다. 포커스 표시가 잘리지 않도록
인터랙티브 콘텐츠에는 주의한다. native div 속성과 ref는 바깥 컨테이너에 전달된다.
명시한 style은 내부 aspectRatio보다 우선하며, 고정 height를 주면 비율 유지가 해제될 수 있다.
