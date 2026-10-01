# Error

Storybook `Blocks/Error/*`. 페이지를 보여 줄 수 없을 때의 화면 세 가지입니다.

| 구현          | 화면                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| `NotFound`    | 404. 검색창, 자주 찾는 페이지 목록, 홈과 이전 페이지 버튼.                                  |
| `ServerError` | 500. `Empty` 에 다시 시도와 알리기 버튼, 그 아래 복사할 수 있는 오류 번호.                   |
| `Maintenance` | 점검 중. 진행 막대와 `Stepper` 로 그린 점검 일정, 끝나면 메일로 알려 주는 입력.              |

- **쓰인 컴포넌트.** Badge, Card, Item, TextField, Kbd, Button, Empty, Field, IconButton, Progress, Stepper, toast
- **알아둘 것.**
  - 오류 코드는 큰 숫자를 그리지 않고 `Badge` 로 붙입니다. 제목이 무슨 일인지 말합니다.
  - `Empty.Description` 안의 링크는 Empty 가 밑줄을 긋습니다.
  - 오류 번호는 `readOnly` TextField 에 복사 버튼을 붙인 것입니다. 앱에서는 `navigator.clipboard.writeText` 로 복사합니다.
  - 점검 일정의 `Stepper` 는 `onValueChange` 가 없어 누를 수 없는 표시 전용입니다.
