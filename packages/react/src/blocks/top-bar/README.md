# TopBar

Storybook `Blocks/TopBar/*`. 화면 맨 위의 막대 두 가지입니다. 넓은 화면에서는 메뉴 링크가 막대에 놓이고, 640px 보다 좁으면 메뉴 버튼이 왼쪽 Drawer 에 같은 링크를 엽니다.

| 구현      | 화면                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| `Simple`  | 로고, 메뉴 링크 넷, 오른쪽 끝의 로그인 버튼.                                                  |
| `Account` | 로고, 메뉴 링크 넷, 찾기와 알림 버튼, 계정 Menu. 좁으면 로고 글자와 이름은 화면에서 숨기고 그림만 남긴다. 로고 글자는 `max-sm:sr-only` 라 링크 이름으로 남는다. |

- **쓰인 컴포넌트.** Link, Drawer, Item, IconButton, Button, Avatar, Badge, Menu, Divider, Skeleton
- **알아둘 것.**
  - 메뉴 링크는 `Link colorScheme="neutral" underline="none"` 입니다. 글자색은 둘레를 따르고, `aria-current="page"` 인 지금 페이지만 primary 글자색이 됩니다. 라우터 링크는 `aria-current` 를 스스로 붙입니다.
  - 막대의 `<nav>` 는 `max-sm:hidden`, 메뉴 버튼은 `sm:hidden` 입니다. 640px 는 Sidebar 와 Select 의 Drawer 경계와 같습니다.
  - Drawer 의 항목은 `Drawer.Close asChild` 로 감싼 `Item asChild` 입니다. 항목을 누르면 Drawer 가 닫히고, 지금 페이지는 `selected` 로 칠합니다.
  - 메뉴를 배열 하나로 두고 막대와 Drawer 에서 두 번 `map` 합니다. `aria-current` 도 양쪽에 적습니다.
  - 화면이 넓어져도 열린 Drawer 는 저절로 닫히지 않습니다.
  - 왼쪽 메뉴가 있는 앱은 [Sidebar](../sidebar/README.md) 블록처럼 상단 바에 `Sidebar.Trigger` 를 두고, 좁은 화면의 메뉴를 Sidebar 의 Drawer 에 맡깁니다.
