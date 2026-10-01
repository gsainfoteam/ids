# FileManager

Storybook `Blocks/FileManager/*`. 자료실 화면 두 가지입니다.

| 구현      | 화면                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| `Browser` | 경로, 폴더, 격자와 목록으로 바꿔 보는 파일, 파일마다 메뉴, 올리기 대화상자, 저장 공간.               |
| `Upload`  | 끌어다 놓는 영역, 올리는 파일의 진행과 완료, 실패와 다시 올리기, 볼 수 있는 사람.                     |

- **쓰인 컴포넌트.** Breadcrumb, Button, IconButton, ToggleGroup, IconToggle, Item, Card, Avatar, Empty, Progress, FileField, TextField, Select, Field, Dialog, Menu, Badge, toast
- **알아둘 것.**
  - 격자의 파일 아이콘은 `Avatar shape="square"` 에 아이콘을 넣은 것이고, 목록과 폴더의 아이콘은 `Item.Media variant="soft"` 타일입니다.
  - 파일 메뉴는 렌더 안의 함수 하나로 만들어 격자와 목록에 함께 씁니다.
  - 보기 전환은 `IconToggle` 두 개를 담은 한 개만 고르는 `ToggleGroup` 입니다.
  - 올리는 중인 파일은 `Item.Content` 에 `Progress` 를 함께 둡니다. 진행 값은 정해 둔 숫자입니다.
  - 파일이 우클릭 메뉴(`Menu triggerType="contextmenu"`)를 가지면 안에 다른 Menu 를 둘 수 없습니다. 여기서는 더 보기 버튼의 메뉴만 둡니다.
