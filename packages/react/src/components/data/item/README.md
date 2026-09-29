# Item

사용자 목록, 알림, 메뉴, 설정 행처럼 미디어와 글과 동작을 가로 한 줄에 놓는 행입니다. 세로로 쌓는 덩어리는 `Card` 를 씁니다.

- **shadcn/ui 구성.** `Item.Media`, `Item.Content` 안의 `Item.Title` 과 `Item.Description`, 그리고 `Item.Actions` 입니다. 전부 선택입니다.
- **두 줄이 되면.** 설명은 두 줄에서 말줄임표로 줄고, 미디어는 행 가운데가 아니라 첫 줄에 맞춰 위에 붙습니다.
- **행 어디를 눌러도 열린다.** `onClick` 만 주면 행 어디를 눌러도 열리고, 키보드와 스크린 리더에는 `Item.Title` 이 버튼이 됩니다. 설명은 `Item.Description` 입니다. `Item.Actions` 의 버튼을 눌러도 행은 눌리지 않고, 버튼이 버튼 안에 들어가지 않습니다.
- **선택.** `selected` 는 옅은 층을 깔고, 버튼인 행에서는 `aria-pressed` 로 알립니다. `aria-current` 를 주면 그쪽이 선택을 말합니다.
- **목록.** `Item.Group` 은 `role="list"` 인 `<ul>` 이고 각 행을 `<li>` 로 감쌉니다. Safari가 목록 의미를 잃지 않습니다.

```tsx
import { Avatar, IconButton, Item } from '@gsainfoteam/ids-react';

<Item variant="outline">
  <Item.Media>
    <Avatar src={user.photo} name={user.name} />
  </Item.Media>
  <Item.Content>
    <Item.Title>{user.name}</Item.Title>
    <Item.Description>{user.email}</Item.Description>
  </Item.Content>
  <Item.Actions>
    <IconButton aria-label="더보기" variant="ghost" icon={<EllipsisVerticalIcon />} />
  </Item.Actions>
</Item>;
```

## 미디어

```tsx
<Item.Media><BellIcon /></Item.Media>                  {/* 기본. 아이콘만 */}
<Item.Media variant="soft"><InboxIcon /></Item.Media>  {/* 옅은 배경 타일 */}
<Item.Media variant="outline"><InboxIcon /></Item.Media> {/* 테두리 타일 */}
<Item.Media variant="soft"><img src={thumbnail} alt="" /></Item.Media> {/* 썸네일 타일 */}
<Item.Media><Avatar name="Alice Kim" /></Item.Media>   {/* 아바타, 아바타 그룹, 이미지 */}
```

- 크기를 정하지 않은 아이콘은 `--ids-size-icon-standard` 를 따릅니다.
- 타일(`soft`, `outline`) 바로 안의 이미지는 타일을 채우고 모서리를 따릅니다. 비율이 달라도 잘라서 채웁니다.
- 설명이 있으면 미디어가 첫 줄 높이에 맞춰 위로 붙습니다.

## 긴 제목

```tsx
<Item.Title>{name}</Item.Title>                           {/* 기본. 줄바꿈된다 */}
<Item.Title truncate title={name}>{name}</Item.Title>     {/* 한 줄에서 말줄임표로 줄인다 */}
```

- `truncate` 는 제목을 행 폭 안의 한 줄로 자릅니다. 파일 이름처럼 끝까지 읽을 필요가 적은 제목에 씁니다.
- 잘린 부분은 보이지 않으니 `title` 로 전체 이름을 함께 둡니다.
- 행과 `Item.Group` 은 grid 나 flex 부모를 따라 줄어듭니다. 잘린 제목의 전체 길이만큼 넓어지지 않습니다.

## 여러 칸

```tsx
<Item>
  <Item.Content>...</Item.Content>
  <Item.Content className="items-end">2분 전</Item.Content> {/* 둘째 Content는 늘어나지 않는다 */}
</Item>
```

## 누를 수 있는 행

```tsx
<Item onClick={() => openChat(chat.id)}>        {/* 어디를 눌러도 열린다 */}
  <Item.Content>
    <Item.Title>{chat.name}</Item.Title>        {/* 이 제목이 버튼. Tab으로 간다 */}
    <Item.Description>{chat.last}</Item.Description>
  </Item.Content>
  <Item.Actions>
    <IconButton aria-label="보관" onClick={archive} icon={<InboxIcon />} />  {/* 행은 눌리지 않는다 */}
  </Item.Actions>
</Item>

<Item asChild>
  <a href="/inbox">...</a>                      {/* 링크 행 */}
</Item>

<Item onClick={open} disabled />                {/* 제목 버튼이 disabled, 행은 aria-disabled */}
```

| 키      | 동작                                       |
| ------- | ------------------------------------------ |
| `Enter` | 누르는 순간 실행                           |
| `Space` | 뗄 때 실행. 떼기 전에 포커스가 떠나면 취소 |

- `Item.Title` 이 없거나 다른 컴포넌트 안에 숨어 있으면 행 자신이 `role="button"` 이 됩니다. 이때는 안에 다른 버튼을 두지 않습니다.

## 선택과 현재 위치

```tsx
<Item selected={file.id === selectedId} onClick={() => select(file.id)}>  {/* 제목 버튼의 aria-pressed */}

<Item asChild selected aria-current="page">                               {/* aria-current만 */}
  <a href="/home">홈</a>
</Item>
```

- 선택된 행은 variant와 상관없이 옅은 층이 깔리고 `data-selected` 가 붙습니다.

## 목록

```tsx
<Item.Group aria-label="설정" size="tiny">
  {' '}
  {/* 안의 행이 size와 dense를 따른다 */}
  <Item>...</Item> {/* <li> 로 감싼다 */}
  <Item.Separator /> {/* 목록 항목으로 세지 않는 구분선 */}
  <Item>...</Item>
</Item.Group>
```

- 이미 `<li>` 로 감싼 자식은 다시 감싸지 않습니다.
- `Item.Separator` 는 `Divider` 입니다. 그룹 안에서는 목록 항목으로 세지 않는 `<li>`, 밖에서는 `<hr>` 로 그립니다.

## variant와 크기

```tsx
<Item variant="ghost" />    // 기본. 배경과 테두리 없음
<Item variant="outline" />  // 중립 테두리
<Item variant="soft" />     // 옅은 배경
<Item size="tiny" />        // standard(패딩 12px, 기본) / tiny(8px)
```

## 촘촘한 행

```tsx
<Item.Group aria-label="첨부 파일" dense>  {/* 안의 행이 dense를 따른다 */}
  <Item variant="outline">...</Item>       {/* 패딩 6px, 최소 높이 48px */}
</Item.Group>

<Item size="tiny" dense />                  // 패딩 4px, 최소 높이 32px
```

- `dense` 는 패딩을 반으로 줄입니다. 36px 컨트롤을 담은 standard 행이 48px 가 됩니다.
- 파일 목록이나 메뉴처럼 행이 많은 목록에 씁니다.

## 상태와 data 속성

| 속성                                                                | 뜻              |
| ------------------------------------------------------------------- | --------------- |
| `data-item`, `data-variant`, `data-size`                            | 루트            |
| `data-dense`                                                        | 촘촘한 행       |
| `data-interactive`                                                  | 누를 수 있는 행 |
| `data-selected`                                                     | 선택됨          |
| `data-disabled`                                                     | 비활성          |
| `data-hovered`, `data-active`, `data-focus-visible`                 | 인터랙션 상태   |
| `data-item-media`, `-content`, `-title`, `-description`, `-actions` | 각 부분         |

루트의 `className`, `style`, `children` 은 `{ interactive, selected, hovered, ... }` 를 받는 함수가 될 수 있습니다.

## 속성

| 속성             | 기본 / 동작                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `variant`        | `ghost`(기본) / `outline` / `soft`                                 |
| `size`           | `standard`(기본) / `tiny`. `Item.Group` 안에서는 그룹을 따른다     |
| `dense`          | `false`. 패딩을 반으로 줄인다. `Item.Group` 안에서는 그룹을 따른다 |
| `onClick`        | 주면 행 어디를 눌러도 불린다. 제목이 버튼이 된다                   |
| `interactive`    | hover와 포커스 표시. `onClick` 이나 `<a>`, `<button>` 이면 자동    |
| `selected`       | 선택 표시                                                          |
| `disabled`       | 누를 수 없고 흐려진다                                              |
| `asChild`        | 루트 `div` 대신 자식 요소에 속성을 합친다                          |
| `Media.variant`  | `ghost`(기본) / `soft` / `outline`                                 |
| `Title.truncate` | `false`. 한 줄에서 말줄임표로 줄인다                               |
| 각 부분          | `asChild` 와 `div` 의 native 속성                                  |
