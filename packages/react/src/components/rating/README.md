# Rating

아이콘 개수로 점수를 고르거나 보여주는 컨트롤. 값은 `number`다.

```tsx
import { Rating } from '@gsainfoteam/ids-react';

const [score, setScore] = useState(0);

<Rating aria-label="만족도" value={score} onChange={setScore} />;
```

## 반 점과 표시 전용

```tsx
<Rating step={0.5} defaultValue={3.5} aria-label="만족도" /> // 아이콘 왼쪽 절반 = .5점, 오른쪽 = 1점
<Rating max={10} aria-label="추천 지수" />                   // max는 양의 정수, 기본 5
<Rating value={4.5} step={0.5} selectionMode="none" aria-label="평균 평점" />
// selectionMode="none": "평균 평점: 5점 만점에 4.5점"으로 읽히는 이미지. 탭 정지점이 없다
// 값은 0..max 범위에서 가장 가까운 step으로 맞춘다
```

## 아이콘

```tsx
<Rating variant="star" />   // 기본
<Rating variant="heart" />
<Rating variant="circle" />

<Rating variant="custom" max={3} aria-label="난이도">
  {[0, 1, 2].map((index) => (
    <Rating.Item key={index} index={index}>
      <FireIcon />                     {/* index마다 하나씩, 0부터 max - 1까지 */}
    </Rating.Item>
  ))}
</Rating>

<Rating variant="custom" max={1} aria-label="좋아요">
  <Rating.Item index={0} asChild>
    <MyIcon />                         {/* 장식 요소 하나. aria-hidden이 붙는다 */}
  </Rating.Item>
</Rating>

<Rating className="[--ids-rating-color:var(--ids-color-danger)]" /> {/* 채운 색, 기본 primary */}
```

## 키보드와 포인터

```text
← →               step만큼 이동 (RTL에서는 반대)
↑ ↓               step만큼 증가 / 감소
Home  0           0점
End               max
1-9               해당 점수
Space  Enter      포커스된 값 선택
마우스 hover       onHover로 미리보기만. 값은 클릭해야 바뀐다
터치              바로 선택
```

## 라벨 지역화

```tsx
<Rating getValueLabel={(value, max) => `${value} of ${max} stars`} />
// 각 선택지의 접근성 이름. 기본 "5점 만점에 3점"
```

## React Hook Form

```tsx
import { Rating } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const methods = useForm({ defaultValues: { score: 0 } });

<FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(save)}>
    <Field
      name="score"
      controlMode="value"
      registerOptions={{ min: { value: 1, message: '평점을 선택하세요.' } }}
    >
      <Field.Label>만족도</Field.Label>
      <Rating step={0.5} />
      <Field.Error />                  {/* 오류 시 선택된 버튼으로 포커스 */}
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                       | 기본 / 동작                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `value` / `defaultValue`   | `number` / `0`                                               |
| `onChange`                 | 값이 실제로 바뀔 때만                                        |
| `onHover`                  | 마우스 미리보기 값, 벗어나면 `null`                          |
| `max` / `step`             | `5` / `1`. `step`은 `1` 또는 `0.5`                           |
| `variant`                  | `star`(기본) / `heart` / `circle` / `custom`                 |
| `size`                     | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`          |
| `selectionMode`            | `single`(기본) / `none`: 표시 전용                           |
| `readOnly`                 | 변경만 막는다. 탭 정지점은 남아 점수를 읽을 수 있다          |
| `disabled`                 | 조작, 탭 이동, 폼 제출에서 모두 빠진다                       |
| `invalid`                  | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선          |
| `getValueLabel`            | `(value, max) => string`. 기본 `${max}점 만점에 ${value}점`  |
| `name` / `form`            | hidden input으로 값 제출                                     |
| `required`                 | ARIA 힌트만. 검증은 RHF나 앱이 한다                          |
| `ref`                      | 현재 선택된 버튼 (0점 포함)                                  |
| `className` / `style` 등   | 그룹 컨테이너로 간다                                         |

## 알아둘 것

- 탭 정지점은 선택된 값 하나다. 0점일 때는 그룹 전체에 포커스 링이 보인다.
- 키보드 이동은 경계에서 멈추고 순환하지 않는다.
- 외부에서 `value`를 바꿔도 `onChange`는 발생하지 않는다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로 되돌린다. 취소된 reset은 무시한다.
- 아이콘 그래픽은 빈 레이어와 채운 레이어에 두 번 렌더링되고 `inert`다. 이벤트 핸들러, `id`, 폼 컨트롤을 넣지 않는다.
- 값이 0..max 밖이면 개발 빌드에서 경고한다.
