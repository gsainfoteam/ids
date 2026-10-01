# PostDetail

Storybook `Blocks/PostDetail/*`. 게시글 화면 두 가지입니다.

| 구현      | 화면                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------- |
| `Article` | 커뮤니티 글. 글쓴이 상자, 본문, 첨부 파일, 태그, 좋아요, 댓글 입력과 답글이 달린 댓글 목록.        |
| `Notice`  | 공식 공지. 카드 하나에 머리, 본문, 일정 표, 주의 사항, 첨부 파일을 담고 이전 글과 다음 글을 잇는다. |

- **쓰인 컴포넌트.** Breadcrumb, Badge, Item, Avatar, IconToggle, IconButton, Toggle, Chip, Card, Table, Alert, TextArea, Button, Divider, toast
- **알아둘 것.**
  - 글쓴이 줄은 `Item variant="soft"` 상자입니다. 기본 Item 은 안쪽 여백이 있어 본문 가장자리와 어긋나니, 여백을 지우지 않고 상자로 만들어 맞춥니다.
  - 댓글 입력은 `TextArea.Input` 뒤에 둔 글자 수와 버튼이 입력 칸 아래 막대가 됩니다.
  - 댓글은 `Item` 이 아니라 배치 클래스로 짭니다. `Item.Description` 은 두 줄에서 잘려 긴 댓글에 맞지 않습니다.
  - 답글의 세로선은 `Divider orientation="vertical"` 입니다.
  - 공지는 `Card asChild` 로 `<article>` 을 그리고, `Card.Header` 와 `Card.Footer` 의 `border-b`, `border-t` 로 머리와 첨부를 나눕니다.
