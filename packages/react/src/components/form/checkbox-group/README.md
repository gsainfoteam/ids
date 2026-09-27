# CheckboxGroup

여러 개를 고르는 체크박스 묶음입니다. 값은 고른 항목의 배열입니다. 하나만 고르면 `RadioGroup`, 켜고 끄는 값 하나는 `Checkbox` 단독이 맞습니다.

- **전체 선택.** `All` 은 항목을 세어 체크, 일부 선택, 해제를 스스로 정하고, 누르면 전부 고르거나 전부 풉니다. 비활성 항목은 세지도 바꾸지도 않습니다.
- **하나 이상 필수.** `required` 면 아무것도 고르지 않았을 때 브라우저가 제출을 막고 "하나 이상 선택하세요." 를 그룹에 띄웁니다.
- **native 체크박스 그대로.** 항목마다 Tab이 멈추고 Space로 바뀌고, 고른 값이 같은 `name` 으로 하나씩 제출됩니다.
- **타입이 좁혀진 항목.** 렌더 함수의 `Item` 은 `value` 가 그룹의 타입으로 좁혀집니다. `Checkbox` 를 바로 넣어도 됩니다.
- **읽기 전용, 폼 초기화, react-hook-form.** `readOnly` 는 값을 막고, reset은 `defaultValue` 로 되돌리고, `controlMode="value"` 로 배열이 그대로 연결됩니다.

```tsx
import { CheckboxGroup, Label } from '@gsainfoteam/ids-react';

type Skill = 'js' | 'ts' | 'py';

<CheckboxGroup<Skill> value={skills} onValueChange={setSkills} aria-label="관심 기술">
  {({ All, Item }) => (
    <>
      <Label>
        <All />
        전체 선택
      </Label>
      <Label>
        <Item value="js" />
        JavaScript
      </Label>
      <Label>
        <Item value="ts" />
        TypeScript
      </Label>
    </>
  )}
</CheckboxGroup>;
```

## 항목

```tsx
<CheckboxGroup<Skill> aria-label="관심 기술">
  {({ Item }) => <Item value="cobol" />}        {/* 'cobol'은 Skill이 아니다: 컴파일 오류 */}
</CheckboxGroup>

<CheckboxGroup aria-label="알림">                {/* 렌더 함수 없이 */}
  <CheckboxGroup.All />
  <Checkbox value="mail" />                      {/* value가 있는 Checkbox가 항목이 된다 */}
  <Checkbox value="push" disabled />
</CheckboxGroup>
```

- 항목은 선택 상태, `name`, `form`, `disabled`, `readOnly`, `size`, `variant` 를 그룹에서 받습니다. 항목에 준 `size` 와 `variant` 가 우선합니다.
- `value` 가 없는 Checkbox는 그룹 안에 있어도 항목이 아닙니다.

## 값

```tsx
<CheckboxGroup defaultValue={['js']} />                          // 비제어
<CheckboxGroup value={skills} onValueChange={setSkills} />      // 제어
```

- 새로 고른 값은 배열 끝에 붙습니다.
- `onValueChange` 는 사용자가 바꿀 때만 불립니다. 부모가 바꾼 값과 폼 초기화는 알리지 않습니다.

## 전체 선택

```tsx
{
  ({ All, Item }) => (
    <>
      <Label>
        <All />
        전체 선택
      </Label>{' '}
      {/* 일부만 고르면 대시 */}
      <div className="flex flex-col gap-3 ps-6">
        <Label>
          <Item value="js" />
          JavaScript
        </Label>
        <Label>
          <Item value="rs" disabled />
          Rust
        </Label>{' '}
        {/* 전체 선택에 들어가지 않는다 */}
      </div>
    </>
  );
}
```

- `All` 은 화면에 있는 항목만 셉니다. 조건부로 숨긴 항목은 자동으로 빠집니다.
- `All` 에는 다루는 체크박스의 id가 `aria-controls` 로 붙습니다.
- `All` 은 제출되지 않습니다. `name` 이 없습니다.

## 키보드

| 키      | 동작                             |
| ------- | -------------------------------- |
| `Tab`   | 다음 체크박스로. 항목마다 멈춘다 |
| `Space` | 포커스된 체크박스를 켜고 끈다    |

## 배치

```tsx
<CheckboxGroup orientation="horizontal" />                 // vertical(기본) / horizontal
<CheckboxGroup className="grid grid-cols-2" />             // 격자는 className으로
```

## 상태와 스타일

`className` 과 `style` 은 그룹 상태를 받는 함수도 됩니다. 같은 상태가 루트에 `data-*` 로 붙습니다. 항목의 상태는 [Checkbox](../checkbox/README.md) 를 봅니다.

| 상태          | `data-*`                         | 뜻                          |
| ------------- | -------------------------------- | --------------------------- |
| `value`       |                                  | 고른 값                     |
| `orientation` | `data-orientation`               | `vertical` / `horizontal`   |
| `disabled`    | `data-disabled`, `aria-disabled` | 모든 항목이 비활성          |
| `readOnly`    | `data-readonly`                  | 값을 바꿀 수 없다           |
| `required`    | `data-required`                  | 하나 이상 골라야 한다       |
| `invalid`     | `data-invalid`, `aria-invalid`   | 오류. 모든 항목이 danger 색 |

## 폼

```tsx
<form>
  <Field required>
    <Field.Label>관심 기술</Field.Label>
    <CheckboxGroup name="skills">...</CheckboxGroup> {/* FormData: skills=js, skills=ts */}
  </Field>
  <button type="reset">초기화</button> {/* defaultValue로 돌아간다 */}
</form>
```

- `required` 는 체크박스 하나하나가 아니라 그룹에 걸립니다. 메시지는 `requiredMessage` 로 바꿉니다.
- 읽기 전용이나 비활성인 그룹은 검사하지 않습니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field
  name="skills"
  controlMode="value"
  registerOptions={{ validate: (value: Skill[]) => value.length > 0 || '하나 이상 고르세요.' }}
>
  <Field.Label>관심 기술</Field.Label>
  <CheckboxGroup<Skill>>{({ Item }) => ...}</CheckboxGroup>
  <Field.Error />
</Field>
```

- `ref` 는 그룹 루트이고, `focus()` 는 첫 번째로 고른 항목, 없으면 첫 항목으로 넘어갑니다. 오류가 났을 때의 포커스도 여기로 갑니다.
- `register()` 로 그룹을 연결하는 native 모드는 쓰지 않습니다.

## 크기와 variant

```tsx
<CheckboxGroup size="tiny" />       // 항목 크기. 생략하면 Field를 따른다
<CheckboxGroup variant="soft" />    // 항목의 outline(기본) / soft
<CheckboxGroup invalid />           // 모든 항목이 danger 색
```

## 속성

| 속성                     | 기본 / 동작                                    |
| ------------------------ | ---------------------------------------------- |
| `value` / `defaultValue` | 고른 값의 배열. 기본 `[]`                      |
| `onValueChange`          | 사용자가 바꿀 때 새 배열                       |
| `name` / `form`          | 항목의 `name` 과 `form`                        |
| `orientation`            | `vertical`(기본) / `horizontal`                |
| `required`               | 하나 이상 골라야 제출된다                      |
| `requiredMessage`        | 비었을 때 메시지. 기본 `하나 이상 선택하세요.` |
| `disabled` / `readOnly`  | 모든 항목에 전해진다                           |
| `invalid`                | 오류 표시. 명시한 `aria-invalid` 가 우선       |
| `size` / `variant`       | 항목으로 전해진다                              |
| `className` / `style`    | 루트로 간다. 그룹 상태를 받는 함수도 된다      |
| `children`               | `({ All, Item }) => ReactNode` 또는 Checkbox들 |
| `ref`                    | 그룹 루트. `focus()` 는 항목으로 넘어간다      |

## 알아둘 것

- 그룹 루트는 `tabIndex={-1}` 이라 Tab 순서에는 없고, 포커스를 받으면 바로 항목으로 넘깁니다.
- `role="group"` 에는 `aria-required` 를 둘 수 없어서, Field가 넘겨준 `aria-required` 는 버립니다. 필수 표시는 `Field.Label` 의 `*` 가 합니다.
