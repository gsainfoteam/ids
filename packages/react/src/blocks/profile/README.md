# Profile

Storybook `Blocks/Profile/*`. 사람을 보여 주는 화면 두 가지입니다.

| 구현      | 화면                                                                                         |
| --------- | -------------------------------------------------------------------------------------------- |
| `Page`    | 왼쪽 프로필 카드(소개, 관심사, 글과 팔로워 수, 팔로우)와 오른쪽 글, 댓글, 동아리 탭.             |
| `Members` | 팀원 카드 격자. 이름이나 기술로 찾고 팀으로 거른다.                                            |

- **쓰인 컴포넌트.** Card, Avatar, Chip, Badge, Button, IconButton, Menu, Tabs, Item, TextField, Select, Empty, toast
- **알아둘 것.**
  - 글과 팔로워 수는 `Card variant="soft" size="tiny"` 세 개를 `<dl>` 로 묶은 것입니다. 숫자를 보이는 Stat 컴포넌트가 아직 없습니다.
  - Avatar 는 40px(`standard`)이 가장 커서, 프로필 카드도 그 크기를 씁니다.
  - 팔로우는 버튼 하나가 `solid` 와 `outline`, 글자와 아이콘을 바꿔 상태를 보입니다.
  - 관심사와 기술 칩은 `<ul>` 에 담아 목록으로 읽힙니다.
