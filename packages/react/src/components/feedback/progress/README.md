# Progress

진행률을 아는 작업의 진행 상태를 막대로 보여 줍니다. 원으로 그리려면 `CircularProgress` 를, 진행률을 모르는 짧은 대기는 `Spinner` 를 씁니다.

- **이름과 값이 자동으로 연결됩니다.** `Progress.Label` 이 progressbar의 이름이 되고, `aria-valuenow` / `aria-valuemax` / `aria-valuetext` 가 붙습니다.
- **화면과 스크린 리더가 같은 말을 합니다.** `getValueLabel` 로 만든 문장이 `aria-valuetext` 와 `Progress.Value` 의 기본 내용에 함께 쓰입니다.
- **범위를 벗어나도 멈추지 않습니다.** 업로드 바이트가 전체를 넘거나 음수가 들어와도 0과 `max` 사이로 맞춥니다. 오류를 던지지 않고 개발 모드에서 경고만 합니다.
- **100%는 끝났을 때만.** 백분율은 내림이라 99.6%는 99%로 보입니다.
- **부드럽고 가볍게.** 값이 바뀌면 막대가 폭을 다시 계산하지 않고 미끄러집니다. `prefers-reduced-motion` 이면 움직이지 않습니다.
- **오른쪽에서 왼쪽으로.** `dir="rtl"` 에서는 막대가 오른쪽부터 차고 무한 애니메이션도 반대로 흐릅니다.

```tsx
import { Progress } from '@gsainfoteam/ids-react';

<Progress value={65}>
  <Progress.Label>업로드 중</Progress.Label>
  <Progress.Value />
</Progress>;
```

## 값

```tsx
<Progress value={65} />                       // 0~100
<Progress value={uploaded} max={total} />     // max 기본 100
<Progress />                                  // value가 없으면 진행률 없이 움직인다
<Progress value={null} />                     // null 도 진행률 없이. 알 수 없게 된 진행을 이렇게 넘긴다
```

- 값이 `max` 에 닿으면 `complete` 상태가 됩니다. 색은 저절로 바뀌지 않으니 `colorScheme` 을 직접 넘깁니다.
- `max` 가 0 이하이거나 값이 숫자가 아니면 진행률 없이 그립니다.

## 값 문장

```tsx
<Progress
  value={uploaded}
  max={total}
  getValueLabel={(value, max) => `${formatBytes(value)} / ${formatBytes(max)}`}
>
  <Progress.Label>{file.name}</Progress.Label>
  <Progress.Value />          {/* "2.3 MB / 8.0 MB", aria-valuetext도 같은 문장 */}
</Progress>

<Progress.Value>{(state) => `${state.value} / ${state.max} 항목`}</Progress.Value>
```

- `getValueLabel` 이 없으면 백분율(`65%`)입니다.
- `Progress.Value` 는 `aria-hidden` 입니다. 값은 progressbar가 이미 알립니다.

## 구조

```tsx
<Progress value={30}>
  <Progress.Label>프로필 완성도</Progress.Label>   {/* Track 앞: 막대 위 */}
  <Progress.Track />
  <Progress.Value />                            {/* Track 뒤: 막대 아래 */}
</Progress>

```

- Track과 Indicator는 생략하면 기본 모양이 들어갑니다. Track이 없으면 다른 자식은 모두 막대 위에 놓입니다.
- `Progress.Label`, `Progress.Value`, `Progress.Indicator` 는 `asChild` 로 다른 요소를 그릴 수 있습니다.
- 막대의 두께와 채움 색을 바꾸는 것은 IDS 밖의 새 디자인입니다. 그때만 Track 과 Indicator 에 `className` 을 줍니다.

```tsx custom-design
<Progress value={72} aria-label="진행률">
  <Progress.Track className="h-3">
    <Progress.Indicator className="bg-linear-to-r from-info to-success" />
  </Progress.Track>
</Progress>
```

## 크기와 색

```tsx
<Progress size="tiny" />            // standard(8px 막대) / tiny(4px)
<Progress colorScheme="success" />  // primary(기본) / neutral / info / success / warning / danger
```

## 상태

앱은 상태를 런타임 값으로 읽습니다. DOM 의 `data-*` 속성은 IDS 내부 스타일용이라 문서에 두지 않고 지키겠다고 약속하지도 않습니다.

- 값은 앱이 넘긴 `value`, `max` 입니다. `size`, `colorScheme` 도 넘긴 값입니다.
- `Progress.Value` 의 `children` 은 아래 `Progress.State` 를 받는 함수가 될 수 있습니다.

| 상태                             | 뜻                                         |
| -------------------------------- | ------------------------------------------ |
| `value`                          | 0~`max` 로 맞춘 값. 진행률이 없으면 `null` |
| `max`                            | 쓰인 `max`                                 |
| `percent`                        | 0~100. 진행률이 없으면 `null`              |
| `valueLabel`                     | 값 문장. `aria-valuetext` 와 같다          |
| `indeterminate`                  | 진행률 없이 그린다(`value` 가 `null`)      |
| `complete`                       | 값이 `max` 에 닿았다                       |
| `size` / `colorScheme`           | 넘긴 값                                    |

- 새 디자인(`custom-design`)에서만 루트와 파트의 `className` 에 `Progress.State` 를 받는 함수를 줍니다. 루트는 `style` 도 같습니다.

```tsx custom-design
<Progress value={value} className={(state) => (state.complete ? 'opacity-60' : undefined)} />
```

## 속성

| 속성                                         | 기본 / 동작                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `value`                                      | 진행 값. 없거나 `null` 이면 진행률 없이 그린다                          |
| `max`                                        | `100`                                                                   |
| `size`                                       | `standard`(기본) / `tiny`                                               |
| `colorScheme`                                | `primary`(기본) / `neutral` / `info` / `success` / `warning` / `danger` |
| `getValueLabel`                              | `(value, max) => string`. 값 문장                                       |
| `aria-label` / `aria-labelledby`             | progressbar의 이름. `Progress.Label` 보다 우선                          |
| `id` / `aria-describedby` / `aria-valuetext` | progressbar로 간다                                                      |
| `className` / `style`                        | 루트로 간다. 새 디자인에서만 쓴다                                       |

## 알아둘 것

- `role="progressbar"` 는 루트가 아니라 트랙에 붙습니다. `id` 와 `aria-*` 도 트랙으로 갑니다.
- 이름이 없으면(`Progress.Label` 도 `aria-label` 도 없으면) 개발 모드에서 경고가 나옵니다.
