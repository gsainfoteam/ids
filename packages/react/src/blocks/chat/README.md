# Chat

Storybook `Blocks/Chat/*`. 대화 화면 두 가지입니다.

| 구현        | 화면                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `Channel`   | 동아리 채널. 날짜 구분선, 아바타와 이름이 붙은 메시지, 첨부 카드, 답글 버튼, 입력 중 표시, 입력창. |
| `Assistant` | GIST 도우미 챗봇. 내 질문은 오른쪽 상자, 답은 본문처럼 쓰고 표와 목록, 평가 버튼을 붙인다.        |

- **쓰인 컴포넌트.** Item, Avatar, AvatarGroup, Badge, Card, Table, Chip, Button, IconButton, IconToggle, TextArea, ScrollArea, Divider, Spacer, toast
- **알아둘 것.**
  - 말풍선 컴포넌트가 아직 없어서 채널은 말풍선 없이 줄로 쌓고, 챗봇의 내 질문만 `Card variant="soft"` 상자로 오른쪽에 둡니다.
  - 날짜 구분은 글자를 가운데 둔 `Divider` 입니다.
  - 채널과 챗봇의 머리는 `Item` 이라, 설명 글자가 흐린 색을 따로 칠하지 않아도 됩니다.
  - 페이지가 `h-dvh` 이고 대화만 `ScrollArea` 에서 스크롤합니다. 입력창은 늘 아래에 있습니다.
  - 입력창은 `TextArea.Input` 뒤에 둔 버튼과 `Spacer` 가 입력 칸 아래 막대가 됩니다.
  - 챗봇 답의 평가 버튼은 렌더 안의 변수 하나로 만들어 답마다 씁니다.
