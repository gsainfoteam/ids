# Settings

Storybook `Blocks/Settings/*`. 설정 화면 세 가지입니다.

| 구현       | 화면                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `Sections` | 한 페이지에 카드를 쌓는다. 프로필 폼, 알림 스위치, 로그인한 기기, 확인 문구를 적어야 지워지는 계정 삭제. |
| `Tabs`     | 일반, 알림, 화면, 보안 탭. 화면 탭에서 고른 모드와 테마 색이 페이지에 바로 들어간다.               |
| `Sidebar`  | 왼쪽 분류 목록과 오른쪽 내용. `md` 보다 좁으면 분류가 Select 로 바뀐다.                           |

- **쓰인 컴포넌트.** Card, Item, Field, TextField, TextArea, PasswordField, Select, Switch, RadioGroup, Checkbox, TimeField, Table, Tabs, ToggleGroup, Toggle, Dialog, Avatar, Badge, Progress, Button, Divider, Label, IdsProvider, toast
- **알아둘 것.**
  - 스위치 행은 `Item` 입니다. `Switch` 에 `Item.Title` 과 `Item.Description` 의 id 를 `aria-labelledby`, `aria-describedby` 로 이어 이름과 설명을 줍니다.
  - 계정 삭제는 `role="alertdialog"` 인 `Dialog` 입니다. 확인 문구를 똑같이 적어야 지우기 버튼이 켜집니다.
  - Tabs 는 페이지를 `IdsProvider color mode` 로 감싸 고른 값을 바로 보여 줍니다. 모드가 바깥과 다르면 IdsProvider 가 면을 칠합니다.
  - 테마 색 견본은 색마다 `IdsProvider color` 로 감싼 `Badge dot` 입니다. 견본을 따로 그리지 않습니다.
  - 가로 `Field` 는 라벨 열의 폭이 줄마다 달라, 여러 줄을 맞춰야 하는 곳은 세로 Field 를 두 열로 놓습니다.
  - Sidebar 의 분류는 `Item asChild` 링크이고, 고른 분류에 `selected` 와 `aria-current="page"` 를 줍니다.
