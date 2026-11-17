# Message

대화 메시지 한 건입니다. 보낸 사람(아바타, 이름, 시간), 본문, 동작, 아래 줄(시간, 상태)을 한 줄로 놓습니다. 면은 Bubble 이 맡고, Message 는 배치를 맡습니다.

- **보낸 사람.** `from="user"` 는 끝에 붙고 본문을 Bubble 로 감쌉니다. `from="assistant"`(기본)는 시작에 붙고 본문을 그대로 그립니다.
- **사람끼리 채팅.** `from` 대신 `align` 을 주고, 본문에 Bubble 을 직접 둡니다.
- **연속 메시지.** `Message.Group` 이 같은 사람의 메시지를 묶습니다. 첫 메시지만 아바타와 이름을, 마지막 메시지만 시간을 보입니다.
- **실패와 다시 보내기.** `status="error"` 면 실패 줄을 그리고, `onRetry` 가 있으면 다시 보내기 버튼을 둡니다.
- **시멘틱 구성.** 루트는 이름을 가리키는 `<article aria-labelledby>`, 이름과 시간은 `<header>` 와 `<time dateTime>`, 아래 줄은 `<footer>`, 묶음은 `<div role="group">` 입니다.

```tsx
import { Bubble, Marker, Message } from '@gsainfoteam/ids-react';

<Message from="user">요약해 줘</Message>

<Message from="assistant" name="지글봇" avatar="/bot.png" time={sentAt}>
  <Marker>웹 검색 3건</Marker>
  요약입니다.
  <Message.Actions />
</Message>

<Message from="user" status="error" onRetry={resend}>보내기 실패한 글</Message>

<Message.Group align="start" aria-label="김지수의 메시지">
  <Message name="김지수" avatar={src} time={t1}><Bubble>학식 메뉴 알려 줘</Bubble></Message>
  <Message name="김지수" avatar={src} time={t2} status="read">
    <Bubble>오늘 거</Bubble>
    <Message.Footer />
  </Message>
</Message.Group>
```

| Property  | Type                                         | Default                          |
| --------- | -------------------------------------------- | -------------------------------- |
| `from`    | `'user' \| 'assistant'`                      | `'assistant'`                    |
| `align`   | `'start' \| 'end'`                           | `from` 에 따름 (`user` 는 `'end'`) |
| `name`    | `string`                                     | -                                |
| `avatar`  | `string \| ReactNode`                        | -                                |
| `time`    | `Date`                                       | -                                |
| `locale`  | `string`                                     | IdsProvider 의 locale, `ko-KR`   |
| `status`  | `'sent' \| 'pending' \| 'error' \| 'read'`   | `'sent'`                         |
| `onRetry` | `() => void`                                 | -                                |

## 파트

```tsx
<Message name="김지수" avatar={src} time={sentAt}>
  <Message.Avatar />          {/* avatar 가 있으면 저절로. 직접 두면 이니셜로도 그린다 */}
  <Message.Header />          {/* name 이나 time 이 있으면 저절로 */}
  <Message.Content>…</Message.Content>  {/* 파트가 아닌 자식이 저절로 들어간다 */}
  <Message.Actions />         {/* 자식이 없으면 복사 버튼 */}
  <Message.Footer />          {/* 자식이 없으면 시간 · 상태 문구 */}
</Message>
```

- 파트는 모두 선택이고, 어디에 적든 정해진 자리에 섭니다. 위에서부터 머리, 본문, 실패 줄, 동작, 아래 줄입니다.
- 파트가 아닌 자식(글, Marker, Accordion, Bubble)은 본문(`Message.Content`)으로 갑니다. 본문은 세로로 쌓이고 블록 사이에 8px 를 둡니다.
- 머리와 아래 줄에 자식을 주면 기본 내용 대신 그 자식을 그립니다. 머리에 자식을 주면 그 머리가 메시지의 이름이 됩니다.

## 정렬과 말풍선

```tsx
<Message from="user">요약해 줘</Message>             {/* 끝에 붙고 <Bubble align="end"> 로 감싼다 */}
<Message from="user" align="start">…</Message>        {/* align 이 from 을 덮어쓴다 */}

<Message align="end">
  <Bubble align="end" variant="solid">같이 갈래?</Bubble>  {/* 직접 둔 Bubble 은 앱이 align 을 준다 */}
</Message>
```

- `align="end"` 면 아바타가 끝 쪽에 서고, 내용 열이 끝으로 붙습니다.
- 말풍선은 `from="user"` 일 때만 저절로 감쌉니다. 본문에 Bubble 이 이미 있으면 감싸지 않습니다.
- 저절로 감쌀 때는 Bubble 에 Message 의 `align` 을 넘기고, variant 는 Bubble 의 기본 `soft` 입니다.
- Bubble 은 Message 안에 있는지 살피지 않습니다. 직접 둔 Bubble 의 꼬리는 앱이 `align` 으로 정합니다.

## 보낸 사람

```tsx
<Message name="김지수" avatar="/jisu.png">…</Message>     {/* src. 못 불러오면 이니셜 */}
<Message name="Alice Kim"><Message.Avatar />…</Message>   {/* 그림 없이 이니셜 */}
<Message avatar={<Avatar size="tiny" name="도우미">…</Avatar>}>…</Message>  {/* 노드를 그대로 */}
```

- 아바타는 Avatar `standard`(40px) 입니다. 다른 크기는 노드로 넘기거나 `<Message.Avatar size="tiny" />` 로 바꿉니다.
- 아바타는 `aria-hidden` 입니다. 이름은 머리가 읽힙니다.
- `name` 이 있으면 메시지(`article`)의 이름이 됩니다. `name` 이 없으면 이름 없는 `article` 입니다.

## 시간

- `time` 은 `<time dateTime>` 에 ISO 문자열로, 글자는 `locale` 의 시와 분(`오후 12:20`)으로 그립니다.
- 시간은 머리에 섭니다. `Message.Footer` 가 있거나 묶음 안이면 아래 줄로 옮깁니다.
- 글자는 그리는 곳의 시간대로 만듭니다. 서버와 브라우저의 시간대가 다르면 글자가 달라지므로 `<time>` 은 그 차이만 hydration 경고에서 뺍니다. 시간대를 맞추려면 머리나 아래 줄에 직접 만든 글자를 넣습니다.

## 상태

```tsx
<Message status="pending">…<Message.Footer /></Message>  {/* 아래 줄: 오후 12:20 · 보내는 중 */}
<Message status="read">…<Message.Footer /></Message>     {/* 아래 줄: 오후 12:20 · 읽음 */}
<Message status="error" onRetry={resend}>…</Message>      {/* 실패 줄 + 다시 보내기 */}
```

| 상태      | 아래 줄 문구                     | 그 밖                                   |
| --------- | -------------------------------- | --------------------------------------- |
| `sent`    | 없음                             | -                                       |
| `pending` | `t('message.pending')` 보내는 중 | -                                       |
| `read`    | `t('message.read')` 읽음         | -                                       |
| `error`   | 없음                             | 실패 줄 `t('message.error')`, 다시 보내기 `t('message.retry')` |

- 상태 문구는 `Message.Footer` 에만 섭니다. 아래 줄을 두지 않으면 `pending` 과 `read` 는 보이지 않습니다.
- 실패 줄은 `Marker` 이고 `role="status"` 입니다. 다시 보내기는 `Button` 입니다. 실패 줄은 아래 줄과 따로 늘 그립니다.
- 요소에는 `data-message`, `data-from`, `data-align`, `data-status` 가 붙고, 묶음 안이면 `data-first`, `data-last` 가 붙습니다.

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
<Message from="assistant" name="도우미">
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

```tsx
<Message.Group align="start" aria-label="김지수의 메시지">
  <Message name="김지수" avatar={src} time={t1}>…</Message>  {/* 아바타, 이름 */}
  <Message name="김지수" avatar={src} time={t2}>…</Message>  {/* 아바타 자리만, 이름은 스크린 리더에만 */}
  <Message name="김지수" avatar={src} time={t3}>…</Message>  {/* 아래 줄에 시간 */}
</Message.Group>
```

- `align` 을 안의 Message 에 줍니다. Message 에 직접 준 `align` 이 이깁니다.
- 묶음 안의 Message 에도 `name` 과 `avatar` 를 모두 줍니다. 첫 메시지가 아닌 메시지는 아바타를 `invisible` 로 그려 자리를 맞추고, 머리를 `sr-only` 로 숨겨 이름을 남깁니다.
- 마지막 메시지는 아래 줄이 없어도 시간을 그리는 아래 줄을 저절로 둡니다. 마지막이 아닌 메시지의 아래 줄은 상태 문구만 그립니다.
- 메시지 사이 간격은 4px 입니다. 묶음끼리의 간격과 목록, 새 메시지 알림은 MessageScroller 가 맡습니다.

## 알아둘 것

- 한국어는 바깥 요소에 `break-keep` 을 줍니다.
- 묶음은 자식 순서로 처음과 끝을 정합니다. Fragment 는 펼쳐 셉니다.
- 메시지 안에 둔 Message(인용 등)는 바깥 묶음의 위치를 물려받지 않습니다.
