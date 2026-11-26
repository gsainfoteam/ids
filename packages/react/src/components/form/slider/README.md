# Slider

연속된 범위에서 숫자 하나, 또는 시작과 끝 두 값을 고르는 슬라이더입니다. 볼륨, 밝기, 가격 범위에 씁니다.

- **키보드.** 화살표는 가로 세로 상관없이 한 칸, `Shift` 와 `PageUp` `PageDown` 은 열 칸, `Home` `End` 는 끝으로 갑니다. 오른쪽에서 왼쪽 문서에서는 가로 화살표가 뒤집힙니다.
- **포인터.** 트랙 어디를 눌러도 가까운 thumb이 오고 그대로 끌 수 있습니다. 누른 자리가 thumb 가운데와 맞아서 잡을 때 튀지 않습니다. 가로 슬라이더 위에서 세로로 쓸면 페이지가 스크롤됩니다.
- **값을 두 번 알림.** 움직이는 동안은 `onValueChange`, 손을 떼거나 키를 놓으면 `onValueCommit` 이 한 번 불립니다. 저장이나 요청은 commit에 겁니다.
- **값 라벨.** 끄는 동안과 키보드 포커스가 있을 때 thumb 위에 `Slider.ValueLabel` 이 뜹니다.
- **모양은 값이 정합니다.** 처음 값이 숫자면 thumb 하나, `[start, end]` 면 둘입니다.
- **폼.** `name` 을 주면 thumb마다 값이 제출되고, reset은 `defaultValue` 로 되돌립니다. react-hook-form은 `controlMode="value"` 로 숫자 그대로 연결됩니다.

```tsx
import { Field, Slider } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>볼륨</Field.Label>
  <Slider value={volume} onValueChange={setVolume} />
</Field>;
```

## 값

```tsx
<Slider defaultValue={50} />                                   // 비제어, 값은 number
<Slider value={volume} onValueChange={setVolume} />           // 제어

<Slider
  value={price}                                                // [start, end] 면 범위
  onValueChange={setPrice}                                     // 끄는 동안 계속
  onValueCommit={search}                                       // 손을 뗄 때 한 번
/>
```

- `min`(0), `max`(100), `step`(1) 으로 범위와 간격을 정합니다. 키보드와 포인터로 고른 값은 `min` 에서 시작하는 `step` 격자에 맞춰집니다.
- 범위를 벗어나거나 순서가 뒤바뀐 값은 잘라서 그리고, 개발 빌드에서 경고합니다.
- 숫자인지 `[start, end]` 인지는 첫 렌더의 `value ?? defaultValue` 로 정하고 바뀌지 않습니다. 도중에 모양이 바뀌면 개발 빌드에서 경고하고 처음 모양에 맞춥니다(범위에 숫자 `n` 이 오면 `[n, n]`). 모양을 바꾸려면 `key` 를 바꿉니다.
- 값이 없으면 숫자 하나입니다. 처음 값 없이 범위로 쓰려면 `defaultValue={[min, max]}` 를 줍니다.
- `onValueChange` 와 `onValueCommit` 은 사용자가 바꿀 때만 불립니다. 폼 초기화는 알리지 않습니다.

## 범위

```tsx
const price = useSlider({ minStepsBetweenThumbs: 2 });

<Slider defaultValue={[20, 80]} slider={price} aria-label="가격">
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb index={0} aria-label="최저가" /> {/* 기본 '시작' */}
    <Slider.Thumb index={1} aria-label="최고가" /> {/* 기본 '끝' */}
  </Slider.Track>
</Slider>;
```

- 두 thumb은 교차하지 않고 `minStepsBetweenThumbs` 칸만큼 떨어져 있습니다. 시작 thumb의 `aria-valuemax` 는 끝 값, 끝 thumb의 `aria-valuemin` 은 시작 값이라 보조 기술도 같은 한계를 읽습니다.
- 두 thumb이 겹쳐 있으면 처음 끄는 방향으로 움직일 수 있는 thumb이 따라옵니다.

## 키보드

| 키                  | 동작                                        |
| ------------------- | ------------------------------------------- |
| `→` `↑`             | `step` 만큼 늘린다                          |
| `←` `↓`             | `step` 만큼 줄인다                          |
| `Shift` + 방향키    | `largeStep`(기본 `step × 10`) 만큼          |
| `PageUp` `PageDown` | `largeStep` 만큼                            |
| `Home` `End`        | `min` / `max`. 범위에서는 다른 thumb 앞까지 |
| RTL 가로 슬라이더   | `→` 가 줄이고 `←` 가 늘린다                 |

```tsx
const hue = useSlider({ largeStep: 45 });

<Slider max={360} slider={hue} aria-label="색상" />;
```

- 처리한 키는 페이지를 스크롤하지 않습니다.
- `onValueCommit` 은 키를 놓을 때, 또는 키를 누른 채 포커스가 떠날 때 한 번 불립니다.

## 눈금과 라벨

```tsx
const percent = useSlider({ formatLabel: (v) => `${v}%` }); // 값 라벨, 눈금 라벨, aria-valuetext

<Slider step={25} slider={percent}>
  <Slider.Marks>
    <Slider.Mark value={0} />                  {/* 라벨은 formatLabel(0) */}
    <Slider.Mark value={50}>절반</Slider.Mark>  {/* children 이 라벨 */}
    <Slider.Mark value={100} />
  </Slider.Marks>
</Slider>

<Slider max={10}>
  <Slider.Marks />                             {/* step 마다 눈금만 */}
</Slider>

<Slider.Thumb>{null}</Slider.Thumb>            // 값 라벨 없는 thumb
```

- 기본 thumb 은 `Slider.ValueLabel` 을 그립니다. 끄는 동안과 키보드 포커스가 있을 때 보입니다.
- `Slider.Thumb` 에 children 을 주면 값 라벨 대신 그것을 그립니다. `null` 이면 아무것도 그리지 않습니다.
- `Slider.Marks` 와 `Slider.Mark` 는 루트의 자식에 둡니다. `Slider.Track` 이 없으면 루트가 기본 트랙을 먼저 그립니다.
- 값 라벨과 눈금은 `aria-hidden` 입니다. 스크린 리더는 `aria-valuetext` 로 같은 문구를 읽습니다.

## 합성

```tsx
<Slider max={360}>
  <Slider.Track>
    <Slider.Thumb />                           {/* Range를 빼면 채워진 구간이 없다 */}
  </Slider.Track>
</Slider>

<Slider defaultValue={[20, 80]}>
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb index={0} />                 {/* range에서는 index로 두 thumb을 가른다 */}
    <Slider.Thumb index={1}>{(thumb) => <MyLabel value={thumb.thumbValue} />}</Slider.Thumb>
  </Slider.Track>
</Slider>
```

- 자식에 `Track` 이 없으면 기본 `Track` 을 먼저 그리고, 그 안에 `Range` 와 thumb이 들어갑니다. `Track` 만 두면 그 안이 기본으로 채워집니다.
- 모든 부분이 `asChild` 와 상태를 받는 `children` 을 받습니다.
- 트랙에 색상 띠를 깔고 thumb 을 고른 색으로 칠하는 예는 `PaintTheTrack` 스토리(`custom-design`)에 있습니다.

## 상태

앱은 상태를 런타임 값으로 읽습니다. DOM 의 `data-*` 속성은 IDS 내부 스타일용이라 문서에 두지 않고 지키겠다고 약속하지도 않습니다.

- 값은 `value` / `defaultValue` / `onValueChange`, 끌기를 마친 값은 `onValueCommit` 으로 읽습니다. `onValueCommit` 은 같은 값의 이벤트라 루트에 있습니다.
- 새 디자인(`custom-design`)에서만 각 부분의 `className`, `style` 에 `Slider.State`(`value`, `values`, `dragging`, `orientation`, `disabled`, `readOnly`, `invalid`)를 받는 함수를 줍니다. thumb 은 `Slider.ThumbState`(더해서 `index`, `thumbValue`, `thumbDragging`)를 받습니다.

## 폼

```tsx
<form>
  <Slider name="price" defaultValue={[10, 90]} /> {/* price=10, price=90 */}
  <button type="reset">초기화</button> {/* defaultValue로 돌아간다 */}
</form>
```

- 값은 hidden input으로 제출됩니다. `disabled` 면 제출되지 않고, `readOnly` 는 제출됩니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field
  name="volume"
  controlMode="value"
  registerOptions={{ min: { value: 30, message: '30 이상' } }}
>
  <Field.Label>알림 볼륨</Field.Label>
  <Slider />
  <Field.Error />
</Field>;
```

- `ref` 는 루트이고, `focus()` 는 첫 thumb으로 넘어갑니다. 오류가 났을 때의 포커스도 여기로 갑니다.

## 이름

```tsx
<Field><Field.Label>볼륨</Field.Label><Slider /></Field>      // 단일: 라벨이 thumb의 이름
<Slider defaultValue={[0, 100]} aria-label="가격" />           // 범위: 그룹 이름 + 각 Slider.Thumb 의 aria-label
```

## 크기와 방향

```tsx
<Slider size="tiny" />                        // standard(트랙 6px, thumb 16px) / tiny(4px, 14px). 생략하면 Field를 따른다
<div className="h-48">
  <Slider orientation="vertical" />           // 세로는 부모 높이를 채운다. 최소 176px
</div>
```

- **크기 계약: fill.** 블록으로 부모 너비를 채우고 바깥 여백이 없습니다. 너비와 자리는 감싸는 요소가 정합니다(`<div className="w-80">…</div>`). 세로 슬라이더는 부모 높이를 채웁니다.

## 속성

| 속성                     | 기본 / 동작                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `value` / `defaultValue` | `number`, 범위는 `[number, number]`. 처음 값이 모양을 정한다  |
| `onValueChange`          | 움직이는 동안                                                 |
| `onValueCommit`          | 손을 떼거나 키를 놓을 때                                      |
| `min` / `max` / `step`   | `0` / `100` / `1`                                             |
| `orientation`            | `horizontal`(기본) / `vertical`                               |
| `slider`                 | `useSlider()` 의 결과. 큰 걸음, thumb 간격, 라벨              |
| `disabled` / `readOnly`  | 조작을 막는다. 읽기 전용은 포커스를 받는다                    |
| `aria-invalid`           | 오류 표시. 생략하면 `Field` 의 `invalid`                      |
| `name` / `form`          | hidden input으로 제출                                         |
| `size`                   | `standard` / `tiny`                                           |
| `className` / `style`    | 루트로 간다. 새 디자인(`custom-design`)에서만 쓴다                          |
| `ref`                    | 루트. `focus()` 는 첫 thumb으로 넘어간다                      |

## useSlider

| 옵션                    | 기본 / 동작                                     |
| ----------------------- | ----------------------------------------------- |
| `largeStep`             | `step × 10`. `Shift` + 방향키, `PageUp` `PageDown` |
| `minStepsBetweenThumbs` | `0`. 범위의 두 thumb 사이에 둘 최소 칸 수        |
| `formatLabel`           | 값 라벨, 눈금 라벨, `aria-valuetext`             |

## 알아둘 것

- 루트는 `tabIndex={-1}` 이라 Tab 순서에는 없고, 포커스를 받으면 첫 thumb으로 넘깁니다. thumb만 Tab에 멈춥니다.
- 가로 슬라이더는 부모 너비를 채웁니다. 바깥 여백은 없습니다.
- `min >= max`, `step <= 0`, `largeStep <= 0` 은 오류가 납니다.
