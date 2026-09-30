# 스터디룸 예약

Storybook `Patterns/PC/Booking` 와 `Patterns/Mobile/Booking`. 날짜, 방, 시작 시간을 골라 예약하는 화면입니다.

- **쓰인 컴포넌트.** Calendar, RadioGroup, ToggleGroup, Toggle, Select, NumberField, Card, Badge, Alert, toast
- **폭에 따라.** `lg` 부터 예약 내용 카드가 오른쪽에 붙고 스크롤해도 따라옵니다(`sticky`).
- **알아둘 것.**
  - `Calendar` 의 `min`, `max`, `disabled={{ dayOfWeek: [0, 6] }}` 로 고를 수 있는 날을 줄입니다.
  - 방 카드는 `Label` 전체가 라디오라서 어디를 눌러도 고르고, `has-data-[state=checked]:` 로 고른 카드를 꾸밉니다.
  - 예약된 시간은 `Toggle disabled` 입니다.
