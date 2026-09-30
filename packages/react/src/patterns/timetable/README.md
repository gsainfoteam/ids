# 시간표

Storybook `Patterns/Timetable`. 평일 격자 시간표와 수강 과목 목록입니다.

- **쓰인 컴포넌트.** IdsProvider, ToggleGroup, Toggle, Select, Card, Item.Group, Badge, Empty
- **폭에 따라.** `sm` 부터 주간 격자를 보여 줍니다. 그보다 좁으면 요일을 골라 그날 수업을 목록으로 봅니다.
- **알아둘 것.**
  - 과목마다 `IdsProvider color` 로 감싸 `secondary` 바탕과 `primary` 선으로 그립니다.
  - 격자 위치는 CSS grid 의 `gridRow`, `gridColumn` 을 `style` 로 줍니다. 클래스를 문자열로 조립하지 않습니다.
