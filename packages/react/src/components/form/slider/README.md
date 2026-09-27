# Slider

연속된 범위에서 숫자 하나, 또는 시작과 끝 두 값을 고르는 슬라이더입니다. 볼륨, 밝기, 가격 범위에 씁니다.

- **키보드.** 화살표는 가로 세로 상관없이 한 칸, `Shift` 와 `PageUp` `PageDown` 은 열 칸, `Home` `End` 는 끝으로 갑니다. 오른쪽에서 왼쪽 문서에서는 가로 화살표가 뒤집힙니다.
- **포인터.** 트랙 어디를 눌러도 가까운 thumb이 오고 그대로 끌 수 있습니다. 누른 자리가 thumb 가운데와 맞아서 잡을 때 튀지 않습니다. 가로 슬라이더 위에서 세로로 쓸면 페이지가 스크롤됩니다.
- **값을 두 번 알림.** 움직이는 동안은 `onValueChange`, 손을 떼거나 키를 놓으면 `onValueCommit` 이 한 번 불립니다. 저장이나 요청은 commit에 겁니다.
- **값 라벨.** 끄는 동안과 키보드 포커스가 있을 때 thumb 위에 값이 뜹니다.
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
  selectionMode="range"                                        // 값은 [start, end]
  value={price}
  onValueChange={setPrice}                                     // 끄는 동안 계속
  onValueCommit={search}                                       // 손을 뗄 때 한 번
/>
```

- `min`(0), `max`(100), `step`(1) 으로 범위와 간격을 정합니다. 키보드와 포인터로 고른 값은 `min` 에서 시작하는 `step` 격자에 맞춰집니다.
- 범위를 벗어나거나 순서가 뒤바뀐 값은 잘라서 그리고, 개발 빌드에서 경고합니다.
- `onValueChange` 와 `onValueCommit` 은 사용자가 바꿀 때만 불립니다. 폼 초기화는 알리지 않습니다.

## 범위

```tsx
<Slider
  selectionMode="range"
  defaultValue={[20, 80]}
  minStepsBetweenThumbs={2} // 두 thumb 사이를 두 칸 이상 벌린다
  thumbLabels={['최저가', '최고가']} // 각 thumb의 이름. 기본 '시작', '끝'
  aria-label="가격"
/>
```

- 두 thumb은 교차하지 않습니다. 시작 thumb의 `aria-valuemax` 는 끝 값, 끝 thumb의 `aria-valuemin` 은 시작 값이라 보조 기술도 같은 한계를 읽습니다.
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

- 처리한 키는 페이지를 스크롤하지 않습니다.
- `onValueCommit` 은 키를 놓을 때, 또는 키를 누른 채 포커스가 떠날 때 한 번 불립니다.

## 눈금과 라벨

```tsx
<Slider step={25} marks={[0, 25, 50, 75, 100]} formatLabel={(v) => `${v}%`} />  // 눈금과 라벨
<Slider max={10} marks />                                                          // step마다 눈금만
<Slider formatLabel={(v) => `₩${v.toLocaleString()}`} />                           // aria-valuetext도 바뀐다
<Slider valueLabel="always" />      // auto(기본): 끄는 동안과 키보드 포커스 / always / never
```

- 값 라벨과 눈금은 `aria-hidden` 입니다. 스크린 리더는 `aria-valuetext` 로 같은 문구를 읽습니다.

## 합성

```tsx
<Slider max={360}>
  <Slider.Track className="bg-[linear-gradient(to_right,red,yellow,lime,cyan,blue,magenta,red)]">
    {/* Range를 빼면 채워진 구간이 없다 */}
    <Slider.Thumb style={(thumb) => ({ backgroundColor: `hsl(${thumb.thumbValue} 90% 55%)` })} />
  </Slider.Track>
</Slider>

<Slider selectionMode="range">
  <Slider.Track>
    <Slider.Range />
    <Slider.Thumb index={0} />                 {/* range에서는 index로 두 thumb을 가른다 */}
    <Slider.Thumb index={1}>{(thumb) => <MyLabel value={thumb.thumbValue} />}</Slider.Thumb>
  </Slider.Track>
</Slider>
```

- 자식이 없으면 `Track` 안에 `Range` 와 thumb이 들어갑니다. `Track` 만 두면 그 안이 기본으로 채워집니다.
- 모든 부분이 `asChild`, 상태를 받는 `className` `style` `children` 을 받습니다.
- thumb 크기를 바꿀 때는 `[--slider-thumb:20px]` 처럼 변수도 맞춥니다. thumb 위치와 포인터 계산이 이 값을 씁니다.

## 상태와 스타일

| 속성               | 붙는 곳     | 뜻                               |
| ------------------ | ----------- | -------------------------------- |
| `data-orientation` | 루트, 트랙  | `horizontal` / `vertical`        |
| `data-dragging`    | 루트, thumb | 끄는 중                          |
| `data-disabled`    | 루트, thumb | 비활성                           |
| `data-readonly`    | 루트        | 읽기 전용                        |
| `data-invalid`     | 루트        | 오류. 채운 구간과 thumb이 danger |
| `data-index`       | thumb       | thumb 순서                       |

- `Slider.State` 는 `value`, `values`, `dragging`, `orientation`, `disabled`, `readOnly`, `invalid` 입니다. thumb은 `index`, `thumbValue`, `thumbDragging` 을 더 받습니다.

## 폼

```tsx
<form>
  <Slider name="price" selectionMode="range" defaultValue={[10, 90]} /> {/* price=10, price=90 */}
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
<Slider selectionMode="range" aria-label="가격" />             // 범위: 그룹 이름 + thumbLabels
```

## 크기와 방향

```tsx
<Slider size="tiny" />                        // standard(트랙 6px, thumb 16px) / tiny(4px, 14px). 생략하면 Field를 따른다
<div className="h-48">
  <Slider orientation="vertical" />           // 세로는 부모 높이를 채운다. 최소 176px
</div>
```

## 속성

| 속성                     | 기본 / 동작                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `selectionMode`          | `single`(기본) / `range`                                      |
| `value` / `defaultValue` | `number`, 범위는 `[number, number]`. 기본 `min`, `[min, max]` |
| `onValueChange`          | 움직이는 동안                                                 |
| `onValueCommit`          | 손을 떼거나 키를 놓을 때                                      |
| `min` / `max` / `step`   | `0` / `100` / `1`                                             |
| `largeStep`              | `step × 10`                                                   |
| `minStepsBetweenThumbs`  | `0`                                                           |
| `orientation`            | `horizontal`(기본) / `vertical`                               |
| `marks`                  | `true` 면 step마다 눈금, 배열이면 그 값에 눈금과 라벨         |
| `formatLabel`            | 값 라벨, 눈금 라벨, `aria-valuetext`                          |
| `valueLabel`             | `auto`(기본) / `always` / `never`                             |
| `thumbLabels`            | 범위 thumb의 이름. 기본 `['시작', '끝']`                      |
| `disabled` / `readOnly`  | 조작을 막는다. 읽기 전용은 포커스를 받는다                    |
| `invalid`                | 오류 표시. 명시한 `aria-invalid` 가 우선                      |
| `name` / `form`          | hidden input으로 제출                                         |
| `size`                   | `standard` / `tiny`                                           |
| `className` / `style`    | 루트로 간다. 상태를 받는 함수도 된다                          |
| `ref`                    | 루트. `focus()` 는 첫 thumb으로 넘어간다                      |

## 알아둘 것

- 루트는 `tabIndex={-1}` 이라 Tab 순서에는 없고, 포커스를 받으면 첫 thumb으로 넘깁니다. thumb만 Tab에 멈춥니다.
- 가로 슬라이더는 부모 너비를 채웁니다. 바깥 여백은 없습니다.
- `min >= max`, `step <= 0`, 모드와 맞지 않는 값의 모양은 오류가 납니다.
