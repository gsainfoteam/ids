# Label

```tsx
import { Label, TextField } from '@gsainfoteam/ids-react';

<Label htmlFor="email">이메일</Label>
<TextField id="email" type="email" />

<Label>
  <input type="checkbox" /> 알림 받기
</Label>
```

native `<label>`에 IDS body-b2-medium 타이포그래피와 on-surface 색상을 적용한다.
`htmlFor`/`id`로 연결하거나 하나의 입력 요소를 감싸서 사용한다. 입력의 접근 가능한
이름, 클릭 시 포커스와 체크박스 토글은 브라우저의 기본 동작을 그대로 따른다.

native label 속성, children, className/style/ref를 전달한다. 라벨은 별도의 disabled,
required 상태를 소유하지 않는다. 해당 상태는 실제 입력에 지정하고 필요한 표시를
children/className으로 합성한다. 라벨 안에 링크나 다른 버튼을 함께 넣지 않는다.
간격은 부모의 gap 등으로 지정한다.
