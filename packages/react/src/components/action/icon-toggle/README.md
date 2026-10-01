# IconToggle

아이콘 하나로 켜고 끄는 정사각형 토글입니다. 서식 툴바의 굵게, 목록과 격자 전환, 즐겨찾기에 씁니다.

- **이름 자동.** `aria-label` 을 생략하면 IconButton 처럼 아이콘에서 이름을 찾습니다. `<BoldIcon />` 은 "Bold" 가 됩니다.
- **정확한 정사각형.** 켜져도 꺼져도 `standard` 36px, `tiny` 32px 정사각형입니다.
- **Toggle 과 같은 동작.** `pressed`, `defaultPressed`, `onPressedChange`, `variant`, `colorScheme`, `ToggleGroup` 안의 `value` 가 모두 Toggle 과 같습니다.

```tsx
import { IconToggle } from '@gsainfoteam/ids-react';
import { BoldIcon } from '@heroicons/react/16/solid';

<IconToggle icon={<BoldIcon />} aria-label="굵게" />;
```

## 켜진 모양

```tsx
<IconToggle
  aria-label="좋아요" // 켜져도 이름은 그대로
  icon={(state) => (state.pressed ? <HeartIcon /> : <HeartOutlineIcon />)} // 모양만 바꾼다
/>
```

- 이름은 상태에 따라 바꾸지 않습니다. 켜짐 여부는 `aria-pressed` 가 알려 줍니다. 이름을 "좋아요 취소" 로 바꾸면 "좋아요 취소, 눌림" 처럼 이름과 상태가 서로 부딪칩니다.
- `variant` 는 Toggle 과 같습니다. `ghost`(기본)와 `outline` 은 켜지면 옅은 회색, `soft` 와 `solid` 는 테마 색, `glossy` 는 테마 색 채움에 광택입니다.

## 이름

```tsx
<IconToggle icon={<BoldIcon />} aria-label="굵게" />  // 직접 준 이름이 가장 우선
<IconToggle icon={<BoldIcon title="굵게" />} />       // 아이콘의 title, aria-label
<IconToggle icon={<BoldIcon />} />                    // 컴포넌트 이름: "Bold"
```

- 규칙과 주의할 점은 IconButton 과 같습니다. 함수 이름에서 찾은 이름은 production 빌드에서 사라질 수 있으니 배포하는 화면에는 `aria-label` 을 줍니다.

## 속성

| 속성                         | 기본 / 동작                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `icon`                       | 필수. 값 또는 상태를 받는 함수                                 |
| `aria-label`                 | 생략하면 아이콘에서 찾는다                                     |
| `pressed` / `defaultPressed` | 켜짐 여부. 기본 `false`                                        |
| `onPressedChange`            | 켜짐 여부가 바뀔 때                                            |
| `variant`                    | `ghost`(기본) / `outline` / `soft` / `solid` / `glossy`        |
| `size`                       | `standard`(36px, 기본) / `tiny`(32px). 그룹 안에서는 그룹 크기 |
| `value`                      | `ToggleGroup` 안에서 필수                                      |
| 그 외                        | Toggle 과 같다                                                 |

## 알아둘 것

- children 을 넘기면 에러가 납니다. 아이콘은 `icon` 으로 줍니다.
- 글자가 필요한 토글은 Toggle 에 아이콘과 글자를 함께 넣습니다.
