# CircularProgress

진행률을 아는 작업의 진행 상태를 원으로 보여 줍니다. 막대로 그리려면 `Progress` 를, 진행률을 모르는 짧은 대기는 `Spinner` 를 씁니다.

- **Progress 와 값을 같이 셉니다.** `value`, `max`, `indeterminate`, `getValueLabel` 은 `Progress` 와 같은 내부 hook 으로 계산합니다. 범위를 벗어난 값은 0과 `max` 사이로 맞추고, 백분율은 내림입니다.
- **이름과 값이 자동으로 연결됩니다.** `CircularProgress.Label` 이 progressbar의 이름이 되고, `aria-valuenow` / `aria-valuemax` / `aria-valuetext` 가 붙습니다.
- **가운데와 옆.** `CircularProgress.Label` 은 원 옆에, 나머지 자식은 원 가운데에 놓입니다.
- **Spinner 와 같은 원.** 반지름과 선 굵기를 Spinner 와 같은 치수(`internal/arc`)에서 가져옵니다.
- **모션 줄이기.** `prefers-reduced-motion` 이면 호가 늘어나는 전환도, 진행률이 없을 때의 회전도 멈춥니다.

```tsx
import { CircularProgress } from '@gsainfoteam/ids-react';

<CircularProgress value={65} aria-label="업로드">
  <CircularProgress.Value />
</CircularProgress>;
```

## 값

```tsx
<CircularProgress value={65} />                    // 0~100
<CircularProgress value={uploaded} max={total} />  // max 기본 100
<CircularProgress />                               // value가 없으면 원의 1/4 이 돈다
<CircularProgress value={40} indeterminate />      // value가 있어도 진행률 없이
```

- 값이 `max` 에 닿으면 `data-complete` 가 붙습니다. 색은 저절로 바뀌지 않으니 `colorScheme` 을 직접 넘깁니다.
- `getValueLabel` 이 없으면 백분율(`65%`)입니다. 돌려준 문장은 `aria-valuetext` 와 `CircularProgress.Value` 에 함께 쓰입니다.

## 구조

```tsx
<CircularProgress value={40}>
  <ArrowDownTrayIcon />                                      {/* 가운데 */}
  <CircularProgress.Label>다운로드 중</CircularProgress.Label>   {/* 원 옆 */}
</CircularProgress>

<CircularProgress value={72} aria-label="진행률">
  <CircularProgress.Track strokeWidth="4" />
  <CircularProgress.Indicator strokeWidth="4" />
</CircularProgress>
```

- Track과 Indicator는 `<circle>` 을 그립니다. 생략하면 기본 원이 들어가고, 넘기면 `className` 과 `<circle>` 속성이 그 원에 적용됩니다.
- 가운데 아이콘은 원의 40% 크기가 됩니다.
- `tiny`(24px)는 가운데에 글자가 들어가기 좁습니다. 아이콘이나 빈 원으로 씁니다.
- `CircularProgress.Label`, `CircularProgress.Value` 는 `asChild` 로 다른 요소를 그릴 수 있습니다.

## 크기와 색

```tsx
<CircularProgress size="tiny" />            // standard(40px) / tiny(24px)
<CircularProgress colorScheme="success" />  // primary(기본) / secondary / tertiary / neutral / info / success / warning / danger
```

## 상태

`Progress.State` 와 같습니다: `value`, `max`, `percent`, `valueLabel`, `indeterminate`, `complete`, `size`, `colorScheme`.

```tsx
<CircularProgress value={value} className={(state) => (state.complete ? 'opacity-60' : undefined)} />
```

- 루트에 `data-circular-progress`, `data-size`, `data-indeterminate`, `data-complete` 가 붙습니다.
- 파트에는 `data-circular-progress-label`, `-value`, `-track`, `-indicator` 가 붙습니다.

## 속성

| 속성                                         | 기본 / 동작                                       |
| -------------------------------------------- | ------------------------------------------------- |
| `value`                                      | 진행 값. 없으면 진행률 없이 돈다                  |
| `max`                                        | `100`                                             |
| `indeterminate`                              | `false`                                           |
| `size`                                       | `standard`(기본) / `tiny`                         |
| `colorScheme`                                | `primary`(기본) 외 7가지                          |
| `getValueLabel`                              | `(value, max) => string`. 값 문장                 |
| `aria-label` / `aria-labelledby`             | progressbar의 이름. `CircularProgress.Label` 보다 우선 |
| `id` / `aria-describedby` / `aria-valuetext` | progressbar로 간다                                |
| `className` / `style`                        | 루트로 간다. 상태를 받는 함수도 된다              |

## 알아둘 것

- `role="progressbar"` 는 루트가 아니라 원과 가운데 내용을 감싼 요소에 붙습니다. `id` 와 `aria-*` 도 그 요소로 갑니다.
- 이름이 없으면(`CircularProgress.Label` 도 `aria-label` 도 없으면) 개발 모드에서 경고가 나옵니다.
- `Progress` 의 `shape="circular"` 를 대신합니다.
