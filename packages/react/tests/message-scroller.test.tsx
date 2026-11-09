import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, IdsProvider, MessageScroller } from '../src';
import { skipWithoutCdp } from './engines';
import { START_ZONE_PX } from '../src/components/layout/message-scroller/message-scroll';

type Point = { x: number; y: number };

const AT_THE_END_PX = 1;
const SAME_PLACE_PX = 1;
const LIST_PADDING_PX = 16;

const viewport = () => document.querySelector<HTMLElement>('[role="log"]')!;
const list = () => viewport().querySelector('ol')!;
const items = () => [...list().children] as HTMLElement[];
const jump = () => document.querySelector<HTMLElement>('[data-message-scroller-jump]')!;
const distanceToEnd = () =>
  viewport().scrollHeight - viewport().scrollTop - viewport().clientHeight;
const topWithin = (element: Element) =>
  element.getBoundingClientRect().top - viewport().getBoundingClientRect().top;

async function restingTop() {
  let last = Number.NaN;
  await expect
    .poll(() => {
      const now = viewport().scrollTop;
      const resting = now === last;
      last = now;
      return resting;
    })
    .toBe(true);
  return last;
}

const atTheEnd = () => expect.poll(distanceToEnd).toBeLessThanOrEqual(AT_THE_END_PX);
const awayFromTheEnd = () => expect.poll(distanceToEnd).toBeGreaterThan(AT_THE_END_PX);

const frameOffset = (point: Point) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + point.x * scale, y: frame.top + point.y * scale };
};

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', point?: Point) {
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints: point ? [{ ...frameOffset(point), id: 0 }] : [],
  });
}

const lines = (count: number, from = 0) =>
  Array.from({ length: count }, (_, index) => ({
    id: from + index,
    text: `메시지 ${from + index}`,
  }));

function Chat({
  initial = 20,
  ...props
}: Omit<MessageScroller.Props, 'children'> & { initial?: number }) {
  const [messages, setMessages] = useState(() => lines(initial));
  const [grown, setGrown] = useState(0);

  return (
    <IdsProvider>
      <MessageScroller {...props} className="h-64 w-80">
        {messages.map((message, index) => (
          <div key={message.id}>
            <p className="h-8">{message.text}</p>
            {index === messages.length - 1 &&
              Array.from({ length: grown }, (_, line) => (
                <p key={line} className="h-8">
                  이어진 줄 {line}
                </p>
              ))}
            <button type="button">답장 {message.id}</button>
          </div>
        ))}
      </MessageScroller>
      <Button
        onClick={() => setMessages((current) => [...current, ...lines(1, current.length + 100)])}
      >
        받기
      </Button>
      <Button onClick={() => setGrown((count) => count + 1)}>늘리기</Button>
      <Button onClick={() => setMessages((current) => [...lines(5, -5), ...current])}>
        앞에 붙이기
      </Button>
    </IdsProvider>
  );
}

const receive = () => userEvent.click(page.getByRole('button', { name: '받기' }));
const grow = () => userEvent.click(page.getByRole('button', { name: '늘리기' }));
const prepend = () => userEvent.click(page.getByRole('button', { name: '앞에 붙이기' }));

test('draws an ordered list inside a log and starts at the end', async () => {
  render(<Chat />);

  await expect.element(page.getByRole('log', { name: '메시지' })).toBeInTheDocument();
  expect(items()).toHaveLength(20);
  expect(items().every((item) => item.tagName === 'LI')).toBe(true);
  await atTheEnd();
  expect(jump().inert).toBe(true);
});

test('follows appended messages and growth while at the end', async () => {
  render(<Chat />);
  await atTheEnd();

  await receive();
  await atTheEnd();
  await grow();
  await grow();
  await atTheEnd();
});

test('scrolling up stops following and counts what arrives', async () => {
  render(<Chat />);
  await atTheEnd();

  viewport().scrollTop -= 120;
  await expect.poll(() => jump().inert).toBe(false);
  const top = viewport().scrollTop;

  await receive();
  await receive();
  await expect.poll(() => viewport().scrollTop).toBe(top);
  await expect
    .element(page.getByRole('button', { name: '맨 아래로, 새 메시지 2개' }))
    .toHaveTextContent('새 메시지 2개');

  viewport().scrollTop = viewport().scrollHeight;
  await atTheEnd();
  await expect.poll(() => jump().inert).toBe(true);
  await receive();
  await atTheEnd();
});

test('the jump button goes back to the end and follows again', async () => {
  render(<Chat />);
  await atTheEnd();
  viewport().scrollTop = 0;
  await receive();

  await userEvent.click(page.getByRole('button', { name: '맨 아래로, 새 메시지 1개' }));
  await atTheEnd();
  await receive();
  await atTheEnd();
});

test('a wheel turned up stops following before the page moves', async () => {
  render(<Chat />);
  await atTheEnd();

  await userEvent.wheel(page.getByRole('log'), { delta: { y: -80 } });
  await awayFromTheEnd();
  const top = await restingTop();
  await receive();
  expect(await restingTop()).toBe(top);
});

test('PageUp, Home and ArrowUp stop following', async () => {
  for (const key of ['{PageUp}', '{Home}', '{ArrowUp}']) {
    const screen = await render(<Chat />);
    await atTheEnd();

    page.getByRole('button', { name: '답장 19' }).element().focus();
    await userEvent.keyboard(key);
    await awayFromTheEnd();
    const top = await restingTop();
    await receive();
    expect(await restingTop()).toBe(top);

    await screen.unmount();
  }
});

test('selecting text in a message stops following, even at the end', async () => {
  render(<Chat />);
  await atTheEnd();

  await userEvent.tripleClick(page.getByText('메시지 19'));
  expect(document.getSelection()!.isCollapsed).toBe(false);
  const top = viewport().scrollTop;

  await receive();
  await expect.poll(() => jump().inert).toBe(false);
  expect(viewport().scrollTop).toBe(top);
});

test('a finger dragging the list down stops following', async (context) => {
  skipWithoutCdp(context);
  render(<Chat />);
  await atTheEnd();

  const rect = viewport().getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  await touch('touchStart', { x, y: rect.top + 40 });
  for (const y of [70, 100, 130]) await touch('touchMove', { x, y: rect.top + y });
  const heldStill = await restingTop();
  for (let still = 0; still < 3; still++) await touch('touchMove', { x, y: rect.top + 130 });
  await touch('touchEnd');
  expect(await restingTop()).toBeLessThanOrEqual(heldStill);

  await awayFromTheEnd();
  const top = await restingTop();
  await receive();
  expect(await restingTop()).toBe(top);
});

test('stickToBottom={false} keeps the place when messages arrive', async () => {
  render(<Chat stickToBottom={false} />);
  await atTheEnd();
  const top = viewport().scrollTop;

  await receive();
  await expect.poll(() => jump().inert).toBe(false);
  expect(viewport().scrollTop).toBe(top);
});

test('scrollOnAppend="start" holds the new child at the top while it grows', async () => {
  render(<Chat initial={3} scrollOnAppend="start" />);

  await receive();
  const appended = () => items().at(-1)!;
  await expect
    .poll(() => Math.abs(topWithin(appended()) - LIST_PADDING_PX))
    .toBeLessThanOrEqual(SAME_PLACE_PX);

  for (let line = 0; line < 12; line++) await grow();
  await expect
    .poll(() => Math.abs(topWithin(appended()) - LIST_PADDING_PX))
    .toBeLessThanOrEqual(SAME_PLACE_PX);
  await awayFromTheEnd();

  viewport().scrollTop = viewport().scrollHeight;
  await atTheEnd();
  await grow();
  await atTheEnd();
});

test('messages added above keep the one being read in place', async () => {
  render(<Chat />);
  await atTheEnd();
  viewport().scrollTop = 100;
  await expect.poll(() => jump().inert).toBe(false);
  const reading = page.getByText('메시지 5').element();
  const before = topWithin(reading);

  await prepend();
  await expect.poll(() => items().length).toBe(25);
  expect(Math.abs(topWithin(reading) - before)).toBeLessThanOrEqual(SAME_PLACE_PX);
});

test('onReachStart fires once on reaching the top, and not while loading', async () => {
  const onReachStart = vi.fn();
  const screen = await render(<Chat onReachStart={onReachStart} />);
  await atTheEnd();

  viewport().scrollTop = START_ZONE_PX + 40;
  viewport().scrollTop = 10;
  await expect.poll(() => onReachStart).toHaveBeenCalledTimes(1);
  viewport().scrollTop = 0;
  await expect.poll(() => viewport().scrollTop).toBe(0);
  expect(onReachStart).toHaveBeenCalledTimes(1);

  await screen.rerender(<Chat onReachStart={onReachStart} loading />);
  await expect.element(page.getByRole('log')).toHaveAttribute('aria-busy', 'true');
  viewport().scrollTop = START_ZONE_PX + 40;
  viewport().scrollTop = 0;
  await expect.poll(() => viewport().scrollTop).toBe(0);
  expect(onReachStart).toHaveBeenCalledTimes(1);
});

test('the jump button floats centered at the bottom of the scroller', async () => {
  render(<Chat />);
  await atTheEnd();
  viewport().scrollTop = 0;
  await expect.poll(() => jump().inert).toBe(false);
  expect(jump()).toHaveTextContent('');

  const area = document.querySelector('[data-message-scroller]')!.getBoundingClientRect();
  const button = jump().getBoundingClientRect();
  expect(button.bottom).toBeLessThanOrEqual(area.bottom);
  expect(button.right).toBeLessThanOrEqual(area.right);
  expect(button.top).toBeGreaterThanOrEqual(area.top);
  expect(
    Math.abs(button.left + button.width / 2 - (area.left + area.width / 2)),
  ).toBeLessThanOrEqual(SAME_PLACE_PX);
  expect(Math.abs(button.width - button.height)).toBeLessThanOrEqual(SAME_PLACE_PX);
});

test('a part outside MessageScroller throws', () => {
  expect(() => renderToString(<MessageScroller.List />)).toThrow(/inside `<MessageScroller>`/);
  expect(() =>
    renderToString(
      <MessageScroller>
        <MessageScroller.List>안</MessageScroller.List>밖
      </MessageScroller>,
    ),
  ).toThrow(/either inside/);
});
