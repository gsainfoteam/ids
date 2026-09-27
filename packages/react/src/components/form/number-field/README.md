# NumberField

`number | null` 값을 입력받는 필드입니다. 로케일 형식으로 보여 주고, 키보드와 버튼으로 값을 올리고 내립니다.

- **값은 숫자.** `onValueChange` 는 `number | null` 을 넘깁니다. 화면의 `1,234.50 €` 가 아니라 `1234.5` 가 폼과 react-hook-form에 들어갑니다.
- **키보드.** ↑↓, Shift(큰 단위), Alt(작은 단위), PageUp·PageDown, Home·End(최솟값·최댓값)가 WAI-ARIA spinbutton 방식으로 동작합니다.
- **누르고 있기.** 버튼을 누르고 있으면 0.4초 뒤부터 계속 바뀌고 점점 빨라집니다. 마우스로 누르면 포커스가 입력에 남고, 터치로 누르면 화상 키보드를 띄우지 않습니다.
- **격자와 범위.** `step` 을 주면 입력을 마칠 때 `min` 에서 시작하는 격자에 맞추고, 범위를 넘은 값은 범위 안으로 맞춥니다. 범위 밖의 값은 native 검증에도 걸려서 폼이 제출을 막습니다.
- **로케일 형식과 붙여넣기.** `Intl.NumberFormat` 으로 보여 주고, 붙여 넣은 `1.234,5 €`, `(123)`, `１２`, 아랍 숫자도 숫자로 읽습니다.
- **모바일 키보드.** 음수가 들어갈 수 있으면 iOS에서도 마이너스가 있는 키보드를 띄우고, 정수만 받으면 숫자 키패드를 띄웁니다.

```tsx
import { Field, NumberField } from '@gsainfoteam/ids-react';

const [seats, setSeats] = useState<number | null>(2);

<Field>
  <Field.Label>좌석 수</Field.Label>
  <NumberField value={seats} onValueChange={setSeats} min={1} max={8} />
</Field>;
```

## 값

```tsx
<NumberField defaultValue={null} />                    // 비제어. 기본 null
<NumberField value={n} onValueChange={setN} />         // 제어. (value: number | null) => void
<NumberField onChange={(e) => log(e.target.value)} />  // native 이벤트. 화면의 글자가 온다
```

| 입력 중     | `onValueChange`                                  |
| ----------- | ------------------------------------------------ |
| `""`        | `null`                                           |
| `-`, `.`    | `null`. 글자는 입력을 마칠 때까지 그대로 둔다    |
| `1.`, `1.20` | `1`, `1.2`. 글자는 blur나 Enter에서 정리한다    |
| `1e3`, `1K` | 받지 않고 직전 값으로 돌아간다                  |

- 코드가 넣은 값은 포커스를 받았다 떠나도 고치지 않습니다. 사용자가 입력한 값만 입력을 마칠 때 정리합니다.

## 키보드

| 키                        | 동작                                         |
| ------------------------- | -------------------------------------------- |
| `↑` `↓`                   | `step` 만큼                                  |
| `Shift` + `↑` `↓`         | `largeStep` 만큼 (기본 `step` × 10)          |
| `Alt` / `Option` + `↑` `↓` | `smallStep` 만큼 (기본 `step` ÷ 10)         |
| `PageUp` `PageDown`       | `largeStep` 만큼                             |
| `Home` `End`              | `min`, `max` 로. 없으면 캐럿만 움직인다      |
| `Enter`                   | 입력한 값을 정리한다                         |

- 빈 값에서 올리고 내리면 0에서 시작합니다. 0이 범위 밖이면 가까운 경계로 갑니다.
- 숫자, 부호, 소수점, 자릿수 구분 기호가 아닌 글자는 입력되지 않습니다. `Ctrl`·`⌘` 조합은 그대로 둡니다.
- IME 조합 중에는 정리와 키 증감을 하지 않습니다.

## 격자와 범위

```tsx
<NumberField min={0} max={10} />               // 범위만. 입력을 마치면 0–10 안으로
<NumberField step={0.5} />                     // 1.3을 입력하고 떠나면 1.5
<NumberField min={1} step={2} />               // 격자는 min에서 시작: 1, 3, 5 …
```

- `step` 을 줄 때만 격자에 맞춥니다. 주지 않으면 ↑↓의 기본 단위 1로만 씁니다.
- 격자 밖의 값에서 ↑↓를 누르면 그 방향의 가장 가까운 격자로 먼저 갑니다. native `stepUp()` 과 같습니다.
- 범위 밖의 값은 `aria-invalid` 와 native 검증(`customError`)으로 알립니다. 문구는 "값은 10 이하여야 합니다." 이고 `Field.Error` 가 보여 줍니다.
- 증감은 십진 연산이라 `0.1 + 0.2` 같은 오차가 생기지 않습니다.

## 버튼

```tsx
<NumberField />                                {/* 끝에 위아래 버튼이 붙는다 */}
<NumberField hideStepper />                    {/* 버튼 없이 */}

<NumberField>
  <NumberField.Decrement />                    {/* 입력 양옆에 −, + */}
  <NumberField.Input className="text-center" />
  <NumberField.Increment />
</NumberField>

<NumberField incrementLabel="인원 늘리기" decrementLabel="인원 줄이기" />
```

- 버튼은 탭 순서에 없습니다. 키보드에서는 입력의 ↑↓가 같은 일을 합니다.
- 경계에 닿으면 그쪽 버튼이 비활성이 됩니다.
- 누르고 있으면 계속 바뀌고, 떼거나 포인터가 취소되면 멈춥니다.

## 휠

```tsx
<NumberField allowWheelScrub />                // 포커스가 있을 때만 휠로 증감. Shift는 largeStep
```

- 켜면 포커스가 있는 입력 위에서 휠이 페이지 대신 값을 바꿉니다. 그래서 기본은 꺼져 있습니다.
- `Ctrl`·`⌘` + 휠은 브라우저 확대로 남겨 둡니다.

## 형식

```tsx
<NumberField defaultValue={1234.567} locale="de-DE" formatOptions={{ style: 'currency', currency: 'EUR' }} />
// 보일 때 "1.234,57 €", 포커스하면 "1234,567"로 편집한다. 값의 정밀도는 그대로다

<NumberField defaultValue={0.125} formatOptions={{ style: 'percent', minimumFractionDigits: 1 }} />
// 보일 때 "12.5%", 포커스하면 "0.125". "25%"를 붙여 넣으면 0.25
```

- `locale` 기본값은 `en-US` 입니다. SSR과 브라우저가 같은 글자를 그리게 하기 위해서입니다.
- 형식은 보일 때와 `aria-valuetext` 에만 씁니다. 반올림한 글자가 값에 들어가지 않습니다.

## 조립

```tsx
<NumberField value={weight} onValueChange={setWeight} step={0.1}>
  <NumberField.Input />
  <span>kg</span>                              {/* Input 뒤 = 뒤쪽 */}
  <NumberField.Clear />                        {/* 값이 있을 때만. 누르거나 Escape면 null */}
  <NumberField.Stepper />                      {/* 직접 두면 그 자리에 놓인다 */}
</NumberField>
```

## 상태

| 속성                                             | 뜻                                 |
| ------------------------------------------------ | ---------------------------------- |
| `data-focused`, `data-filled`                    | 포커스가 필드 안에 있다, 값이 있다 |
| `data-invalid`                                   | `invalid`, `aria-invalid`, 범위 밖 |
| `data-disabled`, `data-readonly`                 | 비활성, 읽기 전용                  |
| `data-size`, `data-variant`                      | 크기와 variant                     |

- 테두리 컨테이너(`data-number-field`)에 붙습니다. `className` 과 `style` 은 이 상태를 받는 함수도 됩니다.

## react-hook-form + Zod

```tsx
import { NumberField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const schema = z.object({ quantity: z.number().nullable().refine((v) => v != null, '수량을 입력하세요.') });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { quantity: null as number | null } });

<Field name="quantity" controlMode="value" required>   {/* onValueChange로 숫자를 받는다 */}
  <Field.Label>수량</Field.Label>
  <NumberField min={1} max={20} />
  <Field.Error />
</Field>;
```

- `native` 모드로 묶지 않습니다. 화면의 글자가 값이 아니기 때문입니다.
- TanStack Form은 `value={field.state.value}` 와 `onValueChange={field.handleChange}` 로 연결합니다.

## 속성

| 속성                                  | 기본 / 동작                                                   |
| ------------------------------------- | ------------------------------------------------------------- |
| `value` / `defaultValue`              | `number \| null`. 유한한 숫자만. 기본 `null`                   |
| `onValueChange`                       | `(value: number \| null) => void`                             |
| `onChange`                            | native change 이벤트                                          |
| `min` / `max`                         | 제한 없음. `min <= max`                                       |
| `step`                                | ↑↓ 단위. 주면 격자에 맞춘다                                   |
| `smallStep` / `largeStep`             | `step` ÷ 10 / `step` × 10. 양수                               |
| `locale` / `formatOptions`            | `en-US` / `Intl.NumberFormat` 옵션                            |
| `allowWheelScrub`                     | `false`                                                       |
| `hideStepper`                         | `false`. 자동 버튼만 숨긴다                                   |
| `incrementLabel` / `decrementLabel`   | "값 늘리기" / "값 줄이기"                                     |
| `variant`                             | `outline`(기본) / `soft` / `ghost`                            |
| `size`                                | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard` |
| `invalid`                             | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선           |
| `disabled` / `readOnly`               | 입력과 버튼의 변경을 모두 막는다                              |
| `name` / `form`                       | hidden input이 숫자 문자열을 제출한다. 빈 값은 `""`           |
| `className` / `style`                 | 컨테이너로 간다. 상태를 받는 함수도 된다                      |
| 그 외 native 속성, ref                 | 실제 input으로 간다                                           |

## 알아둘 것

- 실제 input은 `type="text"` 와 `role="spinbutton"` 입니다. `valueAsNumber` 나 `stepUp()` 은 쓸 수 없습니다.
- 기본으로 `autoComplete="off"`, `autoCorrect="off"`, `spellCheck={false}` 입니다. 전에 입력한 숫자를 브라우저가 제안하지 않습니다.
- native `form.reset()` 은 비제어 값을 `defaultValue` 로 되돌립니다.
- `NumberField.Input` 이나 `Stepper` 를 둘 이상 두면 에러가 납니다. `min > max`, 0 이하의 단위, 유한하지 않은 숫자도 에러입니다.
