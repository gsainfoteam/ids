# Radio

여러 선택지 중 하나를 나타내는 라디오 버튼입니다. 보통은 `RadioGroup` 안에 넣어 씁니다.

- **실제 라디오 하나.** 원은 그림이고 입력은 그 위를 덮은 `<input type="radio">` 가 받습니다. 같은 `name` 끼리 묶이고, 라벨 클릭과 폼 제출이 브라우저 그대로 동작합니다.
- **그룹을 따라 바뀌는 상태.** 같은 `name` 의 다른 Radio를 고르면 이전 Radio의 `data-state` 도 바로 바뀝니다. native 라디오는 이때 이벤트를 보내지 않습니다.
- **RadioGroup 안에서는 그룹이 결정.** `value` 만 주면 `name`, 선택 상태, 크기, 비활성, 필수가 그룹에서 옵니다.
- **읽기 전용, 폼 초기화, react-hook-form.** `readOnly` 는 선택을 막고, reset은 처음 상태로 되돌리고, `register()` 가 input을 직접 바꿔도 원이 따라갑니다.

```tsx
import { Label, Radio, RadioGroup } from '@gsainfoteam/ids-react';

<RadioGroup aria-label="배송" defaultValue="standard">
  <Label>
    <Radio value="standard" />
    일반 배송
  </Label>
  <Label>
    <Radio value="express" />
    빠른 배송
  </Label>
</RadioGroup>;
```

## 라벨

라벨을 내장하지 않습니다. 감싸거나 `htmlFor` 로 잇습니다.

```tsx
<Label>
  <Radio value="pickup" />                 {/* 감싸기: 라벨 어디를 눌러도 선택된다 */}
  매장 수령
</Label>

<Radio id="gift" value="gift" />
<Label htmlFor="gift">선물 포장</Label>
```

## 그룹 없이 쓰기

```tsx
<form>
  <Radio name="shipping" value="standard" defaultChecked /> {/* 같은 name이 한 그룹 */}
  <Radio name="shipping" value="express" />
</form>
```

- 비제어 Radio는 선택을 브라우저에 맡기고, 같은 그룹의 라디오가 바뀔 때마다 자기 상태를 다시 읽습니다.
- `onCheckedChange(true)` 는 이 Radio가 선택될 때, `onCheckedChange(false)` 는 비제어 Radio가 다른 Radio에 밀려 선택이 풀릴 때 불립니다.
- 제어하려면 `checked` 와 `onCheckedChange` 를 씁니다. 선택이 풀리는 것도 부모가 정합니다. 여러 개를 제어한다면 `RadioGroup` 이 간단합니다.

## RadioGroup 안에서

```tsx
<RadioGroup value={plan} onValueChange={setPlan} aria-label="플랜">
  <Radio value="free" /> {/* name, checked, disabled, required, size가 그룹에서 온다 */}
  <Radio value="pro" disabled /> {/* 항목 하나만 비활성 */}
</RadioGroup>
```

- 그룹 안에서는 `value` 가 필요하고, `checked` 와 `defaultChecked` 를 쓸 수 없습니다.
- 키보드, 필수, 카드형 선택지는 [RadioGroup](../radio-group/README.md) 에 있습니다.

## 표시자

```tsx
<Radio value="a" />                                  {/* 가운데 점 */}

<Radio value="star">
  <Radio.Indicator asChild className="size-3">       {/* 자식이 표시 요소가 된다 */}
    <StarIcon />
  </Radio.Indicator>
</Radio>
```

- 표시자는 선택되지 않으면 투명해지고, 선택되면 짧게 커지며 나타납니다. `prefers-reduced-motion` 이면 바로 바뀝니다.
- 표시자 색은 `currentColor` 이고 기본은 `--radio-accent` 입니다.

## 상태와 스타일

`className`, `style`, `children` 은 상태를 받는 함수도 됩니다. 같은 상태가 원에 `data-*` 로 붙습니다.

```tsx
<Radio value="red" className="size-7 rounded-standard" />   // 원 대신 네모로. 네 모서리까지 눌린다
```

- 위를 덮은 input은 원의 모서리를 그대로 받습니다. `className` 으로 모양을 바꾸면 누를 수 있는 곳도 그 모양을 따릅니다.

| 상태           | `data-*`                 | 뜻                                |
| -------------- | ------------------------ | --------------------------------- |
| `checked`      | `data-state="checked"`   | 선택됨                            |
|                | `data-state="unchecked"` | 선택 안 됨                        |
| `disabled`     | `data-disabled`          | 비활성                            |
| `readOnly`     | `data-readonly`          | 읽기 전용                         |
| `required`     | `data-required`          | 필수                              |
| `invalid`      | `data-invalid`           | 오류. 테두리와 점이 danger 색     |
| `hovered`      | `data-hovered`           | 마우스가 올라가 있다              |
| `active`       | `data-active`            | 누르고 있다                       |
| `focused`      | `data-focused`           | 포커스                            |
| `focusVisible` | `data-focus-visible`     | 키보드 포커스. 포커스 링이 보인다 |

- 선택 색은 `--radio-accent` 입니다. 기본은 primary, 오류면 danger입니다.

## react-hook-form

```tsx
const { register } = useForm({ defaultValues: { plan: 'free' } });

<Radio {...register('plan')} value="free" />   {/* 라디오마다 register() 를 펼친다 */}
<Radio {...register('plan')} value="pro" />
```

- `setValue()` 와 `reset()` 이 input을 직접 바꿔도 원이 따라 바뀝니다.
- `Field` 로 연결할 때는 `RadioGroup` 을 `controlMode="value"` 로 씁니다.

## 크기와 variant

```tsx
<Radio variant="soft" />    // outline(기본) / soft: 테두리 대신 옅은 면
<Radio size="tiny" />       // standard(16px) / tiny(14px). 생략하면 RadioGroup, 그다음 Field를 따른다
<Radio invalid />           // 테두리와 점이 danger 색
```

## 속성

| 속성                         | 기본 / 동작                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `value`                      | 제출되는 값. RadioGroup 안에서는 필수                          |
| `checked` / `defaultChecked` | 그룹 밖에서만. 기본 `false`                                    |
| `onCheckedChange`            | 선택되거나 그룹의 다른 라디오에 밀려 풀렸을 때                 |
| `readOnly`                   | 선택되지 않는다                                                |
| `invalid`                    | `aria-invalid` 와 danger 색                                    |
| `variant`                    | `outline`(기본) / `soft`                                       |
| `size`                       | `standard` / `tiny`                                            |
| `className` / `style`        | 원으로 간다. 상태를 받는 함수도 된다                           |
| `children`                   | `Radio.Indicator`. 생략하면 점                                 |
| `ref`                        | 실제 input                                                     |
| 그 외 native 속성            | input으로 간다 (`name`, `id`, `required`, `form`, `aria-*` 등) |

## 알아둘 것

- `checked` 와 `defaultChecked` 를 함께 주면 오류가 납니다. RadioGroup 안에서 둘 중 하나를 주거나 `value` 를 빠뜨려도 오류가 납니다.
- 폼 초기화는 `onCheckedChange` 를 부르지 않습니다.
- `aria-readonly` 는 라디오 하나에 둘 수 없는 속성이라, 읽기 전용은 `RadioGroup` 이 그룹에 표시합니다.
