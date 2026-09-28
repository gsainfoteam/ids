import { useState, type ReactNode } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Avatar, initialsOf } from '../src';

const avatarOf = (node: ReactNode) =>
  new DOMParser()
    .parseFromString(renderToString(node), 'text/html')
    .querySelector<HTMLElement>('[data-avatar]')!;

const PICTURE = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"/>';
const INLINE_PICTURE = `data:image/svg+xml;base64,${btoa(PICTURE)}`;
const HELD = '/__held-avatar__/';
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

async function cdpReadyForListeners() {
  const session = cdp();
  await session.send('Fetch.disable');
  return session;
}

async function holdImages() {
  const session = await cdpReadyForListeners();
  const paused = new Map<string, string>();
  const onPaused = (event: { requestId: string; request: { url: string } }) => {
    paused.set(new URL(event.request.url).pathname, event.requestId);
  };
  session.on('Fetch.requestPaused', onPaused);
  await session.send('Fetch.enable', { patterns: [{ urlPattern: `*${HELD}*` }] });
  onTestFinished(async () => {
    session.off('Fetch.requestPaused', onPaused);
    await session.send('Fetch.disable');
  });
  const requestOf = async (src: string) => {
    await expect.poll(() => paused.get(src), { message: `${src} is requested` }).toBeDefined();
    return paused.get(src)!;
  };
  return {
    async load(src: string) {
      await session.send('Fetch.fulfillRequest', {
        requestId: await requestOf(src),
        responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'image/svg+xml' }],
        body: btoa(PICTURE),
      });
    },
    async fail(src: string) {
      await session.send('Fetch.failRequest', {
        requestId: await requestOf(src),
        errorReason: 'Failed',
      });
    },
  };
}

test('SSR: a named image with an empty inner alt, and no fallback while the image loads', () => {
  const doc = new DOMParser().parseFromString(
    renderToString(<Avatar src="/alice.png" name="Alice Kim" />),
    'text/html',
  );
  const root = doc.querySelector<HTMLElement>('[data-avatar]')!;
  expect(root.getAttribute('role')).toBe('img');
  expect(root.getAttribute('aria-label')).toBe('Alice Kim');
  expect(root.dataset.status).toBe('loading');
  expect(root.dataset.shape).toBe('circle');
  expect(root.dataset.size).toBe('standard');
  const img = doc.querySelector('img')!;
  expect(img.getAttribute('alt')).toBe('');
  expect(img.getAttribute('loading')).toBe('lazy');
  expect(img.getAttribute('decoding')).toBe('async');
  expect(doc.querySelector('[data-avatar-fallback]'), 'initials wait for the image').toBeNull();
});

test('without an image the fallback shows at once: initials, or an icon without a name', () => {
  const named = avatarOf(<Avatar name="류현승" />);
  expect(named.dataset.status).toBe('error');
  expect(named.textContent).toBe('류');
  expect(named.querySelector('[data-avatar-fallback]')!.getAttribute('aria-hidden')).toBe('true');
  const anonymous = avatarOf(<Avatar alt="Unknown user" />);
  expect(anonymous.getAttribute('aria-label')).toBe('Unknown user');
  expect(anonymous.querySelector('[data-avatar-fallback] svg')).not.toBeNull();
});

test('load and error move the status; a broken image leaves the DOM for the initials', async () => {
  const images = await holdImages();
  const statuses: Avatar.Status[] = [];
  const screen = await render(
    <Avatar src={`${HELD}a.png`} name="Alice Kim" onStatusChange={(s) => statuses.push(s)} />,
  );
  const avatar = screen.getByRole('img', { name: 'Alice Kim' });
  await expect.element(avatar).toHaveAttribute('data-status', 'loading');
  await images.load(`${HELD}a.png`);
  await expect.element(avatar).toHaveAttribute('data-status', 'loaded');
  expect(screen.container.querySelector('[data-avatar-fallback]')).toBeNull();
  await screen.rerender(
    <Avatar src={`${HELD}b.png`} name="Alice Kim" onStatusChange={(s) => statuses.push(s)} />,
  );
  await expect
    .element(avatar, { message: 'a new src starts over' })
    .toHaveAttribute('data-status', 'loading');
  await images.fail(`${HELD}b.png`);
  await expect.element(avatar).toHaveAttribute('data-status', 'error');
  expect(screen.container.querySelector('img')).toBeNull();
  expect(avatar.element().textContent).toBe('AK');
  await expect.poll(() => statuses).toEqual(['loading', 'loaded', 'loading', 'error']);
});

test('the fallback waits for its delay while the image loads', async () => {
  const images = await holdImages();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const screen = await render(
    <Avatar src={`${HELD}slow.png`} name="Bob Lee">
      <Avatar.Fallback delay={40} />
    </Avatar>,
  );
  const fallback = () => screen.container.querySelector('[data-avatar-fallback]');
  expect(fallback()).toBeNull();
  vi.advanceTimersByTime(60);
  await expect.poll(() => fallback()?.textContent).toBe('BL');
  await images.load(`${HELD}slow.png`);
  await expect.poll(fallback).toBeNull();
});

test('a late event from a previous src does not overwrite the current one', async () => {
  const images = await holdImages();
  function App() {
    const [src, setSrc] = useState(`${HELD}old.png`);
    return (
      <div>
        <Avatar src={src} name="Alice Kim" />
        <button type="button" onClick={() => setSrc(`${HELD}new.png`)}>
          swap
        </button>
      </div>
    );
  }
  const screen = await render(<App />);
  const avatar = screen.getByRole('img', { name: 'Alice Kim' });
  const old = screen.container.querySelector('img')!;
  await userEvent.click(screen.getByRole('button', { name: 'swap' }));
  expect(screen.container.querySelector('img'), 'the new src is a new element').not.toBe(old);
  await images.load(`${HELD}new.png`);
  await expect.element(avatar).toHaveAttribute('data-status', 'loaded');
  const lateError = new Promise((resolve) =>
    old.addEventListener('error', resolve, { once: true }),
  );
  await images.fail(`${HELD}old.png`);
  await lateError;
  await nextFrame();
  await expect.element(avatar).toHaveAttribute('data-status', 'loaded');
});

test('an image that completed before React listened is read on mount', async () => {
  const avatar = <Avatar src={INLINE_PICTURE} name="Alice Kim" />;
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(avatar);
  const image = container.querySelector('img')!;
  await new Promise((resolve) => image.addEventListener('load', resolve, { once: true }));
  const root = hydrateRoot(container, avatar);
  onTestFinished(() => {
    root.unmount();
    container.remove();
  });
  await expect
    .element(container.querySelector<HTMLElement>('[data-avatar]')!)
    .toHaveAttribute('data-status', 'loaded');
});

test('alt="" makes it decorative; state reaches className and fallback children', async () => {
  const screen = await render(<Avatar name="Alice Kim" alt="" />);
  const avatar = screen.container.querySelector<HTMLElement>('[data-avatar]')!;
  await expect.element(avatar).toHaveAttribute('aria-hidden', 'true');
  await expect.element(avatar).not.toHaveAttribute('role');
  await screen.rerender(
    <Avatar
      name="Acme"
      shape="square"
      size="tiny"
      className={(state) => `status-${state.status} shape-${state.shape}`}
    >
      <Avatar.Fallback>{(state) => `${state.size}`}</Avatar.Fallback>
    </Avatar>,
  );
  await expect.element(avatar).toHaveClass('status-error');
  await expect.element(avatar).toHaveClass('shape-square');
  expect(avatar.textContent).toBe('tiny');
  await expect.element(avatar).toHaveAttribute('data-shape', 'square');
});

test('Avatar.Image takes its own src and native attributes', async () => {
  await holdImages();
  const screen = await render(
    <Avatar name="Alice Kim">
      <Avatar.Image src={`${HELD}own.png`} referrerPolicy="no-referrer" loading="eager" />
    </Avatar>,
  );
  const image = screen.container.querySelector('img')!;
  expect(image.getAttribute('src')).toBe(`${HELD}own.png`);
  expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
  expect(image.getAttribute('loading')).toBe('eager');
  await expect
    .element(screen.getByRole('img', { name: 'Alice Kim' }))
    .toHaveAttribute('data-status', 'loading');
});

test('initials: Korean family name, two Latin words, graphemes and punctuation', () => {
  expect(initialsOf('Alice Kim')).toBe('AK');
  expect(initialsOf('ada lovelace king')).toBe('AL');
  expect(initialsOf('류현승')).toBe('류');
  expect(initialsOf('홍 길동')).toBe('홍');
  expect(initialsOf('Émile Zola')).toBe('ÉZ');
  expect(initialsOf('(주)아크메')).toBe('주');
  expect(initialsOf('🦊 Fox')).toBe('F');
  expect(initialsOf('   ')).toBe('');
});

test('parts outside Avatar throw', () => {
  expect(() => renderToString(<Avatar.Fallback />)).toThrow(/inside `<Avatar>`/);
});
