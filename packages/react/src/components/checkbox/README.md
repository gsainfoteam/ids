# Checkbox

```tsx
import { Checkbox, Label } from '@gsainfoteam/ids-react';

<Label className="inline-flex items-center gap-2">
  <Checkbox checked={agreed} onChange={setAgreed} />
  약관에 동의합니다
</Label>;
```

단일 boolean을 다루는 체크박스다. 즉시 반영되는 시스템 설정은 `Switch`가 더 맞다.

**라벨을 내장하지 않는다.** `Label`로 감싸거나 `htmlFor`로 연결한다. HTML 표준 동작
그대로다.

`variant`는 `outline`(기본) `filled`, `size`는 `standard`(기본) `tiny`.

## 상태

`checked`(controlled) / `defaultChecked`(uncontrolled) / `onChange`. `onChange`는 이벤트가
아니라 `(checked: boolean, event)`를 받는다 — `event.target.checked`를 매번 꺼내지 않아도
된다. 둘을 같이 주면 `IdsError`를 던진다.

`indeterminate`는 "일부 선택됨"이다. 부모-자식 선택에서 쓴다.

```tsx
<Checkbox checked={all} indeterminate={some && !all} onChange={toggleAll} />
```

native `<input type="checkbox">` 위에 세워져 있어서 `aria-checked="mixed"`, `name`, `value`,
폼 제출이 전부 브라우저 기본 동작을 그대로 쓴다. `indeterminate`는 HTML에서 속성이 아니라
DOM 프로퍼티라 내부에서 ref로 설정하고, 스타일은 `:indeterminate` 의사 클래스로 건다.

`invalid`는 `aria-invalid`와 danger 색을 붙인다.

## 표시자

기본 표시자는 체크(`CheckIcon`)와 대시(`MinusIcon`)다. 바꾸려면 `Checkbox.Indicator`에
직접 넣는다.

```tsx
<Checkbox defaultChecked>
  <Checkbox.Indicator>
    <HeartIcon />
  </Checkbox.Indicator>
</Checkbox>
```

`disabled`이면 박스와 표시자가 함께 흐려진다. 배경만 흐려지면 그 위 흰 체크가 대비를
잃는다.
