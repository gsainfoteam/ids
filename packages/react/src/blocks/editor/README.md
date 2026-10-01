# Editor

Storybook `Blocks/Editor/*`. 무언가를 만드는 입력 화면 두 가지입니다.

| 구현    | 화면                                                                                         |
| ------- | -------------------------------------------------------------------------------------------- |
| `Post`  | 게시글 쓰기. 제목, 게시판, 태그, 쓰기와 미리 보기 탭, 표지, 공개 범위, 예약 올리기.              |
| `Event` | 행사 만들기. 이름, 소개, 기간, 시작 시간, 장소, 정원, 참가 신청. 오른쪽 미리 보기가 바로 바뀐다. |

- **쓰인 컴포넌트.** TextField, TextArea, Select, ChipField, Tabs, Card, FileField, RadioGroup, Switch, Label, DateTimeField, DateField, TimeField, NumberField, Field, Item, Badge, Button, toast
- **알아둘 것.**
  - 본문은 서식 없는 `TextArea` 입니다. 굵게, 목록 같은 서식을 넣는 편집기 컴포넌트는 아직 없습니다.
  - 쓰기 탭은 `forceMount` 라 미리 보기로 갔다 와도 입력 칸이 그대로 남습니다.
  - 기간은 `DateField selectionMode="range"` 이고 값은 `{ start, end }` 입니다.
  - 미리 보기의 항목 줄은 `Item` 으로, 제목 자리에 값, 설명 자리에 이름을 둡니다. 키와 값을 보이는 DataList 컴포넌트가 아직 없습니다.
  - 미리 보기는 넓은 화면에서 `sticky` 로 폼을 따라 내려옵니다.
