# 게시판

Storybook `Patterns/PC/PostList` 와 `Patterns/Mobile/PostList`. 분류 탭, 검색, 정렬, 목록과 카드 보기, 페이지를 갖춘 게시판입니다.

- **쓰인 컴포넌트.** Tabs, TextField, Select, ToggleGroup, IconToggle, Item.Group, Card, Image, Badge, Empty, Pagination
- **폭에 따라.** 모바일에서는 검색창이 한 줄을 다 쓰고, 정렬과 보기 전환이 다음 줄에 옵니다. 카드 보기는 `sm` 부터 2열입니다.
- **알아둘 것.**
  - 행과 카드는 링크(`Item asChild`, `Card asChild`)라서 안에 버튼을 두지 않습니다.
  - 표지가 없는 글은 `Image.Fallback` 이 분류 아이콘을 그려 카드 높이를 맞춥니다.
  - 결과 수는 `aria-live="polite"` 로 알리고, 검색 결과가 없으면 `Empty` 가 검색어 지우기를 줍니다.
