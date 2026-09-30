# 글쓰기

Storybook `Patterns/Editor`. 제목, 게시판, 태그, 서식 도구, 미리 보기, 표지, 공개 범위, 예약 올리기를 갖춘 글쓰기 화면입니다.

- **쓰인 컴포넌트.** TextField, Select, ChipField, Tabs, ToggleGroup (multiple), IconToggle, IconButton, TextArea, FileField, RadioGroup, Switch, DateTimeField
- **폭에 따라.** `lg` 부터 올리기 설정이 오른쪽에 붙습니다.
- **알아둘 것.**
  - 서식 도구는 `ToggleGroup selectionMode="multiple"` 이라 스크린 리더에 도구 막대로 읽힙니다.
  - 쓰기 탭은 `forceMount` 라서 미리 보기로 옮겨도 입력이 남습니다.
