# Notifications

Storybook `Blocks/Notifications/*`. 알림 화면 세 가지입니다.

| 구현          | 화면                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| `Page`        | 종류 탭과 날짜별 묶음. 알림을 누르면 읽음이 되고, 모두 읽음 버튼이 있다.                  |
| `Popover`     | 헤더의 종 버튼에 붙은 팝오버. 읽지 않은 수를 버튼에 붙이고, 최근 알림 넷과 모두 보기 링크. |
| `Preferences` | 알림마다 앱과 메일을 고르는 토글, 전체 끄기, 요약 메일 주기.                              |

- **쓰인 컴포넌트.** Tabs, Card, Item, Avatar, Badge, Empty, Popover, IconButton, Skeleton, ToggleGroup, Toggle, Switch, Select, Field, Alert, Button, Divider, toast
- **알아둘 것.**
  - 알림 행은 `onClick` 을 준 `Item` 이라 제목이 버튼이 됩니다. 행 어디를 눌러도 읽음이 됩니다.
  - 시간은 `Item.Description` 에 함께 적습니다. 한 행에 `Item.Description` 을 둘 두면 행의 설명 id 가 서로 덮습니다.
  - 읽지 않은 수는 `Badge` 로 종 버튼을 감싸 붙입니다. `aria-label` 을 주면 수가 바뀔 때 스크린 리더가 읽습니다.
  - Popover 는 스토리에서 `defaultOpen` 으로 열어 둡니다. 뒤의 페이지는 `Skeleton` 입니다.
  - 받을 곳 토글은 `selectionMode="multiple"` 인 `ToggleGroup` 이고, `aria-labelledby` 로 행 제목을 이름으로 씁니다.
