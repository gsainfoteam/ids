# Carpool

Storybook `Blocks/Carpool/*`. 택시 합승 화면 두 가지입니다.

| 구현     | 화면                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| `List`   | 방향 전환, 오늘과 내일 칩, 합승 카드(남은 자리, 모인 사람, 1인 요금, 같이 타기), 모집 Drawer.     |
| `Create` | 출발과 도착(맞바꾸기 버튼), 날짜, 시간, 모을 인원, 하고 싶은 말, 캐리어, 1인 요금 어림.           |

- **쓰인 컴포넌트.** ToggleGroup, Toggle, Chip, Card, Badge, AvatarGroup, Avatar, Button, IconButton, Empty, Drawer, Field, TextField, TimeField, DateField, Select, TextArea, Checkbox, Label, Alert, toast
- **알아둘 것.**
  - 같이 타기를 누르면 그 카드의 모인 사람에 내가 더해지고, 버튼이 취소로 바뀝니다. 자리가 없으면 꺼집니다.
  - 모집 폼은 오른쪽에서 나오는 `Drawer` 입니다. 좁은 화면에서도 같은 쪽에서 나옵니다.
  - 출발과 도착이 같으면 모집 열기 버튼이 꺼집니다.
  - 요금은 정해 둔 어림값을 인원으로 나눈 것입니다. 앱에서는 지도 서비스의 예상 요금을 씁니다.
