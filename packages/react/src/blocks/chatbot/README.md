# Chatbot

Storybook `Blocks/Chatbot/*`. AI 챗봇 화면 다섯 가지입니다.

| 구현       | 화면                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `Welcome`  | 새 대화. 인사, 첨부와 웹 검색이 붙은 입력창, 누르면 입력창에 들어가는 추천 질문 카드, 모델 고르기.       |
| `Thread`   | 대화 기록 사이드바와 대화. 생각 과정과 도구 호출을 접어 두고, 표로 답하고, 출처와 평가 버튼을 단다.      |
| `Research` | 검색형 답. 출처 카드 넷, 번호를 단 답, 순서 목록, 출처 탭, 이어서 많이 묻는 질문.                        |
| `Widget`   | 사이트 오른쪽 아래 버튼으로 여는 작은 상담 창. 자주 묻는 것을 칩으로 고른다.                             |
| `Simple`   | 대화 한 줄기만 있는 가장 단순한 챗봇. 표와 목록으로 답하고 아래에 추천 질문.                             |

- **쓰인 컴포넌트.** TextArea, IconButton, Toggle, Select, Card, Avatar, Accordion, Table, Badge, Button, Chip, Item, Tabs, Alert, Spinner, ScrollArea, Drawer, Menu, Popover, FloatingButton, TextField, Divider, Spacer, toast
- **대신 쓴 것.** shadcn/ui 와 AI Elements 의 채팅 파트가 IDS 에는 아직 없습니다. 아래는 각 블록이 무엇으로 대신했는지입니다.
  - 내 말풍선(Bubble): `Card variant="soft"` 를 오른쪽에 붙인 상자.
  - 답 한 줄(Message): 아바타와 본문을 배치 클래스로 나란히.
  - 생각 과정(Reasoning), 도구 호출(Tool): `Accordion variant="soft"` 항목. 도구에 넘긴 값은 `Table`.
  - 진행 중 표시(Marker, Shimmer): `Spinner` 와 글자를 담은 `role="status"` 문단.
  - 첨부(Attachment): `Item variant="outline" size="tiny"`.
  - 인용 번호(Inline Citation): 화면에 안 보이는 "출처" 글자를 담은 `Badge`.
  - 입력창(Prompt Input): `TextArea.Input` 뒤에 첨부 버튼, 웹 검색 토글, `Spacer`, 보내기 버튼.
  - 따라가는 스크롤(Message Scroller): `ScrollArea.Viewport` 에 ref 를 걸어, 처음과 새 메시지가 오면 끝으로 내린다. 독자가 위로 올려 읽는 중이면 따라가지 않는다.
- **알아둘 것.**
  - Thread 의 마지막 답은 "다시 맞추는 중" 으로 시작해 2.4초 뒤에 답이 됩니다. 보낸 메시지도 같은 시간 뒤에 답이 붙습니다.
  - 추천 질문 카드는 `onClick` 을 준 `Card` 라 제목이 버튼이 됩니다. 버튼 안에 블록 요소를 넣지 않습니다.
  - Widget 은 `FloatingButton` 을 `Popover.Trigger` 로 쓰고, 스토리에서는 `defaultOpen` 으로 열어 둡니다.
