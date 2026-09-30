# Skeleton

내용을 불러오는 동안 그 자리에 내용의 모양을 미리 그려 둡니다. 레이아웃이 먼저 잡혀서 내용이 들어와도 화면이 밀리지 않습니다. 기다린다는 사실만 알리려면 `Spinner` 를 씁니다.

- **두 가지로 씁니다.** 자식 없이 모양(`shape`)만 그리거나, 자식을 감싸서(`loading`) 그 크기 그대로 칠합니다.
- **크기는 className 으로 정합니다.** `w-40`, `h-6`, `size-12`, `aspect-video` 처럼 대신하는 내용의 크기를 따릅니다. `size` prop 은 없습니다.
- **글자 줄은 글자 스타일을 따릅니다.** `shape="text"` 에 `text-body-b3-regular` 같은 클래스를 주면 줄 높이가 실제 글과 같습니다.
- **스스로 알리지 않습니다.** 모양은 `aria-hidden` 이고, 감싸기는 `aria-busy` 입니다. "불러오는 중" 은 Spinner 나 앱의 상태 문구가 한 번 알립니다.
- **서버에서 그대로 그립니다.** 훅이 없어서 서버 HTML 과 hydration 뒤의 마크업이 같습니다.

```tsx
import { Skeleton } from '@gsainfoteam/ids-react';

<Skeleton className="h-5 w-40" />
<Skeleton shape="circle" />
<Skeleton shape="text" lines={3} className="text-body-b3-regular" />

<Skeleton loading={isLoading}>
  <Card>...</Card>
</Skeleton>;
```

## 모양

```tsx
<Skeleton />                                    {/* rect: 높이 16px, 너비를 채운다 */}
<Skeleton className="h-9 w-24" />               {/* 버튼 자리 */}
<Skeleton className="aspect-video" />           {/* 이미지 자리. 높이가 너비를 따른다 */}
<Skeleton shape="circle" />                     {/* 40px 원. Avatar standard 와 같다 */}
<Skeleton shape="circle" className="size-6" />  {/* Avatar tiny 자리 */}
<Skeleton shape="text" />                       {/* 한 줄. 주변 글자 스타일을 따른다 */}
<Skeleton shape="text" lines={3} className="text-body-b3-regular" />   {/* 세 줄, 마지막 줄 60% */}
<Skeleton shape="text" className="w-1/3 text-subtitle-s2-semibold" />  {/* 짧은 제목 한 줄 */}
```

- rect 의 16px 는 내용 높이입니다. `h-*`, `aspect-*`, `absolute inset-0`, flex 와 grid 의 늘이기처럼 크기를 정하는 것이 늘 이깁니다.
- 모서리는 rect `standard`(10px), circle `full`, text 막대 `indicator`(4px) 입니다.
- text 는 줄마다 줄 높이 한 칸(`1lh`) 가운데에 글자 크기(`1em`) 막대를 그립니다. 글자 스타일을 주지 않으면 주변 글자를 따릅니다.
- `lines` 는 정수로 내리고, 1 보다 작으면 1 줄입니다.

## 감싸기

```tsx
<Skeleton loading={isLoading}>          {/* div 로 감싸서 자식의 크기 그대로 칠한다 */}
  <Card>...</Card>
</Skeleton>

<Skeleton loading={isLoading} asChild>  {/* 감싸지 않고 자식 요소를 직접 칠한다 */}
  <Avatar src={user?.photo} name={user?.name ?? '사용자'} />
</Skeleton>

<Skeleton>                              {/* loading 을 빼면 true */}
  <p>...</p>
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
- 인라인 요소(Avatar, Badge, Button)는 `asChild` 로 칠합니다. 기본 `div` 는 블록이라서 줄 너비를 채웁니다.
- 감쌀 때는 `shape`, `lines` 를 쓰지 않습니다.

## 합성

```tsx
<section aria-busy={isLoading} aria-label="최근 글">
  {isLoading ? (
    <Card>
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" />
        <Skeleton shape="text" lines={2} className="flex-1 text-body-b3-regular" />
      </div>
      <Skeleton className="aspect-video" />
    </Card>
  ) : (
    <PostCard post={post} />
  )}
</section>

<Item.Group aria-label="멤버" aria-busy={isLoading}>
  {isLoading
    ? Array.from({ length: 5 }, (_, index) => (
        <Item key={index}>
          <Item.Media>
            <Skeleton shape="circle" />
          </Item.Media>
          <Item.Content>
            <Skeleton shape="text" className="w-1/3 text-body-b3-medium" />
            <Skeleton shape="text" className="w-1/2 text-body-b3-regular" />
          </Item.Content>
        </Item>
      ))
    : members.map((member) => <Item key={member.id}>...</Item>)}
</Item.Group>
```

- 모양만 여러 개 쓰는 영역은 앱이 그 영역에 `aria-busy={isLoading}` 을 둡니다. 모양은 `aria-hidden` 이라서 스크린 리더에는 없는 요소입니다.
- "불러오는 중" 을 알려야 하면 영역 가까이에 `<Spinner />` 하나를 두거나 앱의 상태 문구를 씁니다.
- Skeleton 은 live region 을 두지 않습니다. 모양 여러 개가 한꺼번에 알리는 소음을 막기 위해서입니다.
- 글자 스타일은 대신하는 컴포넌트와 같게 줍니다. Item.Title 은 `text-body-b3-medium`, Item.Description 은 `text-body-b3-regular` 입니다.

## 애니메이션

```tsx
<Skeleton animation="pulse" />  // 기본. muted 와 muted-hover 사이를 오간다
<Skeleton animation="wave" />   // muted-hover 빛 줄기가 글 방향으로 지나간다. RTL 이면 반대로
<Skeleton animation="none" />   // 움직이지 않는다
```

- 바탕은 `--ids-color-muted`, 밝아질 때와 빛 줄기는 `--ids-color-muted-hover` 입니다(중립 사다리 한 칸).
- 움직임은 CSS 패키지의 `animate-skeleton-pulse`, `animate-skeleton-wave` 이고 한 번에 2초입니다.
- `prefers-reduced-motion` 이면 움직이지 않고 muted 바탕만 남습니다.

## data 속성

| 속성                    | 뜻                                                   |
| ----------------------- | ---------------------------------------------------- |
| `data-skeleton`         | 루트. `asChild` 면 자식 요소                         |
| `data-shape`            | 모양만 쓸 때 `rect` / `circle` / `text`              |
| `data-animation`        | `pulse` / `wave` / `none`                            |
| `data-loading`          | 감싸기에서 불러오는 동안                             |
| `data-skeleton-content` | 기본 감싸기에서 자식을 담는 `display: contents` 요소 |

## 속성

| 속성                 | 기본 / 동작                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `shape`              | `rect`(기본) / `circle` / `text`. 자식이 없을 때만 쓴다                  |
| `lines`              | text 의 줄 수. 기본 `1`                                                  |
| `animation`          | `pulse`(기본) / `wave` / `none`                                          |
| `loading`            | 감싸기. 자식이 있으면 기본 `true`                                        |
| `asChild`            | `div` 로 감싸지 않고 자식 요소를 칠한다                                  |
| `className`, `style` | 크기와 글자 스타일. 모양의 루트, 감싸기의 바깥 `div` 나 자식 요소로 간다 |
| `ref` / 그 외 속성   | 모양은 `span`, 감싸기는 바깥 `div`, `asChild` 는 자식 요소로 간다        |

## 알아둘 것

- 모양은 `span` 이라서 `p`, 제목, 버튼 안에도 둘 수 있습니다. 기본 감싸기는 `div` 입니다.
- 자식, `loading`, `asChild` 중 하나라도 있으면 감싸기이고 모두 없으면 모양입니다. `loading` 이 바뀌어도 모양과 감싸기 사이를 오가지 않습니다.
- `asChild` 의 자식 컴포넌트는 받은 `className`, `inert`, `aria-busy`, `ref` 를 DOM 요소까지 전달해야 합니다(Slot 규칙).
- 감싼 자식의 크기가 내용으로 정해지면(빈 글자, 주소가 없는 이미지) 불러오는 동안 크기가 없습니다. 자리를 채울 내용을 주거나 className 으로 크기를 줍니다.
