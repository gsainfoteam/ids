# Onboarding

Storybook `Blocks/Onboarding/*`. 처음 온 사람을 맞는 화면 두 가지입니다.

| 구현        | 화면                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `Steps`     | 관심 게시판 칩, 알림 스위치, 닉네임과 사진의 세 단계. 건너뛰거나 끝내면 준비가 끝났다는 화면이 된다. |
| `Checklist` | 할 일 다섯 개와 진행 막대. 하기를 누르면 했어요로 바뀌고 진행이 오른다. 아래에 도우미 안내.         |

- **쓰인 컴포넌트.** Card, Stepper, Chip, Item, Switch, Avatar, Field, TextField, Empty, Badge, Progress, Button
- **알아둘 것.**
  - 관심 게시판은 `selected` 를 제어하는 `Chip` 들을 `role="group"` 으로 묶은 것입니다. 하나도 고르지 않으면 다음으로 가지 않습니다.
  - Stepper 는 `onValueChange` 없이 `value` 만 받아 누를 수 없는 표시 전용입니다. 단계는 아래 버튼이 옮깁니다.
  - 체크리스트의 아이콘 타일은 끝난 일이면 `soft` 에 체크, 남은 일이면 `outline` 에 그 일의 아이콘입니다.
  - 하기 버튼은 `aria-label` 에 일 이름을 붙여 여러 개의 버튼을 구별합니다.
