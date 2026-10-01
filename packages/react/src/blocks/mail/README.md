# Mail

Storybook `Blocks/Mail/*`. 메일 화면 두 가지입니다.

| 구현      | 화면                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `Inbox`   | 편지함, 메일 목록, 읽기 창의 3단. `Splitter` 로 폭을 끌어 바꾼다. `md` 보다 좁으면 목록과 읽기를 오간다. |
| `Compose` | 카드 하나에 받는 사람 칩, 제목, 내용, 첨부. 보내기 옆 메뉴로 예약 보내기를 고른다.                      |

- **쓰인 컴포넌트.** Splitter, ScrollArea, Item, Badge, Avatar, Empty, Button, IconButton, ButtonGroup, TextArea, TextField, ChipField, FileField, Field, Menu, Card, Divider, Spacer, toast
- **알아둘 것.**
  - 페이지가 `h-dvh` 라 세 칸이 따로 스크롤됩니다. 스크롤은 칸마다 `ScrollArea` 가 맡고, `fade` 로 더 남은 쪽을 흐립니다.
  - 편지함, 목록, 읽기 창은 렌더 안의 변수로 만들어 `Splitter` 와 좁은 화면에 함께 씁니다.
  - 처음에는 아무 메일도 열지 않습니다. 넓은 화면의 읽기 창은 `Empty` 로 고르라고 알립니다.
  - 답장 입력은 `TextArea.Input` 뒤의 `Spacer` 와 버튼이 입력 칸 아래 막대의 오른쪽에 놓입니다.
  - 보내기와 예약 메뉴는 `ButtonGroup variant="solid"` 라 두 버튼이 한 덩어리로 이어집니다. IconButton 의 기본 variant 는 ghost 라, 그룹에 variant 를 줍니다.
