# Badge

아이콘, 버튼, 아바타의 모서리에 붙는 카운트나 상태 점입니다. 붙을 요소 하나를 children 으로 감쌉니다. 글 흐름 안의 라벨, 숫자, 점은 `Chip` 을 씁니다.

- **크기는 감싼 요소를 따른다(hug).** Badge 는 감싼 요소 하나만큼 자리를 차지하고, 배지는 그 위에 떠 있어 자리를 늘리지 않습니다. 폭과 높이는 감싼 요소나 Badge 를 둘러싼 앱 요소가 정합니다.
- **위치는 Badge가 잡는다.** 부모에 `relative` 를 줄 필요 없이 감싼 요소의 모서리를 찾아갑니다. 위치 이름은 논리 방향이라 오른쪽에서 왼쪽으로 쓰는 문서에서는 알아서 뒤집힙니다.
- **둥근 대상.** 감싼 요소의 모서리를 재서 그 곡선 위에 붙습니다. 동그란 `Avatar`, 둥근 버튼, 카드 모두 모서리 허공이 아니라 가장자리에 붙습니다.
- **요소 하나와 Indicator.** children 은 배지가 붙을 요소 하나와 `Badge.Indicator` 하나입니다. 요소가 없거나 둘 이상이면 오류를 던집니다. `{open && <X />}` 처럼 조건으로 비울 수 있는 자리는 Badge 바깥에서 고릅니다.
- **있으면 그린다.** 배지는 `Badge.Indicator` 를 넣을 때만 그립니다. 0일 때 감추려면 Indicator 를 넣지 않습니다. 숨기는 prop 은 없습니다.
- **카운트.** `count` 는 `99+` 로 줄이고, 0도 그대로 `0` 으로 그립니다.
- **읽히는 숫자.** Indicator 에 `aria-label` 을 주면 값이 바뀔 때 그 문장을 읽어 주는 live region이 됩니다. 주지 않으면 붙은 버튼의 설명이 되어 "알림, 버튼, 3" 처럼 읽힙니다.
- **강도와 의미.** 루트의 `variant` 로 강도(`solid` / `soft` / `outline`), `colorScheme` 으로 의미를 고릅니다.

```tsx
import { Badge } from '@gsainfoteam/ids-react';

<Badge>
  <IconButton aria-label="알림" icon={<BellIcon />} />
  {unread > 0 && <Badge.Indicator count={unread} aria-label={`읽지 않은 알림 ${unread}개`} />}
</Badge>;
```

## 카운트

```tsx
<Badge.Indicator count={3} />                // 3
<Badge.Indicator count={120} />              // 99+ (max 기본 99)
<Badge.Indicator count={1200} max={999} />   // 999+
<Badge.Indicator count={0} />                // 0
{count > 0 && <Badge.Indicator count={count} />}   // 0이면 그리지 않는다
<Badge.Indicator>New</Badge.Indicator>       // 숫자가 아니어도 된다
<Badge.Indicator><CheckIcon />완료</Badge.Indicator>  // 아이콘은 글자 크기에 맞춰 그린다
```

- 음수와 소수는 0 이상의 정수로 셉니다.
- 숫자가 `max` 를 넘으면 상태의 `overflowed` 가 `true` 입니다.
- Indicator 가 새로 들어오면 작게 시작해 커지며 나타납니다(`@starting-style`).

## 점

```tsx
<Badge colorScheme={online ? 'success' : 'neutral'} placement="bottom-end">
  <Avatar name="Alice Kim" />
  <Badge.Indicator aria-label={online ? '온라인' : '오프라인'} />
</Badge>
```

- `count` 와 children 이 없는 Indicator 는 점입니다.
- 상태가 바뀌어도 읽어 줘야 하면 Indicator 를 남기고 색을 바꿉니다. Indicator 를 빼면 live region 도 함께 빠집니다.

## 위치

```tsx
<Badge placement="top-end" />      // 기본. 오른쪽에서 왼쪽으로 쓰는 문서에서는 왼쪽 위
<Badge placement="top-start" />
<Badge placement="bottom-end" />
<Badge placement="bottom-start" />
```

## 붙는 대상의 모서리를 따라간다

```tsx
<Badge>                                  {/* 원: 모서리에서 14.6% 안쪽 */}
  <Avatar name="Alice Kim" />
  <Badge.Indicator count={3} />
</Badge>
<Badge>                                  {/* 10px 모서리의 곡선 위 */}
  <IconButton aria-label="알림" icon={<BellIcon />} />
  <Badge.Indicator count={3} />
</Badge>
<Badge>                                  {/* 카드의 16px 모서리 */}
  <Card>...</Card>
  <Badge.Indicator>New</Badge.Indicator>
</Badge>
<Badge>                                  {/* rounded-full 이면 어떤 요소든 원처럼 */}
  <div className="size-10 rounded-full" />
  <Badge.Indicator count={2} />
</Badge>
<IdsProvider theme={defineIdsTheme({ primary, cornerShape: 'squircle' })}>
  <Badge>                                {/* squircle 곡선 위 */}
    <IconButton aria-label="알림" icon={<BellIcon />} />
    <Badge.Indicator count={3} />
  </Badge>
</IdsProvider>
```

- Badge는 감싼 요소에서 `placement` 가 가리키는 모서리 하나의 계산된 `border-radius` 와 `corner-shape` 를 읽고, 배지 중심을 그 곡선의 45도 지점에 둡니다. 원은 반지름의 29.3%(지름의 14.6%), squircle 은 반지름의 15.9% 안쪽입니다. 가로세로 반지름이 다른 타원 모서리는 축마다 따로 들어옵니다.
- 반지름은 CSS 가 그리는 값을 따릅니다. 이웃 모서리 반지름의 합이 변보다 길면 모든 반지름을 같은 비율로 줄입니다. 그래서 `rounded-tl-full` 은 한 변 전체를 반지름으로 씁니다.
- 오른쪽에서 왼쪽으로 쓰는 문서에서는 `end` 가 왼쪽이므로 왼쪽 모서리를 읽습니다.
- 각진 요소에서는 꼭짓점에 붙습니다.
- 퍼센트 반지름처럼 크기에 따라 바뀌는 모서리는 `ResizeObserver` 로 다시 잽니다. observer 는 감싼 요소가 바뀔 때만 새로 만들고, 렌더마다 하는 일은 모서리를 한 번 다시 재는 것뿐입니다.
- 서버 HTML 과 hydration 전의 첫 그림에서는 꼭짓점에 있다가, hydration 뒤 곡선 위로 옮겨 갑니다.

## 접근성

```tsx
<Badge.Indicator count={3} aria-label="읽지 않은 알림 3개" />  // live region이 문장을 읽는다
<Badge>                                                       // 버튼의 설명: "알림, 버튼, 3"
  <IconButton aria-label="알림" icon={<BellIcon />} />
  <Badge.Indicator count={3} />
</Badge>
<Badge.Indicator />                                           // 점. 장식이라 읽지 않는다
```

- `aria-label` 이 있으면 `role="status"` 안에 그 문장을 숨겨 두고, 보이는 숫자는 읽지 않습니다. 숫자만 바뀌어도 문장 전체를 읽습니다.
- `aria-label` 이 없으면 숫자가 감싼 요소의 `aria-describedby` 에 이어집니다. 감싼 요소에 원래 있던 `aria-describedby` 는 유지됩니다.

## variant와 색

```tsx
<Badge variant="solid">...</Badge>     // 기본. 채운 배경
<Badge variant="soft">...</Badge>      // 옅은 배경. 겹쳐 놓여도 뒤가 비치지 않는다
<Badge variant="outline">...</Badge>   // 테두리
<Badge colorScheme="danger">...</Badge>   // 기본
<Badge size="tiny">...</Badge>            // standard(20px, 기본) / tiny(16px)
```

- `primary` 의 `soft` 는 `bg-primary-soft` 배경에 `text-on-primary-soft` 글자, `outline` 은 `text-primary` 글자입니다. 밝은 테마 색에서도 soft 는 APCA Lc 75, outline 은 Lc 60 을 지킵니다.
- 상태 색의 `soft` 와 `outline` 글자는 `*-strong` 입니다.

## 상태

앱이 실행 중에 배지 상태를 읽는 길은 앱이 넘긴 prop 과 상태 함수입니다.

- 위치와 값은 앱이 넘긴 `placement`, Indicator 의 `count`, `max`, children 그대로입니다. 배지가 보이는지는 Indicator 를 넣었는지입니다.
- 루트의 `className`, `style` 은 `{ count, dot, overflowed }` 를 받는 함수가 될 수 있습니다.

| 상태         | 뜻                                          |
| ------------ | ------------------------------------------- |
| `count`      | Indicator 의 `count` 를 센 값               |
| `dot`        | Indicator 에 `count` 도 children 도 없다    |
| `overflowed` | 숫자가 `max` 를 넘었다                      |

## 속성

| 속성          | 기본 / 동작                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `children`    | 배지가 붙을 요소 하나와 `Badge.Indicator`                               |
| `placement`   | `top-end`(기본) / `top-start` / `bottom-end` / `bottom-start`           |
| `variant`     | `solid`(기본) / `soft` / `outline`                                      |
| `colorScheme` | `danger`(기본) / `neutral` / `primary` / `secondary` / `tertiary` / `success` / `warning` / `info` |
| `size`        | `standard`(기본) / `tiny`                                               |
| 그 외         | 루트 `span` 의 native 속성                                              |

| 파트              | 속성                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `Badge.Indicator` | `count`(숫자), `max`(기본 `99`), children(숫자가 아닌 글), `aria-label`(바뀔 때 읽을 문장). `count` 와 children 이 없으면 점 |

- `Badge.Indicator` 는 `<Badge>` 안에서만 씁니다. 밖에 두면 오류입니다.

## 알아둘 것

- 배지는 `pointer-events: none` 이라 아래 버튼의 클릭을 가로채지 않습니다.
- 배지 둘레에는 표면색 링이 있어 대상과 겹쳐도 경계가 보입니다.
- 크기는 그대로인 채 모서리만 바뀌면(테마의 `radius` 나 `cornerShape` 를 바꾸는 경우) Badge가 다시 렌더될 때 다시 잽니다. Badge 가 다시 렌더되지 않으면 이전 값이 남습니다.
