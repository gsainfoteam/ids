# TextField

```tsx
import { TextField, Label } from '@gsainfoteam/ids-react';

<Label htmlFor="email">이메일</Label>
<TextField id="email" type="email" placeholder="you@gm.gist.ac.kr" />

<TextField variant="underline" size="tiny" defaultValue="검색어" />
```

native `<input>`에 IDS 필드 표면을 적용한다. `variant`는 `outline`(기본), `filled`,
`underline`이고 `size`는 `standard`(높이 44px, body-b2) 또는 `tiny`(32px, body-b3)다.
placeholder는 muted 색, 선택 영역은 primary 톤을 쓰며 focus-visible 상태에서 outline이나
밑줄이 primary로 바뀐다.

HTML의 `size` 속성은 IDS `size`가 이름을 차지하므로 쓸 수 없다. 입력 폭은 className으로
지정한다. type, value, 검증 관련 속성 등 나머지 native input 속성과 ref는 그대로 전달한다.
TextField는 라벨을 소유하지 않으므로 Label과 `htmlFor`/`id`로 연결한다.

TextFieldGroup 안에서는 표면을 그룹이 그리며 필드는 배경 없이 남는 폭을 채운다.
이때 `size`는 그룹을 따라야 하며 다른 값을 주면 개발 중에 에러가 난다. `disabled`를
지정하지 않으면 그룹의 값을 물려받는다.
