# 채팅

Storybook `Patterns/PC/Chat` 와 `Patterns/Mobile/Chat`. 대화 목록과 챗봇 대화 창입니다.

- **쓰인 컴포넌트.** Item.Group, ScrollArea, TextArea, IconButton, Chip, Menu, Divider, Spinner, Avatar
- **폭에 따라.** `md` 부터 대화 목록이 보입니다.
- **알아둘 것.**
  - 메시지 목록은 `role="log"` 라서 새 메시지를 스크린 리더가 읽습니다. 말풍선마다 누가 말했는지 `sr-only` 로 붙입니다.
  - Enter 로 보내고 Shift+Enter 로 줄을 바꿉니다. 한글을 조합하는 중(`isComposing`)에는 보내지 않습니다.
