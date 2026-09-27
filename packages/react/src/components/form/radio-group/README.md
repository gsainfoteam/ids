# RadioGroup

```tsx
import { RadioGroup, Label } from '@gsainfoteam/ids-react';

type Plan = 'free' | 'pro' | 'team';

<RadioGroup<Plan> value={plan} onChange={setPlan} aria-label="구독 플랜">
  {({ Item }) => (
    <>
      <Label className="inline-flex items-center gap-2">
        <Item value="free" />
        무료
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Item value="pro" />
        Pro
      </Label>
    </>
  )}
</RadioGroup>;
```

여러 선택지 중 하나를 고르는 그룹이다. 다중 선택은 `CheckboxGroup`, 선택지가 많거나 공간이
좁으면 `Select`가 낫다.

## render children

자식은 노드가 아니라 **함수**다. `Item`을 인자로 받아 쓴다. 이렇게 하는 이유는 제네릭
`T`를 합성 경계 너머로 전달하기 위해서다 — `Item`이 `RadioGroup<Plan>` 안에서 만들어지므로
`value` prop이 `Plan`으로 좁혀지고, 오타는 컴파일 에러가 된다.

```tsx
<Item value="enterprise" /> // 'enterprise'는 Plan에 없다 -> 컴파일 에러
```

`Item`은 `name`, `checked`, `size`, `disabled`를 그룹에서 자동으로 받는다. 개별 항목만
비활성화하려면 `Item`에 `disabled`를 준다.

`variant`는 `vertical`(기본) `horizontal`, `size`는 `standard`(기본) `tiny`.

## 키보드와 접근성

컨테이너가 `role="radiogroup"`이므로 `aria-label`로 무슨 그룹인지 알려준다.

항목 사이 화살표 키 이동과 이동 즉시 선택은 구현하지 않았다 — 모든 `Item`이 같은 `name`을
공유하는 native radio라 브라우저가 이미 해준다. `name`을 주지 않으면 `useId`로 만든다.

## 계획서와 다른 점

`value` 중복 검사는 넣지 않았다. 자식이 함수라 렌더 전에 목록을 알 수 없고, 중복은 곧바로
눈에 보이는 오동작이라 진단의 값이 낮다.
