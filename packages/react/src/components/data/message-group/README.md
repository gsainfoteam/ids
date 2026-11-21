# MessageGroup

같은 사람이 이어 보낸 [Message](../message/README.md) 를 한 덩어리로 묶습니다. Message 의 일부가 아니라 여러 Message 를 담는 그릇이라, `Message.Group` 이 아닌 별도 컴포넌트입니다.

- **처음과 끝.** 첫 메시지만 아바타와 이름을, 마지막 메시지만 시간을 보입니다.
- **이어지는 말풍선.** 첫 메시지가 아닌 말풍선은 꼬리 쪽 위 모서리를 줄여 한 덩어리로 보입니다.
- **방향.** `align` 을 안의 Message 에 줍니다.
- **시멘틱 구성.** `<div role="group">` 입니다. 이름은 `aria-label` 로 줍니다.

```tsx
import { Bubble, Message, MessageGroup } from '@gsainfoteam/ids-react';

<MessageGroup align="start" aria-label="김지수의 메시지">
  <Message name="김지수" avatar={src} time={t1}>학식 메뉴 알려 줘</Message>  {/* 아바타, 이름 */}
  <Message name="김지수" avatar={src} time={t2}>오늘 거</Message>           {/* 아바타 자리만, 이름은 스크린 리더에만 */}
  <Message name="김지수" avatar={src} time={t3}>2학생회관 기준으로</Message>  {/* 말풍선 옆에 시간 */}
</MessageGroup>

<MessageGroup align="end" aria-label="내 메시지">
  <Message time={t4} unread={2}><Bubble align="end" variant="solid">돈가스랑 우동이야</Bubble></Message>
  <Message time={t4} unread={2}><Bubble align="end" variant="solid">같이 갈래?</Bubble></Message>
</MessageGroup>
```

| Property | Type                 | Default |
| -------- | -------------------- | ------- |
| `align`  | `'start' \| 'end'`   | -       |

`<div>` 의 나머지 속성은 루트로 갑니다.

## 처음과 끝

- 안의 Message 에도 `name` 과 `avatar` 를 모두 줍니다. 첫 메시지가 아닌 메시지는 아바타를 `invisible` 로 그려 자리를 맞추고, 머리를 `sr-only` 로 숨겨 이름을 남깁니다.
- 시간은 마지막 메시지만 그립니다. 말풍선이 없는 메시지라면 마지막 메시지에 시간을 그리는 아래 줄을 저절로 둡니다.
- 첫 메시지가 아닌 말풍선은 꼬리 쪽 위 모서리를 `indicator`(4px)로 줄입니다. 꼬리 쪽 아래 모서리는 원래 4px 이라 이어지는 말풍선이 한 덩어리로 보입니다.
- Message 에는 묶음 안이면 `data-first`, `data-last` 가 붙습니다.

## 방향

- `align` 을 안의 Message 에 줍니다. Message 에 직접 준 `align` 이 이깁니다.
- `shape="plain"` 인 Message 는 묶음의 `align` 을 따르지 않고 늘 `start` 입니다.

## 알아둘 것

- 자식 순서로 처음과 끝을 정합니다. Fragment 는 펼쳐 셉니다. 글자나 `null` 같은 요소 아닌 자식은 세지 않습니다.
- 메시지 사이 간격은 4px 입니다. 묶음끼리의 간격과 목록, 새 메시지 알림은 MessageScroller 가 맡습니다.
- 메시지 안에 둔 Message(인용 등)는 바깥 묶음의 위치를 물려받지 않습니다.
- 한국어는 바깥 요소에 `break-keep` 을 줍니다.
