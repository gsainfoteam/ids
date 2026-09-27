# Progress

```tsx
import { Progress } from '@gsainfoteam/ids-react';

<Progress value={65} aria-label="업로드 진행률" />

<Progress value={65}>
  <Progress.Label>업로드 중</Progress.Label>
  <Progress.Value />
</Progress>
```

진행률을 아는 작업의 상태를 표시한다. 진행률을 모르는 짧은 대기는 `Spinner`, 콘텐츠
자리표시는 `Skeleton`을 쓴다.

`shape`는 `linear`(기본) `circular`, `size`는 `standard`(기본) `tiny`,
`colorScheme`은 `primary`(기본) `success` `warning` `danger` `neutral`.

`Progress.Value`는 자식이 없으면 `{value}/{max}`를 백분율로 반올림해 표시한다. 바이트처럼
다른 단위로 보여주려면 자식을 직접 넣는다 — `aria-valuenow`는 원래 `value`를 그대로 쓴다.

```tsx
<Progress value={uploaded} max={total}>
  <Progress.Label>{file.name}</Progress.Label>
  <Progress.Value>
    {formatBytes(uploaded)} / {formatBytes(total)}
  </Progress.Value>
</Progress>
```

## indeterminate

`value`를 주지 않거나 `indeterminate`를 주면 진행률 없는 애니메이션이 된다. 이때
`aria-valuenow`는 붙지 않는다.

circular indeterminate는 `Spinner`와 같은 호(arc)를 쓰되 트랙이 보인다. 버튼 안에 들어가는
작은 대기 표시는 `Spinner`, 독립적으로 놓이는 것은 이쪽이다.

`prefers-reduced-motion`이면 linear는 흐름을 멈추고 흐린 전체 바로, circular는 회전을
멈춘다.

## 접근성

`role="progressbar"`와 `aria-valuemin` / `aria-valuemax` / `aria-valuenow`가 붙는다.
읽을 이름은 직접 준다 — `Progress.Label`을 쓰거나, 라벨이 없으면 `aria-label`을 넘긴다.

`value`가 음수이거나 `max`를 넘으면 `IdsError`를 던진다.

## 계획서와 다른 점

- `Progress.Track` / `Progress.Indicator`를 공개 서브컴포넌트로 두지 않았다. 지금 바꿔 끼울
  이유가 없어서 내부로 남겼다.
- `value === max`일 때 자동으로 success 색이 되지 않는다. 색이 저절로 바뀌는 것은 놀라운
  동작이라 `colorScheme`을 직접 넘기게 두었다.
