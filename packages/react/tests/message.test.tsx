import { type ReactNode } from 'react';

import axe from 'axe-core';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Bubble, IconButton, IdsProvider, Marker, Message, MessageGroup } from '../src';
import { testTheme } from './theme';

const SENT_AT = new Date('2026-11-17T12:20:00+09:00');

const parse = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const articles = (root: ParentNode) => [...root.querySelectorAll<HTMLElement>('article')];
const articleIn = (root: ParentNode) => articles(root)[0]!;

const withProvider = (node: ReactNode) => (
  <IdsProvider theme={testTheme} mode="light">
    {node}
  </IdsProvider>
);

const clipboardThatRecords = () => {
  const copied: string[] = [];
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text: string) => void copied.push(text) },
  });
  return copied;
};

test('SSR: an article named by the sender, with the time in its header', () => {
  const article = articleIn(
    parse(
      <Message name="GIST 도우미" time={SENT_AT}>
        답입니다
      </Message>,
    ),
  );
  const name = article.querySelector('header > span')!;
  expect(article.getAttribute('aria-labelledby')).toBe(name.id);
  expect(name.textContent).toBe('GIST 도우미');
  expect(article.dataset.align).toBe('start');
  expect(article.dataset.status).toBe('sent');
  expect(article.querySelector('header time')!.getAttribute('datetime')).toBe(
    SENT_AT.toISOString(),
  );
  expect(article.querySelector('[data-bubble]')).toBeNull();
  expect(article.querySelector('[data-message-content]')!.textContent).toBe('답입니다');
});

test('SSR: without a name the article has no labelledby and no header', () => {
  const article = articleIn(parse(<Message align="end">요약해 줘</Message>));
  expect(article.hasAttribute('aria-labelledby')).toBe(false);
  expect(article.querySelector('header')).toBeNull();
});

test('a body without a Bubble is drawn as it is, and a Bubble in the body makes a bubbled message', () => {
  const doc = parse(
    <>
      <Message align="end" time={SENT_AT}>
        요약해 줘
      </Message>
      <Message align="end" time={SENT_AT}>
        <Bubble variant="solid">직접 둔 말풍선</Bubble>
      </Message>
    </>,
  );
  const [plain, bubbled] = articles(doc);
  expect(plain!.querySelector('[data-bubble]'), 'a body is never wrapped for the app').toBeNull();
  expect(plain!.querySelector('[data-message-content]')!.textContent).toBe('요약해 줘');
  expect(plain!.querySelector('header time')).not.toBeNull();
  expect(plain!.querySelector('[data-message-side] time')).toBeNull();
  expect(bubbled!.querySelectorAll('[data-bubble]')).toHaveLength(1);
  expect(bubbled!.querySelector<HTMLElement>('[data-bubble]')!.dataset.variant).toBe('solid');
  expect(bubbled!.querySelector('[data-message-side] time')).not.toBeNull();
  expect(bubbled!.querySelector('header')).toBeNull();
});

test('a Bubble takes the align its Message hands out, and its own align wins', () => {
  const doc = parse(
    <>
      <Message align="end">
        <Bubble>끝</Bubble>
      </Message>
      <Message align="end">
        <Bubble align="start">앱이 고른 쪽</Bubble>
      </Message>
      <MessageGroup align="end">
        <Message>
          <Bubble>묶음의 끝</Bubble>
        </Message>
      </MessageGroup>
      <Message>
        <Bubble>기본</Bubble>
      </Message>
      <Bubble>메시지 밖</Bubble>
    </>,
  );
  const aligns = [...doc.querySelectorAll<HTMLElement>('[data-bubble]')].map(
    (bubble) => bubble.dataset.align,
  );
  expect(aligns).toEqual(['end', 'start', 'end', 'start', 'start']);
});

test('a message without a Bubble keeps its align and follows its group', () => {
  const doc = parse(
    <>
      <Message align="end">넓은 답</Message>
      <MessageGroup align="end">
        <Message>묶음 안의 넓은 답</Message>
      </MessageGroup>
    </>,
  );
  const [direct, grouped] = articles(doc);
  expect(direct!.dataset.align).toBe('end');
  expect(grouped!.dataset.align).toBe('end');
});

test('the end column pushes the content to the end', async () => {
  const screen = await render(
    withProvider(
      <div className="w-96">
        <Message align="end">
          <Bubble>짧은 말</Bubble>
        </Message>
      </div>,
    ),
  );
  const article = screen.container.querySelector('article')!;
  const bubble = article.querySelector('[data-bubble]')!;
  expect(
    Math.abs(bubble.getBoundingClientRect().right - article.getBoundingClientRect().right),
  ).toBeLessThan(1);
});

test('MessageGroup hands out align and shows the name first and the time last', () => {
  const doc = parse(
    <MessageGroup align="end" aria-label="내 메시지">
      <Message name="나" avatar="data:image/png;base64,AAAA" time={SENT_AT}>
        <Bubble align="end">하나</Bubble>
      </Message>
      <Message name="나" avatar="data:image/png;base64,AAAA" time={SENT_AT}>
        <Bubble>둘</Bubble>
      </Message>
      <Message name="나" avatar="data:image/png;base64,AAAA" time={SENT_AT} align="start">
        <Bubble>셋</Bubble>
      </Message>
    </MessageGroup>,
  );
  const group = doc.querySelector('[role="group"]')!;
  expect(group.getAttribute('aria-label')).toBe('내 메시지');
  const [one, two, three] = articles(doc);
  expect(one!.dataset.align).toBe('end');
  expect(two!.dataset.align).toBe('end');
  expect(three!.dataset.align, 'a message’s own align wins over the group').toBe('start');
  expect(one!.hasAttribute('data-first')).toBe(true);
  expect(three!.hasAttribute('data-last')).toBe(true);

  expect(one!.querySelector('header')!.className).not.toMatch(/\bsr-only\b/);
  expect(two!.querySelector('header')!.className).toMatch(/\bsr-only\b/);
  expect(two!.getAttribute('aria-labelledby'), 'every message keeps its name').toBe(
    two!.querySelector('header > span')!.id,
  );
  expect(one!.querySelector('[data-message-avatar]')!.className).not.toMatch(/\binvisible\b/);
  expect(two!.querySelector('[data-message-avatar]')!.className).toMatch(/\binvisible\b/);

  expect(one!.querySelector('time')).toBeNull();
  expect(two!.querySelector('time')).toBeNull();
  expect(three!.querySelector('[data-message-side] time')!.getAttribute('datetime')).toBe(
    SENT_AT.toISOString(),
  );
});

test('a Message inside another Message’s content is not part of the outer group', () => {
  const doc = parse(
    <MessageGroup>
      <Message name="바깥">
        <Message name="안쪽">인용</Message>
      </Message>
      <Message name="바깥">둘째</Message>
    </MessageGroup>,
  );
  const inner = articles(doc)[1]!;
  expect(inner.hasAttribute('data-first')).toBe(false);
  expect(inner.querySelector('header')!.className).not.toMatch(/\bsr-only\b/);
});

test('Message.Footer takes the time of a message without a bubble, and draws nothing without one', () => {
  const doc = parse(
    <>
      <Message time={SENT_AT}>
        답
        <Message.Footer />
      </Message>
      <Message>
        시간 없는 답
        <Message.Footer />
      </Message>
      <Message time={SENT_AT}>
        글<Message.Footer>어제</Message.Footer>
      </Message>
    </>,
  );
  const [timed, untimed, custom] = articles(doc);
  expect(timed!.querySelector('footer time')!.getAttribute('datetime')).toBe(SENT_AT.toISOString());
  expect(timed!.querySelector('header'), 'the footer takes the time from the header').toBeNull();
  expect(untimed!.querySelector('footer')).toBeNull();
  expect(custom!.querySelector('footer')!.textContent).toBe('어제');
});

test('a bubbled message puts its time beside the bubble, outside the copied content', () => {
  const article = articleIn(
    parse(
      <Message align="end" name="나" time={SENT_AT}>
        <Bubble>요약해 줘</Bubble>
      </Message>,
    ),
  );
  const side = article.querySelector('[data-message-side]')!;
  expect(side.querySelector('time')!.getAttribute('datetime')).toBe(SENT_AT.toISOString());
  expect(article.querySelector('header time')).toBeNull();
  expect(article.querySelector('[data-message-content]')!.contains(side)).toBe(false);
});

test('unread draws a count or a dot beside the bubble, read by screen readers, only once sent', () => {
  const doc = parse(
    <>
      <Message align="end" unread={3}>
        <Bubble>단체방</Bubble>
      </Message>
      <Message align="end" unread>
        <Bubble>1대1</Bubble>
      </Message>
      <Message align="end" unread={0}>
        <Bubble>다 읽음</Bubble>
      </Message>
      <Message align="end" unread={2} status="pending">
        <Bubble>보내는 중</Bubble>
      </Message>
      <Message align="end" unread={2} status="error">
        <Bubble>실패</Bubble>
      </Message>
    </>,
  );
  const [count, dot, none, pending, error] = articles(doc);
  const unreadOf = (article: HTMLElement) => article.querySelector('[data-message-unread]');
  expect(unreadOf(count!)!.textContent).toBe('33명 안 읽음');
  expect(unreadOf(count!)!.querySelector('[aria-hidden]')!.textContent).toBe('3');
  expect(unreadOf(dot!)!.querySelector('[data-dot]')).not.toBeNull();
  expect(unreadOf(dot!)!.textContent).toBe('안 읽음');
  expect(unreadOf(none!)).toBeNull();
  expect(unreadOf(pending!)).toBeNull();
  expect(pending!.querySelector('[data-message-side]')!.textContent).toBe('보내는 중');
  expect(unreadOf(error!)).toBeNull();
});

test('unread leaves through an exit and keeps its last count while it does', async () => {
  const screen = await render(
    withProvider(
      <Message align="end" unread={2}>
        <Bubble>글</Bubble>
      </Message>,
    ),
  );
  const unread = () => screen.container.querySelector('[data-message-unread]');
  await expect.poll(unread).not.toBeNull();
  await screen.rerender(
    withProvider(
      <Message align="end" unread={0}>
        <Bubble>글</Bubble>
      </Message>,
    ),
  );
  await expect.poll(unread).toBeNull();
});

test('a grouped bubble after the first shrinks the corner it shares with the one above', async () => {
  const screen = await render(
    withProvider(
      <MessageGroup align="end">
        <Message>
          <Bubble align="end">하나</Bubble>
        </Message>
        <Message>
          <Bubble align="end">둘</Bubble>
        </Message>
      </MessageGroup>,
    ),
  );
  const [first, second] = [...screen.container.querySelectorAll('[data-bubble]')];
  const style = (bubble: Element) => getComputedStyle(bubble);
  expect(style(first!).borderStartEndRadius).not.toBe(style(first!).borderEndEndRadius);
  expect(style(second!).borderStartEndRadius).toBe(style(second!).borderEndEndRadius);
  expect(style(second!).borderStartStartRadius).toBe(style(first!).borderStartStartRadius);
});

test('error rings the bubble in danger and pending fades its fill', async () => {
  const screen = await render(
    withProvider(
      <>
        <Message align="end">
          <Bubble>보낸 글</Bubble>
        </Message>
        <Message align="end" status="error">
          <Bubble>실패한 글</Bubble>
        </Message>
        <Message align="end" status="pending">
          <Bubble>보내는 글</Bubble>
        </Message>
      </>,
    ),
  );
  const [sent, error, pending] = [...screen.container.querySelectorAll('[data-bubble]')].map(
    (bubble) => getComputedStyle(bubble),
  );
  expect(sent!.boxShadow).toBe('none');
  expect(error!.boxShadow).not.toBe('none');
  expect(pending!.backgroundColor).not.toBe(sent!.backgroundColor);
});

test('status="error" draws the failure line under the bubble and the retry button beside it', async () => {
  const onRetry = vi.fn();
  const screen = await render(
    withProvider(
      <>
        <Message align="end" status="error" onRetry={onRetry}>
          <Bubble>다시 보낼 글</Bubble>
        </Message>
        <Message align="end" status="error">
          <Bubble>그냥 실패한 글</Bubble>
        </Message>
      </>,
    ),
  );
  const [withRetry, without] = articles(screen.container);
  const failure = withRetry!.querySelector('[data-message-failure] [data-marker]')!;
  expect(failure.getAttribute('role')).toBe('status');
  expect(failure.textContent).toBe('보내지 못했어요');
  expect(without!.querySelector('[data-message-failure]')).not.toBeNull();
  expect(without!.querySelector('button')).toBeNull();
  expect(withRetry!.querySelector('[data-message-side] button')).not.toBeNull();
  expect(withRetry!.querySelector('time')).toBeNull();

  await screen.getByRole('button', { name: '다시 보내기' }).click();
  expect(onRetry).toHaveBeenCalledOnce();
  expect(onRetry.mock.calls[0]).toEqual([]);
});

test('a message that failed to send draws no time, wherever its time would stand', () => {
  const doc = parse(
    <>
      <Message align="end" time={SENT_AT} status="error">
        <Bubble>말풍선</Bubble>
      </Message>
      <Message name="GIST 도우미" time={SENT_AT} status="error">
        머리
      </Message>
      <Message time={SENT_AT} status="error">
        아래 줄
        <Message.Footer />
      </Message>
    </>,
  );
  const [bubbled, headed, footed] = articles(doc);
  expect(bubbled!.querySelector('time')).toBeNull();
  expect(headed!.querySelector('header')!.textContent).toBe('GIST 도우미');
  expect(headed!.querySelector('time')).toBeNull();
  expect(footed!.querySelector('time')).toBeNull();
  expect(footed!.querySelector('footer')).toBeNull();
});

test('Message.Actions without children copies the content text', async () => {
  const copied = clipboardThatRecords();
  const screen = await render(
    withProvider(
      <Message name="GIST 도우미">
        <Marker>웹 검색 3건</Marker>
        <p>셔틀은 12시 20분에 와요.</p>
        <Message.Actions />
      </Message>,
    ),
  );
  await expect.element(screen.getByRole('group', { name: '메시지 동작' })).toBeVisible();
  await screen.getByRole('button', { name: '복사' }).click();
  await expect.poll(() => copied).toEqual(['웹 검색 3건\n\n셔틀은 12시 20분에 와요.']);
  await expect.element(screen.getByRole('button', { name: '복사했습니다' })).toBeVisible();
});

test('Message.Copy text copies that text instead', async () => {
  const copied = clipboardThatRecords();
  const screen = await render(
    withProvider(
      <Message>
        **굵게**
        <Message.Actions>
          <Message.Copy text="**굵게** 원문" />
        </Message.Actions>
      </Message>,
    ),
  );
  await screen.getByRole('button', { name: '복사' }).click();
  await expect.poll(() => copied).toEqual(['**굵게** 원문']);
});

test('an explicit Message.Content holds the body, and a Bubble in it makes a bubbled message', () => {
  const doc = parse(
    <>
      <Message align="end" time={SENT_AT}>
        <Message.Content className="custom">
          <Bubble>본문</Bubble>
        </Message.Content>
      </Message>
      <Message align="end">
        <Message.Content>말풍선 없는 본문</Message.Content>
      </Message>
    </>,
  );
  const [bubbled, plain] = articles(doc);
  const content = bubbled!.querySelector('[data-message-content]')!;
  expect(content.className).toContain('custom');
  expect(content.querySelector<HTMLElement>('[data-bubble]')!.dataset.align).toBe('end');
  expect(bubbled!.querySelector('[data-message-side] time')).not.toBeNull();
  expect(bubbled!.querySelectorAll('[data-message-content]')).toHaveLength(1);
  expect(plain!.querySelector('[data-bubble]')).toBeNull();
});

test('Tab reaches the actions and the retry button in order, never the article', async () => {
  clipboardThatRecords();
  const screen = await render(
    withProvider(
      <>
        <Message name="도우미">
          답
          <Message.Actions>
            <Message.Copy />
            <IconButton aria-label="다시 답하기" icon={<svg />} />
          </Message.Actions>
        </Message>
        <Message align="end" status="error" onRetry={() => {}}>
          <Bubble>실패</Bubble>
        </Message>
      </>,
    ),
  );
  await expect.element(screen.getByRole('button', { name: '복사' })).toBeVisible();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '복사' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '다시 답하기' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '다시 보내기' })).toHaveFocus();
});

test('axe finds nothing in a chat of groups, answers and failures', async () => {
  clipboardThatRecords();
  const screen = await render(
    withProvider(
      <div className="flex w-96 flex-col gap-4">
        <Message align="end">
          <Bubble>요약해 줘</Bubble>
        </Message>
        <Message name="도우미" time={SENT_AT}>
          <Marker>웹 검색 3건</Marker>
          요약입니다.
          <Message.Actions />
        </Message>
        <MessageGroup align="start" aria-label="김지수의 메시지">
          <Message name="김지수" avatar="data:image/png;base64,AAAA" time={SENT_AT}>
            <Bubble>학식 메뉴 알려 줘</Bubble>
          </Message>
          <Message name="김지수" avatar="data:image/png;base64,AAAA" time={SENT_AT} unread={2}>
            <Bubble>오늘 거</Bubble>
          </Message>
        </MessageGroup>
        <Message align="end" status="error" onRetry={() => {}}>
          <Bubble>실패한 글</Bubble>
        </Message>
      </div>,
    ),
  );
  await expect.element(screen.getByRole('button', { name: '복사' })).toBeVisible();
  const { violations } = await axe.run(screen.container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(violations.map((violation) => violation.id)).toEqual([]);
});
