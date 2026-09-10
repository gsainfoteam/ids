# Badge

```tsx
import { Badge } from '@gsainfoteam/ids-react';

<Badge content={unread}>
  <BellIcon className="size-7" />
</Badge>;
```

다른 element의 모서리에 붙는 카운트나 상태 점이다. 글 흐름 안에 놓이는 라벨과 태그는
`Chip`을 쓴다.

**위치는 Badge가 잡는다.** 부모에 `relative`를 주거나 `absolute`를 넘길 필요가 없다.
Badge가 children을 감싸는 컨테이너를 만들고 그 안에서 모서리를 찾아간다.

`placement`는 `top-right`(기본) `top-left` `bottom-right` `bottom-left`.

## shape

동그란 대상에 붙일 때는 `shape="circular"`를 준다. 사각형 기준으로 모서리를 잡으면 원의
바깥 허공에 뜨기 때문에, 원의 실제 가장자리로 안쪽으로 당긴다.

```tsx
<Badge content={3} shape="circular">
  <Avatar name="Alice Kim" />
</Badge>
```

## 카운트

`content`가 숫자면 `max`(기본 `99`)를 넘을 때 `99+`로 줄인다. `0`은 기본적으로 숨기고,
`showZero`를 주면 보인다.

숫자 대신 아무 `ReactNode`나 넣어도 된다.

## dot

`dot`을 주면 내용 없는 작은 점만 그린다. 온라인 표시 같은 곳에 쓴다. 점은 글자가 없어서
읽을 것이 없으므로 기본적으로 `aria-hidden`이다. 의미가 있으면 `aria-label`을 준다.

```tsx
<Badge dot colorScheme="success" shape="circular" placement="bottom-right" aria-label="온라인">
  <Avatar name="Alice Kim" />
</Badge>
```

`aria-label`을 주면 `role="status"`가 붙어 값이 바뀔 때 읽힌다. 숫자 카운트도 마찬가지로
`aria-label="읽지 않은 알림 3개"`처럼 문장으로 주는 편이 낫다 — 숫자만 읽으면 무엇의
숫자인지 알 수 없다.

`colorScheme`은 `danger`(기본) `neutral` `primary` `success` `warning` `info`,
`size`는 `standard`(기본) `tiny`.
