# 회원가입

Storybook `Patterns/PC/SignUp` 와 `Patterns/Mobile/SignUp`. 계정, 학생 인증, 약관의 세 단계로 나눈 회원가입입니다.

- **쓰인 컴포넌트.** Stepper, Field, TextField, PasswordField, Select, OTPField, Checkbox, Divider, Empty, toast
- **폭에 따라.** 카드 하나에 담기고, 학번과 학과는 `sm` 부터 한 줄에 놓입니다.
- **알아둘 것.**
  - 단계마다 `<form>` 을 두어 브라우저 기본 검증(`required`, `pattern`, `minLength`)이 다음 단계로 넘어가는 것을 막습니다.
  - `Stepper.Content` 는 지나간 단계를 숨긴 채 남겨 두어 입력값이 유지됩니다.
  - 약관의 "모두 동의" 는 `checked="indeterminate"` 로 일부 선택을 보여 줍니다.
