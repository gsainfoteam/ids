# Sidebar

Storybook `Blocks/Sidebar/*`. 왼쪽 메뉴가 있는 앱 셸 세 가지입니다.

| 구현          | 화면                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `Simple`      | 묶음 제목이 있는 메뉴, 개수 배지, 아래쪽 사용자 메뉴. 640px 보다 좁으면 본문의 메뉴 버튼이 Drawer 로 연다. |
| `Collapsible` | 아이콘 띠로 접히는 메뉴. 접히면 항목 이름이 오른쪽 Tooltip 으로 뜬다. `Mod+B` 로 접고 편다.              |
| `Inset`       | 워크스페이스 전환, 찾기, 접히는 즐겨찾기와 채널. 본문은 페이지 안쪽에 뜬 카드고, 사이드바는 통째로 밀려 나간다. |

- **쓰인 컴포넌트.** Sidebar, Item, Badge, Avatar, Button, IconButton, Menu, Breadcrumb, Kbd, Divider, Spacer, Skeleton
- **알아둘 것.**
  - 세 화면 모두 [Sidebar](../../components/navigation/sidebar/README.md) 로 짓습니다. `Sidebar.Provider` 가 사이드바와 본문(`Sidebar.Inset`)을 나란히 놓고, 본문의 `Sidebar.Trigger` 가 같은 사이드바를 접거나 Drawer 를 엽니다.
  - 메뉴 항목은 `Sidebar.Item` 입니다. 첫 아이콘, 라벨, 끝 칸(Badge, Kbd)을 자식 순서로 적고, `Sidebar` 의 `value` 와 같은 항목에 `aria-current="page"` 가 붙습니다.
  - 좁은 화면의 메뉴는 Sidebar 가 같은 내용을 Drawer 에 그립니다. 메뉴를 두 번 적지 않습니다.
  - 접혔을 때 Header, Footer 의 내용을 숨기려면 `in-data-collapsed:hidden` 을 줍니다.
