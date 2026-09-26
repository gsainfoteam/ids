# Radio

```tsx
import { Radio, Label } from '@gsainfoteam/ids-react';

<Label className="inline-flex items-center gap-2">
  <Radio name="plan" value="pro" />
  Pro
</Label>;
```

단일 선택지 하나를 나타낸다. 보통은 직접 쓰지 않고 `RadioGroup`이 주입하는 `Item`을 쓴다 —
그래야 `name` 공유, 선택 상태, 화살표 키 이동이 자동으로 붙는다.

**라벨을 내장하지 않는다.** `Label`로 감싸거나 `htmlFor`로 연결한다.

`size`는 `standard`(기본) `tiny`. `invalid`는 `aria-invalid`와 danger 색을 붙인다.

native `<input type="radio">` 위에 세워져 있어서 `name`이 같은 라디오끼리 그룹이 되고,
화살표 키 이동과 폼 제출이 브라우저 기본 동작 그대로다. `onChange`는
`(checked: boolean, event)`를 받는다.

안쪽 점은 아이콘이 아니라 원이다 — SVG보다 선명하고 크기에 맞춰 정확히 떨어진다.
`disabled`이면 테두리와 점이 함께 흐려진다.
