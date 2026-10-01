# Cafeteria

Storybook `Blocks/Cafeteria/*`. 학식 화면 두 가지입니다.

| 구현    | 화면                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------- |
| `Today` | 오늘 메뉴. 끼니 전환, 식당 탭, 코너별 카드(가격, 열량, 반찬, 평점과 별점 매기기), 알레르기 표시. |
| `Week`  | 이번 주 메뉴 표. 오늘 줄을 깔고, 쉬는 날은 한 칸으로 합친다.                                    |

- **쓰인 컴포넌트.** ToggleGroup, Toggle, Tabs, Card, Badge, Chip, Rating, Table, Alert, IconButton, toast
- **알아둘 것.**
  - 피하고 싶은 재료는 `colorScheme="danger"` 인 `Chip` 입니다. 고르면 그 재료가 든 메뉴 카드에 경고 배지가 붙습니다.
  - 별점은 매기는 `Rating` 이고, 옆의 평점 숫자가 다른 사람들의 평균입니다.
  - 오늘 줄은 `Table.Row selected` 이고, 쉬는 날은 `colSpan={3}` 칸 하나에 배지를 둡니다.
