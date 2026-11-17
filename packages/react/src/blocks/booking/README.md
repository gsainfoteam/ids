# Booking

Storybook `Blocks/Booking/*`. 날짜와 시간을 골라 예약하는 화면 두 가지입니다.

| 구현    | 화면                                                                                         |
| ------- | -------------------------------------------------------------------------------------------- |
| `Room`  | 스터디룸 예약. 평일만 고르는 달력, 방 카드, 이미 찬 시간이 꺼진 시작 시간, 예약 내용 요약.       |
| `Slots` | 면담 시간 잡기. 달력에서 날을 고르면 그날 빈 시간이 나오고, 시간을 고르면 정보 입력, 완료로 간다. |

- **쓰인 컴포넌트.** Calendar, Card, Item, RadioGroup, ToggleGroup, Toggle, Button, Alert, Avatar, Badge, Empty, Field, TextField, TextArea, Divider, toast
- **알아둘 것.**
  - 오늘은 `2026-10-01` 로 고정합니다. 서버와 클라이언트가 같은 달력을 그립니다.
  - 달력은 `min`, `max`, `disabled={{ dayOfWeek: [0, 6] }}` 로 2주 안의 평일만 남깁니다.
  - 방 카드는 `Item asChild` 로 그린 `<label>` 안에 Radio 를 둔 것이라 카드 어디를 눌러도 고릅니다. 고른 카드에는 Item 의 `selected` 층이 깔립니다.
  - 시작 시간은 `attached={false}` 인 `ToggleGroup` 입니다. 붙은 묶음은 줄이 넘어가면 마지막 칸이 늘어납니다.
  - Slots 는 고른 시간 옆에 다음 버튼을 붙이는 Calendly 방식입니다. 단계는 상태 하나로 바꿉니다.
