# TimePicker

- 시, 분, 초와 AM/PM 컬럼으로 시각을 고르는 독립 컴포넌트
- 값은 `Date | null`. 날짜는 두고 시각만 바꾼다
- `grid` / `wheel` 표시
- `precision`, `step`, `min` / `max`로 고를 수 있는 시각을 제한한다

```tsx
import { useState } from 'react';
import { TimePicker } from '@gsainfoteam/ids-react';

function Alarm() {
  const [time, setTime] = useState<Date | null>(null);
  return <TimePicker value={time} onChange={setTime} format="24h" step={15} />;
}
```

## 값

```tsx
<TimePicker value={new Date(2026, 8, 15, 9, 30)} onChange={setTime} />
// 10시를 고르면 onChange(2026-09-15 10:30). 날짜는 그대로, 시각만 바뀐다

<TimePicker value={null} onChange={setTime} />
// 빈 값이면 2000-01-01을 기준일로 쓴다. 고르기 전에는 아무것도 선택 표시하지 않는다

<TimePicker defaultValue={null} />   // value를 생략하면 uncontrolled
```

## 정밀도와 간격

```tsx
<TimePicker precision="hour" />                 // 시 컬럼만. step은 1만 허용
<TimePicker precision="minute" step={15} />     // 기본 precision. 분: 00 15 30 45
<TimePicker precision="second" step={10} />     // 초: 00 10 20 ... 분은 1 간격
// step은 가장 작은 단위에만 적용된다(1..60). 그보다 작은 단위와 밀리초는 0이 된다
```

## 제한

```tsx
<TimePicker min={new Date(0, 0, 1, 9, 0)} max={new Date(0, 0, 1, 18, 0)} />
// 날짜는 무시하고 로컬 시각만 비교한다. 양 끝 포함
// 자정을 넘는 범위(min > max)는 오류
// 시를 고르면 그 시간 안에서 가장 가까운 허용 시각이 선택된다
```

## 시간제와 locale

```tsx
<TimePicker locale="ko-KR" />       // 기본 시간제는 locale을 따른다(기본 en-US)
<TimePicker format="12h" />         // AM/PM(Period) 컬럼이 붙는다
<TimePicker format="24h" />
```

## Wheel

```tsx
<TimePicker variant="wheel" />
// 가운데로 스냅되는 스크롤 컬럼. 스크롤이 멈추면 가운데 값을 선택한다
// 키보드 이동이나 프로그램 스크롤만으로는 값이 바뀌지 않는다
```

## 합성

```tsx
<TimePicker format="12h" value={time} onChange={setTime}>
  <TimePicker.Header>시 / 분</TimePicker.Header>       {/* 스크린리더에서 숨긴 장식용 머리글 */}
  <TimePicker.Column unit="hour" aria-label="시" />    {/* 기본 이름 Hour/Minute/Second/AM/PM */}
  <TimePicker.Separator />                             {/* 기본 ":" */}
  <TimePicker.Column unit="minute" aria-label="분" />
  <TimePicker.Period aria-label="오전/오후" />          {/* 12h 전용 */}
</TimePicker>
// children을 주면 기본 컬럼 구성을 대체한다
// 같은 unit 중복, 12h가 아닌 Period, precision보다 작은 unit은 오류
// Column/Period에 children을 주면 option 내용과 접근성 구조를 직접 채워야 한다
```

## 속성

| 속성                    | 기본 / 동작                                          |
| ----------------------- | ---------------------------------------------------- |
| `value` / `defaultValue` | `Date \| null`. 생략하면 uncontrolled               |
| `onChange`              | `(value: Date) => void`. 사용자가 고를 때만 발생     |
| `precision`             | `minute`. `hour` / `minute` / `second`               |
| `step`                  | `1`. 가장 작은 단위의 간격, 1..60                    |
| `format`                | locale 시간제. `12h` / `24h`                         |
| `min` / `max`           | 로컬 시각 양 끝 포함, 날짜 무시                      |
| `locale`                | `en-US`. 숫자와 AM/PM 표기                           |
| `variant`               | `grid`(기본) / `wheel`                               |
| `selectionMode`         | `single`(기본) / `none`(탐색만)                      |
| `readOnly`              | 탐색만 허용                                          |
| `disabled`              | 조작과 Tab 진입을 막는다                             |
| `size`                  | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`  |
| `aria-label`            | `Time picker`                                        |
| 그 외 native 속성       | 루트 group으로 간다. Column의 속성은 listbox로 간다  |

## 알아둘 것

- 외부 `value`를 제한이나 간격에 맞춰 고치지 않는다.
- DST로 존재하지 않는 시각은 고를 수 없고, 두 번 있는 시각은 native `Date`의 이른 오프셋을 쓴다. 시간대 선택이나 변환은 없다.
- 키보드: 컬럼마다 Tab으로 들어간다. `ArrowUp`/`ArrowDown`, `Home`/`End`, `PageUp`/`PageDown`(5칸)은 이동만 하고 `Enter`/`Space`로 선택한다. `ArrowLeft`/`ArrowRight`는 옆 컬럼으로 옮긴다.
- `wheel`은 `scrollend`가 오지 않는 브라우저에서도 마지막 스크롤 150ms 뒤에 확정한다.
