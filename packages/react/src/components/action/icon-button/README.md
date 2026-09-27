# IconButton

```tsx
import { IconButton } from '@gsainfoteam/ids-react';
import { X } from 'lucide-react';

<IconButton icon={<X />} aria-label="닫기" />
<IconButton icon={<X />} aria-label="닫기" variant="soft" size="tiny" />
```

Button을 바탕으로 정사각형 아이콘 전용 레이아웃을 적용한 컴포넌트다. Button의 prop을 그대로
받지만 `variant` 기본값만 `ghost`로 다르다. `size`는 `standard`(44x44, 아이콘 20px)
또는 `tiny`(32x32, 16px)이며 아이콘 크기는 내부에서 맞춘다.

`icon`과 `aria-label`은 필수다. 아이콘 하나만 받으므로 children은 넘길 수 없고,
`aria-label`이 없거나 공백이면 개발 중에 에러를 던진다. 시각적 텍스트가 없는 버튼이라
접근 가능한 이름을 달리 얻을 방법이 없기 때문이다. 아이콘 옆에 글자가 필요하면
Button에 아이콘과 텍스트를 함께 넣는다.

`icon`과 `aria-label`도 `(state) => 값` 함수로 줄 수 있어서, 눌린 상태에 따라 아이콘이나
설명을 바꿀 수 있다. 그룹 안에서는 그룹의 `size`를 따르며 다른 값을 주면 에러가 난다.
