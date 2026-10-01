# Checkout

Storybook `Blocks/Checkout/*`. 굿즈를 사는 화면 두 가지입니다.

| 구현      | 화면                                                                                         |
| --------- | -------------------------------------------------------------------------------------------- |
| `Cart`    | 담은 상품의 수량과 빼기, 주문 금액, 쿠폰, 무료 배송까지 남은 금액. 다 빼면 빈 장바구니가 된다.   |
| `Payment` | 받는 방법(학생회관, 택배), 받는 사람, 결제 수단, 주문 상품과 금액, 동의하고 결제하기.            |

- **쓰인 컴포넌트.** Card, Item, Avatar, NumberField, IconButton, TextField, TelField, RadioGroup, Checkbox, Label, Field, Button, Alert, Empty, Divider, toast
- **알아둘 것.**
  - 상품 사진 자리는 이름 첫 글자를 보이는 `Avatar shape="square"` 입니다. 앱에서는 `src` 로 사진을 넣습니다.
  - 금액 줄은 배치 클래스로 양 끝에 놓은 문단입니다. 키와 값을 보이는 DataList 컴포넌트가 아직 없습니다.
  - 받는 방법과 결제 수단은 `Item asChild` 로 그린 `<label>` 에 Radio 를 담은 카드입니다. 고른 카드에 `selected` 층이 깔립니다.
  - 쿠폰 적용 버튼은 `TextField.Input` 뒤에 둔 버튼이라 입력 칸 안쪽 끝에 붙습니다.
  - 택배를 고를 때만 주소 칸이 나타납니다.
