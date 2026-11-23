# Card

상품, 게시물, 설정 묶음, 통계처럼 관련된 내용을 한 덩어리로 보여 주는 세로 컨테이너입니다. 가로 한 줄에 미디어가 붙는 형태는 `Item` 을 씁니다.

- **shadcn/ui 구성.** `Card.Header` 안에 `Card.Title`, `Card.Description`, 끝 모서리의 `Card.Action`, 그리고 `Card.Content`, `Card.Footer` 입니다. 전부 선택이고 선언한 순서가 곧 화면 순서입니다.
- **가장자리까지 채우는 미디어.** `Card.Media` 는 카드의 패딩을 뚫고 가장자리까지 나가고, 닿는 모서리는 카드의 둥근 모서리를 따릅니다. outline 테두리는 가리지 않습니다.
- **카드 어디를 눌러도 열린다.** `onClick` 만 주면 카드 어디를 눌러도 열리고, 키보드와 스크린 리더에는 `Card.Title` 이 버튼이 됩니다. 설명은 `Card.Description` 입니다. 카드 안에 다른 버튼을 둬도 버튼이 버튼 안에 들어가지 않습니다.
- **안쪽 버튼은 따로.** 카드 안의 버튼이나 링크를 눌러도 카드의 `onClick` 은 불리지 않습니다.
- **링크 카드.** `asChild` 로 `<a href>` 나 `href` 를 받는 라우터 링크가 카드가 됩니다.
- **바닥글은 띠.** `Card.Footer` 는 위쪽 선과 옅은 배경을 깐 띠로 카드 바닥을 가장자리까지 채웁니다.

```tsx
import { Button, Card, IconButton } from '@gsainfoteam/ids-react';

<Card>
  <Card.Header>
    <Card.Title>새 프로젝트 만들기</Card.Title>
    <Card.Description>프로젝트 정보를 입력해주세요.</Card.Description>
    <Card.Action>
      <IconButton aria-label="더보기" variant="outline" icon={<EllipsisHorizontalIcon />} />
    </Card.Action>
  </Card.Header>
  <Card.Content>...</Card.Content>
  <Card.Footer>
    <Button variant="outline">취소</Button>
    <Button>만들기</Button>
  </Card.Footer>
</Card>;
```

## 크기

- **fill.** 카드는 부모의 너비를 다 채웁니다. 너비와 자리는 부모가 정합니다.

```tsx
<div className="w-80">
  <Card>...</Card>
</div>

<div className="grid grid-cols-3 gap-4">        {/* 칸마다 카드 하나 */}
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

- `Card.Header` 는 제목과 설명을 위아래로 쌓고 `Card.Action` 을 끝 모서리에 둡니다. `Card.Footer` 는 버튼을 한 줄로 끝에 모읍니다. 둘 다 클래스 없이 씁니다.
- `Card.Content` 안의 배치는 안쪽 요소가 맡습니다.

```tsx
<Card.Content>
  <div className="grid gap-4">...</div>
</Card.Content>
```

## 미디어

```tsx
<Card>
  <Card.Media>                                  {/* 첫 자식이면 위쪽 모서리까지 */}
    <AspectRatio ratio={16 / 9}>
      <img src={product.photo} alt="" />
    </AspectRatio>
  </Card.Media>
  <Card.Header>
    <Card.Title>{product.name}</Card.Title>
    <Card.Description>{product.price}</Card.Description>
  </Card.Header>
</Card>
```

- 가운데에 두면 좌우만, 마지막에 두면 아래쪽 모서리까지 채웁니다.
- 비율은 `AspectRatio` 가 정합니다. 바로 아래의 `img` 와 `video` 는 `object-cover` 로 채웁니다.
- `Card.Media` 는 `Card` 의 바로 아래 자식이어야 모서리를 따릅니다.

## 바닥글

```tsx
<Card>
  <Card.Header>...</Card.Header>
  <Card.Content>...</Card.Content>
  <Card.Footer>                                 {/* 위쪽 선과 옅은 배경의 띠. 버튼은 끝에 */}
    <Button variant="outline">취소</Button>
    <Button>저장</Button>
  </Card.Footer>
</Card>

<Card.Footer>
  <div className="grid flex-1">                 {/* 버튼 하나로 띠를 채운다 */}
    <Button>장바구니</Button>
  </div>
</Card.Footer>
```

- `Card.Footer` 는 카드 좌우 가장자리까지 나가고, 마지막 자식이면 아래 가장자리와 둥근 모서리까지 채웁니다. 글자와 버튼은 카드 안 내용과 세로줄이 맞습니다.
- 배경은 `bg-block` 이고, 위쪽에 `border-neutral` 선이 있습니다. light 에서는 흰 카드 아래 `neutral-50`, dark 에서는 `neutral-900` 카드 아래 `neutral-850` 입니다. dark 에서 면은 위로 올라올수록 밝아지므로 띠도 카드보다 반 단계 밝습니다. `soft` 카드(`bg-neutral-soft`)는 dark 에서 띠와 같은 850 이라 선만 보이고, `ghost` 카드에서는 배경 없이 선만 남습니다.
- outline 테두리는 가리지 않습니다. 띠는 테두리 1px 안쪽에서 멈춥니다.
- 띠 위 버튼의 hover 와 press 는 다른 곳과 같은 state layer 라, 띠 위에서도 따로 맞추지 않고 보입니다.

## 누를 수 있는 카드

```tsx
<Card onClick={() => navigate(`/posts/${post.id}`)}>   {/* 어디를 눌러도 열린다 */}
  <Card.Header>
    <Card.Title>{post.title}</Card.Title>              {/* 이 제목이 버튼. Tab으로 간다 */}
    <Card.Description>{post.excerpt}</Card.Description> {/* 카드의 설명 */}
  </Card.Header>
  <Card.Footer>
    <Button onClick={like}>좋아요</Button>              {/* 카드는 열리지 않는다 */}
  </Card.Footer>
</Card>

<Card asChild>
  <a href={`/posts/${post.id}`}>...</a>                {/* 링크 그대로. role을 덧씌우지 않는다 */}
</Card>

<Card asChild>
  <Link href="/posts/1">...</Link>                     {/* href 를 받는 라우터 링크도 같다 */}
</Card>

<Card onClick={open} disabled />                       {/* 제목 버튼이 disabled, 카드는 aria-disabled */}
```

- 누를 수 있는 카드는 따로 켜지 않습니다. `onClick` 이 있거나, `asChild` 의 자식이 `href` 가 있는 요소(`<a href>`, Next.js `Link`)나 `<button>` 이면 누를 수 있는 모양과 동작이 됩니다.
- 자식은 JSX 에 적힌 대로 봅니다. `to` 만 받는 라우터 링크(React Router, TanStack Router)는 알아보지 못하므로, 링크 컴포넌트가 그리는 `<a>` 를 `asChild` 로 감쌀 수 없으면 `onClick` 으로 이동합니다.

| 키      | 동작                                       |
| ------- | ------------------------------------------ |
| `Enter` | 누르는 순간 실행. 누르고 있으면 반복한다   |
| `Space` | 뗄 때 실행. 떼기 전에 포커스가 떠나면 취소 |

- 제목 버튼은 제목의 글자 모양을 그대로 씁니다. 제목은 heading 이라 버튼은 heading 안에 들어갑니다.
- `Card.Title` 이 없거나 다른 컴포넌트 안에 숨어 있으면(자식이 함수이거나 직접 만든 컴포넌트 안) 카드 자신이 `role="button"` 이 됩니다. 이때는 안에 다른 버튼을 두지 않습니다.
- hover와 누름은 배경 위에 글자색 층(`state-layer`)을 6%(`state-hover`), 10%(`state-press`) 얹어 표시하므로 어느 variant에서나 같게 보입니다.
- 포커스는 `focus-ring` 입니다. 제목 버튼에 포커스가 가면 카드 전체에 링이 그려지고, outline 카드는 테두리도 primary 색으로 바뀝니다.

## variant와 크기

```tsx
<Card variant="outline" />  // 기본. 중립 테두리와 옅은 그림자
<Card variant="soft" />     // 옅은 배경
<Card variant="ghost" />    // 배경과 테두리 없음
<Card size="tiny" />        // standard(패딩 16px, 기본) / tiny(12px)
```

## 상태

- `onInteractionChange(state)` 는 hover, 누름, 포커스가 바뀔 때 `{ hovered, active, focused, focusVisible }` 를 넘깁니다.
- 새 디자인을 얹을 때만 루트의 `className`, `style`, `children` 을 `Card.State` 를 받는 함수로 줍니다. `Card.State` 는 인터랙션 상태와 누를 수 있는지(`interactive`)입니다.

## 속성

| 속성       | 기본 / 동작                                                           |
| ---------- | --------------------------------------------------------------------- |
| `variant`  | `outline`(기본) / `soft` / `ghost`                                    |
| `size`     | `standard`(기본) / `tiny`                                             |
| `onClick`  | 주면 카드 어디를 눌러도 불린다. 제목이 버튼이 된다                    |
| `disabled` | 누를 수 없고 흐려진다                                                 |
| `asChild`  | 루트 `div` 대신 자식 요소에 속성을 합친다. `href` 가 있으면 링크 카드 |
| 각 부분    | `asChild` 와 `div` 의 native 속성                                     |

## 알아둘 것

- `Card.Title` 은 `h3` 입니다. 다른 수준이 필요하면 `<Card.Title asChild><h2>...</h2></Card.Title>`, heading 이 아니어야 하면 `<Card.Title asChild><span>...</span></Card.Title>` 처럼 태그를 넣습니다.
- `Card.Description` 은 `<p>` 입니다. 목록이나 문단 여럿 같은 블록 내용은 `<Card.Description asChild><div>...</div></Card.Description>` 처럼 태그를 넣습니다. `<p>` 안에 블록 요소가 들어가면 개발 빌드에서 경고합니다.
- 누를 수 있는 카드는 글자 선택이 되지 않습니다. 버튼처럼 눌리는 면이기 때문입니다.
