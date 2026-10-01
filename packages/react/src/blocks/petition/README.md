# Petition

Storybook `Blocks/Petition/*`. 학생 청원 화면 두 가지입니다.

| 구현     | 화면                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| `Detail` | 청원 본문, 진행 단계, 답변 대기, 동의한 사람들의 말. 오른쪽에 목표까지의 진행과 동의하기.        |
| `List`   | 상태 탭(동의 모으는 중, 검토 중, 답변 완료)과 청원 카드. 모으는 중인 청원은 목표까지 막대를 둔다. |

- **쓰인 컴포넌트.** Breadcrumb, Badge, Item, Avatar, Stepper, Empty, Progress, Card, Button, IconButton, Tabs, Divider, toast
- **알아둘 것.**
  - 동의하기는 버튼 하나가 `solid` 와 `soft`, 아이콘과 글자를 바꿔 상태를 보입니다. 누르면 동의 수가 하나 늘어납니다.
  - 목표 대비 진행은 `Progress.Label` 과 `Progress.Value` 로 남은 인원과 퍼센트를 함께 보입니다.
  - 청원 카드는 `Card asChild interactive` 로 감싼 링크입니다.
  - 글쓴이 줄은 `Item variant="soft"` 상자입니다.
