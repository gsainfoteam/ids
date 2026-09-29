# Toggle

눌린 상태를 유지하는 버튼입니다. 서식 툴바의 굵게, 보기 전환, 사이드바 열기처럼 켜고 끄는 명령에 씁니다.

- **꺼지면 조용하게.** 꺼진 토글은 배경이 없고, 켜지면 hover 보다 한 단계 진한 회색으로 채워져 hover 와 구별됩니다. 테마 색으로 강조하려면 `soft` 나 `solid` 를 고릅니다.
- **상태가 DOM 에.** `aria-pressed` 로 스크린 리더에 알리고, 같은 상태가 `data-pressed` 로 붙어 CSS 만으로 꾸밀 수 있습니다.
- **제어와 비제어.** `defaultPressed` 로 두거나 `pressed` 와 `onPressedChange` 로 제어합니다.
- **취소할 수 있는 클릭.** `onClick` 이 먼저 돌고, 거기서 `preventDefault` 하면 상태가 바뀌지 않습니다.
- **Button 과 같은 기반.** `asChild`, `focusableWhenDisabled`, 상태 함수 prop, `colorScheme`, 그룹 크기를 Button 과 같게 받습니다.

```tsx
import { Toggle } from '@gsainfoteam/ids-react';

<Toggle defaultPressed>굵게</Toggle>;
```

## 상태

```tsx
<Toggle defaultPressed>굵게</Toggle>                             // 비제어

<Toggle pressed={bold} onPressedChange={setBold}>굵게</Toggle>   // 제어

<Toggle
  onClick={(event) => {
    if (!confirm('알림을 끌까요?')) event.preventDefault();  // 상태를 그대로 둔다
  }}
>
  알림 끄기
</Toggle>
```

- `onPressedChange(pressed)` 는 새 상태를 받습니다.
- `pressed` 를 주고 `onPressedChange` 를 빼면 토글이 움직이지 않습니다. 개발 모드에서 콘솔에 경고합니다. `pressed` 와 `defaultPressed` 를 함께 줘도 경고합니다.

## variant

```tsx
<Toggle variant="ghost">굵게</Toggle>    // 기본. 켜지면 옅은 회색
<Toggle variant="outline">굵게</Toggle>  // 테두리. 켜지면 옅은 회색
<Toggle variant="soft">굵게</Toggle>     // 켜지면 옅은 테마 색
<Toggle variant="solid">굵게</Toggle>    // 켜지면 테마 색으로 채움
```

- 꺼진 모습은 모두 같고 `outline` 만 테두리가 있습니다. variant 는 켜진 모습의 강도입니다.
- `colorScheme` 을 주면 `soft` 와 `solid` 가 그 색으로 켜지고, 상태 색에서는 꺼진 글자도 그 색입니다.

## 아이콘

```tsx
<Toggle>
  <BoldIcon />   {/* 크기를 주지 않은 아이콘은 standard 16px, tiny 14px */}
  굵게
</Toggle>

<Toggle aria-label="굵게">
  <BoldIcon />   {/* 아이콘만 있어도 최소 너비가 높이와 같아 정사각형이 된다 */}
</Toggle>
```

- 아이콘 하나만 쓸 때는 `IconToggle` 이 이름을 아이콘에서 찾아 줍니다.

## 상태 함수

```tsx
<Toggle>{(state) => (state.pressed ? '켜짐' : '꺼짐')}</Toggle>
```

| 상태           | data 속성            | 뜻                   |
| -------------- | -------------------- | -------------------- |
| `pressed`      | `data-pressed`       | 켜져 있다            |
| `hovered`      | `data-hovered`       | 마우스가 올라가 있다 |
| `active`       | `data-active`        | 누르고 있다          |
| `focusVisible` | `data-focus-visible` | 키보드로 포커스했다  |
| `disabled`     | `data-disabled`      | 비활성               |

- 켜진 토글에는 `data-hovered` 와 `data-active` 가 붙지 않습니다. 켜진 배경이 hover 배경과 다투지 않게 하기 위해서입니다.
- 루트에는 `data-variant`, `data-size` 가 붙고, `ToggleGroup` 안에서는 `data-value` 도 붙습니다.

## 키보드

| 키               | 동작             |
| ---------------- | ---------------- |
| `Space`, `Enter` | 켜고 끈다        |
| `Tab`            | 다음 요소로 간다 |

## 속성

| 속성                           | 기본 / 동작                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| `pressed` / `defaultPressed`   | 켜짐 여부. 기본 `false`                                                 |
| `onPressedChange`              | 켜짐 여부가 바뀔 때                                                     |
| `variant`                      | `ghost`(기본) / `outline` / `soft` / `solid`                            |
| `colorScheme`                  | `primary`(기본) / `neutral` / `danger` / `success` / `warning` / `info` |
| `size`                         | `standard`(36px, 기본) / `tiny`(32px). 그룹 안에서는 그룹 크기          |
| `value`                        | `ToggleGroup` 안에서 필수                                               |
| `asChild`                      | 자식 요소 하나를 토글로 그린다                                          |
| `focusableWhenDisabled`        | 비활성이어도 포커스와 탭 순서를 지킨다                                  |
| `className` `style` `children` | 값, 또는 상태를 받는 함수                                               |

## 알아둘 것

- 토글은 상태만 바꿉니다. 켜짐에 따라 무언가 일어나야 하면 `onPressedChange` 에서 처리합니다.
- 폼 값을 받는 두 상태 입력이면 `Switch` 나 `Checkbox` 를 씁니다. 토글은 명령입니다.
- `ToggleGroup` 안에서는 그룹이 상태를 가지므로 `pressed`, `defaultPressed`, `onPressedChange` 를 쓸 수 없고 `value` 가 필요합니다. 어기면 에러가 납니다.
