import { type ReactNode } from 'react';

import axe from 'axe-core';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Bubble, IconButton, IdsProvider, Marker, Message } from '../src';
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
  expect(article.dataset.from).toBe('assistant');
  expect(article.dataset.align).toBe('start');
  expect(article.dataset.status).toBe('sent');
  expect(article.querySelector('header time')!.getAttribute('datetime')).toBe(
    SENT_AT.toISOString(),
  );
  expect(article.querySelector('[data-bubble]')).toBeNull();
  expect(article.querySelector('[data-message-content]')!.textContent).toBe('답입니다');
});

test('SSR: without a name the article has no labelledby and no header', () => {
  const article = articleIn(parse(<Message from="user">요약해 줘</Message>));
  expect(article.hasAttribute('aria-labelledby')).toBe(false);
  expect(article.querySelector('header')).toBeNull();
});

test('from="user" wraps the body in a Bubble on the end, and a Bubble given is not wrapped again', () => {
  const doc = parse(
    <>
      <Message from="user">요약해 줘</Message>
      <Message from="user">
        <Bubble align="end" variant="solid">
          직접 둔 말풍선
        </Bubble>
      </Message>
    </>,
  );
  const [auto, given] = articles(doc);
  expect(auto!.dataset.align).toBe('end');
  const bubble = auto!.querySelector<HTMLElement>('[data-bubble]')!;
  expect(bubble.dataset.align).toBe('end');
  expect(bubble.textContent).toBe('요약해 줘');
  expect(given!.querySelectorAll('[data-bubble]')).toHaveLength(1);
  expect(given!.querySelector<HTMLElement>('[data-bubble]')!.dataset.variant).toBe('solid');
});

test('align overrides from, and a Bubble placed by the app keeps its own align', () => {
  const doc = parse(
    <>
      <Message from="user" align="start">
        시작에 붙는 내 말
      </Message>
      <Message align="end">
        <Bubble>앱이 align 을 주지 않은 말풍선</Bubble>
      </Message>
    </>,
  );
  const [user, chat] = articles(doc);
  expect(user!.dataset.align).toBe('start');
  expect(user!.querySelector<HTMLElement>('[data-bubble]')!.dataset.align).toBe('start');
  expect(chat!.dataset.align).toBe('end');
  expect(
    chat!.querySelector<HTMLElement>('[data-bubble]')!.dataset.align,
    'Bubble does not look for Message',
  ).toBe('start');
});

test('the end column pushes the content to the end', async () => {
  const screen = await render(
    withProvider(
      <div className="w-96">
        <Message from="user">짧은 말</Message>
      </div>,
    ),
  );
  const article = screen.container.querySelector('article')!;
  const bubble = article.querySelector('[data-bubble]')!;
  expect(
    Math.abs(bubble.getBoundingClientRect().right - article.getBoundingClientRect().right),
  ).toBeLessThan(1);
});

test('Message.Group hands out align and shows the name first and the time last', () => {
  const doc = parse(
    <Message.Group align="end" aria-label="내 메시지">
      <Message name="나" avatar="data:image/png;base64,AAAA" time={SENT_AT}>
        <Bubble align="end">하나</Bubble>
      </Message>
      <Message name="나" avatar="data:image/png;base64,AAAA" time={SENT_AT}>
        <Bubble align="end">둘</Bubble>
      </Message>
      <Message name="나" avatar="data:image/png;base64,AAAA" time={SENT_AT} align="start">
        <Bubble>셋</Bubble>
      </Message>
    </Message.Group>,
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
  expect(three!.querySelector('footer time')!.getAttribute('datetime')).toBe(SENT_AT.toISOString());
});

test('a Message inside another Message’s content is not part of the outer group', () => {
  const doc = parse(
    <Message.Group>
      <Message name="바깥">
        <Message name="안쪽">인용</Message>
      </Message>
      <Message name="바깥">둘째</Message>
    </Message.Group>,
  );
  const inner = articles(doc)[1]!;
  expect(inner.hasAttribute('data-first')).toBe(false);
  expect(inner.querySelector('header')!.className).not.toMatch(/\bsr-only\b/);
});

test('Message.Footer draws time and the status line, and nothing when it has neither', () => {
  const doc = parse(
    <>
      <Message time={SENT_AT} status="read">
        읽은 글
        <Message.Footer />
      </Message>
      <Message status="pending">
        보내는 글
        <Message.Footer />
      </Message>
      <Message>
        보낸 글
        <Message.Footer />
      </Message>
      <Message time={SENT_AT}>
        글<Message.Footer>어제</Message.Footer>
      </Message>
    </>,
  );
  const [read, pending, sent, custom] = articles(doc);
  expect(read!.querySelector('footer')!.textContent).toMatch(/·읽음$/);
  expect(read!.querySelector('header'), 'the footer takes the time from the header').toBeNull();
  expect(pending!.querySelector('footer')!.textContent).toBe('보내는 중');
  expect(sent!.querySelector('footer')).toBeNull();
  expect(custom!.querySelector('footer')!.textContent).toBe('어제');
});

test('status="error" draws the failure line, and the retry button only with onRetry', async () => {
  const onRetry = vi.fn();
  const screen = await render(
    withProvider(
      <>
        <Message from="user" status="error" onRetry={onRetry}>
          다시 보낼 글
        </Message>
        <Message from="user" status="error">
          그냥 실패한 글
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

  await screen.getByRole('button', { name: '다시 보내기' }).click();
  expect(onRetry).toHaveBeenCalledOnce();
  expect(onRetry.mock.calls[0]).toEqual([]);
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
  await screen.getByRole('button', { name: '메시지 복사' }).click();
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
  await screen.getByRole('button', { name: '메시지 복사' }).click();
  await expect.poll(() => copied).toEqual(['**굵게** 원문']);
});

test('an explicit Message.Content is the copy source and keeps the user Bubble', () => {
  const article = articleIn(
    parse(
      <Message from="user">
        <Message.Content className="custom">본문</Message.Content>
      </Message>,
    ),
  );
  const content = article.querySelector('[data-message-content]')!;
  expect(content.className).toContain('custom');
  expect(content.querySelector('[data-bubble]')!.textContent).toBe('본문');
  expect(article.querySelectorAll('[data-message-content]')).toHaveLength(1);
});

test('Tab reaches the actions and the retry button in order, never the article', async () => {
  clipboardThatRecords();
  const screen = await render(
    withProvider(
      <>
        <Message from="assistant" name="도우미">
          답
          <Message.Actions>
            <Message.Copy />
            <IconButton aria-label="다시 답하기" icon={<svg />} />
          </Message.Actions>
        </Message>
        <Message from="user" status="error" onRetry={() => {}}>
          실패
        </Message>
      </>,
    ),
  );
  await expect.element(screen.getByRole('button', { name: '메시지 복사' })).toBeVisible();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '메시지 복사' })).toHaveFocus();
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
        <Message from="user">요약해 줘</Message>
        <Message from="assistant" name="도우미" time={SENT_AT}>
          <Marker>웹 검색 3건</Marker>
          요약입니다.
          <Message.Actions />
        </Message>
        <Message.Group align="start" aria-label="김지수의 메시지">
          <Message name="김지수" avatar="data:image/png;base64,AAAA" time={SENT_AT}>
            <Bubble>학식 메뉴 알려 줘</Bubble>
          </Message>
          <Message name="김지수" avatar="data:image/png;base64,AAAA" time={SENT_AT} status="read">
            <Bubble>오늘 거</Bubble>
            <Message.Footer />
          </Message>
        </Message.Group>
        <Message from="user" status="error" onRetry={() => {}}>
          실패한 글
        </Message>
      </div>,
    ),
  );
  await expect.element(screen.getByRole('button', { name: '메시지 복사' })).toBeVisible();
  const { violations } = await axe.run(screen.container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(violations.map((violation) => violation.id)).toEqual([]);
});
