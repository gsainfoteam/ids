# PostList

Storybook `Blocks/PostList/*`. 게시판 목록 세 가지입니다.

| 구현    | 화면                                                                                         |
| ------- | -------------------------------------------------------------------------------------------- |
| `List`  | 분류 탭, 검색, 정렬, 한 줄짜리 글 목록, 페이지 번호. 고정 글이 맨 위에 온다.                    |
| `Cards` | 분류 칩과 글 카드 격자. 카드 어디를 눌러도 글로 가고, 더 보기로 여섯 개씩 늘린다.               |
| `Table` | `DataTable` 로 그린 공지 표. 머리글을 눌러 정렬하고, 표 아래에서 페이지를 넘긴다.               |

- **쓰인 컴포넌트.** Tabs, TextField, Select, Card, Item, Badge, Empty, Pagination, Chip, Avatar, Spacer, DataTable, Button
- **알아둘 것.**
  - List 의 분류 탭은 탭마다 `Tabs.Content` 를 두고 그 안에 목록을 그립니다. Content 가 없는 `Tabs.Trigger` 는 IDS 가 개발 모드에서 경고합니다.
  - 글 행은 `Item asChild` 로 감싼 링크, 글 카드는 `Card asChild` 로 감싼 링크입니다. 안에 다른 버튼을 두지 않습니다.
  - 카드 바닥의 글쓴이와 수치는 `Spacer` 로 양 끝에 밉니다.
  - 수를 보이는 `Badge` 에 `aria-label` 을 주지 않습니다. `aria-label` 을 주면 값이 바뀔 때마다 읽는 live region 이 되어, 목록에서는 줄마다 읽힙니다. 대신 "댓글 12" 처럼 글자로 적습니다.
  - Table 의 열 정의는 모듈 위에 둡니다. 렌더마다 새로 만들면 TanStack 이 모든 행을 다시 계산합니다.
  - Table 의 제목 링크는 꾸미지 않은 `<a>` 입니다. 표 칸의 링크를 그릴 Link 컴포넌트가 아직 없습니다.
