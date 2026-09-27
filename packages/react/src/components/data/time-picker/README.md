# TimePicker

시, 분, 초와 오전/오후를 세로 목록에서 골라 시각을 정하는 컴포넌트입니다.

- **값은 `Date | null`.** 날짜는 두고 시각만 바꿉니다. 비어 있으면 `referenceDate`(기본 오늘)에 시각을 붙입니다.
- **date-fns locale 시간제.** date-fns 의 한국어와 독일어는 24시간제, 미국 영어는 12시간제에 오전/오후 컬럼이 기본입니다. `format` 으로 정할 수도 있습니다.
- **간격과 범위.** `step` 으로 분이나 초를 15분 단위처럼 끊고, `min` / `max` 밖의 시각은 고를 수 없습니다. 서머타임으로 없는 시각도 빠집니다.
- **키보드.** 방향키로 둘러보고 Enter로 고릅니다. 숫자를 치면 그 숫자로 가고, Delete로 비웁니다.
- **휠.** `variant="wheel"` 은 iOS처럼 가운데로 스냅되는 컬럼이고, 스크롤이 멈추면 가운데 값이 선택됩니다.

```tsx
import { TimePicker } from '@gsainfoteam/ids-react';

const [time, setTime] = useState<Date | null>(null);

<TimePicker value={time} onValueChange={setTime} step={15} />;
```

## 값

```tsx
<TimePicker value={new Date(2026, 8, 15, 9, 30)} onValueChange={setTime} />
// 10시를 고르면 2026-09-15 10:30. 날짜는 그대로

<TimePicker value={null} onValueChange={setTime} />
// 아무것도 선택 표시하지 않는다. 고르면 오늘 날짜에 그 시각

<TimePicker value={null} referenceDate={meetingDay} onValueChange={setTime} />
// 비어 있을 때 시각을 붙일 날
```

- `onValueChange` 는 값이 바뀔 때만 부릅니다. 이미 고른 시각을 다시 골라도 부르지 않습니다.
- 컬럼에서 `Delete` 나 `Backspace` 를 누르면 `null` 이 됩니다.
- 고를 때 정밀도보다 작은 단위와 밀리초는 0이 됩니다.

## 정밀도와 간격

```tsx
<TimePicker precision="hour" />                 // 시 컬럼만. step 은 1만 된다
<TimePicker precision="minute" step={15} />     // 기본 정밀도. 분: 00 15 30 45
<TimePicker precision="second" step={10} />     // 초: 00 10 20 ... 분은 1분 간격
```

- `step` 은 가장 작은 단위에만 걸립니다(1~60).

## 범위

```tsx
<TimePicker min={new Date(0, 0, 1, 9, 30)} max={new Date(0, 0, 1, 18)} step={15} />
// 날짜는 빼고 시각만 비교한다. 양 끝 포함. 자정을 넘는 범위(min > max)는 오류
```

- 시를 고르면 그 시간 안에서 가장 가까운 허용 시각으로 갑니다. 09:45 에서 10시를 고르면 `max` 가 10:15 일 때 10:15 입니다.
- 비어 있으면 허용 시각 중 자정에 가장 가까운 시각에서 둘러보기를 시작합니다. 값은 고를 때까지 비어 있습니다.

## 시간제와 locale

```tsx
import { de } from 'date-fns/locale';

<TimePicker />                        // ko-KR: 24시간제
<TimePicker format="12h" />           // 오전/오후 컬럼
<TimePicker locale="en-US" />         // 12시간제, AM/PM
<TimePicker locale={de} />            // date-fns Locale. 24시간제
```

- 시간제는 locale 의 짧은 시각 형식(date-fns `p`)에 오전/오후나 12시간 표기가 있는지로 정합니다.
- 오전/오후 이름은 date-fns locale 에서 가져옵니다(`오전`/`오후`, `AM`/`PM`). 컬럼 이름(`시`, `분`, `초`, `오전/오후`)은 IDS 메시지이고 `aria-label` 로 바꿉니다.
- 문자열 `locale` 은 `ko`, `ko-KR`, `en`, `en-US` 만 받습니다. 다른 언어는 date-fns `Locale` 을 넘깁니다.

## 키보드

| 키                     | 동작                                       |
| ---------------------- | ------------------------------------------ |
| `Tab`                  | 컬럼마다 한 번씩 들어간다                  |
| `↑` `↓`                | 한 칸 이동. 값은 바뀌지 않는다             |
| `PageUp` / `PageDown`  | 다섯 칸 이동                               |
| `Home` / `End`         | 처음 / 끝                                  |
| `Enter` / `Space`      | 선택                                       |
| 숫자                   | 그 숫자로 시작하는 옵션으로. `4` `5` 는 45 |
| `←` `→`                | 옆 컬럼. 오른쪽에서 왼쪽 문서에서는 반대   |
| `Delete` / `Backspace` | 값을 비운다                                |

## 휠

```tsx
<TimePicker variant="wheel" />
```

- 스크롤이 멈추면 가운데 값을 고릅니다. `scrollend` 가 없는 브라우저에서도 마지막 스크롤 150ms 뒤에 확정합니다.
- 키보드 이동이나 프로그램이 바꾼 스크롤로는 값이 바뀌지 않습니다.

## 합성

```tsx
<TimePicker format="12h" value={time} onValueChange={setTime}>
  <TimePicker.Header /> {/* 컬럼 이름. 스크린 리더에서는 숨긴다 */}
  <TimePicker.Period /> {/* 12시간제 전용. 앞에 둘 수도 있다 */}
  <TimePicker.Column unit="hour" />
  <TimePicker.Separator /> {/* 기본 ":" */}
  <TimePicker.Column unit="minute">
    {(option) => (option.value === 0 ? '정각' : `${option.label}분`)}
  </TimePicker.Column>
</TimePicker>
```

- `children` 을 주면 기본 컬럼 대신 그대로 그립니다. 같은 `unit` 두 번, 24시간제의 `Period`, 정밀도보다 작은 `unit` 은 오류입니다.
- `Column` 의 `children` 은 옵션 상태를 받는 함수입니다. 이름표만 바뀌고 선택과 키보드는 그대로입니다.
- `Column`, `Period`, `Header`, `Separator` 는 `asChild` 를 받습니다. 자식이 빈 요소면 옵션이나 기본 이름표가 그 안에 들어갑니다.

| `TimePicker.OptionState` | 뜻                                      |
| ------------------------ | --------------------------------------- |
| `unit`                   | `hour` / `minute` / `second` / `period` |
| `value`                  | 숫자. `period` 는 0(오전), 1(오후)      |
| `label`                  | 두 자리 숫자나 locale 의 오전/오후      |
| `selected`               | 현재 값                                 |
| `active`                 | 키보드가 가리키는 옵션                  |
| `disabled`               | 범위 밖                                 |

- 옵션에는 같은 상태가 `data-selected`, `data-active`, `data-disabled` 로 붙고, 컬럼에는 `data-time-column` 이 붙습니다.
- 루트에는 `data-format`, `data-variant`, `data-size`, `data-empty`, `data-disabled`, `data-readonly` 가 붙고, `className` 과 `style` 은 `TimePicker.State`(`value`, `format`, `precision`, `step`, `disabled`, `readOnly`)를 받는 함수도 됩니다.

## 속성

| 속성                                       | 기본 / 동작                                                 |
| ------------------------------------------ | ----------------------------------------------------------- |
| `value` / `defaultValue` / `onValueChange` | `Date \| null`. 기본 `null`                                 |
| `referenceDate`                            | 오늘. 비어 있을 때 시각을 붙일 날                           |
| `precision`                                | `minute`. `hour` / `minute` / `second`                      |
| `step`                                     | `1`. 가장 작은 단위의 간격                                  |
| `format`                                   | locale 시간제. `12h` / `24h`                                |
| `min` / `max`                              | 시각만 비교, 양 끝 포함                                     |
| `locale`                                   | `ko-KR`. 태그 또는 date-fns `Locale`                        |
| `variant`                                  | `grid`(기본) / `wheel`                                      |
| `selectionMode`                            | `single`(기본) / `none`(둘러보기만)                         |
| `readOnly`                                 | 둘러보기만                                                  |
| `disabled`                                 | 조작과 Tab 진입을 막는다                                    |
| `size`                                     | `standard`(옵션 36px) / `tiny`(32px). 생략하면 `Field` 크기 |
| `className` / `style`                      | 루트. 상태를 받는 함수도 된다                               |
| 그 외 native 속성                          | 루트 `div`(`role="group"`, 이름 `시간`)                     |

## 알아둘 것

- 바깥에서 준 `value` 를 범위나 간격에 맞춰 고치지 않습니다.
- 서머타임으로 없는 시각은 고를 수 없고, 두 번 있는 시각은 `Date` 의 이른 오프셋을 씁니다. 시간대 변환은 없습니다.
- 컬럼은 스크롤바를 숨깁니다. 마우스 휠, 트랙패드, 터치, 키보드로 움직입니다.
- 컬럼 높이는 옵션 다섯 개입니다. `className="[--time-picker-height:calc(var(--time-option)*7)]"` 처럼 바꿀 수 있고, 위아래 여백이 반 컬럼씩이라 어느 높이에서도 고른 시각이 가운데 줄에 옵니다.
- 12시간제의 시 컬럼은 12, 1, 2, ... 11 순서입니다.
- 오전/오후 이름은 런타임과 상관없이 date-fns 데이터라 서버와 브라우저가 같습니다.
