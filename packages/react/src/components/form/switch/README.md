# Switch

켜는 순간 적용되는 설정을 켜고 끄는 스위치입니다. 다크 모드, 알림, 자동 저장처럼 즉시 반영되는 값에 씁니다. 폼을 제출해야 반영되는 선택은 `Checkbox` 가 맞습니다.

- **실제 체크박스 하나.** 트랙과 thumb은 그림이고 입력은 그 위를 덮은 `<input type="checkbox" role="switch">` 가 받습니다. 라벨 클릭, `name`, `value`, 폼 제출이 브라우저 그대로 동작합니다.
- **Space로 토글.** Enter는 폼 제출에 남겨 두어 바꾸지 않습니다.
- **읽기 전용.** `readOnly` 면 포커스와 제출은 그대로이고 바뀌지 않습니다.
- **오른쪽에서 왼쪽.** `dir="rtl"` 안에서는 thumb이 오른쪽에서 출발합니다.
- **폼 초기화와 react-hook-form.** reset은 `defaultChecked` 로 되돌리고, `setValue()` 와 `reset()` 이 input을 직접 바꿔도 thumb이 따라갑니다.

```tsx
import { Field, Switch } from '@gsainfoteam/ids-react';

<Field variant="horizontal">
  <Field.Label>다크 모드</Field.Label>
  <Switch checked={dark} onCheckedChange={setDark} />
</Field>;
```

## 라벨

라벨을 내장하지 않습니다. 감싸거나 `htmlFor` 로 잇거나 `Field` 에 넣습니다.

```tsx
<Label>
  <Switch />                                {/* 감싸기 */}
  알림 받기
</Label>

<div className="flex items-center justify-between">
  <Label htmlFor="push">푸시 알림</Label>   {/* 설정 행: 라벨은 왼쪽, 스위치는 오른쪽 */}
  <Switch id="push" />
</div>
```

## 값

```tsx
<Switch defaultChecked />                              // 비제어
<Switch checked={on} onCheckedChange={setOn} />       // 제어
```

- `onCheckedChange` 는 사용자가 바꾸거나 코드가 `input.checked` 를 직접 바꿨을 때 불립니다. 폼 초기화와 부모가 바꾼 값은 알리지 않습니다.
- `onChange` 는 native change 이벤트입니다. `onCheckedChange` 가 먼저 불립니다.

## 키보드

| 키        | 동작                              |
| --------- | --------------------------------- |
| `Tab`     | 스위치로 이동. 포커스 링이 보인다 |
| `Space`   | 켜고 끈다                         |
| `Enter`   | 바꾸지 않는다                     |
| 라벨 클릭 | 켜고 끈다                         |

## Thumb

```tsx
<Switch />                                         {/* thumb 자동 */}

<Switch>
  <Switch.Thumb>                                   {/* thumb 안에 아이콘 */}
    {(state) => (state.checked ? <MoonIcon /> : <SunIcon />)}
  </Switch.Thumb>
</Switch>
```

- 루트가 트랙입니다.
- `Switch.Thumb` 은 `asChild` 를 받습니다. 아이콘은 thumb의 3/4 크기로 그립니다.
- thumb은 `--ids-motion-fast` 동안 미끄러집니다. `prefers-reduced-motion` 이면 바로 옮겨집니다.

## 상태

앱은 상태를 런타임 값으로 읽습니다. DOM 의 `data-*` 속성은 IDS 내부 스타일용이라 문서에 두지 않고 지키겠다고 약속하지도 않습니다.

- 켜짐은 `checked` / `defaultChecked` / `onCheckedChange` 로 읽고 정합니다.
- 새 디자인(`custom-design`)에서만 `className`, `style`, `children` 에 `Switch.State`(`checked`, `disabled`, `readOnly`, `required`, `invalid`, `hovered`, `active`, `focused`, `focusVisible`)를 받는 함수를 줍니다. `Switch.Thumb` 도 같습니다.
- 켜진 트랙 색은 `bg-scheme-solid`, 켜진 thumb 색은 `text-on-scheme-solid` 입니다. 기본은 `scheme-primary`, 오류면 `scheme-danger` 입니다.

## 폼

```tsx
<form>
  <Label>
    <Switch name="autosave" value="yes" defaultChecked /> {/* 켜져 있으면 autosave=yes */}
    자동 저장
  </Label>
  <button type="reset">초기화</button> {/* defaultChecked로 돌아간다 */}
</form>
```

- 꺼져 있으면 FormData에 항목이 없습니다. `value` 가 없으면 `on` 이 제출됩니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="autoSave" variant="horizontal">          {/* register() 로 연결된다 */}
  <Field.Label>자동 저장</Field.Label>
  <Switch />
</Field>

<Field name="autoSave" controlMode="checked">         {/* checked + onCheckedChange 로 연결 */}
  <Field.Label>자동 저장</Field.Label>
  <Switch />
</Field>
```

## 크기

```tsx
<Switch size="tiny" /> // standard(36 × 20px, thumb 16px) / tiny(28 × 16px, thumb 12px). 생략하면 Field를 따른다
```

- **크기 계약: hug.** 트랙 크기만큼 차지하고 바깥 여백이 없습니다. 자리와 간격은 감싸는 요소와 그 `gap` 이 정합니다.

## 속성

| 속성                         | 기본 / 동작                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `checked` / `defaultChecked` | `boolean`. 기본 `false`                                         |
| `onCheckedChange`            | 사용자나 코드가 input을 바꿨을 때                               |
| `readOnly`                   | 바뀌지 않는다. `aria-readonly`                                  |
| `invalid`                    | `aria-invalid` 와 danger 색. 명시한 `aria-invalid` 가 우선      |
| `size`                       | `standard` / `tiny`. 생략하면 `Field` 크기                      |
| `className` / `style`        | 트랙으로 간다. 새 디자인(`custom-design`)에서만 쓴다                          |
| `children`                   | `Switch.Thumb`. 생략하면 기본 thumb                             |
| `ref`                        | 실제 input                                                      |
| 그 외 native 속성            | input으로 간다 (`name`, `value`, `id`, `required`, `aria-*` 등) |

## 알아둘 것

- `checked` 와 `defaultChecked` 를 함께 주면 오류가 납니다.
- 즉시 반영되는 값이라 `Field.Error` 보다 `Field.Description` 으로 현재 상태를 안내하는 편이 자연스럽습니다.
- `onClick` 에서 `event.preventDefault()` 를 부르면 바뀌지 않습니다.
