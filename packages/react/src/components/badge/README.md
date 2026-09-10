# Badge

```tsx
import { Badge } from '@gsainfoteam/ids-react';

<Badge>Beta</Badge>
<Badge variant="solid" colorScheme="danger">Failed</Badge>
<Badge size="tiny">3</Badge>
```

상태나 카테고리를 나타내는 작은 라벨이다. 정적 라벨부터 클릭, 토글, 삭제까지 prop으로
확장된다 — 시각이 같은 두 개념을 컴포넌트로 나누지 않는다.

`variant`는 `soft`(기본) `solid` `outline`, `colorScheme`은 `neutral`(기본) `primary`
`success` `warning` `danger` `info`, `size`는 `standard`(기본) `tiny`.

서브컴포넌트 `Badge.Icon` `Badge.Label` `Badge.Close`는 모두 선택이다. 텍스트만 넣으려면
`<Badge>Beta</Badge>`로 충분하다.

## 인터랙션

인터랙션 prop이 없으면 `role`도 `tabIndex`도 붙지 않는 정적 라벨이다. `onClick`이나
`onSelectedChange`를 주면 `role="button"` + `tabIndex={0}`으로 바뀌고 Enter/Space가 클릭으로
이어진다 — `role="button"`인 `span`은 브라우저가 키보드 활성화를 대신해주지 않는다.

토글은 `selected` + `onSelectedChange`(controlled) 또는 `defaultSelected`(uncontrolled)로
쓴다. 토글일 때만 `aria-pressed`가 붙는다. `selected`만 주고 `onSelectedChange`를 빠뜨리면
`IdsError`를 던진다 — 눌러도 바뀌지 않는 배지가 되기 때문이다.

```tsx
<Badge colorScheme="primary" selected={following} onSelectedChange={setFollowing}>
  Following
</Badge>
```

`Badge.Close`는 `onClose`와 `children`이 둘 다 필수고, 클릭을 부모 Badge로 전파하지 않는다.
`children`이 필수인 것은 IDS가 아이콘 세트를 들고 다니지 않기 때문이다 — `IconButton`이
`icon`을 요구하는 것과 같다. 실제 제거는 부모의 몫이다 — Badge가 스스로 unmount하지 않는다.

```tsx
<Badge>
  <Badge.Label>frontend</Badge.Label>
  <Badge.Close aria-label="frontend 삭제" onClose={() => removeTag('frontend')}>
    <XMarkIcon />
  </Badge.Close>
</Badge>
```

## 부착

알림 카운트처럼 다른 element 모서리에 붙일 때는 부모에 `relative`, Badge에 `absolute`를 준다.
Badge가 부착 위치를 직접 관리하지 않는다.

```tsx
<div className="relative inline-block">
  <BellIcon className="size-7" />
  <Badge colorScheme="danger" variant="solid" size="tiny" className="absolute top-0 right-0">
    3
  </Badge>
</div>
```
