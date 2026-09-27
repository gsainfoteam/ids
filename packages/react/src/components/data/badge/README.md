# Badge

아이콘, 버튼, 아바타의 모서리에 붙는 카운트나 상태 점입니다. 글 흐름 안의 라벨은 `Chip` 을 씁니다.

- **위치는 Badge가 잡는다.** 부모에 `relative` 를 줄 필요 없이 감싼 요소의 모서리를 찾아갑니다. 위치 이름은 논리 방향이라 오른쪽에서 왼쪽으로 쓰는 문서에서는 알아서 뒤집힙니다.
- **둥근 대상.** 동그란 `Avatar` 에 붙이면 모서리 허공이 아니라 원의 가장자리에 붙습니다.
- **카운트.** `99+` 로 줄이고, 0은 숨깁니다. 숨은 배지도 자리를 지켜서 다시 나타날 때 커지며 나타납니다.
- **읽히는 숫자.** `aria-label` 을 주면 값이 바뀔 때 그 문장을 읽어 주는 live region이 됩니다. 주지 않으면 붙은 버튼의 설명이 되어 "알림, 버튼, 3" 처럼 읽힙니다.
- **강도와 의미.** `variant` 로 강도(`solid` / `soft` / `outline`), `colorScheme` 으로 의미를 고릅니다.

```tsx
import { Badge } from '@gsainfoteam/ids-react';

<Badge content={unread} aria-label={`읽지 않은 알림 ${unread}개`}>
  <IconButton aria-label="알림" icon={<BellIcon />} />
</Badge>;
```

## 카운트

```tsx
<Badge content={3}>...</Badge>                // 3
<Badge content={120}>...</Badge>              // 99+ (max 기본 99)
<Badge content={1200} max={999}>...</Badge>   // 999+
<Badge content={0}>...</Badge>                // 숨는다
<Badge content={0} showZero>...</Badge>       // 0
<Badge content="New">...</Badge>              // 숫자가 아니어도 된다
```

- 음수와 소수는 0 이상의 정수로 셉니다.
- 숫자가 `max` 를 넘으면 `data-overflow` 가 붙습니다.

## 점

```tsx
<Badge dot colorScheme="success" placement="bottom-end" aria-label="온라인">
  <Avatar name="Alice Kim" />
</Badge>

<Badge dot invisible={!online} aria-label={online ? '온라인' : '오프라인'}>
  <Avatar name="Alice Kim" />
</Badge>
```

- `invisible` 은 배지를 지우지 않고 줄여서 감춥니다. live region은 남아 있어 바뀐 상태를 읽습니다.

## 위치와 모양

```tsx
<Badge placement="top-end" />      // 기본. 오른쪽에서 왼쪽으로 쓰는 문서에서는 왼쪽 위
<Badge placement="top-start" />
<Badge placement="bottom-end" />
<Badge placement="bottom-start" />

<Badge shape="circular">           {/* 둥근 대상. Avatar는 생략해도 된다 */}
  <div className="size-10 rounded-full" />
</Badge>
<Badge shape="rectangular">        {/* 둥근 Avatar라도 사각형 모서리에 */}
  <Avatar name="Alice Kim" />
</Badge>
```

- 원 위의 45도 지점은 사각형 모서리에서 14.6% 안쪽이라 그만큼 당겨 붙습니다.

## 제자리에 그리기

```tsx
<span>
  받은 편지함 <Badge content={12} variant="soft" colorScheme="primary" size="tiny" />
</span>
```

- children이 없으면 모서리에 붙지 않고 글 흐름 안에 그립니다.

## 접근성

```tsx
<Badge content={3} aria-label="읽지 않은 알림 3개">...</Badge>  // live region이 문장을 읽는다
<Badge content={3}>                                           // 버튼의 설명: "알림, 버튼, 3"
  <IconButton aria-label="알림" icon={<BellIcon />} />
</Badge>
<Badge dot>...</Badge>                                        // 장식. 읽지 않는다
```

- `aria-label` 이 있으면 `role="status"` 안에 그 문장을 숨겨 두고, 보이는 숫자는 읽지 않습니다. 숫자만 바뀌어도 문장 전체를 읽습니다.
- `aria-label` 이 없으면 숫자가 감싼 요소의 `aria-describedby` 에 이어집니다. 감싼 요소에 원래 있던 `aria-describedby` 는 유지됩니다.

## variant와 색

```tsx
<Badge variant="solid" />     // 기본. 채운 배경
<Badge variant="soft" />      // 옅은 배경. 겹쳐 놓여도 뒤가 비치지 않는다
<Badge variant="outline" />   // 테두리
<Badge colorScheme="danger" />   // 기본. neutral / primary / success / warning / info
<Badge size="tiny" />            // standard(20px, 기본) / tiny(16px)
```

## 상태와 data 속성

| 속성             | 붙는 곳 | 뜻                                |
| ---------------- | ------- | --------------------------------- |
| `data-badge`     | 루트    | Badge                             |
| `data-placement` | 루트    | 위치                              |
| `data-invisible` | 배지    | 0이거나 `invisible` 이라 감춰졌다 |
| `data-overflow`  | 배지    | 숫자가 `max` 를 넘었다            |
| `data-dot`       | 배지    | 점                                |

`className`, `style` 은 `{ count, dot, invisible, overflowed }` 를 받는 함수가 될 수 있습니다.

## 속성

| 속성          | 기본 / 동작                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `content`     | 숫자면 카운트, 그 밖에는 그대로 그린다                                  |
| `dot`         | 글자 없는 점                                                            |
| `max`         | 기본 `99`                                                               |
| `showZero`    | 0도 보인다                                                              |
| `invisible`   | 지우지 않고 감춘다                                                      |
| `placement`   | `top-end`(기본) / `top-start` / `bottom-end` / `bottom-start`           |
| `shape`       | `rectangular` / `circular`. 생략하면 Avatar를 보고 정한다               |
| `variant`     | `solid`(기본) / `soft` / `outline`                                      |
| `colorScheme` | `danger`(기본) / `neutral` / `primary` / `success` / `warning` / `info` |
| `size`        | `standard`(기본) / `tiny`                                               |
| `aria-label`  | 바뀔 때 읽을 문장                                                       |
| 그 외         | 루트 `span` 의 native 속성                                              |

## 알아둘 것

- 배지는 `pointer-events: none` 이라 아래 버튼의 클릭을 가로채지 않습니다.
- 배지 둘레에는 표면색 링이 있어 대상과 겹쳐도 경계가 보입니다.
