# Chat

Storybook `Blocks/Chat/*`. 사람끼리 이야기하는 화면입니다. 챗봇은 [Chatbot](../chatbot/README.md) 에 있습니다.

| 구현      | 화면                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- |
| `Channel` | 동아리 채널. 날짜 구분선, 아바타와 이름이 붙은 메시지, 첨부 카드, 답글 버튼, 입력 중 표시, 입력창. |

- **쓰인 컴포넌트.** Item, Avatar, AvatarGroup, Badge, Card, Button, IconButton, TextArea, ScrollArea, Divider, Spacer
- **알아둘 것.**
  - 말풍선 컴포넌트가 아직 없어서 메시지를 말풍선 없이 줄로 쌓습니다.
  - 날짜 구분은 글자를 가운데 둔 `Divider` 입니다.
  - 채널 머리는 `Item` 이라, 설명 글자가 흐린 색을 따로 칠하지 않아도 됩니다.
  - 페이지가 `h-dvh` 이고 대화만 `ScrollArea` 에서 스크롤합니다. 입력창은 늘 아래에 있습니다.
  - 입력창은 `TextArea.Input` 뒤에 둔 버튼과 `Spacer` 가 입력 칸 아래 막대가 됩니다.
