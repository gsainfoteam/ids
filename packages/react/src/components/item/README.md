# Item

```tsx
import { Item, Avatar, IconButton } from '@gsainfoteam/ids-react';

<Item>
  <Item.Media>
    <Avatar name={user.name} size="tiny" />
  </Item.Media>
  <Item.Content>
    <Item.Title>{user.name}</Item.Title>
    <Item.Description>{user.email}</Item.Description>
  </Item.Content>
  <Item.Actions>
    <IconButton aria-label="더보기" size="tiny" icon={<EllipsisVerticalIcon />} />
  </Item.Actions>
</Item>;
```

좌측 미디어 + 중앙 텍스트 + 우측 액션의 가로 row다. 세로 컨테이너는 `Card`를 쓴다.

`Item.Media`는 children을 그대로 받는 구멍이다 — 아이콘이든 `Avatar`든 `AvatarGroup`이든
`<img>`든 들어간다. 전용 variant를 두지 않는다. `Item.Content`가 남는 폭을 먹고,
`Item.Actions`는 우측으로 밀린다. 전부 선택이다.

`size`는 `standard`(기본) `tiny`.

## 인터랙티브

`interactive`를 주거나 `onClick`만 넘겨도 hover/focus가 켜진다. `div`로 그릴 때는
`role="button"`과 `tabIndex={0}`이 붙고 Enter/Space가 클릭이 된다.

`asChild`로 행 전체를 링크로 만들 수 있고, 이때는 자식이 이미 포커스와 키보드를 처리하므로
`role`과 `tabIndex`를 덧씌우지 않는다.

```tsx
<Item interactive asChild>
  <a href={`/posts/${post.id}`}>...</a>
</Item>
```

`selected`는 시각적 강조와 `data-selected`를 붙인다. `role="button"`으로 그릴 때는
`aria-pressed`로 눌림 상태를 알린다. `aria-selected`는 `option`, `row`, `tab`, `gridcell`
에만 쓸 수 있어서 여기서는 맞지 않는다. 진짜 listbox가 필요하면 `asChild`로 `role="option"`
을 직접 지정하고 `aria-selected`도 직접 붙인다.

## 리스트

`Item`은 `role`을 스스로 정하지 않는다. 목록으로 쓸 때는 바깥에서 `<ul>`/`<li>`로 감싼다.

```tsx
<ul>
  {files.map((file) => (
    <li key={file.id}>
      <Item interactive selected={file.id === selectedId} onClick={() => select(file.id)}>
        <Item.Content>{file.name}</Item.Content>
      </Item>
    </li>
  ))}
</ul>
```
