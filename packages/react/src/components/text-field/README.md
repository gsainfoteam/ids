# TextField

```tsx
import { TextField, Label, IconButton } from '@gsainfoteam/ids-react';
import { Search, MoreVertical } from 'lucide-react';

<Label htmlFor="email">이메일</Label>
<TextField id="email" type="email" placeholder="you@gm.gist.ac.kr" />

<TextField placeholder="검색">
  <Search />
  <TextField.Input />
  <TextField.Clear />
</TextField>

<TextField variant="filled" size="tiny" defaultValue="0.00">
  <span>$</span>
  <TextField.Input />
  <span>USD</span>
</TextField>
```

입력 하나를 감싸는 컨테이너다. 테두리, 배경, 포커스 링을 컨테이너가 그리고 안쪽 input은
배경 없이 남는 폭을 채운다. `variant`는 `outline`(기본), `filled`, `underline`이고 `size`는
`standard`(높이 44px, body-b2) 또는 `tiny`(32px, body-b3)다.

`TextField.Input`이 sentinel이다. 그 앞에 놓은 자식은 leading, 뒤에 놓은 자식은 trailing이
된다. `placement` 같은 prop 없이 JSX 순서가 곧 시각적 순서다. 생략하면 TextField가 하나
만들어 넣으므로 `<TextField placeholder="..." />`만 써도 된다. 둘 이상 넣으면 개발 중에
에러가 난다.

native input 속성은 TextField에 직접 주든 `TextField.Input`에 주든 같은 input에 도달한다.
`id`도 마찬가지라 Label과는 `htmlFor`/`id`로 그냥 연결하면 되고, 클릭 시 포커스는 브라우저
기본 동작을 탄다. `Input`에 직접 준 값이 TextField에 준 값을 이긴다. HTML의 `size` 속성은
IDS `size`가 이름을 차지하므로 쓸 수 없다. 폭은 className으로 지정한다. `className`과
`style`은 컨테이너로 간다.

leading/trailing 자식은 각각 span으로 감싸 톤을 맞춘다. 버튼이 없으면 muted 색과 크기에
맞는 타이포그래피, 아이콘 크기를 적용하고, 버튼이 있으면 패딩과 고정 크기만 제거하고
컴포넌트의 스타일은 건드리지 않는다.

`TextField.Clear`는 값이 있을 때만 나타나고 누르면 입력을 비운다. controlled든
uncontrolled든 `onChange`가 정상적으로 발화한다. `onClear`로 초기화 동작을 대신할 수 있다.

컨테이너의 빈 곳을 누르면 입력에 포커스가 간다. 버튼, 링크, 라벨, 다른 입력을 눌렀을 때는
그 요소의 동작을 방해하지 않도록 포커스를 옮기지 않는다.
