# Login

Storybook `Blocks/Login/*`. 로그인 화면 네 가지입니다.

| 구현      | 화면                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| `Card`    | 가운데 카드 하나. GIST 계정 버튼, 이메일과 비밀번호, 로그인 상태 유지, 비밀번호 찾기, 회원가입. |
| `Minimal` | 카드 없이 로고와 이메일 하나. 로그인 링크를 메일로 보내고, 보낸 뒤에는 `Alert` 로 알린다.   |
| `QR`      | 카드 안의 탭으로 QR 코드 로그인과 비밀번호 로그인을 오간다.                               |
| `Split`   | 왼쪽은 폼, 오른쪽은 서비스를 미리 보여 주는 카드 묶음. `lg` 보다 좁으면 폼만 남는다.        |

- **쓰인 컴포넌트.** Card, Field, TextField, PasswordField, Checkbox, Label, Button, Spinner, Divider, Tabs, QRCode, Item, Avatar, Badge, Progress, Alert, toast
- **알아둘 것.**
  - `Button` 에는 `loading` 이 없어 `Spinner` 와 문구를 직접 바꿉니다.
  - `Field` 안에는 라벨과 컨트롤 하나만 둡니다. "비밀번호 찾기" 는 `Field` 밖의 버튼입니다.
  - 로고는 `Avatar shape="square"` 에 아이콘을 넣은 것입니다. 앱의 로고 이미지는 `src` 로 넣습니다.
  - Split 의 미리 보기는 실제 데이터가 아닌 그림이라 `aria-hidden` 입니다. 안에 누를 수 있는 것을 두지 않습니다.
  - QR 의 새 코드는 정해 둔 세 값을 돌아가며 씁니다. 앱에서는 서버가 내준 로그인 세션으로 바꿉니다.
