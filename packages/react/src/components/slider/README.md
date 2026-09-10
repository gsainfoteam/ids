# Slider

```tsx
import { Slider } from '@gsainfoteam/ids-react';

<Slider value={volume} onChange={(next) => setVolume(next as number)} />

<Slider
  selectionMode="range"
  value={price}
  onChange={(next) => setPrice(next as [number, number])}
/>
```

연속된 숫자 값을 고른다. `selectionMode`가 `single`(기본)이면 값은 `number`,
`range`면 `[start, end]`다. 모드와 값의 모양이 어긋나면 `IdsError`를 던진다.

`min`(0) `max`(100) `step`(1)로 범위와 간격을 정한다. `min >= max`이거나 `step`이 0 이하면
`IdsError`를 던진다.

`orientation`은 `horizontal`(기본) `vertical`, `size`는 `standard`(기본) `tiny`.
vertical일 때는 바깥에서 높이를 준다.

## 키보드

thumb마다 `role="slider"`이고 각자 포커스를 받는다.

| 키 | 동작 |
| --- | --- |
| `←` `→` (vertical은 `↓` `↑`) | `step` 만큼 이동 |
| `Shift` + 방향키 | `largeStep`(기본 `step * 10`) 만큼 |
| `PageUp` `PageDown` | `largeStep` 만큼 |
| `Home` `End` | `min` / `max` |

## 포인터

트랙 아무 데나 누르면 **가까운 thumb**이 그 자리로 오고 곧바로 드래그가 시작된다. 포인터를
캡처하므로 트랙 밖으로 끌고 나가도 따라온다.

range 모드에서 두 thumb은 교차하지 않는다. 시작 thumb의 `aria-valuemax`는 끝 값이고, 끝
thumb의 `aria-valuemin`은 시작 값이라 보조 기술도 같은 한계를 읽는다.

## 눈금과 라벨

`marks`에 배열을 주면 그 값에, `true`를 주면 `step` 단위로 눈금이 생긴다.

`formatLabel`은 눈금 텍스트와 `aria-valuetext`에 함께 쓰인다. 숫자만 읽히면 단위를 알 수
없으므로 통화나 단위가 있으면 넣어준다.

```tsx
<Slider min={0} max={1000000} step={50000} formatLabel={(v) => `₩${v.toLocaleString()}`} />
```

## 계획서와 다른 점

`Slider.Track` / `Range` / `Thumb` / `Marks`를 공개 서브컴포넌트로 두지 않았다. 지금 바꿔
끼울 곳이 없어서 내부 슬롯으로 남겼다. ColorPicker가 gradient 트랙을 필요로 할 때 그때
열면 된다.
