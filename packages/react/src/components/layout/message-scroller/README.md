# MessageScroller

채팅과 AI 대화의 메시지 목록을 스크롤합니다. 맨 아래에 있으면 새 메시지를 따라가고, 위로 올려 읽는 동안에는 멈춥니다.

- **맨 아래를 따라간다.** 맨 아래에 있으면 새 메시지가 붙거나 메시지가 자라도 맨 아래에 남습니다.
- **읽는 중에는 멈춘다.** 위로 스크롤하거나, 휠을 위로 돌리거나, PageUp·Home·위 화살표를 누르거나, 손가락으로 목록을 내리거나, 글자를 고르면 따라가지 않습니다. 맨 아래로 다시 내리면 따라갑니다.
- **AI 대화는 질문을 위에.** `scrollOnAppend="start"` 면 새로 붙은 자식을 위쪽에 맞추고 답이 그 아래로 자랍니다.
- **앞 기록을 불러와도 제자리.** 위에 메시지가 붙거나 위쪽 메시지의 크기가 바뀌어도 읽던 메시지는 그 자리에 있습니다.
- **아래로 가기 버튼.** 맨 아래가 아니면 스크롤 영역 아래 가운데에 작은 버튼이 뜨고, 읽는 동안 온 메시지 수를 보여 줍니다.
- **시멘틱 구성.** 스크롤 영역이 `role="log"` 이고 그 안이 `<ol>`, 자식마다 `<li>` 입니다. 스크롤은 `ScrollArea` 위에서 합니다.

```tsx
import { Bubble, MessageScroller } from '@gsainfoteam/ids-react';

<MessageScroller className="h-96">
  {messages.map((message) => (
    <Bubble
      key={message.id}
      align={message.mine ? 'end' : 'start'}
      variant={message.mine ? 'solid' : 'soft'}
      className={message.mine ? 'self-end' : 'self-start'}
    >
      {message.text}
    </Bubble>
  ))}
</MessageScroller>;
```

## 새 메시지가 붙을 때

```tsx
<MessageScroller />                          // scrollOnAppend="end" (기본). 맨 아래에 붙어 따라간다
<MessageScroller scrollOnAppend="start" />   // 새로 붙은 첫 자식을 위쪽에 맞춘다. AI 대화
<MessageScroller stickToBottom={false} />    // 맨 아래에 있어도 따라가지 않는다
```

- `end` 는 맨 아래에 있을 때만 따라갑니다. 위로 올려 둔 동안 붙은 자식 수는 아래로 가기 버튼에 셉니다.
- `start` 는 한 번에 붙은 자식 중 첫 자식의 위쪽을 목록 첫 자식이 서는 자리(목록의 위 padding)에 맞춥니다. 위로 올려 읽는 중이어도 맞춥니다.
- `start` 에서 맞춘 자식이 짧으면 목록에 `min-height` 를 주어 그 자식이 위쪽에 설 만큼 자리를 둡니다. 답이 자라면 그 자리를 채웁니다.
- `start` 에서 답이 화면을 넘겨도 따라 내려가지 않습니다. 맨 아래로 내리면 그때부터 따라갑니다.
- MessageScroller 는 자식이 어떤 컴포넌트인지 보지 않습니다. `start` 에서는 질문과 그 답을 한 자식(한 차례)으로 묶어 넘깁니다. 답을 따로 넘기면 답도 위쪽에 맞춰져 질문이 위로 밀려납니다.
- 처음 그릴 때는 두 값 모두 맨 아래에서 시작합니다.

## 따라가기를 푸는 것

| 입력                                   | 동작                                 |
| -------------------------------------- | ------------------------------------ |
| 위로 스크롤 (막대 끌기, 찾기, 스크립트 포함) | 맨 아래에서 벗어나면 푼다          |
| 휠을 위로                              | 스크롤이 일어나기 전에 푼다          |
| `PageUp`, `Home`, `ArrowUp` (수정키 포함) | 브라우저가 스크롤하기 전에 푼다   |
| 손가락으로 목록을 아래로 끌기           | 푼다                                 |
| 목록 안의 글자 고르기 (`selectionchange`) | 맨 아래에 있어도 푼다              |
| 맨 아래로 다시 스크롤, 아래로 가기 버튼  | 다시 따라간다 (`stickToBottom` 일 때) |

- 맨 아래로 보는 거리는 8px 입니다. 그 안에서 위로 조금 움직인 것은 맨 아래로 봅니다.
- MessageScroller 가 직접 옮긴 스크롤(따라가기, 자리 지키기, 위쪽 맞추기)은 사용자 입력으로 세지 않습니다.
- 글자를 고른 채 새 메시지가 와도 화면이 움직이지 않아 고르기가 흐트러지지 않습니다.

## 앞 기록 불러오기

```tsx
<MessageScroller onReachStart={loadOlder} loading={loadingOlder}>
  {messages.map(...)}
</MessageScroller>
```

- 위로 스크롤해 맨 위에서 48px 안에 들어오면 `onReachStart` 를 한 번 부릅니다. 48px 밖으로 나갔다가 다시 들어오거나 앞에 메시지가 붙으면 다시 부를 수 있습니다.
- `loading` 인 동안은 부르지 않습니다. 더 불러올 기록이 없으면 `onReachStart` 를 넘기지 않거나 함수 안에서 그냥 돌아옵니다.
- 처음부터 넘치지 않는 짧은 목록은 스크롤이 없어 부르지 않습니다. 첫 화면을 채울 만큼은 앱이 먼저 불러옵니다.
- `loading` 이면 위쪽 가운데에 Spinner 가 내용 위로 뜨고, 스크롤 영역에 `aria-busy` 가 붙습니다. 목록을 밀지 않습니다.
- 앞에 붙은 메시지는 화면 위쪽 밖에 생깁니다. 화면에 보이던 첫 메시지가 같은 자리에 남도록 스크롤을 옮깁니다.

## 아래로 가기 버튼

```tsx
<MessageScroller>
  {messages.map(...)}
  {/* 없으면 기본 버튼. 바꿀 때만 둔다 */}
  <MessageScroller.ScrollToBottom variant="soft" colorScheme="primary" />
</MessageScroller>

<MessageScroller.ScrollToBottom>
  <ArrowDownIcon />최신 메시지     {/* 글자를 주면 확장형, 이름은 글자 */}
</MessageScroller.ScrollToBottom>
```

- `Button` 입니다. 기본은 `variant="outline"`, `colorScheme="neutral"`, `size="tiny"` 이고 Button 의 속성을 모두 받습니다.
- 스크롤 영역 아래 가운데에 둥글게 뜹니다. 입력창을 MessageScroller 바로 아래에 두면 입력창 위에 뜹니다.
- 맨 아래에 있으면 흐려지며 숨고 `inert` 라 누를 수도, Tab 으로 갈 수도 없습니다.
- 기본 내용은 아래 화살표입니다. 위로 올려 둔 동안 메시지가 오면 "새 메시지 3개" 처럼 글자가 붙어 알약 모양으로 늘어납니다.
- 기본 이름은 "맨 아래로", 새 메시지가 있으면 "맨 아래로, 새 메시지 3개" 입니다. children 을 주면 이름은 그 글자이고, `aria-label` 을 주면 그 값입니다.
- 누르면 맨 아래로 부드럽게 스크롤하고 다시 따라갑니다. `prefers-reduced-motion` 이면 바로 갑니다. `onClick` 에서 `preventDefault` 하면 스크롤하지 않습니다.

## 목록

```tsx
<MessageScroller className="h-dvh">
  <MessageScroller.List className="mx-auto w-full max-w-3xl gap-8 px-4 py-6">
    {messages.map(...)}
  </MessageScroller.List>
</MessageScroller>
```

- 목록의 간격, 폭, padding 을 바꿀 때만 `MessageScroller.List` 로 감쌉니다. 기본은 `flex flex-col gap-4 p-4` 입니다.
- 메시지는 `List` 안이나 MessageScroller 바로 아래 중 한쪽에만 둡니다. 둘 다면 오류입니다.
- 자식마다 `<li>` 로 감쌉니다. `<li>` 는 `flex flex-col` 이라 자식에 `self-end` 를 주면 오른쪽(끝)으로 붙습니다.
- Fragment 는 펼쳐서 그 안의 자식마다 `<li>` 를 줍니다. `null`, `false` 는 빠집니다.

## AI SDK

AI SDK `useChat` 의 메시지를 `Message` 로 그립니다. `scrollOnAppend="start"` 에 맞춰 사용자 메시지와 그 뒤의 답을 한 차례로 묶습니다.

```tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { Message, MessageScroller } from '@gsainfoteam/ids-react';
import type { UIMessage } from 'ai';

const textOf = (message: UIMessage) =>
  message.parts.map((part) => (part.type === 'text' ? part.text : '')).join('');

const turnsOf = (messages: UIMessage[]) =>
  messages.reduce<UIMessage[][]>((turns, message) => {
    if (message.role === 'user' || turns.length === 0) turns.push([message]);
    else turns[turns.length - 1].push(message);
    return turns;
  }, []);

export function Chat() {
  const { messages, sendMessage } = useChat();

  return (
    <MessageScroller scrollOnAppend="start" className="min-h-0 flex-1">
      {turnsOf(messages).map((turn) => (
        <div key={turn[0].id} className="flex flex-col gap-4">
          {turn.map((message) => (
            <Message key={message.id} from={message.role}>
              {textOf(message)}
            </Message>
          ))}
        </div>
      ))}
    </MessageScroller>
  );
}
```

- 스트리밍으로 자라는 답은 MessageScroller 가 크기 변화로 봅니다. 따로 알릴 것이 없습니다.
- 사람끼리의 채팅은 메시지 하나를 자식 하나로 두고 기본 `scrollOnAppend="end"` 를 씁니다.

## 높이

- 높이는 root 에 줍니다(`h-96`, 부모가 flex 면 `min-h-0 flex-1`). 높이가 없으면 내용만큼 자라 스크롤하지 않습니다.
- root 에 준 테두리와 둥근 모서리는 안쪽 ScrollArea 가 `rounded-[inherit]` 로 이어받아 막대가 모서리를 넘지 않습니다.

## 접근성

- 스크롤 영역은 `role="log"` 라 새로 붙은 메시지를 스크린 리더가 읽습니다. 이름은 "메시지"이고 root 의 `aria-label`, `aria-labelledby` 가 그 이름이 됩니다.
- 앞 기록을 불러오는 동안은 `aria-busy` 라 붙은 기록을 한꺼번에 읽지 않습니다.
- 안에 포커스를 받을 요소가 없으면 스크롤 영역이 Tab 멈춤을 받아 키보드로 읽을 수 있습니다(ScrollArea 규칙).

## 상태

| 속성                                      | 붙는 곳         | 뜻                     |
| ----------------------------------------- | --------------- | ---------------------- |
| `data-at-end`                             | root            | 맨 아래에 있다         |
| `data-loading`                            | root            | `loading`              |
| `data-hidden`                             | ScrollToBottom  | 맨 아래라 숨었다       |
| `data-message-scroller`                   | root            |                        |
| `data-message-scroller-list` / `-item`    | `<ol>` / `<li>` |                        |
| `data-message-scroller-loader`            | Spinner 를 담은 층 |                     |
| `data-message-scroller-scroll-to-bottom`  | 아래로 가기 버튼 |                       |

## 속성

| 속성             | 기본 / 동작                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `stickToBottom`  | `true`. 맨 아래에 있으면 새 메시지와 자라는 메시지를 따라간다       |
| `scrollOnAppend` | `'end'`(기본) / `'start'`. 새로 붙은 첫 자식을 위쪽에 맞출지        |
| `onReachStart`   | 위로 스크롤해 맨 위에 닿으면 부른다                                 |
| `loading`        | `false`. 위쪽에 Spinner, 스크롤 영역에 `aria-busy`                  |
| `aria-label`     | 스크롤 영역(`role="log"`)의 이름. 기본 "메시지"                     |
| 그 외            | root `<div>` 로 간다                                               |

| 파트             | 기본 / 동작                                                  |
| ---------------- | ------------------------------------------------------------ |
| `List`           | `<ol>`. 간격과 폭을 바꿀 때만 둔다                            |
| `ScrollToBottom` | Button. 없으면 기본 버튼이 붙는다                             |

## 알아둘 것

- 엔진은 IDS 가 직접 씁니다. `@shadcn/react` 의 message-scroller 는 스크롤 요소와 목록을 자기 `<div>` 로 그려 ScrollArea 의 viewport 와 `<ol>`/`<li>` 가 될 수 없고, 목록 안에 빈 `<div>` 를 넣으며, 글자 고르기·앞 기록 불러오기·새 메시지 수가 없습니다.
- 스크롤 영역은 `overflow-anchor: none` 입니다. 브라우저마다 다른 스크롤 앵커링 대신 MessageScroller 가 읽던 메시지의 자리를 지킵니다.
- 크기 변화는 스크롤 영역과 목록의 `ResizeObserver` 로 보고, 그리기 전에 스크롤을 옮깁니다. 위쪽 맞추기 자리(`min-height`)는 크기 변화 중에 바뀌면 다음 프레임에 고칩니다.
- 서버 HTML 은 맨 위에서 그려지고, 하이드레이션 뒤 첫 그림 전에 맨 아래로 갑니다.
