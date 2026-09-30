# 로그인

Storybook `Patterns/Login`. 가운데 카드형(`Default`)과 왼쪽에 브랜드 영역을 둔 분할형(`Split`) 두 가지 로그인 화면입니다.

- **쓰인 컴포넌트.** Card, Field, TextField, PasswordField, Checkbox, Button, Spinner, Divider, toast
- **폭에 따라.** 분할형은 `lg` 부터 브랜드 영역이 보이고, 그보다 좁으면 폼만 남습니다.
- **알아둘 것.**
  - `Button` 에는 `loading` 이 없어 `Spinner` 와 문구를 직접 바꿉니다.
  - `Field` 안에는 라벨과 컨트롤만 둡니다. "비밀번호를 잊었나요?" 링크는 `Field` 밖에 둡니다.
  - 글 속 링크는 색만으로 구분되지 않게 늘 밑줄을 긋습니다(WCAG 1.4.1).
