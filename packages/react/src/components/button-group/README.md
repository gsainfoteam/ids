# ButtonGroup

```tsx
import { ButtonGroup, Button, IconButton } from '@gsainfoteam/ids-react';
import { ChevronDown } from 'lucide-react';

<ButtonGroup>
  <Button variant="outline">저장</Button>
  <IconButton variant="outline" icon={<ChevronDown />} aria-label="더보기" />
</ButtonGroup>

<ButtonGroup orientation="vertical" size="tiny">
  <Button variant="outline">위</Button>
  <ButtonGroup.Separator />
  <Button variant="outline">아래</Button>
</ButtonGroup>
```

버튼 여러 개를 하나로 이어 붙인다. `orientation`은 `horizontal`(기본) 또는 `vertical`,
`size`는 `standard`(기본) 또는 `tiny`다. 맞닿는 쪽의 둥근 모서리를 없애고 테두리를 1px 겹쳐서
경계선이 두 줄로 보이지 않게 하며, hover/press/focus 순으로 z-index를 올려 겹친 테두리에
가리는 버튼이 없게 한다.

`size`는 그룹이 소유한다. 자식 버튼은 `size`를 생략하거나 그룹과 같은 값을 줘야 하고
어긋나면 개발 중에 에러를 던진다. 높이가 다른 버튼이 붙으면 이어 붙인 모양이 어긋나기 때문이다.

`ButtonGroup.Separator`는 이어 붙인 버튼을 두 묶음으로 나눈다. 눈에 보이는 선이 아니라 8px
여백이며, 사이에 요소가 끼면 둥근 모서리를 없애는 인접 선택자가 끊겨 양옆 버튼에 둥근
모서리가 다시 적용된다. 접근성 트리에는 `role="separator"`로 노출된다. 붙이지 않고
나열만 하려면 그룹 대신 부모의 `gap`을 쓴다.
