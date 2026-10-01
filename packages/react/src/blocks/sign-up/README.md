# SignUp

Storybook `Blocks/SignUp/*`. 회원가입 화면 세 가지입니다.

| 구현    | 화면                                                                                         |
| ------- | -------------------------------------------------------------------------------------------- |
| `Card`  | 카드 하나에 이름, 학번, GIST 메일, 비밀번호, 약관 동의. 필수 약관에 동의해야 가입 버튼이 켜진다. |
| `Split` | 왼쪽은 가입하면 좋은 점과 후기, 오른쪽은 폼. `lg` 보다 좁으면 폼만 남는다.                     |
| `Steps` | `Stepper` 로 계정, 프로필, 동의 세 단계를 나눈다. 단계마다 폼이 따로라 브라우저 검증이 그 단계만 본다. |

- **쓰인 컴포넌트.** Card, Stepper, Field, TextField, PasswordField, Select, CheckboxGroup, Checkbox, Switch, Label, Badge, Button, Divider, Empty, Item, Avatar, toast
- **알아둘 것.**
  - 메일 주소의 `@gm.gist.ac.kr` 은 `TextField.Input` 뒤에 둔 글자라 입력 칸 끝에 흐리게 붙습니다.
  - 약관은 `CheckboxGroup` 의 `All` 이 전체 동의를 맡습니다. 일부만 고르면 대시로 바뀝니다.
  - Steps 의 각 단계는 `Card asChild` 로 그린 `<form>` 입니다. 지난 단계는 `Stepper.Content` 가 숨긴 채 DOM 에 두어 이전으로 돌아가도 값이 남습니다.
  - Steps 의 단계 설명은 `sm` 보다 좁으면 숨깁니다. 세 단계가 한 줄에 들어갈 자리가 없습니다.
