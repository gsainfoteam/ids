# ToggleGroup

Toggle 여러 개를 묶어 하나 또는 여러 개를 고르게 합니다. 정렬 방식처럼 하나만 고르는 선택과, 굵게와 기울임처럼 여러 개를 켜는 서식에 씁니다.

- **키보드 한 번에 한 칸.** 그룹 전체가 Tab 한 칸입니다. 안에서는 화살표, Home, End 로 옮기고, 끝에서는 처음으로 돌아가며, 비활성 항목은 건너뜁니다.
- **맞는 역할.** 하나만 고르면 라디오 그룹이라 화살표가 선택도 함께 옮기고, 여러 개 고르면 툴바라 화살표는 포커스만 옮깁니다.
- **폼.** `name` 을 주면 고른 값마다 FormData 항목이 생기고, `required` 면 고르기 전까지 브라우저가 제출을 막습니다. 폼을 초기화하면 `defaultValue` 로 돌아갑니다.
- **ButtonGroup 과 같은 모양.** 이어 붙인 테두리, `size` 와 `variant` 전파, 오른쪽에서 왼쪽으로 쓰는 화면까지 ButtonGroup 과 같습니다.

```tsx
import { IconToggle, ToggleGroup } from '@gsainfoteam/ids-react';

<ToggleGroup aria-label="정렬" defaultValue="left" onValueChange={setAlign}>
  <IconToggle value="left" icon={<Bars3BottomLeftIcon />} aria-label="왼쪽 정렬" />
  <IconToggle value="center" icon={<Bars3Icon />} aria-label="가운데 정렬" />
  <IconToggle value="right" icon={<Bars3BottomRightIcon />} aria-label="오른쪽 정렬" />
</ToggleGroup>;
```

## 하나만 고르기

```tsx
<ToggleGroup aria-label="보기" defaultValue="list">                  // 비제어
  <Toggle value="list">목록</Toggle>
  <Toggle value="grid">격자</Toggle>
</ToggleGroup>

<ToggleGroup aria-label="보기" value={view} onValueChange={setView}>  // 제어. 값은 string 또는 null
  <Toggle value="list">목록</Toggle>
  <Toggle value="grid">격자</Toggle>
</ToggleGroup>

<ToggleGroup aria-label="크기" required>  {/* 한 번 고르면 선택을 풀 수 없다 */}
  ...
</ToggleGroup>
```

- `selectionMode` 기본값은 `single` 입니다.
- 고른 항목을 다시 누르면 선택이 풀리고 `onValueChange(null)` 이 불립니다. `required` 면 풀리지 않습니다.
- `value={null}` 은 제어 상태로 선택을 비웁니다. `undefined` 는 비제어입니다.

## 여러 개 고르기

```tsx
<ToggleGroup selectionMode="multiple" aria-label="서식" value={marks} onValueChange={setMarks}>
  <IconToggle value="bold" icon={<BoldIcon />} aria-label="굵게" />
  <IconToggle value="italic" icon={<ItalicIcon />} aria-label="기울임" />
  <ToggleGroup.Separator />
  <IconToggle value="strike" icon={<StrikethroughIcon />} aria-label="취소선" />
</ToggleGroup>
```

- 값은 `string[]` 이고 누른 순서가 아니라 항목 순서로 정렬됩니다.

## 키보드

| 키              | 하나만 고르기 (라디오)          | 여러 개 고르기 (툴바)                       |
| --------------- | ------------------------------- | ------------------------------------------- |
| `Tab`           | 선택된 항목으로. 없으면 첫 항목 | 마지막에 있던 항목으로. 처음이면 첫 항목    |
| `→` `↓`         | 다음 항목으로 옮기고 고른다     | 다음 항목으로 옮긴다 (방향에 맞는 화살표만) |
| `←` `↑`         | 이전 항목으로 옮기고 고른다     | 이전 항목으로 옮긴다 (방향에 맞는 화살표만) |
| `Home` `End`    | 처음, 끝 항목으로 옮기고 고른다 | 처음, 끝 항목으로 옮긴다                    |
| `Space` `Enter` | 고르거나 푼다                   | 켜고 끈다                                   |

- 끝에서 처음으로 돌아갑니다. `loop={false}` 면 끝에서 멈춥니다.
- 비활성 항목과, `inert` 나 CSS 로 숨겨져 포커스를 받을 수 없는 항목은 건너뜁니다.
- 오른쪽에서 왼쪽으로 쓰는 화면에서는 `←` 와 `→` 가 바뀝니다.
- `Ctrl`, `Alt`, `⌘`, `Shift` 와 함께 누른 화살표는 그룹이 가로채지 않습니다.

## 폼

```tsx
<form>
  <ToggleGroup aria-label="크기" name="size" required>
    {' '}
    {/* FormData: size=m */}
    <Toggle value="s">S</Toggle>
    <Toggle value="m">M</Toggle>
  </ToggleGroup>
  <ToggleGroup aria-label="토핑" name="toppings" selectionMode="multiple">
    {' '}
    {/* toppings=cheese&toppings=olive */}
    <Toggle value="cheese">치즈</Toggle>
    <Toggle value="olive">올리브</Toggle>
  </ToggleGroup>
</form>
```

- `required` 인데 비어 있으면 브라우저가 제출을 막고, 그 메시지를 그룹에 띄우고, 첫 항목으로 포커스를 옮깁니다.
- `disabled` 그룹은 제출되지 않습니다. `form` 으로 바깥 폼을 가리킬 수 있습니다.

## 모양

```tsx
<ToggleGroup aria-label="정렬" variant="outline" size="tiny">  {/* 안의 토글이 따른다 */}
<ToggleGroup aria-label="보기" orientation="vertical">         {/* 세로. 화살표도 위아래 */}
<ToggleGroup aria-label="정렬" className="w-full">              {/* 넓히면 토글이 폭을 나눠 가진다 */}
<ToggleGroup aria-label="태그" attached={false}>               {/* 붙이지 않고 간격만 둔다 */}
```

## 속성

| 속성                     | 기본 / 동작                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `selectionMode`          | `single`(기본) / `multiple`                                          |
| `value` / `defaultValue` | single: `string` 또는 `null`. multiple: `string[]`                   |
| `onValueChange`          | 값이 바뀔 때. single 은 `string` 또는 `null`, multiple 은 `string[]` |
| `orientation`            | `horizontal`(기본) / `vertical`                                      |
| `loop`                   | `true`. 화살표가 끝에서 처음으로 돌아간다                            |
| `required`               | single 은 선택을 풀 수 없고, 비어 있으면 폼 제출을 막는다            |
| `name` / `form`          | FormData 이름과 대상 폼                                              |
| `disabled`               | 모든 항목과 폼 값을 끈다                                             |
| `size` / `variant`       | 안의 Toggle, IconToggle 이 따른다. 직접 준 값이 이긴다               |
| `attached`               | `true`. `false` 면 간격을 두고 떨어진다                              |
| `ToggleGroup.Separator`  | 선. 라디오 그룹에서는 읽지 않는 장식이다                             |

## 알아둘 것

- 안의 Toggle 에는 `value` 가 필요하고, 그룹이 상태를 가지므로 `pressed` 류 prop 은 쓸 수 없습니다.
- 어느 토글과도 맞지 않는 값, 모드와 맞지 않는 값 모양(single 에 배열), 이름 없는 그룹은 개발 모드에서 콘솔에 경고합니다. 값 모양이 틀리면 single 은 첫 값을, multiple 은 그 문자열 하나를 씁니다.
- 라디오 그룹에서 화살표로 고를 때도 항목의 `onClick` 이 불립니다. 네이티브 라디오와 같습니다.
