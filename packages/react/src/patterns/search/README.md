# 통합 검색

Storybook `Patterns/Search`. 검색어 강조, 종류와 기간 필터, 최근 검색어, 묶음별 결과를 갖춘 검색 화면입니다.

- **쓰인 컴포넌트.** TextField, Chip, CheckboxGroup, RadioGroup, Select, Drawer, Item.Group, Card, Badge, Empty
- **폭에 따라.** `lg` 부터 필터가 왼쪽에 붙습니다. 그보다 좁으면 "필터" 버튼이 아래 서랍을 엽니다.
- **알아둘 것.**
  - 검색어는 `<mark>` 에 `secondary` 바탕으로 강조합니다.
  - 필터 내용은 JSX 변수 하나로 두고 옆 칸과 서랍에서 함께 씁니다.
