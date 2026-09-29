# Pagination

긴 목록을 여러 페이지로 나눠 오갑니다. 게시글, 검색 결과, 표처럼 서버가 페이지 단위로 주는 데이터에 씁니다.

- **버튼과 링크 둘 다.** `onPageChange` 만 주면 버튼을 그리고, `getHref` 를 주면 `<a href>` 를 그립니다. 라우터의 `Link` 는 `asChild` 로 감쌉니다.
- **자동 생략.** 페이지가 많으면 `1 … 6 7 8 … 20` 처럼 먼 쪽을 줄입니다. 칸 수가 늘 같아서 페이지를 옮겨도 폭이 흔들리지 않습니다.
- **랜드마크.** `<nav>` 에 이름("페이지 탐색")을 붙이고 목록(`ul`, `li`)으로 그립니다. 현재 페이지는 `aria-current="page"`, 번호마다 "3페이지" 처럼 읽습니다.
- **IDS 버튼.** 번호는 Button, 이전과 다음은 IconButton 이라 포커스 링, 크기, variant 가 다른 버튼과 같습니다.

```tsx
import { Pagination } from '@gsainfoteam/ids-react';

const [page, setPage] = useState(1);

<Pagination page={page} pageCount={data.totalPages} onPageChange={setPage} />;
```

## 버튼 모드

```tsx
<Pagination defaultPage={1} pageCount={20} />                          // 비제어
<Pagination page={page} pageCount={20} onPageChange={setPage} />       // 제어
<Pagination page={page} pageCount={Math.ceil(total / pageSize)} ... /> // 항목 수로 계산
```

- 페이지는 1부터 셉니다. 범위 밖의 `page` 는 가까운 끝으로 맞춰 그리고, 개발 모드에서 콘솔에 경고합니다.
- `pageCount` 가 0 이면 1페이지 하나를 그리고 이전, 다음을 끕니다. 불러오는 중에 자리가 흔들리지 않습니다.
- 현재 페이지를 다시 눌러도 `onPageChange` 는 불리지 않습니다.

## 링크 모드

```tsx
<Pagination page={page} pageCount={20} getHref={(page) => `/posts?page=${page}`} />
```

- 페이지마다 `<a href>` 를 그립니다. 서버가 그린 HTML 에도 주소가 있어 새 탭으로 열리고 검색 엔진이 따라갑니다.
- 끝에 닿은 이전, 다음은 `href` 를 떼고 `aria-disabled="true"` 가 되며 Tab 에서 빠집니다.
- 누르면 `onPageChange` 도 불립니다. `⌘`, `Ctrl`, `Shift`, `Alt` 를 누른 채 누르거나 가운데 버튼으로 누르면 새 탭에 맡기고 부르지 않습니다.

## 라우터 Link

`Pagination.List` 에 함수를 넘기면 이전, 페이지, 생략, 다음을 차례로 받습니다. 받은 `entry.page` 로 주소를 만들어 라우터의 `Link` 를 `asChild` 로 감쌉니다.

```tsx
import { Link } from '@tanstack/react-router';

<Pagination page={page} pageCount={20}>
  <Pagination.List>
    {(entry) => {
      if (entry.type === 'ellipsis') return <Pagination.Ellipsis />;
      const link = <Link to="/posts" search={{ page: entry.page }} />;
      if (entry.type === 'previous') return <Pagination.Previous asChild>{link}</Pagination.Previous>;
      if (entry.type === 'next') return <Pagination.Next asChild>{link}</Pagination.Next>;
      return <Pagination.Link page={entry.page} asChild>{link}</Pagination.Link>;
    }}
  </Pagination.List>
</Pagination>;
```

- 자식을 비워 두면 번호와 화살표를 채웁니다.
- Next.js 의 `Link` 는 `href` 를 받으니 `getHref` 와 함께 쓰면 `<Link />` 만 두어도 주소가 들어갑니다.
- 함수가 돌려준 것은 `Pagination.Item`(`li`)으로 감쌉니다. 직접 `Pagination.Item` 을 돌려주면 한 번 더 감싸지 않습니다.
- `entry` 의 모양:

| `type`     | 필드                                              |
| ---------- | ------------------------------------------------- |
| `previous` | `page`(갈 페이지), `disabled`(첫 페이지면 `true`) |
| `page`     | `page`, `current`                                 |
| `ellipsis` | `position`(`start` / `end`)                       |
| `next`     | `page`, `disabled`(마지막 페이지면 `true`)        |

## 생략 규칙

```tsx
<Pagination page={7} pageCount={20} />                    // 1 … 6 7 8 … 20
<Pagination page={10} pageCount={20} siblingCount={2} />  // 1 … 8 9 10 11 12 … 20
<Pagination page={10} pageCount={20} boundaryCount={2} /> // 1 2 … 9 10 11 … 19 20
<Pagination page={10} pageCount={20} boundaryCount={0} /> // … 9 10 11 …
```

- `siblingCount`(기본 1)는 현재 페이지 양옆에, `boundaryCount`(기본 1)는 양 끝에 늘 보일 페이지 수입니다.
- 칸 수는 `boundaryCount × 2 + siblingCount × 2 + 3` 입니다. 페이지가 이보다 적으면 모두 보입니다.
- 생략은 두 페이지 이상을 대신할 때만 씁니다. 한 페이지만 빠지면 그 번호를 그립니다.

## 파트 조합

```tsx
<Pagination defaultPage={2} pageCount={3}>
  <Pagination.List>
    <Pagination.Item>
      <Pagination.Previous icon={<ArrowLongLeftIcon />} />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Link page={1} />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Ellipsis />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Next />
    </Pagination.Item>
  </Pagination.List>
</Pagination>
```

- 자식을 직접 쓰면 그 순서 그대로 그리고 생략은 계산하지 않습니다. 자식이 없으면 `<Pagination.List />` 를 그립니다.
- `Pagination.Previous`, `Pagination.Next` 의 `icon` 으로 화살표를 바꿉니다. 오른쪽에서 왼쪽으로 쓰는 화면에서는 화살표가 뒤집힙니다.
- `Pagination.Ellipsis` 의 자식으로 생략 표시를 바꿉니다. 스크린 리더에는 숨깁니다.

## 모양

```tsx
<Pagination pageCount={20} variant="outline" />  {/* 현재 페이지만. 나머지는 ghost */}
<Pagination pageCount={20} size="tiny" />
<Pagination pageCount={20} disabled />           {/* 모든 버튼을 끈다 */}
```

## 키보드

| 키              | 동작                              |
| --------------- | --------------------------------- |
| `Tab`           | 버튼과 링크마다 멈춘다            |
| `Enter` `Space` | 누른다(링크는 `Enter`)            |
| `←` `→`         | 이전, 다음 페이지로               |
| `Home` `End`    | 첫 페이지, 마지막 페이지로        |

- 방향키와 `Home` `End` 는 페이지네이션 안에 포커스가 있을 때만 받습니다. 그 자리에 보이는 버튼이나 링크를 눌러서 옮기므로 라우터 링크에서도 같습니다.
- 페이지 번호에서 누르면 포커스가 새 현재 페이지를 따라가고, 이전과 다음에서 누르면 그 버튼에 남습니다.
- 오른쪽에서 왼쪽으로 쓰는 화면에서는 `←` 와 `→` 가 바뀝니다. 수식키를 함께 누르면 가로채지 않습니다.

## 속성

| 속성                    | 기본 / 동작                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `page` / `defaultPage`  | 현재 페이지. 1부터 센다. `defaultPage` 기본 `1`               |
| `onPageChange`          | `(page: number) => void`                                      |
| `pageCount`             | 전체 페이지 수. 필수                                          |
| `siblingCount`          | `1`. 현재 페이지 양옆에 보일 수                               |
| `boundaryCount`         | `1`. 양 끝에 보일 수                                          |
| `getHref`               | `(page) => string`. 주면 링크 모드                            |
| `size`                  | `standard`(기본) / `tiny`                                     |
| `variant`               | 현재 페이지의 Button variant. `solid`(기본)                   |
| `disabled`              | 모든 버튼과 링크를 끈다                                       |
| `Pagination.Link`       | `page` 필수. `asChild`, 자식이 없으면 번호                    |
| `Pagination.Previous`   | `icon`, `asChild`. 이름은 "이전 페이지"                       |
| `Pagination.Next`       | `icon`, `asChild`. 이름은 "다음 페이지"                       |
| `Pagination.List`       | `ul`. 자식은 노드 또는 `(entry) => ReactNode`                 |
| `Pagination.Item`       | `li`                                                          |
| `Pagination.Ellipsis`   | `aria-hidden` 인 `span`. 자식이 없으면 가로 점 세 개 아이콘   |

## 알아둘 것

- `getHref` 와 `Pagination.List` 의 함수는 함수라서 Server Component 에서 넘길 수 없습니다. 서버에서 그리는 페이지는 이 부분만 클라이언트 컴포넌트로 둡니다.
- 이름("페이지 탐색", "3페이지", "이전 페이지", "다음 페이지")은 `IdsProvider translate` 의 `pagination.*` 키로 바꿉니다. 한 화면에 페이지네이션이 둘이면 `aria-label` 로 구분합니다.
- 항목 수로 "41-60 / 1,000" 같은 안내를 적는 파트는 없습니다. 옆에 글자로 둡니다.
