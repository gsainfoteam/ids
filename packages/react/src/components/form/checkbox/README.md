# Checkbox

켜고 끄는 값 하나를 고르는 체크박스입니다. 약관 동의처럼 폼을 제출할 때 반영되는 선택에 씁니다.

- **실제 체크박스 하나.** 상자는 그림이고 입력은 그 위를 덮은 `<input type="checkbox">` 가 받습니다. `name`, `value`, `required`, 폼 제출, 라벨 클릭이 브라우저 그대로 동작합니다.
- **일부 선택.** `checked` 에 `'indeterminate'` 를 주면 대시로 그리고 스크린 리더에는 "일부 선택"으로 읽힙니다. 누르면 체크가 됩니다.
- **읽기 전용.** `readOnly` 면 포커스와 제출은 그대로이고 클릭과 Space로 바뀌지 않습니다.
- **폼 초기화.** `<button type="reset">` 을 누르면 `defaultChecked` 로 돌아갑니다. 일부 선택도 돌아옵니다.
- **react-hook-form.** `register()` 가 그대로 연결되고, `setValue()` 와 `reset()` 이 input을 직접 바꿔도 상자가 따라 바뀝니다.

```tsx
import { Checkbox, Label } from '@gsainfoteam/ids-react';

<Label className="inline-flex items-center gap-2">
  <Checkbox checked={agreed} onCheckedChange={setAgreed} />
  약관에 동의합니다
</Label>;
```

## 라벨

라벨을 내장하지 않습니다. 감싸거나 `htmlFor` 로 잇거나 `Field` 에 넣습니다.

```tsx
<Label>                                   {/* 감싸기 */}
  <Checkbox name="terms" />
  약관에 동의합니다
</Label>

<Checkbox id="news" />                     {/* htmlFor */}
<Label htmlFor="news">소식 받기</Label>

<Field>                                   {/* Field가 id, aria-describedby, aria-invalid를 잇는다 */}
  <Field.Label>자동 로그인</Field.Label>
  <Checkbox />
</Field>
```

- 라벨이 전혀 없으면 `aria-label` 을 줍니다.

## 값

```tsx
<Checkbox defaultChecked />                                     // 비제어

<Checkbox checked={agreed} onCheckedChange={setAgreed} />      // 제어

<Checkbox
  checked={all ? true : some ? 'indeterminate' : false}          // 일부 선택
  onCheckedChange={(next) => selectAll(next)}                   // 일부 선택을 누르면 true
/>
```

- `onCheckedChange` 는 사용자가 바꾸거나 코드가 `input.checked` 를 직접 바꿨을 때 불리고, 항상 `boolean` 을 받습니다. `'indeterminate'` 는 부모만 정합니다.
- 제어 모드에서 부모가 값을 바꾸지 않으면 눌러도 그대로입니다. 일부 선택도 남습니다.
- `onChange` 는 native change 이벤트입니다. `onCheckedChange` 가 먼저 불립니다.
- `onClick` 에서 `event.preventDefault()` 를 부르면 바뀌지 않고 `onCheckedChange` 도 불리지 않습니다.

## CheckboxGroup 안에서

```tsx
<CheckboxGroup value={skills} onValueChange={setSkills} aria-label="관심 기술">
  <Checkbox value="js" />{' '}
  {/* value가 있으면 그룹의 항목: 선택 상태, name, disabled가 그룹에서 온다 */}
  <Checkbox value="ts" />
</CheckboxGroup>
```

- 그룹의 항목에는 `checked` 와 `defaultChecked` 를 줄 수 없습니다. 전체 선택과 필수는 [CheckboxGroup](../checkbox-group/README.md) 에 있습니다.

## 키보드

| 키        | 동작                                 |
| --------- | ------------------------------------ |
| `Tab`     | 체크박스로 이동. 포커스 링이 보인다  |
| `Space`   | 켜고 끈다. 일부 선택이면 체크가 된다 |
| 라벨 클릭 | 켜고 끈다                            |

## 표시자

```tsx
<Checkbox />                                  {/* 체크, 일부 선택이면 대시 */}

<Checkbox>
  <Checkbox.Indicator asChild>                {/* 자식이 표시 요소가 된다 */}
    <HeartIcon />
  </Checkbox.Indicator>
</Checkbox>

<Checkbox>
  <Checkbox.Indicator>
    {(state) => (state.indeterminate ? <MinusIcon /> : <StarIcon />)}
  </Checkbox.Indicator>
</Checkbox>
```

- 표시자는 꺼져 있을 때 투명해지고, 켜질 때 짧게 커지며 나타납니다. `prefers-reduced-motion` 이면 바로 바뀝니다.
- 표시자에는 `aria-hidden` 이 붙습니다. 상태는 input이 읽힙니다.

## 상태와 스타일

`className`, `style`, `children` 은 상태를 받는 함수도 됩니다. 같은 상태가 상자에 `data-*` 로 붙습니다.

```tsx
<Checkbox className={(state) => (state.checked ? 'shadow-md' : undefined)} />
<Checkbox className="data-[state=checked]:[--checkbox-accent:var(--ids-color-success)]" />
```

| 상태            | `data-*`                     | 뜻                                |
| --------------- | ---------------------------- | --------------------------------- |
| `checked`       | `data-state="checked"`       | 켜짐                              |
| `indeterminate` | `data-state="indeterminate"` | 일부 선택                         |
|                 | `data-state="unchecked"`     | 꺼짐                              |
| `disabled`      | `data-disabled`              | 비활성                            |
| `readOnly`      | `data-readonly`              | 읽기 전용                         |
| `required`      | `data-required`              | 필수                              |
| `invalid`       | `data-invalid`               | 오류. danger 색                   |
| `hovered`       | `data-hovered`               | 마우스가 올라가 있다              |
| `active`        | `data-active`                | 누르고 있다                       |
| `focused`       | `data-focused`               | 포커스                            |
| `focusVisible`  | `data-focus-visible`         | 키보드 포커스. 포커스 링이 보인다 |

- 체크 색은 `--checkbox-accent`, 체크 표시 색은 `--checkbox-on-accent` 입니다. 기본은 primary, 오류면 danger입니다.
- `Checkbox.Indicator` 에도 `data-state` 가 붙습니다.

## 폼

```tsx
<form onSubmit={submit}>
  <Label>
    <Checkbox name="terms" value="agreed" required /> {/* FormData: terms=agreed */}
    약관에 동의합니다
  </Label>
  <button type="submit">가입</button> {/* 체크하지 않으면 브라우저가 막는다 */}
  <button type="reset">초기화</button> {/* defaultChecked로 돌아간다 */}
</form>
```

- `value` 를 주지 않으면 체크했을 때 `on` 이 제출됩니다. 꺼져 있으면 항목이 없습니다.
- `readOnly` 는 제출됩니다. `disabled` 는 제출되지 않습니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="terms" registerOptions={{ required: '약관에 동의해야 합니다.' }}>
  <Field.Label>약관 동의</Field.Label>
  <Checkbox />                              {/* register() 로 연결된다 */}
  <Field.Error />
</Field>

<Field name="alerts" controlMode="checked"> {/* 값으로 연결: checked + onCheckedChange */}
  <Field.Label>알림</Field.Label>
  <Checkbox />
</Field>
```

## 크기와 variant

```tsx
<Checkbox variant="soft" />    // outline(기본) / soft: 테두리 대신 옅은 면
<Checkbox size="tiny" />       // standard(16px) / tiny(14px). 생략하면 Field를 따른다
<Checkbox invalid />           // 테두리와 체크 색이 danger
```

## 속성

| 속성                         | 기본 / 동작                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `checked` / `defaultChecked` | `boolean` 또는 `'indeterminate'`. 기본 `false`                  |
| `onCheckedChange`            | 사용자나 코드가 input을 바꿨을 때 `boolean`                     |
| `value`                      | 제출되는 값. CheckboxGroup 안에서는 항목의 값                   |
| `readOnly`                   | 바뀌지 않는다. `aria-readonly`                                  |
| `invalid`                    | `aria-invalid` 와 danger 색. 명시한 `aria-invalid` 가 우선      |
| `variant`                    | `outline`(기본) / `soft`                                        |
| `size`                       | `standard` / `tiny`. 생략하면 `Field` 크기                      |
| `className` / `style`        | 상자로 간다. 상태를 받는 함수도 된다                            |
| `children`                   | `Checkbox.Indicator`. 생략하면 체크와 대시                      |
| `ref`                        | 실제 input                                                      |
| 그 외 native 속성            | input으로 간다 (`name`, `value`, `id`, `required`, `aria-*` 등) |

## 알아둘 것

- `checked` 와 `defaultChecked` 를 함께 주면 오류가 납니다.
- 폼 초기화는 `onCheckedChange` 를 부르지 않습니다. native 체크박스도 change 이벤트를 보내지 않습니다.
- input은 상자 크기만큼만 덮습니다. 누를 곳을 넓히려면 `Label` 로 감쌉니다.
- `className` 과 `style` 만 상자로 가고, 이벤트 핸들러를 포함한 나머지는 input으로 갑니다.
