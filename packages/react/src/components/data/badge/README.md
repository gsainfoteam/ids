# Badge

아이콘, 버튼, 아바타의 모서리에 붙는 카운트나 상태 점입니다. 글 흐름 안의 라벨은 `Chip` 을 씁니다.

- **위치는 Badge가 잡는다.** 부모에 `relative` 를 줄 필요 없이 감싼 요소의 모서리를 찾아갑니다. 위치 이름은 논리 방향이라 오른쪽에서 왼쪽으로 쓰는 문서에서는 알아서 뒤집힙니다.
- **둥근 대상.** 감싼 요소의 모서리를 재서 그 곡선 위에 붙습니다. 동그란 `Avatar`, 둥근 버튼, 카드 모두 모서리 허공이 아니라 가장자리에 붙습니다.
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
<Badge content={<><CheckIcon />완료</>} />  // 아이콘은 글자 크기에 맞춰 그린다
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

## 위치

```tsx
<Badge placement="top-end" />      // 기본. 오른쪽에서 왼쪽으로 쓰는 문서에서는 왼쪽 위
<Badge placement="top-start" />
<Badge placement="bottom-end" />
<Badge placement="bottom-start" />
```

## 붙는 대상의 모서리를 따라간다

```tsx
<Badge content={3}>                       {/* 원: 모서리에서 14.6% 안쪽 */}
  <Avatar name="Alice Kim" />
</Badge>
<Badge content={3}>                       {/* 10px 모서리의 곡선 위 */}
  <IconButton aria-label="알림" icon={<BellIcon />} />
</Badge>
<Badge content="New">                     {/* 카드의 16px 모서리 */}
  <Card>...</Card>
</Badge>
<Badge content={2}>                       {/* rounded-full 이면 어떤 요소든 원처럼 */}
  <div className="size-10 rounded-full" />
</Badge>
<IdsProvider theme={defineIdsTheme({ primary, cornerShape: 'squircle' })}>
  <Badge content={3}>                     {/* squircle 곡선 위 */}
    <IconButton aria-label="알림" icon={<BellIcon />} />
  </Badge>
</IdsProvider>
```

- Badge는 감싼 요소(첫 자식 요소)에서 `placement` 가 가리키는 모서리 하나의 계산된 `border-radius` 와 `corner-shape` 를 읽고, 배지 중심을 그 곡선의 45도 지점에 둡니다. 원은 반지름의 29.3%(지름의 14.6%), squircle 은 반지름의 15.9% 안쪽입니다.
- 오른쪽에서 왼쪽으로 쓰는 문서에서는 `end` 가 왼쪽이므로 왼쪽 모서리를 읽습니다.
- 각진 요소에서는 꼭짓점에 붙습니다.
- 퍼센트 반지름처럼 크기에 따라 바뀌는 모서리는 `ResizeObserver` 로 다시 잽니다.
- 서버 HTML 과 hydration 전의 첫 그림에서는 꼭짓점에 있다가, hydration 뒤 곡선 위로 옮겨 갑니다.

## 제자리에 그리기

```tsx
<span>
  받은 편지함 <Badge content={12} variant="soft" colorScheme="primary" size="tiny" />
</span>
```

- children이 없으면 모서리에 붙지 않고 글 흐름 안에 그립니다. `{show && <Icon />}` 처럼 `false` 가 남아도 같습니다.

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
<Badge colorScheme="danger" />   // 무언가에 붙으면 기본. 혼자 쓰면 neutral 이 기본
<Badge size="tiny" />            // standard(20px, 기본) / tiny(16px)
```

- `primary` 의 `soft` 는 `bg-primary-soft` 배경에 `text-on-primary-soft` 글자, `outline` 은 `text-primary` 글자입니다. 밝은 테마 색에서도 soft 는 APCA Lc 75, outline 은 Lc 60 을 지킵니다.
- 상태 색의 `soft` 와 `outline` 글자는 `*-strong` 입니다.

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
| `variant`     | `solid`(기본) / `soft` / `outline`                                      |
| `colorScheme` | `danger`(붙은 배지 기본) / `neutral`(혼자 쓰는 배지 기본) / `primary` / `success` / `warning` / `info` |
| `size`        | `standard`(기본) / `tiny`                                               |
| `aria-label`  | 바뀔 때 읽을 문장                                                       |
| 그 외         | 루트 `span` 의 native 속성                                              |

## 알아둘 것

- 배지는 `pointer-events: none` 이라 아래 버튼의 클릭을 가로채지 않습니다.
- 배지 둘레에는 표면색 링이 있어 대상과 겹쳐도 경계가 보입니다.
- 크기는 그대로인 채 모서리만 바뀌면(테마의 `radius` 나 `cornerShape` 를 바꾸는 경우) Badge가 다시 렌더될 때 다시 잽니다.
