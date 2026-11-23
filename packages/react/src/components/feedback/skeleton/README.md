# Skeleton

내용을 불러오는 동안 그 내용을 감싸서 그 자리에 내용의 모양을 칠합니다. 레이아웃이 먼저 잡혀서 내용이 들어와도 화면이 밀리지 않습니다. 기다린다는 사실만 알리려면 `Spinner` 를 씁니다.

- **늘 자식을 감쌉니다.** `children` 은 필수입니다. 따로 그리는 모양(`shape`, `lines`)은 없습니다.
- **크기는 감싼 컴포넌트가 정합니다.** 불러오는 동안에는 placeholder 데이터로 실제 컴포넌트를 그리고 감쌉니다. 원은 Avatar, 글자 줄은 그 글자 스타일의 `<p>`, 카드는 Card 입니다.
- **스스로 알리지 않습니다.** 칠한 요소는 `aria-busy` 이고 내용은 `inert` 입니다. "불러오는 중" 은 Spinner 나 앱의 상태 문구가 한 번 알립니다.
- **서버에서 그대로 그립니다.** 훅이 없어서 서버 HTML 과 hydration 뒤의 마크업이 같습니다.

```tsx
import { Skeleton } from '@gsainfoteam/ids-react';

<Skeleton loading={isLoading}>
  <Card>...</Card>
</Skeleton>

<Skeleton loading={isLoading} asChild>
  <Avatar src={user?.photo} name={user?.name ?? '사용자'} />
</Skeleton>;
```

## 감싸기

```tsx
<Skeleton loading={isLoading}>          {/* div 로 감싸서 자식의 크기 그대로 칠한다 */}
  <Card>...</Card>
</Skeleton>

<Skeleton loading={isLoading} asChild>  {/* 감싸지 않고 자식 요소를 직접 칠한다 */}
  <Avatar name={user?.name ?? '사용자'} />
</Skeleton>

<Skeleton>                              {/* loading 을 빼면 true */}
  <p className="text-body-b3-regular">수강 신청은 9월 1일에 열립니다.</p>
</Skeleton>
```

- 불러오는 동안 자식은 보이지 않고(`invisible`) `inert` 입니다. Tab, 스크린 리더, 포인터가 들어가지 않습니다.
- 끝나면(`loading={false}`) 속성과 클래스만 빠집니다. 구조가 그대로라서 화면이 밀리지 않고 자식이 다시 마운트되지 않습니다.
- 기본 감싸기는 `div` 두 개입니다.
  - 칠하는 바깥 `div`: `aria-busy="true"`, 모서리 `standard`. `className` 과 `style` 이 여기로 갑니다.
  - 자식을 담는 안쪽 `div`: `display: contents` 라서 상자를 만들지 않고, `inert` 가 여기에 붙습니다.
- `asChild` 는 자식 요소에 속성과 모양을 합칩니다(Slot).
  - 자식의 모서리가 그대로입니다. Avatar 는 원, Card 는 concentric 모서리입니다.
  - 자식의 테두리, 그림자, 글자, `::before` 와 `::after` 는 숨깁니다.
  - 자식 요소가 곧 불러오는 내용이라서 `aria-busy` 와 `inert` 가 그 요소에 함께 붙습니다.
- 인라인 요소(Avatar, Badge, Button)는 `asChild` 로 칠합니다. 기본 `div` 는 블록이라서 줄 너비를 채웁니다. 글자 한 줄을 그 글 너비만큼 칠하려면 `className="w-fit"` 을 줍니다.

## 합성

```tsx
const placeholderPost = { author: '김지스트', team: '인포팀', title: '2026 가을 학기 공지' };

<section aria-busy={isLoading} aria-label="최근 글">
  <Card>
    <div className="flex items-center gap-3">
      <Skeleton loading={isLoading} asChild>
        <Avatar name={(post ?? placeholderPost).author} />
      </Skeleton>
      <Skeleton loading={isLoading} className="flex-1">
        <p className="text-body-b3-medium">{(post ?? placeholderPost).author}</p>
        <p className="text-body-b3-regular">{(post ?? placeholderPost).team}</p>
      </Skeleton>
    </div>
    <Skeleton loading={isLoading} className="w-fit">
      <Card.Title>{(post ?? placeholderPost).title}</Card.Title>
    </Skeleton>
  </Card>
</section>

const placeholderMembers = Array.from({ length: 5 }, (_, index) => ({
  id: String(index),
  name: '김지스트',
  team: '인포팀',
}));

<ItemGroup aria-label="멤버" aria-busy={isLoading}>
  {(members ?? placeholderMembers).map((member) => (
    <Item key={member.id}>
      <Item.Media>
        <Skeleton loading={isLoading} asChild>
          <Avatar name={member.name} />
        </Skeleton>
      </Item.Media>
      <Item.Content>
        <Skeleton loading={isLoading} asChild className="w-fit">
          <Item.Title>{member.name}</Item.Title>
        </Skeleton>
        <Skeleton loading={isLoading} asChild className="w-fit">
          <Item.Description>{member.team}</Item.Description>
        </Skeleton>
      </Item.Content>
    </Item>
  ))}
</ItemGroup>
```

- 불러오는 동안과 끝난 뒤에 같은 컴포넌트를 그립니다. 데이터만 placeholder 에서 실제 값으로 바뀌므로 크기와 글자 스타일이 저절로 맞습니다.
- placeholder 글은 실제 글과 길이가 비슷하게 줍니다. 칠한 상자의 너비와 줄 수가 그 글을 따릅니다.
- 여러 부분을 칠하는 영역은 앱이 그 영역에 `aria-busy={isLoading}` 을 둡니다.
- "불러오는 중" 을 알려야 하면 영역 가까이에 `<Spinner />` 하나를 두거나 앱의 상태 문구를 씁니다.
- Skeleton 은 live region 을 두지 않습니다. 칠한 요소 여러 개가 한꺼번에 알리는 소음을 막기 위해서입니다.

## 애니메이션

```tsx
<Skeleton animation="pulse">...</Skeleton>  // 기본. `bg-neutral-soft` 와 페이지에 가까운 `bg-block` 사이를 오간다
<Skeleton animation="wave">...</Skeleton>   // `bg-block` 빛 줄기가 글 방향으로 지나간다. RTL 이면 반대로
<Skeleton animation="none">...</Skeleton>   // 움직이지 않는다
```

- 바탕은 `--ids-color-bg-neutral-soft`, 밝아질 때와 빛 줄기는 `--ids-color-bg-block` 입니다(페이지 쪽으로 한 세기).
- 움직임은 CSS 패키지의 `animate-skeleton-pulse`, `animate-skeleton-wave` 이고 한 번에 2초입니다.
- `prefers-reduced-motion` 이면 움직이지 않고 `bg-neutral-soft` 바탕만 남습니다.

## data 속성

| 속성                    | 뜻                                                   |
| ----------------------- | ---------------------------------------------------- |
| `data-skeleton`         | 바깥 `div`. `asChild` 면 자식 요소                   |
| `data-animation`        | `pulse` / `wave` / `none`                            |
| `data-loading`          | 불러오는 동안                                        |
| `data-skeleton-content` | 기본 감싸기에서 자식을 담는 `display: contents` 요소 |

## 속성

| 속성                 | 기본 / 동작                                                   |
| -------------------- | ------------------------------------------------------------- |
| `children`           | 필수. 불러오는 내용. `asChild` 면 요소 하나                   |
| `loading`            | 불러오는 중인지. 기본 `true`                                  |
| `animation`          | `pulse`(기본) / `wave` / `none`                               |
| `asChild`            | `div` 로 감싸지 않고 자식 요소를 칠한다                       |
| `className`, `style` | 배치와 크기. 바깥 `div` 나 자식 요소로 간다                   |
| `ref` / 그 외 속성   | 바깥 `div` 로, `asChild` 면 자식 요소로 간다                  |

## 알아둘 것

- 기본 감싸기는 `div` 라서 `p`, 제목, 버튼 안에는 `asChild` 로 그 안의 요소를 칠합니다.
- `loading` 은 Skeleton 이 그리는 상태입니다. `aria-busy` 와 `inert` 는 이 값에서 나오므로 직접 주지 않습니다.
- `asChild` 의 자식 컴포넌트는 받은 `className`, `inert`, `aria-busy`, `ref` 를 DOM 요소까지 전달해야 합니다(Slot 규칙).
- 감싼 자식의 크기가 내용으로 정해지면(빈 글자, 주소가 없는 이미지) 불러오는 동안 크기가 없습니다. placeholder 데이터를 주거나 className 으로 크기를 줍니다.
