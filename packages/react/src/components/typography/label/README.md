# Label

폼 컨트롤의 이름표입니다. native `<label>` 그대로 쓰면서, 브라우저가 하지 않는 일을 채웁니다. `Field` 안에서는 `Field.Label` 을 씁니다.

- **어떤 컨트롤이든.** `input` 과 `button` 은 브라우저가 연결하고, `role="slider"` 처럼 브라우저가 라벨로 인식하지 않는 위젯은 Label이 `aria-labelledby` 로 이름을 붙이고 클릭하면 포커스를 옮깁니다.
- **컨트롤을 따라갑니다.** 연결된 컨트롤이 `disabled` 면 흐려지고, `required` 면 `*` 가 붙습니다. 나중에 바뀌어도 바로 따라갑니다.
- **감싸기와 htmlFor.** 컨트롤을 감싸면 htmlFor 없이 연결되고, 떨어져 있으면 `htmlFor` 와 `id` 로 연결합니다.
- **두 번 눌러도 선택되지 않습니다.** 라벨을 빠르게 누를 때 글자가 선택되지 않습니다.

```tsx
import { Label, TextField } from '@gsainfoteam/ids-react';

<Label htmlFor="email">이메일</Label>
<TextField id="email" type="email" required />   {/* 라벨에 * 가 붙는다 */}
```

## 연결

```tsx
<Label htmlFor="email">이메일</Label>          // 떨어진 위치
<TextField id="email" />

<Label>                                        // 감싸기
  <Checkbox />
  알림 받기
</Label>

<Label htmlFor="volume">볼륨</Label>           // role="slider" 위젯도
<Slider id="volume" />
```

- 커스텀 위젯에는 이미 `aria-label` 이나 `aria-labelledby` 가 있으면 건드리지 않습니다. 라벨이 사라지면 붙였던 속성도 뗍니다.
- `role="checkbox"`, `"switch"`, `"radio"` 위젯은 라벨을 누르면 native 라벨처럼 토글됩니다.

## 필수, 비활성, 오류

```tsx
<Label htmlFor="name">이름</Label>
<TextField id="name" required />      {/* 자동으로 * */}

<Label required>이름</Label>           // 직접 표시
<Label required={false}>이름</Label>   // 컨트롤이 required여도 * 없이

<Label disabled>이름</Label>           // 직접 흐리게

<Label aria-invalid>이름</Label>       // danger 색
```

- `*` 는 `aria-hidden` 입니다. 필수라는 사실은 컨트롤의 `required` 가 스크린 리더에 전합니다. 컨트롤에도 `required` 를 주세요.
- 컨트롤의 `disabled`, `aria-disabled="true"`, `data-disabled` 를 비활성으로, `required`, `aria-required="true"` 를 필수로 읽습니다.
- 오류 색은 라벨에 직접 준 `aria-invalid` 로만 켜집니다. 오류인 그룹 안 선택지의 라벨까지 붉어지지 않도록 컨트롤의 `aria-invalid` 는 따르지 않습니다.
- 라벨의 `aria-invalid` 는 색만 바꾸고 `<label>` 요소에는 쓰지 않습니다. ARIA 1.2 에서 `aria-invalid` 는 라벨이 아니라 컨트롤의 속성이고, 오류는 컨트롤의 `aria-invalid` 가 스크린 리더에 전합니다.
- 비활성일 때 라벨을 눌러도 커스텀 위젯으로 포커스를 옮기지 않습니다.

## 크기

```tsx
<Label size="standard" />   // 14px medium (기본)
<Label size="tiny" />       // 12px medium
```

- 글자(와 감싼 컨트롤)만큼만 차지하는 `inline-flex` 입니다. 컨트롤 위에 줄로 놓으려면 부모가 `flex flex-col` 로 쌓습니다.

## asChild

```tsx
<Label asChild htmlFor="volume">
  <span>볼륨</span>          {/* span 이 라벨이 된다 */}
</Label>
<Slider id="volume" />
```

- 자식이 가진 `id` 와 `htmlFor` 를 라벨의 것으로 씁니다. 필수 `*` 는 자식 안 끝에 붙습니다.
- `label` 이 아닌 요소도 컨트롤의 이름이 되고, 누르면 컨트롤로 포커스가 갑니다.

## 상태

- 앱이 상태를 읽는 길은 `className` / `style` 에 주는 함수 하나입니다. 함수는 아래 필드를 받습니다. 새 디자인을 입힐 때만 씁니다.

| 필드       | 뜻                            |
| ---------- | ----------------------------- |
| `disabled` | 비활성이다 (직접 또는 컨트롤) |
| `required` | 필수다 (직접 또는 컨트롤)     |
| `invalid`  | 오류다 (직접 준 `aria-invalid`) |

## 속성

| 속성                  | 기본 / 동작                                        |
| --------------------- | -------------------------------------------------- |
| `htmlFor`             | 연결할 컨트롤의 `id`                               |
| `required`            | 생략하면 컨트롤을 따른다. `true` / `false` 로 고정 |
| `disabled`            | 생략하면 컨트롤을 따른다. `true` / `false` 로 고정 |
| `aria-invalid`        | `true` 면 danger 색. 요소에는 쓰지 않는다          |
| `size`                | `standard`(기본) / `tiny`                          |
| `asChild`             | 자식 요소 하나를 라벨로 그린다                     |
| `id`                  | 생략하면 만들어 붙인다                             |
| `className` / `style` | 상태를 받는 함수도 된다                            |
| 그 외 속성            | `<label>` 로, `asChild` 면 자식 요소로 간다        |

## 알아둘 것

- `Field` 안에 Label을 두면 개발 모드에서 `Field.Label` 을 쓰라는 경고가 나옵니다.
- 어떤 컨트롤과도 연결되지 않으면 개발 모드에서 경고가 나옵니다.
- 라벨 안에 링크나 다른 버튼을 넣지 마세요. 라벨을 누르는 동작과 겹칩니다.
