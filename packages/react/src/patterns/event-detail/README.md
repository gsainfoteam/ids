# 행사 상세

Storybook `Patterns/PC/EventDetail` 와 `Patterns/Mobile/EventDetail`. 포스터, 순서, 자주 묻는 질문, 참석 여부, 참석자, 주최 정보를 갖춘 행사 화면입니다.

- **쓰인 컴포넌트.** Image, Stepper, Accordion, ToggleGroup, Toggle, AvatarGroup, Progress, Card, Badge
- **폭에 따라.** `lg` 부터 참가 신청 카드가 오른쪽에 붙고 따라옵니다.
- **알아둘 것.**
  - 행사 순서는 기록형 `Stepper`(`progress={false}`)입니다.
