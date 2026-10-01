# Sidebar

Storybook `Blocks/Sidebar/*`. 왼쪽 메뉴가 있는 앱 셸 세 가지입니다.

| 구현          | 화면                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `Simple`      | 묶음 제목이 있는 메뉴, 개수 배지, 아래쪽 사용자 메뉴. `md` 보다 좁으면 메뉴 버튼이 Drawer 로 연다. |
| `Collapsible` | 아이콘만 남기고 접히는 메뉴. 접히면 항목 이름이 오른쪽 Tooltip 으로 뜬다.                          |
| `Inset`       | 워크스페이스 전환, 찾기 버튼, 즐겨찾기와 채널. 본문은 페이지 안쪽에 뜬 카드다.                      |

- **쓰인 컴포넌트.** Item, Badge, Avatar, Button, IconButton, Menu, Drawer, Tooltip, Breadcrumb, Card, Kbd, Divider, Spacer, Skeleton
- **알아둘 것.**
  - 메뉴 항목은 `Item asChild` 로 감싼 링크입니다. 지금 페이지에 `selected` 와 `aria-current="page"` 를 줍니다.
  - 사이드바와 본문 사이의 선은 `Divider orientation="vertical"` 입니다.
  - Simple 은 메뉴를 렌더 안의 변수 하나로 만들어 사이드바와 Drawer 에 함께 씁니다.
  - 숨긴 사이드바 안에 `Spacer` 를 두면 IDS 가 부모가 flex 가 아니라고 경고합니다. 아래로 미는 요소는 `mt-auto` 로 둡니다.
  - Inset 은 `md` 보다 좁으면 사이드바를 숨깁니다. 좁은 화면의 메뉴는 Simple 처럼 Drawer 로 엽니다.
  - 앱 셸을 하나로 묶는 Sidebar 컴포넌트(접기 상태, 단축키, 모바일 Drawer)는 아직 없습니다.
