# 주문과 결제

Storybook `Patterns/PC/Checkout` 와 `Patterns/Mobile/Checkout`. 장바구니, 받는 방법, 결제 수단, 쿠폰, 합계를 갖춘 주문 화면입니다.

- **쓰인 컴포넌트.** Item.Group, NumberField, RadioGroup, TelField, TextField, Field, Checkbox, Card, Divider, toast
- **폭에 따라.** `lg` 부터 결제 금액 카드가 오른쪽에 붙고 따라옵니다.
- **알아둘 것.**
  - 합계는 `<dl>` 입니다. 구분선은 `<dl>` 안에 넣지 않고 합계 줄의 윗선으로 그립니다.
  - 택배를 고를 때만 주소 칸이 나타납니다.
