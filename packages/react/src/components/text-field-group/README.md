# TextFieldGroup

```tsx
import { TextFieldGroup, TextField, IconButton } from '@gsainfoteam/ids-react';
import { Search, X } from 'lucide-react';

<TextFieldGroup>
  <TextFieldGroup.Adornment>
    <Search />
  </TextFieldGroup.Adornment>
  <TextField aria-label="검색" placeholder="검색어" />
  <TextFieldGroup.Adornment>
    <IconButton icon={<X />} aria-label="지우기" onClick={clear} />
  </TextFieldGroup.Adornment>
</TextFieldGroup>

<TextFieldGroup variant="filled" size="tiny">
  <TextField aria-label="금액" />
  <TextFieldGroup.Adornment>원</TextFieldGroup.Adornment>
</TextFieldGroup>
```

입력 앞뒤에 아이콘, 단위, 버튼을 붙일 때 쓰는 컨테이너다. 테두리와 배경은 그룹이 `variant`에
맞춰 그리므로 자식 TextField의 `variant`는 쓰이지 않는다. `size`는 그룹 값이 자식의 크기를
정하고, `disabled`는 자식이 직접 지정하지 않았을 때만 그룹 값을 물려준다. 안쪽 입력이
focus-visible이 되면 그룹 전체에 outline이 걸린다.

`<TextField />`는 정확히 하나만 넣어야 하고 없거나 둘 이상이면 에러를 던진다. 이 필드가
앞뒤를 가르는 기준점이라 없으면 어디가 leading이고 어디가 trailing인지 정할 수 없다.
children을 생략하면 빈 TextField 하나가 들어간다.

컨테이너의 빈 곳을 누르면 입력에 포커스가 간다. 버튼, 링크, 다른 입력을 눌렀을 때는
그 요소의 동작을 방해하지 않도록 포커스를 옮기지 않는다.

`Adornment`는 내용에 버튼이 있는지에 따라 다르게 동작한다. 버튼이 없으면 muted 색과
크기에 맞는 타이포그래피, 아이콘 크기를 적용하고, 버튼이 있으면 패딩과 고정 크기만 제거하고
컴포넌트의 스타일은 건드리지 않는다. 그룹 밖에서 쓰면 에러를 던진다.
