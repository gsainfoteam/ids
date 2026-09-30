# Event

Storybook `Blocks/Event/*`. 행사 화면 두 가지입니다.

| 구현     | 화면                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| `Detail` | 행사 소개, 날짜와 장소, 첫날 순서, 자주 묻는 질문. 오른쪽에서 참석 여부를 고르고 참석자를 본다. |
| `List`   | 한 달 행사 목록. 분류 칩으로 거르고, 줄마다 참석 토글이 있다. 정원이 찬 행사는 꺼진다.           |

- **쓰인 컴포넌트.** Breadcrumb, Badge, Card, Item, Stepper, Accordion, ToggleGroup, Toggle, IconButton, Avatar, AvatarGroup, Chip, Empty, toast
- **알아둘 것.**
  - 순서는 `Stepper progress={false}` 로 그린 기록입니다. 지금 단계 없이 점과 선만 이어집니다.
  - 참석 여부는 하나만 고르는 `ToggleGroup` 이고, 세 칸이 폭을 나누도록 `Toggle` 마다 `flex-1` 을 줍니다.
  - 목록의 날짜 칸은 글자를 담은 `Item.Media variant="outline"` 타일입니다. 날짜는 설명 줄에 다시 적으니 타일은 `aria-hidden` 입니다.
  - 참석 토글의 이름은 `aria-label` 로 행사 이름을 붙여, 여러 개의 "참석" 버튼을 구별합니다.
