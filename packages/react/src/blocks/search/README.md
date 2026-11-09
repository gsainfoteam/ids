# Search

Storybook `Blocks/Search/*`. 검색 화면 두 가지입니다.

| 구현      | 화면                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| `Results` | 검색창, 결과 수, 종류 탭(글, 장소, 사람), 결과 목록, 추천 검색어 칩.                            |
| `Command` | 헤더의 찾기 버튼과 `Mod+K` 로 여는 명령 팔레트. 최근 검색, 바로 가기, 사람, 명령을 묶는다.       |

- **쓰인 컴포넌트.** TextField, Button, Tabs, Card, Item, Avatar, Chip, Empty, Highlight, Menu, Kbd, Skeleton, Divider, toast
- **알아둘 것.**
  - 결과 수 문장은 `aria-live="polite"` 라 다시 찾으면 스크린 리더가 새 수를 읽습니다.
  - 결과 종류마다 `Tabs.Content` 를 둡니다. 탭 이름의 수는 글자라 탭 이름에 함께 읽힙니다.
  - 결과의 제목과 설명은 `Highlight` 로 검색어를 칠합니다. 칠하는 규칙은 Select 검색과 같아 대소문자와 전각을 가리지 않습니다.
  - 명령 팔레트는 `Menu triggerType="command"` 입니다. 스토리에서는 `defaultOpen` 으로 열어 두고, 뒤의 페이지는 `Skeleton` 입니다.
  - 팔레트의 검색은 항목 글자로 거릅니다. 맞는 항목이 없는 묶음은 제목과 함께 숨습니다.
