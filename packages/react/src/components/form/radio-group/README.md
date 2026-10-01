# RadioGroup

여러 선택지 중 하나를 고르는 그룹입니다. 여러 개를 고르면 `CheckboxGroup`, 선택지가 많거나 자리가 좁으면 `Select` 가 낫습니다.

- **native 라디오 그대로.** 모든 항목이 같은 `name` 을 쓰는 `<input type="radio">` 라서 Tab은 선택된 항목에 멈추고, 화살표 키는 옮기면서 바로 고르고, 비활성 항목은 건너뜁니다. `Home` `End` 로 처음과 끝 항목도 고릅니다.
- **타입이 좁혀진 항목.** 렌더 함수의 `Item` 은 `value` 가 그룹의 타입으로 좁혀져 오타가 컴파일 오류가 됩니다. `Radio` 를 바로 넣어도 됩니다.
- **필수.** `required` 면 아무것도 고르지 않았을 때 브라우저가 제출을 막습니다.
- **읽기 전용과 폼 초기화.** `readOnly` 는 선택을 막고 포커스 이동은 남깁니다. reset은 `defaultValue` 로 되돌립니다.
- **react-hook-form.** `controlMode="value"` 로 연결되고, 오류가 나면 선택된 항목으로 포커스가 갑니다.

```tsx
import { Label, RadioGroup } from '@gsainfoteam/ids-react';

type Plan = 'free' | 'pro' | 'team';

<RadioGroup<Plan> value={plan} onValueChange={setPlan} aria-label="구독 플랜">
  {({ Item }) => (
    <>
      <Label>
        <Item value="free" />
        무료
      </Label>
      <Label>
        <Item value="pro" />
        Pro
      </Label>
    </>
  )}
</RadioGroup>;
```

## 항목

```tsx
<RadioGroup<Plan> aria-label="플랜">
  {({ Item }) => <Item value="enterprise" />}    {/* 'enterprise'는 Plan이 아니다: 컴파일 오류 */}
</RadioGroup>

<RadioGroup aria-label="사이즈">                  {/* Radio를 바로 넣어도 그룹에 묶인다 */}
  <Radio value="s" />
  <Radio value="m" disabled />                    {/* 항목 하나만 비활성 */}
</RadioGroup>
```

- 항목은 `name`, 선택 상태, `disabled`, `readOnly`, `required`, `size`, `variant`, `form` 을 그룹에서 받습니다. 항목에 준 `size` 와 `variant` 가 우선합니다.
- `name` 을 주지 않으면 그룹이 하나 만듭니다. 폼으로 제출하려면 `name` 을 줍니다.

## 값

```tsx
<RadioGroup defaultValue="free" />                          // 비제어
<RadioGroup value={plan} onValueChange={setPlan} />        // 제어
<RadioGroup value={null} />                                 // 제어, 아무것도 고르지 않음
```

- `onValueChange` 는 사용자가 고를 때만 불립니다. 부모가 바꾼 값이나 폼 초기화는 알리지 않습니다.
- 한 번 고르면 사용자가 선택을 비울 수 없습니다. native 라디오 그룹과 같습니다.

## 키보드

| 키           | 동작                                           |
| ------------ | ---------------------------------------------- |
| `Tab`        | 선택된 항목으로 들어간다. 없으면 첫 항목       |
| `↓` `→`      | 다음 항목으로 옮기면서 고른다. 끝에서 처음으로 |
| `↑` `←`      | 이전 항목으로 옮기면서 고른다                  |
| `Home` `End` | 처음 / 마지막 항목으로 옮기면서 고른다         |
| `Space`      | 포커스된 항목을 고른다                         |

- 화살표 키는 브라우저의 라디오 그룹 동작입니다. `Home` `End` 는 그룹이 더한 키이고, 화살표처럼 항목의 click으로 고릅니다.
- 비활성 항목은 어느 키로도 건너뜁니다.
- `readOnly` 면 포커스만 옮겨지고 선택은 그대로입니다.
- 루트에 준 `onKeyDown` 이 먼저 불리고, 거기서 `preventDefault()` 하면 `Home` `End` 를 그룹이 처리하지 않습니다.

## 배치와 카드형 선택지

```tsx
<RadioGroup orientation="horizontal" />      // vertical(기본) / horizontal. aria-orientation도 붙는다

<RadioGroup<Plan> className="grid gap-3" aria-label="플랜">
  {({ Item }) =>
    plans.map((plan) => (
      <Label
        key={plan.value}
        className="flex items-start gap-3 rounded-standard p-4 inset-ring-1 inset-ring-(--ids-color-border)
                   has-data-[state=checked]:inset-ring-(--ids-color-primary)"   // 선택된 카드
      >
        <Item value={plan.value} />
        <span>{plan.label}</span>
      </Label>
    ))
  }
</RadioGroup>
```

- 카드 전체가 `Label` 이라 어디를 눌러도 선택됩니다. 선택된 항목의 원에 `data-state="checked"` 가 붙어 `has-data-[state=checked]:` 로 카드를 꾸밉니다.

## 상태와 스타일

그룹 루트에 붙는 속성입니다. 항목의 상태는 [Radio](../radio/README.md) 를 봅니다. `className` 과 `style` 은 `RadioGroup.State`(`value`, `orientation`, `disabled`, `readOnly`, `required`, `invalid`)를 받는 함수도 됩니다.

| 속성                              | 뜻                          |
| --------------------------------- | --------------------------- |
| `data-orientation`                | `vertical` / `horizontal`   |
| `data-disabled` / `aria-disabled` | 모든 항목이 비활성          |
| `data-readonly` / `aria-readonly` | 선택을 바꿀 수 없다         |
| `data-required` / `aria-required` | 필수                        |
| `data-invalid` / `aria-invalid`   | 오류. 모든 항목이 danger 색 |

## 폼

```tsx
<form>
  <Field required>
    <Field.Label>플랜</Field.Label>
    <RadioGroup name="plan" defaultValue="free">
      {' '}
      {/* FormData: plan=free */}
      ...
    </RadioGroup>
  </Field>
  <button type="reset">초기화</button> {/* defaultValue로 돌아간다 */}
</form>
```

- 필수 검사는 native 라디오가 합니다. 브라우저 메시지가 첫 라디오에 붙습니다.
- 아무것도 고르지 않으면 FormData에 항목이 없습니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="plan" controlMode="value" registerOptions={{ required: '플랜을 고르세요.' }}>
  <Field.Label>플랜</Field.Label>
  <RadioGroup<Plan>>{({ Item }) => ...}</RadioGroup>
  <Field.Error />
</Field>
```

- `ref` 는 그룹 루트입니다. `focus()` 를 부르면 선택된 항목, 없으면 첫 항목으로 포커스가 갑니다. react-hook-form이 오류 때 부르는 것도 이 `focus()` 입니다.
- `register()` 로 그룹 하나를 연결하는 native 모드는 쓰지 않습니다. 라디오마다 `register()` 를 펼치려면 `Radio` 를 직접 씁니다.

## 크기와 variant

```tsx
<RadioGroup size="tiny" />       // 항목 크기. 생략하면 Field를 따른다
<RadioGroup variant="soft" />    // 항목의 outline(기본) / soft
<RadioGroup invalid />           // 모든 항목이 danger 색
```

## 속성

| 속성                     | 기본 / 동작                                           |
| ------------------------ | ----------------------------------------------------- |
| `value` / `defaultValue` | 고른 값, 없으면 `null`                                |
| `onValueChange`          | 사용자가 고를 때                                      |
| `name`                   | 항목이 함께 쓰는 이름. 생략하면 자동                  |
| `form`                   | 항목의 `form` 속성                                    |
| `orientation`            | `vertical`(기본) / `horizontal`                       |
| `disabled`               | 모든 항목 비활성                                      |
| `readOnly`               | 선택을 바꿀 수 없다                                   |
| `required`               | 하나를 골라야 제출된다                                |
| `invalid`                | 오류 표시. 명시한 `aria-invalid` 가 우선              |
| `size` / `variant`       | 항목으로 전해진다                                     |
| `children`               | `({ Item }) => ReactNode` 또는 `Radio` 들             |
| `ref`                    | 그룹 루트. `focus()` 는 항목으로 넘어간다             |
| 그 외 속성               | 그룹 루트로 간다 (`id`, `aria-label`, `className` 등) |

## 알아둘 것

- 그룹 루트는 `tabIndex={-1}` 이라 Tab 순서에는 들어가지 않고, 포커스를 받으면 바로 항목으로 넘깁니다.
- 한 그룹에 같은 `value` 를 두 번 쓰지 않습니다. 둘 다 선택된 것처럼 보입니다.
