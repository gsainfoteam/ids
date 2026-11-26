# Radio

여러 선택지 중 하나를 나타내는 라디오 버튼입니다. 보통은 `RadioGroup` 안에 넣어 씁니다.

- **실제 라디오 하나.** 원은 그림이고 입력은 그 위를 덮은 `<input type="radio">` 가 받습니다. 같은 `name` 끼리 묶이고, 라벨 클릭과 폼 제출이 브라우저 그대로 동작합니다.
- **그룹을 따라 바뀌는 상태.** 같은 `name` 의 다른 Radio를 고르면 이전 Radio의 상태와 원도 바로 바뀝니다. native 라디오는 이때 이벤트를 보내지 않습니다.
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
  <Radio.Indicator asChild>                          {/* 자식이 표시 요소가 된다 */}
    <StarIcon className="size-3" />
  </Radio.Indicator>
</Radio>
```

- 표시자는 선택되지 않으면 투명해지고, 선택되면 짧게 커지며 나타납니다. `prefers-reduced-motion` 이면 바로 바뀝니다.
- 표시자 색은 `currentColor` 이고 기본은 `text-scheme` 입니다.

## 상태

앱은 상태를 런타임 값으로 읽습니다. DOM 의 `data-*` 속성은 IDS 내부 스타일용이라 문서에 두지 않고 지키겠다고 약속하지도 않습니다.

- 선택은 RadioGroup 의 `value` / `onValueChange` 로 읽습니다. 그룹 없이 쓰면 `checked` / `onCheckedChange` 입니다.
- 새 디자인(`custom-design`)에서만 `className`, `style`, `children` 에 `Radio.State`(`checked`, `disabled`, `readOnly`, `required`, `invalid`, `hovered`, `active`, `focused`, `focusVisible`)를 받는 함수를 줍니다. `Radio.Indicator` 도 같습니다.
- 위를 덮은 input은 원의 모서리를 그대로 받아, 누를 수 있는 곳이 원과 같습니다.
- 선택 색은 `text-scheme` 입니다. 기본은 `scheme-primary`, 오류면 `scheme-danger` 입니다.

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
<Radio aria-invalid />      // 테두리와 점이 danger 색
```

- **크기 계약: hug.** 원 크기만큼 차지하고 바깥 여백이 없습니다. 자리와 간격은 감싸는 요소와 그 `gap` 이 정합니다.

## 속성

| 속성                         | 기본 / 동작                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `value`                      | 제출되는 값. RadioGroup 안에서는 필수                          |
| `checked` / `defaultChecked` | 그룹 밖에서만. 기본 `false`                                    |
| `onCheckedChange`            | 선택되거나 그룹의 다른 라디오에 밀려 풀렸을 때                 |
| `readOnly`                   | 선택되지 않는다                                                |
| `aria-invalid` | 오류 표시(danger 색). Field 안이면 Field 가 넘긴다 |
| `variant`                    | `outline`(기본) / `soft`                                       |
| `size`                       | `standard` / `tiny`                                            |
| `className` / `style`        | 원으로 간다. 새 디자인(`custom-design`)에서만 쓴다                           |
| `children`                   | `Radio.Indicator`. 생략하면 점                                 |
| `ref`                        | 실제 input                                                     |
| 그 외 native 속성            | input으로 간다 (`name`, `id`, `required`, `form`, `aria-*` 등) |

## 알아둘 것

- `checked` 와 `defaultChecked` 를 함께 주면 오류가 납니다. RadioGroup 안에서 둘 중 하나를 주거나 `value` 를 빠뜨려도 오류가 납니다.
- 폼 초기화는 `onCheckedChange` 를 부르지 않습니다.
- `aria-readonly` 는 라디오 하나에 둘 수 없는 속성이라, 읽기 전용은 `RadioGroup` 이 그룹에 표시합니다.
