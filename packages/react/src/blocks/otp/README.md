# OTP

Storybook `Blocks/OTP/*`. 인증 코드를 받는 화면 세 가지입니다.

| 구현        | 화면                                                                                   |
| ----------- | -------------------------------------------------------------------------------------- |
| `Email`     | 메일로 받은 6자리 코드. 다 채우면 바로 확인하고, 코드를 다시 보낼 수 있다.                 |
| `Phone`     | 휴대폰 번호로 인증번호를 받은 뒤에 코드 칸이 나타난다.                                    |
| `TwoFactor` | 탭으로 인증 앱의 6자리 코드와 8자리 복구 코드를 오간다. 이 기기를 30일 동안 기억할 수 있다. |

- **쓰인 컴포넌트.** Card, Field, OTPField, TelField, Tabs, Checkbox, Label, Alert, Button, Spinner, toast
- **알아둘 것.**
  - 코드 칸은 `OTPField.Group` 두 개와 `OTPField.Separator` 로 3-3, 4-4 로 나눕니다. 입력은 여전히 input 하나라 붙여넣기와 SMS 자동 완성이 그대로 됩니다.
  - 복구 코드는 `pattern="alphanumeric"` 으로 영문과 숫자를 받습니다.
  - `Button` 에는 `loading` 이 없어 `Spinner` 와 문구를 직접 바꿉니다.
