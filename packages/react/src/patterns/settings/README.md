# 설정

Storybook `Patterns/PC/Settings` 와 `Patterns/Mobile/Settings`. 프로필, 알림, 화면, 보안 네 탭으로 나눈 설정 화면입니다.

- **쓰인 컴포넌트.** Tabs, Card, Field, TextField, Select, TextArea, Switch, RadioGroup, ToggleGroup, IconToggle, Item.Group, Dialog, IdsProvider
- **폭에 따라.** 폼 격자는 `sm` 부터 2열이고 `items-start` 로 설명이 있는 칸과 윗줄을 맞춥니다.
- **알아둘 것.**
  - 화면 탭에서 고른 테마 색과 모드는 페이지를 감싼 `IdsProvider` 에 바로 들어가 화면 전체가 바뀝니다. 처음 값은 `useTheme()` 에서 읽습니다.
  - 계정 삭제는 `Dialog role="alertdialog"` 이고, 확인 글자를 입력해야 삭제 버튼이 켜집니다.
