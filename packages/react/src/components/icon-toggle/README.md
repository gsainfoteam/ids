# IconToggle

```tsx
import { IconToggle } from '@gsainfoteam/ids-react';
import { Star } from 'lucide-react';

<IconToggle icon={<Star />} aria-label="즐겨찾기" />
<IconToggle
  icon={(state) => <Star fill={state.pressed ? 'currentColor' : 'none'} />}
  aria-label={(state) => (state.pressed ? '즐겨찾기 해제' : '즐겨찾기')}
/>
```

Toggle에 정사각형 아이콘 레이아웃을 적용한 컴포넌트다. IconButton과 같은 크기 규칙
(`standard` 44x44 / 아이콘 20px, `tiny` 32x32 / 16px)을 쓰고 `variant` 기본값은 `ghost`다.
Toggle의 prop, 제어 방식, ToggleGroup 안에서의 `value` 규칙을 그대로 물려받는다.

`icon`과 `aria-label`은 필수이고 children은 받지 않는다. 두 prop 모두 `(state) => 값`
함수로 줄 수 있어서 위 예제처럼 눌림 여부로 아이콘 모양과 이름을 함께 바꾼다.
아이콘만 채워지고 이름이 그대로면 눈으로만 상태가 보이므로, 모양을 바꿀 때는
`aria-label`도 같이 바꾼다.
