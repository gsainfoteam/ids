# Chip

상태, 카테고리, 태그, 필터처럼 글 흐름 안에 놓이는 작은 라벨입니다. 모서리에 붙는 카운트나 점은 `Badge` 를 씁니다.

- **하는 일에 맞는 요소.** 그냥 라벨은 `span`, 누르거나 켜고 끄는 칩은 진짜 `<button>` 입니다. 켜고 끄는 칩은 `aria-pressed` 로 상태를 알립니다.
- **지우기.** `onRemove` 만 주면 끝에 삭제 버튼이 붙고, 그 이름은 "frontend 삭제" 처럼 칩의 글과 이어집니다.
- **키보드로 지우기.** 포커스된 칩이나 삭제 버튼에서 `Backspace` 나 `Delete` 를 누르면 지워지고, 포커스는 옆 칩으로 옮겨 갑니다.
- **버튼 속 버튼 없이.** 켜고 끄면서 지울 수도 있는 칩은 X를 마우스 전용으로 그리고 키보드는 `Backspace` 로 지웁니다. X를 눌러도 토글되지 않습니다.
- **강도와 의미.** `variant` 로 강도(`solid` / `soft` / `outline`), `colorScheme` 으로 의미를 고릅니다.

```tsx
import { Chip } from '@gsainfoteam/ids-react';

<Chip>Beta</Chip>
<Chip variant="solid" colorScheme="danger">Failed</Chip>
<Chip onRemove={() => removeTag('react')}>react</Chip>
```

## 켜고 끄기

```tsx
<Chip selected={following} onSelectedChange={setFollowing}>팔로우</Chip>   {/* 제어 */}
<Chip defaultSelected>알림</Chip>                                             {/* 비제어 */}
<Chip onClick={openFilter}>필터</Chip>                                         {/* 토글이 아닌 버튼 */}
```

- 켜진 칩은 `colorScheme` 의 진한 색으로 채워지고 `data-selected` 가 붙습니다.
- `selected` 만 주고 `onSelectedChange` 가 없으면 눌러도 바뀌지 않습니다.

## 지우기

```tsx
<ul>
  {tags.map((tag) => (
    <li key={tag}>
      <Chip onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}>{tag}</Chip>
    </li>
  ))}
</ul>

<Chip onRemove={detach}>
  첨부 파일
  <Chip.Close aria-label="첨부 파일 지우기">   {/* 이름과 모양을 직접 */}
    <TrashIcon />
  </Chip.Close>
</Chip>
```

| 키                     | 동작                                 |
| ---------------------- | ------------------------------------ |
| `Tab`                  | 칩의 삭제 버튼, 또는 누를 수 있는 칩 |
| `Enter` / `Space`      | 누르기. 삭제 버튼이면 지우기         |
| `Backspace` / `Delete` | 포커스된 칩 지우기                   |

- 지운 뒤 포커스는 다음 칩, 마지막 칩이었다면 앞 칩으로 갑니다. 칩이 실제로 사라졌을 때만 옮깁니다.
- 실제로 목록에서 빼는 일은 `onRemove` 를 받은 쪽이 합니다.
- `Chip.Close` 는 칩의 `colorScheme` 을 받은 ghost `IconButton` 입니다. 모양은 칩 글자색의 작은 원이고, 포커스 링과 hover 는 IconButton 과 같습니다.
- `onRemove` 는 지우기를 부른 클릭이나 키 이벤트를 받습니다. `event.preventDefault()` 하면 칩은 포커스를 옮기지 않으니, 태그 입력창처럼 포커스를 직접 보낼 때 씁니다.

```tsx
<Chip
  onRemove={(event) => {
    event.preventDefault(); // 옆 칩 대신
    removeTag('react');
    inputRef.current?.focus(); // 입력창으로
  }}
>
  react
</Chip>
```

## 구성

```tsx
<Chip colorScheme="success">
  <Chip.Icon><CheckIcon /></Chip.Icon>   {/* 앞 아이콘. 스크린 리더는 읽지 않는다 */}
  <Chip.Label>완료</Chip.Label>          {/* 글자만 쓰면 알아서 Label이 된다 */}
</Chip>

<Chip asChild>
  <a href="/tags/react">react</a>        {/* 링크 칩 */}
</Chip>
```

- 긴 글은 한 줄에서 말줄임표로 줄어듭니다. 폭은 `className="max-w-32"` 처럼 정합니다.

## variant와 색

```tsx
<Chip variant="soft" />       // 기본. 옅은 배경
<Chip variant="solid" />      // 진한 배경
<Chip variant="outline" />    // 테두리
<Chip colorScheme="neutral" /> // 기본. primary / success / warning / danger / info
<Chip size="tiny" />          // standard(22px, 기본) / tiny(18px)
<Chip disabled />             // 누를 수도, 지울 수도 없다
```

## 상태와 data 속성

| 속성                                                          | 뜻                       |
| ------------------------------------------------------------- | ------------------------ |
| `data-chip`, `data-variant`, `data-color-scheme`, `data-size` | 루트                     |
| `data-selected`                                               | 켜짐                     |
| `data-removable`                                              | 지울 수 있음             |
| `data-interactive`                                            | 누르거나 켜고 끌 수 있음 |
| `data-disabled`                                               | 비활성                   |
| `data-hovered`, `data-active`, `data-focus-visible`           | 인터랙션 상태            |

`className`, `style`, `children` 은 `{ selected, removable, interactive, hovered, ... }` 를 받는 함수가 될 수 있습니다.

## 속성

| 속성                                                | 기본 / 동작                                                             |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `selected` / `defaultSelected` / `onSelectedChange` | 켜고 끄기                                                               |
| `onClick`                                           | 토글이 아닌 버튼                                                        |
| `onRemove`                                          | 지우기. 기본 삭제 버튼이 붙고, 지우기를 부른 이벤트를 받는다            |
| `variant`                                           | `soft`(기본) / `solid` / `outline`                                      |
| `colorScheme`                                       | `neutral`(기본) / `primary` / `success` / `warning` / `danger` / `info` |
| `size`                                              | `standard`(기본) / `tiny`                                               |
| `disabled`                                          | 비활성                                                                  |
| `asChild`                                           | 루트 대신 자식 요소에 속성을 합친다                                     |
| `Chip.Close`                                        | 삭제 버튼. 기본 `aria-label` 은 "삭제"                                  |

## 알아둘 것

- 삭제 버튼의 기본 글리프는 `@heroicons/react` 의 `XMarkIcon` 입니다. `Chip.Close` 의 children으로 바꿉니다.
- 누를 수 있는 칩 안의 X는 `aria-hidden` 입니다. 키보드와 스크린 리더 사용자는 `Backspace` 나 `Delete` 로 지웁니다.
