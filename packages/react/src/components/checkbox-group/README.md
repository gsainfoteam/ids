# CheckboxGroup

```tsx
import { CheckboxGroup, Label } from '@gsainfoteam/ids-react';

type Skill = 'js' | 'ts' | 'py' | 'rs';

<CheckboxGroup<Skill> value={skills} onChange={setSkills} aria-label="관심 기술">
  {({ All, Item }) => (
    <>
      <Label className="inline-flex items-center gap-2">
        <All />
        전체 선택
      </Label>
      <Label className="inline-flex items-center gap-2">
        <Item value="js" />
        JavaScript
      </Label>
    </>
  )}
</CheckboxGroup>;
```

여러 개를 고르는 그룹이다. 값은 배열이다. 하나만 고르는 것은 `RadioGroup`, 단일 boolean은
`Checkbox` 단독.

## render children

자식은 함수이고 `Item`과 `All`을 받는다. `RadioGroup`과 같은 이유 — 제네릭 `T`를 합성 경계
너머로 전달해 `value` 오타를 컴파일 타임에 잡는다.

`Item`은 `checked`, `size`, `disabled`를 그룹에서 자동으로 받는다.

## All

`All`은 등록된 `Item` 전체를 기준으로 스스로 상태를 정한다. 전부 선택이면 checked, 일부만
선택이면 indeterminate, 누르면 전체 선택 또는 전체 해제다. `every` / `some`을 직접 짤 필요가
없다.

`All`이 무엇을 "전부"로 볼지는 **실제로 렌더된 `Item`들**이다. 자식이 함수라 렌더 전에는
목록을 알 수 없어서, 각 `Item`이 마운트될 때 자기 value를 그룹에 등록한다. 조건부로 숨긴
`Item`은 자동으로 계산에서 빠진다.

## 배치

`variant`는 `vertical`(기본) `horizontal` `grid`. `grid`일 때 `columns`로 열 수를 정한다.

`role="group"`이라 `aria-label`로 무슨 그룹인지 알려준다.

## 계획서와 다른 점

`value` 중복 검사는 넣지 않았다. 자식이 함수라 렌더 전에 목록을 알 수 없다.
