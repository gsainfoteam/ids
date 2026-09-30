# 게시글과 댓글

Storybook `Patterns/PostDetail`. 사진 묶음, 첨부 파일, 태그, 좋아요, 댓글과 답글을 갖춘 게시글 화면입니다.

- **쓰인 컴포넌트.** Breadcrumb, Image.Group, Alert, Item.Group, Chip, Toggle, IconToggle, Menu, TextArea, Badge, Divider
- **폭에 따라.** 한 열이고 사진 묶음은 3열 격자입니다. 사진을 누르면 `Image.Viewer` 가 열립니다.
- **알아둘 것.**
  - 첨부 파일은 `download` 링크 행입니다.
  - 댓글 입력은 `TextArea` 의 아래 바에 글자 수와 등록 버튼을 둡니다.
