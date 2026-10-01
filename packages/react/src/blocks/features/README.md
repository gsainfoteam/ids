# Features

Storybook `Blocks/Features/*`. 서비스가 하는 일을 보여 주는 섹션 두 가지입니다.

| 구현       | 화면                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| `Grid`     | 제목과 기능 여섯 칸. 칸마다 아이콘 타일, 이름, 한두 줄 설명.                            |
| `Showcase` | 기능 셋을 한 줄씩 번갈아 놓고, 반대쪽에 그 기능을 IDS 컴포넌트로 짠 미리 보기를 둔다.     |

- **쓰인 컴포넌트.** Item, Badge, Button, Card, Avatar, Progress, Stepper
- **알아둘 것.**
  - 기능 칸은 `Item variant="outline"` 을 `<ul>` 격자에 둔 것입니다. `Item.Group` 은 자식마다 `<li>` 를 씌우니, 격자 `div` 를 사이에 끼우면 목록 항목이 하나가 됩니다.
  - Showcase 의 미리 보기는 그림이라 `aria-hidden` 입니다. 짝수 줄은 `lg:order-first` 로 미리 보기를 왼쪽에 둡니다.
