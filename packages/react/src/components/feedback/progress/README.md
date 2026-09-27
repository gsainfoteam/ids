# Progress

진행률을 아는 작업의 진행 상태를 막대나 원으로 보여 줍니다. 진행률을 모르는 짧은 대기는 `Spinner` 를 씁니다.

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
<Progress value={40} indeterminate />         // value가 있어도 진행률 없이
```

- 값이 `max` 에 닿으면 `data-complete` 가 붙습니다. 색은 저절로 바뀌지 않으니 `colorScheme` 을 직접 넘깁니다.
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

<Progress value={72} aria-label="진행률">
  <Progress.Track className="h-3">
    <Progress.Indicator className="bg-linear-to-r from-(--ids-color-info) to-(--ids-color-success)" />
  </Progress.Track>
</Progress>
```

- Track과 Indicator는 생략하면 기본 모양이 들어갑니다. Track이 없으면 다른 자식은 모두 막대 위에 놓입니다.
- `Progress.Label`, `Progress.Value`, `Progress.Indicator` 는 `asChild` 로 다른 요소를 그릴 수 있습니다.

## 원형

```tsx
<Progress shape="circular" value={65}>
  <Progress.Value />                     {/* 가운데 */}
</Progress>

<Progress shape="circular" value={40}>
  <ArrowDownTrayIcon />                  {/* 가운데 아이콘 */}
  <Progress.Label>다운로드 중</Progress.Label>   {/* 원 옆 */}
</Progress>
```

- `Progress.Label` 은 원 옆에, 나머지 자식은 원 가운데에 놓입니다.
- Track과 Indicator를 넘기면 원의 트랙과 호에 `className` 이 적용됩니다.
- `tiny`(24px)는 가운데에 글자가 들어가기 좁습니다. 아이콘이나 빈 원으로 씁니다.

## 크기와 색

```tsx
<Progress size="tiny" />            // standard(8px 막대, 40px 원) / tiny(4px, 24px)
<Progress colorScheme="success" />  // primary(기본) / neutral / info / success / warning / danger
```

## 상태

| 상태                             | 뜻                                         |
| -------------------------------- | ------------------------------------------ |
| `value`                          | 0~`max` 로 맞춘 값. 진행률이 없으면 `null` |
| `max`                            | 쓰인 `max`                                 |
| `percent`                        | 0~100. 진행률이 없으면 `null`              |
| `valueLabel`                     | 값 문장. `aria-valuetext` 와 같다          |
| `indeterminate`                  | 진행률 없이 그린다                         |
| `complete`                       | 값이 `max` 에 닿았다                       |
| `shape` / `size` / `colorScheme` | 넘긴 값                                    |

```tsx
<Progress value={value} className={(state) => (state.complete ? 'opacity-60' : undefined)} />
```

- 루트에 `data-progress`, `data-shape`, `data-size`, `data-indeterminate`, `data-complete` 가 붙습니다.
- 파트에는 `data-progress-label`, `data-progress-value`, `data-progress-track`, `data-progress-indicator` 가 붙습니다.

## 속성

| 속성                                         | 기본 / 동작                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `value`                                      | 진행 값. 없으면 진행률 없이 그린다                                      |
| `max`                                        | `100`                                                                   |
| `indeterminate`                              | `false`                                                                 |
| `shape`                                      | `linear`(기본) / `circular`                                             |
| `size`                                       | `standard`(기본) / `tiny`                                               |
| `colorScheme`                                | `primary`(기본) / `neutral` / `info` / `success` / `warning` / `danger` |
| `getValueLabel`                              | `(value, max) => string`. 값 문장                                       |
| `aria-label` / `aria-labelledby`             | progressbar의 이름. `Progress.Label` 보다 우선                          |
| `id` / `aria-describedby` / `aria-valuetext` | progressbar로 간다                                                      |
| `className` / `style`                        | 루트로 간다. 상태를 받는 함수도 된다                                    |

## 알아둘 것

- 막대형에서 `role="progressbar"` 는 루트가 아니라 트랙에 붙습니다. `id` 와 `aria-*` 도 트랙으로 갑니다.
- 이름이 없으면(`Progress.Label` 도 `aria-label` 도 없으면) 개발 모드에서 경고가 나옵니다.
