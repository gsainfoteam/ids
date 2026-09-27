# Card

상품, 게시물, 설정 묶음, 통계처럼 관련된 내용을 한 덩어리로 보여 주는 세로 컨테이너입니다. 가로 한 줄에 미디어가 붙는 형태는 `Item` 을 씁니다.

- **shadcn/ui 구성.** `Card.Header` 안에 `Card.Title`, `Card.Description`, 끝 모서리의 `Card.Action`, 그리고 `Card.Content`, `Card.Footer` 입니다. 전부 선택이고 선언한 순서가 곧 화면 순서입니다.
- **가장자리까지 채우는 미디어.** `Card.Media` 는 카드의 패딩을 뚫고 가장자리까지 나가고, 닿는 모서리는 카드의 둥근 모서리를 따릅니다. outline 테두리는 가리지 않습니다.
- **카드 전체가 버튼.** `onClick` 만 주면 키보드로도 누를 수 있는 버튼이 됩니다. 이름은 제목, 설명은 `Card.Description` 이라 카드 글 전체를 한 줄로 읽지 않습니다.
- **안쪽 버튼은 따로.** 카드 안의 버튼이나 링크를 눌러도 카드의 `onClick` 은 불리지 않습니다.
- **링크 카드.** `asChild` 로 `<a>` 나 라우터 링크가 카드가 됩니다.

```tsx
import { Button, Card } from '@gsainfoteam/ids-react';

<Card>
  <Card.Header>
    <Card.Title>새 프로젝트 만들기</Card.Title>
    <Card.Description>프로젝트 정보를 입력해주세요.</Card.Description>
    <Card.Action>
      <IconButton aria-label="더보기" variant="ghost" icon={<EllipsisHorizontalIcon />} />
    </Card.Action>
  </Card.Header>
  <Card.Content>...</Card.Content>
  <Card.Footer>
    <Button variant="ghost">취소</Button>
    <Button>만들기</Button>
  </Card.Footer>
</Card>;
```

## 미디어

```tsx
<Card>
  <Card.Media className="aspect-video">       {/* 첫 자식이면 위쪽 모서리까지 */}
    <img src={product.photo} alt="" />
  </Card.Media>
  <Card.Header>
    <Card.Title>{product.name}</Card.Title>
    <Card.Description>{product.price}</Card.Description>
  </Card.Header>
</Card>

<Card.Media asChild>
  <img src={photo} alt="" className="aspect-video" />  {/* img 자체를 Media로 */}
</Card.Media>
```

- 가운데에 두면 좌우만, 마지막에 두면 아래쪽 모서리까지 채웁니다.
- 안의 `img` 와 `video` 는 `object-cover` 로 채웁니다.
- `Card.Media` 는 `Card` 의 바로 아래 자식이어야 모서리를 따릅니다.

## 구분선

```tsx
<Card.Header className="border-b">...</Card.Header>   {/* 카드 너비만큼 선, 아래 간격 */}
<Card.Footer className="border-t">...</Card.Footer>   {/* 위쪽 선 */}
```

- 선 색은 `--ids-color-border` 입니다. 선이 있는 쪽에 패딩이 붙어 간격이 맞습니다.

## 누를 수 있는 카드

```tsx
<Card onClick={() => navigate(`/posts/${post.id}`)}>   {/* role="button", Tab으로 간다 */}
  <Card.Header>
    <Card.Title>{post.title}</Card.Title>              {/* 카드의 이름 */}
    <Card.Description>{post.excerpt}</Card.Description> {/* 카드의 설명 */}
  </Card.Header>
  <Card.Footer>
    <Button onClick={like}>좋아요</Button>              {/* 카드는 열리지 않는다 */}
  </Card.Footer>
</Card>

<Card asChild>
  <a href={`/posts/${post.id}`}>...</a>                {/* 링크 그대로. role을 덧씌우지 않는다 */}
</Card>

<Card asChild interactive>
  <Link to="/posts/1">...</Link>                       {/* 라우터 링크는 interactive로 알린다 */}
</Card>

<Card onClick={open} disabled />                       {/* aria-disabled, Tab에서 빠진다 */}
```

| 키      | 동작                                       |
| ------- | ------------------------------------------ |
| `Enter` | 누르는 순간 실행. 누르고 있으면 반복한다   |
| `Space` | 뗄 때 실행. 떼기 전에 포커스가 떠나면 취소 |

- hover와 누름은 배경 위에 반투명 층을 얹어 표시하므로 어느 variant에서나 같게 보입니다.
- 포커스는 `focus-ring` 입니다. outline 카드는 테두리도 primary 색으로 바뀝니다.

## variant와 크기

```tsx
<Card variant="outline" />  // 기본. 중립 테두리와 옅은 그림자
<Card variant="soft" />     // 옅은 배경
<Card variant="ghost" />    // 배경과 테두리 없음
<Card size="tiny" />        // standard(패딩 16px, 기본) / tiny(12px)
<Card className="concentric-p-6" />  // 다른 패딩. 모서리와 미디어가 따라온다
```

## 상태와 data 속성

| 속성                                                                                     | 뜻                |
| ---------------------------------------------------------------------------------------- | ----------------- |
| `data-card`, `data-variant`, `data-size`                                                 | 루트              |
| `data-interactive`                                                                       | 누를 수 있는 카드 |
| `data-disabled`                                                                          | 비활성            |
| `data-hovered`, `data-active`, `data-focus-visible`                                      | 인터랙션 상태     |
| `data-card-header`, `-title`, `-description`, `-action`, `-content`, `-footer`, `-media` | 각 부분           |

루트의 `className`, `style`, `children` 은 인터랙션 상태와 `interactive` 를 받는 함수가 될 수 있습니다.

## 속성

| 속성          | 기본 / 동작                                                     |
| ------------- | --------------------------------------------------------------- |
| `variant`     | `outline`(기본) / `soft` / `ghost`                              |
| `size`        | `standard`(기본) / `tiny`                                       |
| `onClick`     | 주면 카드 전체가 버튼                                           |
| `interactive` | hover와 포커스 표시. `onClick` 이나 `<a>`, `<button>` 이면 자동 |
| `disabled`    | 누를 수 없고 흐려진다                                           |
| `asChild`     | 루트 `div` 대신 자식 요소에 속성을 합친다                       |
| 각 부분       | `asChild` 와 `div` 의 native 속성                               |

## 알아둘 것

- 제목을 heading으로 만들려면 `<Card.Title asChild><h3>...</h3></Card.Title>` 처럼 씁니다.
- 누를 수 있는 카드는 글자 선택이 되지 않습니다. 버튼처럼 눌리는 면이기 때문입니다.
