# 운영 대시보드

Storybook `Patterns/Dashboard`. 상단 메뉴, 기간 전환, 지표 카드, 서비스별 방문 막대, 최근 활동, 신고 표를 갖춘 대시보드입니다.

- **쓰인 컴포넌트.** ToggleGroup, Card, Badge, Progress, Item.Group, DataTable, Select, TextField, Menu, IdsProvider
- **폭에 따라.** 지표 카드는 모바일 2열, `lg` 부터 4열입니다. 상단 메뉴는 `md` 부터 보이고, 그보다 좁으면 메뉴 버튼이 `Menu` 를 엽니다.
- **알아둘 것.**
  - 서비스별 막대는 서비스마다 `IdsProvider color` 로 감싸 각자의 테마 색을 씁니다. 막대는 `aria-hidden` 이고 숫자는 글자로 둡니다.
  - 신고 표는 `DataTable` 의 선택, 페이지, 빈 상태를 쓰고, 고른 행을 한 번에 처리합니다. 열 정의는 모듈 위 상수입니다.
  - 상단 메뉴의 현재 페이지는 `aria-current="page"` 에 `secondary` 배경을 깝니다.
