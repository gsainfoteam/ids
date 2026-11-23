# Message

대화 메시지 한 건입니다. 보낸 사람(아바타, 이름), 본문, 말풍선 옆 줄(안 읽은 수, 시간), 동작을 한 줄로 놓습니다. 면은 Bubble 이 맡고, Message 는 배치를 맡습니다.

- **말풍선.** 본문에 `<Bubble>` 을 두면 말풍선 메시지가 됩니다. 두지 않으면 본문(Marker, Accordion, 문단)을 메시지 폭 그대로 그립니다. 누가 말하는지와 상관없이 고릅니다.
- **방향.** `align` 이 붙는 쪽을 고르고, 안의 Bubble 에도 같은 쪽을 줍니다. 기본은 `start` 입니다.
- **연속 메시지.** [MessageGroup](../message-group/README.md) 이 같은 사람의 메시지를 묶습니다. 첫 메시지만 아바타와 이름을, 마지막 메시지만 시간을 보이고, 이어지는 말풍선은 맞닿는 모서리를 줄입니다.
- **읽음.** `unread` 에 안 읽은 사람 수(단체방)나 `true`(1대1)를 주면 말풍선 옆에 숫자나 점을 그립니다.
- **보내는 중과 실패.** `pending` 은 말풍선을 옅게 하고 빛을 지나가게 합니다. `error` 는 말풍선 테두리를 빨갛게 하고, 시간 자리에 다시 보내기 버튼을, 아래에 실패 줄을 둡니다.
- **시멘틱 구성.** 루트는 이름을 가리키는 `<article aria-labelledby>`, 이름과 시간은 `<header>` 와 `<time dateTime>`, 아래 줄은 `<footer>` 입니다.

```tsx
import { Bubble, Marker, Message, MessageGroup } from '@gsainfoteam/ids-react';

<Message align="end">
  <Bubble variant="solid">요약해 줘</Bubble>
</Message>

<Message name="지글봇" avatar="/bot.png" time={sentAt}>
  <Marker>웹 검색 3건</Marker>
  요약입니다.
  <Message.Actions />
</Message>

<Message align="end" status="error" onRetry={resend}>
  <Bubble>보내기 실패한 글</Bubble>
</Message>

<Message align="end" time={sentAt} unread={2}>
  <Bubble>단체방에 보낸 글</Bubble>
</Message>

<MessageGroup align="start" aria-label="김지수의 메시지">
  <Message name="김지수" avatar={src} time={t1}><Bubble>학식 메뉴 알려 줘</Bubble></Message>
  <Message name="김지수" avatar={src} time={t2}><Bubble>오늘 거</Bubble></Message>
</MessageGroup>
```

| Property  | Type                                         | Default                          |
| --------- | -------------------------------------------- | -------------------------------- |
| `align`   | `'start' \| 'end'`                           | `'start'`                        |
| `name`    | `string`                                     | -                                |
| `avatar`  | `string \| ReactNode`                        | -                                |
| `time`    | `Date`                                       | -                                |
| `locale`  | `string`                                     | IdsProvider 의 locale, `ko-KR`   |
| `status`  | `'sent' \| 'pending' \| 'error'`             | `'sent'`                         |
| `unread`  | `number \| boolean`                          | -                                |
| `onRetry` | `() => void`                                 | -                                |

## 파트

```tsx
<Message name="김지수" avatar={src} time={sentAt}>
  <Message.Avatar />          {/* avatar 가 있으면 저절로. 직접 두면 이니셜로도 그린다 */}
  <Message.Header />          {/* name 이나 time 이 있으면 저절로 */}
  <Message.Content>…</Message.Content>  {/* 파트가 아닌 자식이 저절로 들어간다 */}
  <Message.Actions />         {/* 자식이 없으면 복사 버튼 */}
  <Message.Footer />          {/* 자식이 없으면 말풍선 없는 메시지의 시간 */}
</Message>
```

- 파트는 모두 선택이고, 어디에 적든 정해진 자리에 섭니다. 위에서부터 머리, 본문과 그 옆 줄, 실패 줄, 동작, 아래 줄입니다.
- 옆 줄(`data-message-side`)은 파트가 아닙니다. 안 읽은 수, 시간, 다시 보내기 버튼을 Message 가 그립니다.
- 파트가 아닌 자식(글, Marker, Accordion, Bubble)은 본문(`Message.Content`)으로 갑니다. 본문은 세로로 쌓이고 블록 사이에 8px 를 둡니다.
- 머리와 아래 줄에 자식을 주면 기본 내용 대신 그 자식을 그립니다. 머리에 자식을 주면 그 머리가 메시지의 이름이 됩니다.

## 말풍선과 정렬

```tsx
<Message align="end">
  <Bubble variant="solid">같이 갈래?</Bubble>   {/* 끝에 붙고, Bubble 은 Message 의 align 을 받는다 */}
</Message>

<Message align="end">
  <Bubble align="start">인용한 말</Bubble>      {/* Bubble 에 준 align 이 이긴다 */}
</Message>

<Message name="도우미">…</Message>              {/* Bubble 이 없으면 폭 그대로. AI 답이든 내 말이든 */}
```

- 본문에 Bubble 이 있으면 말풍선 메시지입니다. Message 는 본문을 Bubble 로 감싸지 않으므로, 말풍선이 필요하면 앱이 `<Bubble>` 을 둡니다. 본문은 파트가 아닌 자식이나 `Message.Content` 의 자식입니다.
- 말풍선 메시지는 시간, 안 읽은 수, 다시 보내기 버튼을 말풍선 옆 줄에 둡니다. Bubble 이 없으면 시간은 머리나 아래 줄에, 다시 보내기 버튼은 실패 줄에 섭니다.
- `align="end"` 면 아바타가 끝 쪽에 서고, 머리와 본문과 동작이 끝으로 붙습니다. Bubble 이 없어도 같아서, 폭보다 짧은 본문은 끝에 붙고 긴 본문은 폭을 채웁니다.
- Message 는 자기 `align` 을 안의 Bubble 에 context 로 줍니다. Bubble 이 Message 를 찾는 것이 아니라 Message 가 주는 값이고, Bubble 에 직접 준 `align` 이 이깁니다. MessageGroup 의 `align` 도 Message 를 거쳐 Bubble 까지 갑니다.
- 본문 바로 아래의 Bubble(`Message.Content > [data-bubble]`)은 Message 가 스타일을 덧씁니다. 묶음의 모서리, `pending` 의 옅은 면과 빛, `error` 의 테두리입니다. Bubble 의 `data-align` 과 `data-variant` 를 읽으므로 직접 둔 Bubble 에도 그대로 적용됩니다.
- 말풍선이 있으면 본문은 메시지 폭의 80% 까지 자라고, 그 안에서 Bubble 은 `--bubble-max-width: 100%` 입니다. 나머지 폭에 옆 줄이 섭니다.

## 보낸 사람

```tsx
<Message name="김지수" avatar="/jisu.png">…</Message>     {/* src. 못 불러오면 이니셜 */}
<Message name="Alice Kim"><Message.Avatar />…</Message>   {/* 그림 없이 이니셜 */}
<Message avatar={<Avatar size="tiny" name="도우미">…</Avatar>}>…</Message>  {/* 노드를 그대로 */}
```

- 아바타는 `avatar` 를 주거나 `<Message.Avatar />` 를 둘 때만 그립니다. 이름이나 `align` 으로 숨기지 않습니다. 내 아바타를 빼려면 `avatar` 를 주지 않습니다.
- 아바타는 Avatar `standard`(40px) 입니다. 다른 크기는 노드로 넘기거나 `<Message.Avatar size="tiny" />` 로 바꿉니다.
- 아바타는 `aria-hidden` 입니다. 이름은 머리가 읽힙니다.
- `name` 이 있으면 메시지(`article`)의 이름이 됩니다. `name` 이 없으면 이름 없는 `article` 입니다.

## 시간

- `time` 은 `<time dateTime>` 에 ISO 문자열로, 글자는 `locale` 의 시와 분(`오후 12:20`)으로 그립니다.
- 말풍선이 있으면 시간은 말풍선 옆 아래(옆 줄)에 섭니다. 복사하는 본문 밖이라 복사되지 않습니다.
- 말풍선이 없으면 머리에 섭니다. `Message.Footer` 가 있거나 묶음 안이면 아래 줄로 옮깁니다.
- 묶음 안에서는 마지막 메시지만 시간을 그립니다.
- 글자는 그리는 곳의 시간대로 만듭니다. 서버와 브라우저의 시간대가 다르면 글자가 달라지므로 `<time>` 은 그 차이만 hydration 경고에서 뺍니다. 시간대를 맞추려면 머리나 아래 줄에 직접 만든 글자를 넣습니다.

## 읽음

```tsx
<Message align="end" time={sentAt} unread={3}>…</Message>     {/* 단체방: 옆 줄에 3, 그 아래 시간 */}
<Message align="end" time={sentAt} unread={!seen}>…</Message> {/* 1대1: 점 */}
```

- 숫자는 `text-primary`, 점은 children 없는 `Chip variant="solid" colorScheme="primary"` 입니다. 시간 위에 섭니다.
- `0` 이나 `false` 가 되면 줄어들며 사라집니다(`usePresence`). 사라지는 동안 마지막 숫자를 그대로 둡니다.
- 스크린 리더는 `t('message.unreadBy', { count })`("2명 안 읽음")나 `t('message.unread')`("안 읽음")를 읽습니다.
- `pending` 과 `error` 인 메시지에는 그리지 않습니다. 아직 닿지 않은 메시지라서입니다.

## 상태

```tsx
<Message status="pending">…</Message>                     {/* 옅은 말풍선, 빛이 지나간다 */}
<Message status="error" onRetry={resend}>…</Message>      {/* 빨간 테두리, 옆에 다시 보내기, 아래 실패 줄 */}
```

| 상태      | 말풍선                                                   | 옆 줄                        | 아래                              |
| --------- | -------------------------------------------------------- | ---------------------------- | --------------------------------- |
| `sent`    | -                                                        | 안 읽은 수, 시간             | -                                 |
| `pending` | 면을 옅게(`solid` 는 `soft` 색), 글자 `text-neutral`, 빛 | 시간, `t('message.pending')`(스크린 리더) | -                     |
| `error`   | `inset-ring-danger` 테두리                               | 다시 보내기 IconButton       | 실패 줄 `t('message.error')`      |

- 빛은 CSS 패키지의 `animate-skeleton-wave` 를 말풍선 면 뒤(`::after`)로 지나가게 한 것입니다. 움직임 줄이기 설정이면 옅은 면만 남습니다.
- 보내지 못한 메시지에는 보낸 시간이 없으므로 `time` 을 줘도 시간을 그리지 않습니다. 말풍선이 있으면 그 자리에 다시 보내기 버튼(`t('message.retry')`)이 서고, `onRetry` 가 없으면 비워 둡니다.
- 말풍선이 없는 메시지는 머리와 아래 줄에도 시간을 그리지 않고, 다시 보내기 버튼을 실패 줄 옆에 둡니다.
- 실패 줄은 `Marker` 이고 `role="status"` 입니다.
- 요소에는 `data-message`, `data-align`, `data-status` 가 붙고, 묶음 안이면 `data-first`, `data-last` 가 붙습니다.

## 동작

```tsx
<Message.Actions />                      {/* 복사 버튼 하나 */}

<Message.Actions>
  <Message.Copy text={markdown} />       {/* 본문 대신 이 글을 복사 */}
  <IconToggle aria-label="좋은 답" icon={<HandThumbUpIcon />} />
  <IconButton aria-label="다시 답하기" icon={<ArrowPathIcon />} />
</Message.Actions>
```

- `Message.Actions` 는 붙이지 않은(`attached={false}`) ButtonGroup 이고, `size="tiny"`, `variant="outline"` 을 안의 버튼에 줍니다. 이름은 `t('message.actions')`("메시지 동작") 입니다.
- `Message.Copy` 는 `text` 가 없으면 본문(`Message.Content`)의 `innerText` 를 복사합니다. 본문에 둔 Marker 와 Accordion 의 글자도 들어가므로, 원문을 따로 가진 앱은 `text` 를 줍니다.
- 복사하면 잠깐 체크로 바뀌고 `role="status"` 로 "복사했습니다" 를 알립니다. Clipboard API 가 없는 곳에서는 그리지 않습니다.
- 동작 버튼은 평범한 버튼이라 Tab 으로 차례로 갑니다. 메시지 줄 자체는 포커스를 받지 않습니다.

## 추론과 도구 줄

```tsx
<Message name="도우미">
  <Accordion type="multiple">
    <Accordion.Item value="reasoning">
      <Accordion.Header asChild>
        <h3>
          <Accordion.Trigger>
            <Marker asChild><span><SparklesIcon />12초 동안 생각했어요</span></Marker>
          </Accordion.Trigger>
        </h3>
      </Accordion.Header>
      <Accordion.Content>…</Accordion.Content>
    </Accordion.Item>
  </Accordion>
  <p>답입니다.</p>
</Message>
```

- 따로 파트를 두지 않습니다. Marker 를 Accordion.Trigger 에 넣어 접고, 본문 첫머리에 둡니다.

## 묶음

같은 사람의 연속 메시지는 [MessageGroup](../message-group/README.md) 으로 묶습니다. Message 는 묶음 안에서 자기 위치(처음, 끝)를 읽어 아바타, 이름, 시간, 말풍선 모서리를 정합니다.

## 알아둘 것

- 한국어는 바깥 요소에 `break-keep` 을 줍니다.
- 메시지 안에 둔 Message(인용 등)는 바깥 묶음의 위치를 물려받지 않습니다.
