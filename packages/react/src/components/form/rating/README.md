# Rating

별 같은 아이콘 개수로 점수를 고르거나 보여 주는 컨트롤입니다. 리뷰, 만족도 조사, 평균 평점에 씁니다. 연속된 값은 `Slider` 가 맞습니다.

- **반 점.** `step={0.5}` 면 아이콘의 앞쪽 절반이 .5점, 뒤쪽 절반이 1점입니다. 오른쪽에서 왼쪽 문서에서는 반쪽도 뒤집힙니다.
- **미리보기.** 마우스를 올리면 그 점수까지 반투명하게 채워 보여 주고 `onHover` 로 알립니다. 값은 눌러야 바뀌고 그때 불투명해집니다. 터치는 누르는 순간 고릅니다.
- **키보드.** 방향키는 한 칸씩, 숫자 키는 그 점수로, `Home` 과 `0` 은 0점으로, `End` 는 만점으로 갑니다. Tab은 고른 점수 하나에 멈춥니다.
- **모양은 합성.** `Rating.Item` 에 하트, 점, 얼굴처럼 원하는 아이콘을 넣습니다. 전부 같은 모양이어도, 자리마다 달라도 됩니다.
- **폼.** `name` 을 주면 점수가 제출되고, `required` 면 0점일 때 브라우저가 "점수를 선택하세요." 로 막습니다. react-hook-form은 `controlMode="value"` 로 연결됩니다.
- **표시 전용.** `selectionMode="none"` 은 "5점 만점에 4.5점" 으로 읽히는 그림입니다.

```tsx
import { Field, Rating } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>만족도</Field.Label>
  <Rating value={score} onValueChange={setScore} />
</Field>;
```

## 값

```tsx
<Rating defaultValue={3} />                                  // 비제어
<Rating value={score} onValueChange={setScore} />           // 제어
<Rating step={0.5} max={10} />                              // 반 점, 10점 만점. max는 양의 정수
```

- 값은 `0` 부터 `max` 까지이고 가장 가까운 `step` 으로 맞춥니다. 0점은 "고르지 않음" 입니다.
- `onValueChange` 는 값이 실제로 바뀔 때만 불립니다. 부모가 바꾼 값과 폼 초기화는 알리지 않습니다.
- 범위를 벗어난 값은 개발 빌드에서 경고합니다.

## 키보드와 포인터

| 입력            | 동작                                        |
| --------------- | ------------------------------------------- |
| `→` `↑`         | `step` 만큼 올린다. RTL에서는 `←` 가 올린다 |
| `←` `↓`         | `step` 만큼 내린다                          |
| `Home` `0`      | 0점                                         |
| `End`           | 만점                                        |
| `1` - `9`       | 그 점수                                     |
| `Space` `Enter` | 포커스된 점수를 고른다                      |
| 마우스 올리기   | 미리보기만. `onHover(score)`, 떠나면 `null` |
| 누르기, 터치    | 그 점수를 고른다                            |

- 키보드는 끝에서 멈추고 돌아가지 않습니다. 포커스는 새로 고른 점수를 따라갑니다.

## 모양

```tsx
<Rating>                                        {/* 기본은 별 */}
  <Rating.Item>                                 {/* index가 없으면 모든 자리에 */}
    <HeartIcon />
  </Rating.Item>
</Rating>

<Rating max={3}>
  <Rating.Item><FireIcon /></Rating.Item>        {/* 나머지 자리 */}
  <Rating.Item index={0}><FaceSmileIcon /></Rating.Item>   {/* 첫 자리만 */}
</Rating>

<Rating>
  <Rating.Item>
    <span className="block size-full rounded-full bg-current" />   {/* 점 */}
  </Rating.Item>
</Rating>

<Rating className="[--rating-accent:var(--ids-color-warning)]" />   {/* 채운 색. 기본 primary */}
```

- 아이콘은 빈 층과 채운 층에 두 번 그려지고, 채운 층을 잘라서 반 점을 표시합니다. `currentColor` 로 그리는 아이콘이면 됩니다.
- `Rating.Item` 의 `className`, `style`, `children` 은 자리 상태(`index`, `itemValue`, `fill`)를 받는 함수도 됩니다.
- 아이콘은 `aria-hidden` 이고 `inert` 입니다. 이벤트 핸들러, `id`, 폼 컨트롤을 넣지 않습니다.

## 상태와 스타일

| 속성              | 붙는 곳 | 뜻                                           |
| ----------------- | ------- | -------------------------------------------- |
| `data-state`      | 자리    | `full` / `half` / `empty`. 미리보기를 따른다 |
| `data-previewing` | 루트    | 마우스로 미리보는 중                         |
| `data-disabled`   | 루트    | 비활성                                       |
| `data-readonly`   | 루트    | 읽기 전용                                    |
| `data-required`   | 루트    | 필수                                         |
| `data-invalid`    | 루트    | 오류. 채운 색이 danger                       |

- `Rating.State` 는 `value`, `previewValue`, `interactive`, `disabled`, `readOnly`, `required`, `invalid` 입니다. 루트의 `className` 과 `style` 은 이 상태를 받는 함수도 됩니다.

## 폼

```tsx
<form>
  <Field required>
    <Field.Label>평점</Field.Label>
    <Rating name="score" /> {/* 4점이면 score=4, 0점이면 항목 없음 */}
  </Field>
  <button type="reset">초기화</button> {/* defaultValue로 돌아간다 */}
</form>
```

- `name` 이 없으면 hidden input을 만들지 않습니다.
- `required` 는 0점을 막습니다. 메시지는 `requiredMessage` 로 바꿉니다. 읽기 전용이면 검사하지 않고, 비활성이면 제출도 하지 않습니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field
  name="score"
  controlMode="value"
  registerOptions={{ min: { value: 1, message: '점수를 고르세요.' } }}
>
  <Field.Label>만족도</Field.Label>
  <Rating step={0.5} />
  <Field.Error />
</Field>;
```

- `ref` 와 `id` 는 그룹에 붙어 있고 옮겨 다니지 않습니다. `focus()` 는 고른 점수로 넘어가고, 오류가 났을 때의 포커스도 그렇습니다.

## 라벨

```tsx
<Rating aria-label="만족도" />                                  // 없으면 '평점'
<Rating getValueLabel={(value, max) => `${value} of ${max}`} />  // 각 점수의 이름. 기본 '5점 만점에 3점'
```

## 크기

```tsx
<Rating size="tiny" /> // standard(28px 아이콘) / tiny(22px). 줄 높이는 컨트롤 높이(36px / 32px). 생략하면 Field를 따른다
```

## 속성

| 속성                     | 기본 / 동작                                             |
| ------------------------ | ------------------------------------------------------- |
| `value` / `defaultValue` | `number` / `0`                                          |
| `onValueChange`          | 값이 실제로 바뀔 때                                     |
| `onHover`                | 마우스 미리보기 점수, 벗어나면 `null`                   |
| `max` / `step`           | `5` / `1`. `step` 은 `1` 또는 `0.5`                     |
| `selectionMode`          | `single`(기본) / `none`: 표시 전용                      |
| `readOnly`               | 바꿀 수 없다. 탭 정지점은 남아 점수를 읽을 수 있다      |
| `disabled`               | 조작, 탭 이동, 폼 제출에서 모두 빠진다                  |
| `required`               | 0점이면 제출을 막는다                                   |
| `requiredMessage`        | 기본 `점수를 선택하세요.`                               |
| `invalid`                | 오류 표시. 명시한 `aria-invalid` 가 우선                |
| `name` / `form`          | hidden input으로 제출                                   |
| `getValueLabel`          | `(value, max) => string`                                |
| `size`                   | `standard` / `tiny`                                     |
| `children`               | `Rating.Item` 들. 생략하면 별                           |
| `ref`                    | 그룹. `focus()` 는 고른 점수로 넘어간다                 |
| 그 외 속성               | 그룹으로 간다 (`id`, `aria-*`, `className`, `style` 등) |

## 알아둘 것

- 0점을 고를 수 있도록 화면에 보이지 않는 0점 항목이 있습니다. 여기에 포커스가 있으면 그룹 전체에 포커스 링이 그려집니다.
- 그룹 루트는 `tabIndex={-1}` 이라 Tab 순서에는 없습니다.
