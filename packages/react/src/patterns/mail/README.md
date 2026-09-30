# 받은편지함

Storybook `Patterns/Mail`. 편지함, 메일 목록, 읽기 창의 3단 메일 화면입니다.

- **쓰인 컴포넌트.** Splitter, Item.Group, ToggleGroup, TextField, ScrollArea, Tooltip, Menu, TextArea, Avatar, Badge, Empty
- **폭에 따라.** `lg` 부터 `Splitter` 로 세 칸을 나누고 끌어서 크기를 바꿉니다. 그보다 좁으면 목록과 읽기 화면을 번갈아 보여 줍니다.
- **알아둘 것.**
  - 안 읽은 메일은 점과 `sr-only` 글자("안 읽음")로 함께 알립니다.
  - 답장 칸은 `TextArea` 의 아래 바에 보내기 버튼을 둡니다.
