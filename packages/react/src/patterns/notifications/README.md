# 알림 센터

Storybook `Patterns/PC/Notifications` 와 `Patterns/Mobile/Notifications`. 전체, 멘션, 시스템 탭과 날짜별 묶음을 갖춘 알림 목록입니다.

- **쓰인 컴포넌트.** Tabs, Item.Group, Avatar, Badge, Menu, Button, Empty
- **폭에 따라.** 한 열입니다.
- **알아둘 것.**
  - 안 읽은 알림은 "새 알림" 배지와 `sr-only` 글자로 알립니다. 행 전체를 색으로 칠하지 않습니다.
  - 행을 누르면 읽음이 되고(`Item onClick`), 제목이 버튼이 됩니다.
