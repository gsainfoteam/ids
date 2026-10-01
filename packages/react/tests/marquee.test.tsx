import { type ReactNode } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Marquee } from '../src';
import { skipWithoutCdp } from './engines';

const WORDS = ['Alpha', 'Bravo', 'Charlie', 'Delta'];

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');

const parts = (scope: ParentNode) => ({
  root: scope.querySelector<HTMLElement>('[data-marquee]')!,
  viewport: scope.querySelector<HTMLElement>('[data-marquee-viewport]')!,
  track: scope.querySelector<HTMLElement>('[data-marquee-track]')!,
  content: scope.querySelector<HTMLElement>('[data-marquee-content]:not([data-marquee-copy])')!,
  copy: scope.querySelector<HTMLElement>('[data-marquee-copy]'),
  pause: scope.querySelector<HTMLButtonElement>('[data-marquee-pause]'),
});

const playState = (track: HTMLElement) => getComputedStyle(track).animationPlayState;

function words(props: Partial<Marquee.Props> = {}) {
  return (
    <Marquee aria-label="Partners" {...props}>
      {WORDS.map((word) => (
        <Marquee.Item key={word}>{word}</Marquee.Item>
      ))}
    </Marquee>
  );
}

function fixedItems(props: Partial<Marquee.Props> = {}, width = 150) {
  return (
    <Marquee
      aria-label="Fixed"
      reducedMotion={false}
      pauseControl={false}
      className="w-[300px] gap-[20px]"
      {...props}
    >
      {WORDS.map((word) => (
        <Marquee.Item key={word} asChild>
          <button type="button" style={{ width }}>
            {word}
          </button>
        </Marquee.Item>
      ))}
    </Marquee>
  );
}

const NORMAL_PIXELS_PER_SECOND = 50;

async function measured(track: HTMLElement) {
  const root = track.closest<HTMLElement>('[data-marquee]')!;
  const vertical = root.dataset.orientation === 'vertical';
  const loop = Math.round((vertical ? track.offsetHeight : track.offsetWidth) / 2);
  await expect
    .poll(() => root.style.getPropertyValue('--ids-marquee-duration'))
    .toBe(`${Math.round((loop / NORMAL_PIXELS_PER_SECOND) * 1000)}ms`);
}

async function seek(track: HTMLElement, fraction: number) {
  await measured(track);

  const [animation] = track.getAnimations();
  const duration = Number(animation!.effect!.getComputedTiming().duration);
  animation!.currentTime = duration * fraction;
}

const leftOf = (element: Element) => element.getBoundingClientRect().left;
const topOf = (element: Element) => element.getBoundingClientRect().top;

const emulateReducedMotion = (value: 'reduce' | 'no-preference') =>
  cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value }],
  });

const marquees = (scope: ParentNode) => [...scope.querySelectorAll<HTMLElement>('[data-marquee]')];
const trackOf = (root: Element) => root.querySelector<HTMLElement>('[data-marquee-track]')!;
const viewportOf = (root: Element) => root.querySelector<HTMLElement>('[data-marquee-viewport]')!;

test('SSR: a named group holds the items, an aria-hidden inert copy and an unpressed Pause button', () => {
  const doc = html(words());
  const { root, content, copy, pause } = parts(doc);

  expect(root.getAttribute('role')).toBe('group');
  expect(root.getAttribute('aria-label')).toBe('Partners');
  expect(root.dataset.orientation).toBe('horizontal');
  expect(root.hasAttribute('data-playing')).toBe(true);
  expect(root.hasAttribute('data-paused')).toBe(false);
  expect(root.hasAttribute('data-reverse')).toBe(false);
  expect(root.hasAttribute('data-reduced-motion')).toBe(false);
  expect(content.textContent).toBe(WORDS.join(''));
  expect(copy!.textContent).toBe(WORDS.join(''));
  expect(copy!.getAttribute('aria-hidden')).toBe('true');
  expect(copy!.hasAttribute('inert')).toBe(true);
  expect(pause!.getAttribute('aria-pressed')).toBe('false');
  expect(pause!.getAttribute('aria-label')).toBe('일시 정지');
  expect(doc.querySelectorAll('[data-marquee-pause]')).toHaveLength(1);
});

test('SSR: before measuring, a loop takes 1000px at the chosen speed', () => {
  const loops = [
    ['slow', '40000ms'],
    ['normal', '20000ms'],
    ['fast', '10000ms'],
    [80, '12500ms'],
  ] as const;

  for (const [speed, time] of loops) {
    const { root } = parts(html(words({ speed })));
    expect(root.style.getPropertyValue('--ids-marquee-duration'), String(speed)).toBe(time);
  }
});

test('SSR: without a preference known, CSS hides the copy and the button under reduced motion', () => {
  const { copy, pause, viewport } = parts(html(words()));

  expect(copy!.className).toContain('motion-reduce:hidden');
  expect(pause!.className).toContain('motion-reduce:hidden');
  expect(viewport.className).toContain('motion-reduce:me-0');
});

test('SSR: reducedMotion draws the items once, with no copy and no Pause button', () => {
  const { root, copy, pause, content } = parts(html(words({ reducedMotion: true })));

  expect(root.hasAttribute('data-reduced-motion')).toBe(true);
  expect(root.hasAttribute('data-paused')).toBe(true);
  expect(copy).toBeNull();
  expect(pause).toBeNull();
  expect(content.className).toContain('flex-wrap');
  expect(content.className).not.toContain('motion-reduce:');
});

test('SSR: pauseControl={false} leaves the button out and keeps no room for it', () => {
  const { pause, viewport } = parts(html(words({ pauseControl: false })));

  expect(pause).toBeNull();
  expect(viewport.className).not.toMatch(/\bme-\[/);
});

test('a declared Marquee.Pause replaces the default one outside the content, and is not copied', () => {
  const doc = html(
    <Marquee aria-label="Partners">
      <Marquee.Item>Alpha</Marquee.Item>
      <>
        <Marquee.Pause aria-label="Stop the partners" className="custom-pause" />
      </>
    </Marquee>,
  );
  const { root, content, copy } = parts(doc);
  const buttons = doc.querySelectorAll('[data-marquee-pause]');

  expect(buttons).toHaveLength(1);
  expect(buttons[0]!.getAttribute('aria-label')).toBe('Stop the partners');
  expect(buttons[0]!.className).toContain('custom-pause');
  expect(buttons[0]!.parentElement).toBe(root);
  expect(content.querySelector('button')).toBeNull();
  expect(copy!.querySelector('button')).toBeNull();
});

test('before hydration CSS hides the copy under reduced motion, and hydration removes it', async () => {
  const tree = <IdsProvider>{words()}</IdsProvider>;
  const host = document.createElement('div');
  host.innerHTML = renderToString(tree);
  document.body.append(host);
  onTestFinished(() => host.remove());

  const before = parts(host);
  expect(getComputedStyle(before.copy!).display).toBe('none');
  expect(getComputedStyle(before.pause!).display).toBe('none');
  expect(getComputedStyle(before.track).animationName).toBe('none');

  const errors = vi.spyOn(console, 'error');
  onTestFinished(() => errors.mockRestore());
  const recoverable: unknown[] = [];
  const root = hydrateRoot(host, tree, {
    onRecoverableError: (error) => recoverable.push(error),
  });
  onTestFinished(() => root.unmount());

  await expect.poll(() => host.querySelector('[data-marquee-copy]')).toBeNull();
  expect(host.querySelector('[data-marquee-pause]')).toBeNull();
  expect(parts(host).root.hasAttribute('data-reduced-motion')).toBe(true);
  expect(recoverable).toEqual([]);
  expect(errors.mock.calls).toEqual([]);
});

test('following the preference, reduced motion wraps every item in place with no copy or button', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="w-40">{words({ className: 'h-8' })}</div>
    </IdsProvider>,
  );
  const { root, track, copy, pause } = parts(screen.container);

  expect(root.hasAttribute('data-reduced-motion')).toBe(true);
  expect(root.hasAttribute('data-paused')).toBe(true);
  expect(copy).toBeNull();
  expect(pause).toBeNull();
  expect(getComputedStyle(track).animationName).toBe('none');

  const bounds = root.getBoundingClientRect();
  const items = [...root.querySelectorAll('[data-marquee-item]')];
  for (const item of items) {
    const box = item.getBoundingClientRect();
    expect(box.left).toBeGreaterThanOrEqual(bounds.left - 1);
    expect(box.right).toBeLessThanOrEqual(bounds.right + 1);
    expect(box.bottom).toBeLessThanOrEqual(bounds.bottom + 1);
  }
  expect(new Set(items.map(topOf)).size).toBeGreaterThan(1);
});

test('following the preference, it flows without reduced motion and stops when the setting turns on', async (context) => {
  skipWithoutCdp(context);
  await emulateReducedMotion('no-preference');
  onTestFinished(async () => {
    await emulateReducedMotion('reduce');
  });

  const screen = await render(<IdsProvider>{words()}</IdsProvider>);
  const root = () => parts(screen.container).root;

  expect(root().hasAttribute('data-reduced-motion')).toBe(false);
  expect(parts(screen.container).copy).not.toBeNull();
  await expect.element(screen.getByRole('button', { name: '일시 정지' })).toBeVisible();
  expect(getComputedStyle(parts(screen.container).track).animationName).toBe('ids-marquee');
  expect(playState(parts(screen.container).track)).toBe('running');

  await emulateReducedMotion('reduce');
  await expect.poll(() => root().hasAttribute('data-reduced-motion')).toBe(true);
  expect(parts(screen.container).copy).toBeNull();
  expect(parts(screen.container).pause).toBeNull();
  expect(getComputedStyle(parts(screen.container).track).animationName).toBe('none');
});

test('the copy is hidden and inert, so each link is read once and Tab stops once per link', async () => {
  const screen = await render(
    <IdsProvider>
      <button type="button">Before</button>
      <Marquee aria-label="Notices" reducedMotion={false}>
        {WORDS.map((word) => (
          <Marquee.Item key={word} asChild>
            <a href={`#${word}`}>{word}</a>
          </Marquee.Item>
        ))}
      </Marquee>
    </IdsProvider>,
  );

  expect(screen.getByRole('link').elements()).toHaveLength(WORDS.length);
  expect(parts(screen.container).copy!.querySelectorAll('a')).toHaveLength(WORDS.length);

  await userEvent.click(screen.getByRole('button', { name: 'Before' }));
  for (const word of WORDS) {
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('link', { name: word })).toHaveFocus();
  }
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '일시 정지' })).toHaveFocus();
});

test('the Pause button stops the flow until it is pressed again, by pointer or keyboard', async () => {
  const onPlayingChange = vi.fn();
  const screen = await render(
    <IdsProvider>{words({ reducedMotion: false, onPlayingChange })}</IdsProvider>,
  );
  const { root, track } = parts(screen.container);
  const pause = screen.getByRole('button', { name: '일시 정지' });

  await userEvent.click(pause);
  await expect.element(pause).toHaveAttribute('aria-pressed', 'true');
  expect(root.hasAttribute('data-paused')).toBe(true);
  expect(root.hasAttribute('data-playing')).toBe(false);
  expect(playState(track)).toBe('paused');
  expect(onPlayingChange).toHaveBeenLastCalledWith(false);

  await userEvent.keyboard(' ');
  await expect.element(pause).toHaveAttribute('aria-pressed', 'false');
  expect(root.hasAttribute('data-playing')).toBe(true);
  expect(playState(track)).toBe('running');
  expect(onPlayingChange).toHaveBeenLastCalledWith(true);

  await userEvent.keyboard('{Enter}');
  await expect.element(pause).toHaveAttribute('aria-pressed', 'true');
  expect(onPlayingChange).toHaveBeenCalledTimes(3);
});

test('hovering the content pauses only while the pointer stays, and leaves the playing state alone', async () => {
  const screen = await render(
    <IdsProvider>
      <p>Outside</p>
      {words({ reducedMotion: false })}
      {words({ reducedMotion: false, pauseOnHover: false, 'aria-label': 'Keeps flowing' })}
    </IdsProvider>,
  );
  const [pausing, flowing] = marquees(screen.container);

  await userEvent.hover(page.elementLocator(viewportOf(pausing!)));
  expect(playState(trackOf(pausing!))).toBe('paused');
  expect(pausing!.hasAttribute('data-playing')).toBe(true);
  expect(pausing!.querySelector('[data-marquee-pause]')!.getAttribute('aria-pressed')).toBe(
    'false',
  );

  await userEvent.hover(screen.getByText('Outside'));
  expect(playState(trackOf(pausing!))).toBe('running');

  await userEvent.hover(page.elementLocator(viewportOf(flowing!)));
  expect(playState(trackOf(flowing!))).toBe('running');
});

test('keyboard focus inside pauses while it stays, unless pauseOnFocus is off', async () => {
  const linked = (props: Partial<Marquee.Props>) => (
    <Marquee reducedMotion={false} pauseControl={false} {...props}>
      <Marquee.Item asChild>
        <a href="#one">{props['aria-label']} one</a>
      </Marquee.Item>
    </Marquee>
  );
  const screen = await render(
    <IdsProvider>
      <button type="button">Start</button>
      {linked({ 'aria-label': 'Pausing' })}
      {linked({ 'aria-label': 'Flowing', pauseOnFocus: false })}
      <button type="button">End</button>
    </IdsProvider>,
  );
  const [pausing, flowing] = marquees(screen.container);

  await userEvent.click(screen.getByRole('button', { name: 'Start' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('link', { name: 'Pausing one' })).toHaveFocus();
  expect(playState(trackOf(pausing!))).toBe('paused');
  expect(pausing!.hasAttribute('data-playing')).toBe(true);

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('link', { name: 'Flowing one' })).toHaveFocus();
  expect(playState(trackOf(pausing!))).toBe('running');
  expect(playState(trackOf(flowing!))).toBe('running');
});

test('playing is controlled: the button asks through onPlayingChange and the prop decides', async () => {
  const onPlayingChange = vi.fn();
  const screen = await render(
    <IdsProvider>{words({ reducedMotion: false, playing: true, onPlayingChange })}</IdsProvider>,
  );
  const pause = screen.getByRole('button', { name: '일시 정지' });

  await userEvent.click(pause);
  expect(onPlayingChange).toHaveBeenCalledWith(false);
  await expect.element(pause).toHaveAttribute('aria-pressed', 'false');
  expect(parts(screen.container).root.hasAttribute('data-playing')).toBe(true);

  await screen.rerender(
    <IdsProvider>{words({ reducedMotion: false, playing: false, onPlayingChange })}</IdsProvider>,
  );
  await expect.element(pause).toHaveAttribute('aria-pressed', 'true');
  expect(parts(screen.container).root.hasAttribute('data-paused')).toBe(true);
  expect(playState(parts(screen.container).track)).toBe('paused');
});

test('defaultPlaying={false} starts paused with the button pressed', async () => {
  const screen = await render(
    <IdsProvider>{words({ reducedMotion: false, defaultPlaying: false })}</IdsProvider>,
  );

  await expect
    .element(screen.getByRole('button', { name: '일시 정지' }))
    .toHaveAttribute('aria-pressed', 'true');
  expect(playState(parts(screen.container).track)).toBe('paused');
});

test('a loop takes the measured length at the chosen speed, and follows the content as it resizes', async () => {
  const screen = await render(<IdsProvider>{fixedItems({ speed: 100 })}</IdsProvider>);
  const { root } = parts(screen.container);
  const loopOf = (items: number, width: number, gap: number) => items * width + items * gap;

  await expect
    .poll(() => root.style.getPropertyValue('--ids-marquee-duration'))
    .toBe(`${(loopOf(4, 150, 20) / 100) * 1000}ms`);

  await screen.rerender(<IdsProvider>{fixedItems({ speed: 100 }, 200)}</IdsProvider>);
  await expect
    .poll(() => root.style.getPropertyValue('--ids-marquee-duration'))
    .toBe(`${(loopOf(4, 200, 20) / 100) * 1000}ms`);
});

test('the gap between the two copies is the gap between items, so the copy lands where the content was', async () => {
  const screen = await render(<IdsProvider>{fixedItems({ defaultPlaying: false })}</IdsProvider>);
  const { track, content, copy } = parts(screen.container);
  const items = [...content.children];
  const copied = [...copy!.children];

  expect(leftOf(items[1]!) - items[0]!.getBoundingClientRect().right).toBeCloseTo(20, 0);
  expect(leftOf(copied[0]!) - items.at(-1)!.getBoundingClientRect().right).toBeCloseTo(20, 0);
  expect(leftOf(copy!) - leftOf(content)).toBeCloseTo(track.getBoundingClientRect().width / 2, 0);
});

test('content shorter than the strip still fills it, spreading its items', async () => {
  const screen = await render(
    <IdsProvider>
      {fixedItems({ className: 'w-[1000px] gap-[20px]', defaultPlaying: false }, 50)}
    </IdsProvider>,
  );
  const { viewport, content } = parts(screen.container);
  const items = [...content.children];

  expect(content.getBoundingClientRect().width).toBeCloseTo(viewport.clientWidth, 0);
  expect(leftOf(items[1]!) - items[0]!.getBoundingClientRect().right).toBeGreaterThan(20);
});

test('right to left flows the other way and puts the Pause button on the left', async () => {
  const screen = await render(
    <IdsProvider dir="rtl">{words({ reducedMotion: false, defaultPlaying: false })}</IdsProvider>,
  );
  const { track, viewport, pause } = parts(screen.container);

  expect(getComputedStyle(track).getPropertyValue('--ids-marquee-translate').trim()).toBe('50%');
  expect(pause!.getBoundingClientRect().right).toBeLessThanOrEqual(leftOf(viewport));

  const atRest = track.getBoundingClientRect().right;
  await seek(track, 0.25);
  const loop = track.getBoundingClientRect().width / 2;
  expect(track.getBoundingClientRect().right - atRest).toBeCloseTo(loop / 4, 0);
});

test('left to right flows toward the start, and reverse runs the other way', async () => {
  const screen = await render(
    <IdsProvider>
      {words({ reducedMotion: false, defaultPlaying: false })}
      {words({ reducedMotion: false, defaultPlaying: false, reverse: true, 'aria-label': 'Back' })}
    </IdsProvider>,
  );
  const [forward, backward] = marquees(screen.container).map(trackOf);
  const offset = (track: HTMLElement) => leftOf(track) - leftOf(track.parentElement!);

  expect(offset(forward!)).toBeCloseTo(0, 0);
  await seek(forward!, 0.25);
  expect(offset(forward!)).toBeCloseTo(-forward!.offsetWidth / 8, 0);

  expect(getComputedStyle(backward!).animationDirection).toBe('reverse');
  expect(backward!.closest('[data-marquee]')!.hasAttribute('data-reverse')).toBe(true);
  await seek(backward!, 0.25);
  expect(offset(backward!)).toBeCloseTo((-backward!.offsetWidth / 2) * 0.75, 0);
});

test('vertical moves up along the column inside the height it is given', async () => {
  const screen = await render(
    <IdsProvider>
      {words({
        orientation: 'vertical',
        reducedMotion: false,
        defaultPlaying: false,
        className: 'h-40 w-64',
      })}
    </IdsProvider>,
  );
  const { root, track, content } = parts(screen.container);

  expect(root.dataset.orientation).toBe('vertical');
  expect(root.getBoundingClientRect().height).toBe(160);
  expect(getComputedStyle(content).flexDirection).toBe('column');
  expect(content.getBoundingClientRect().height).toBeGreaterThanOrEqual(160 - 1);

  const atRest = topOf(track);
  await seek(track, 0.25);
  expect(topOf(track) - atRest).toBeCloseTo(-track.offsetHeight / 8, 0);
});

test('fade masks both ends unless fade={false}', async () => {
  const screen = await render(
    <IdsProvider>
      {words({ reducedMotion: false })}
      {words({ reducedMotion: false, fade: false, 'aria-label': 'Sharp' })}
    </IdsProvider>,
  );
  const [faded, sharp] = [...screen.container.querySelectorAll('[data-marquee-viewport]')];

  expect(getComputedStyle(faded!).maskImage).toMatch(/linear-gradient/);
  expect(getComputedStyle(sharp!).maskImage).toBe('none');
});

test('Marquee.Item keeps its content on one line and passes itself onto its child with asChild', async () => {
  const screen = await render(
    <IdsProvider>
      <Marquee aria-label="Items" reducedMotion={false}>
        <Marquee.Item>A long notice that stays on one line</Marquee.Item>
        <Marquee.Item asChild>
          <a href="#more">More</a>
        </Marquee.Item>
      </Marquee>
    </IdsProvider>,
  );
  const [text, link] = [...parts(screen.container).content.children] as HTMLElement[];

  expect(getComputedStyle(text!).whiteSpace).toBe('nowrap');
  expect(getComputedStyle(text!).flexShrink).toBe('0');
  expect(link!.tagName).toBe('A');
  expect(link!.hasAttribute('data-marquee-item')).toBe(true);
});

async function tabThroughCentering(props: Partial<Marquee.Props>, dir?: 'rtl') {
  const screen = await render(
    <IdsProvider dir={dir}>
      <button type="button">Start</button>
      {fixedItems({ defaultPlaying: false, ...props })}
    </IdsProvider>,
  );
  const { viewport, track } = parts(screen.container);
  const middle = (viewport.clientWidth - 150) / 2;
  await measured(track);

  await userEvent.click(screen.getByRole('button', { name: 'Start' }));
  for (const word of WORDS) {
    await userEvent.keyboard('{Tab}');
    const item = screen.getByRole('button', { name: word });
    await expect.element(item).toHaveFocus();
    expect(leftOf(item.element()) - leftOf(viewport), word).toBeCloseTo(middle, 0);
  }
}

test('keyboard focus brings each item to the middle of the strip, the first one too', async () => {
  await tabThroughCentering({});
});

test('keyboard focus centers items when the strip runs in reverse', async () => {
  await tabThroughCentering({ reverse: true });
});

test('keyboard focus centers items in a right-to-left strip', async () => {
  await tabThroughCentering({}, 'rtl');
});

test('pointing at a copied item puts the original under the pointer, so a click reaches it', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Marquee
        aria-label="Buttons"
        reducedMotion={false}
        pauseControl={false}
        defaultPlaying={false}
        className="w-[300px] gap-[20px]"
      >
        {WORDS.map((word) => (
          <Marquee.Item key={word} asChild>
            <button type="button" style={{ width: 150 }} onClick={() => onClick(word)}>
              {word}
            </button>
          </Marquee.Item>
        ))}
      </Marquee>
    </IdsProvider>,
  );
  const { track, copy } = parts(screen.container);
  await seek(track, 0.9);
  const copiedAlpha = copy!.querySelector('button')!;

  await userEvent.hover(page.elementLocator(copiedAlpha), { force: true });
  expect(track.hasAttribute('data-swapped')).toBe(true);

  await userEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(onClick).toHaveBeenCalledWith('Alpha');
});

test('size sets the Pause button: 36px standard, 32px tiny', async () => {
  const screen = await render(
    <IdsProvider>
      {words({ reducedMotion: false })}
      {words({ reducedMotion: false, size: 'tiny', 'aria-label': 'Tiny' })}
    </IdsProvider>,
  );
  const [standard, tiny] = screen.getByRole('button', { name: '일시 정지' }).elements();

  expect(standard!.getBoundingClientRect().width).toBe(36);
  expect(tiny!.getBoundingClientRect().width).toBe(32);
});

test('development warns without a name, and aria-labelledby counts as one', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(
    <IdsProvider>
      <span id="partners">Partners</span>
      <Marquee aria-labelledby="partners">
        <Marquee.Item>A</Marquee.Item>
      </Marquee>
    </IdsProvider>,
  );
  expect(warn).not.toHaveBeenCalled();

  await render(
    <IdsProvider>
      <Marquee speed={0}>
        <Marquee.Item>A</Marquee.Item>
      </Marquee>
    </IdsProvider>,
  );
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('[IDS] Marquee: give it an aria-label'),
  );
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('[IDS] Marquee: speed must be'));
});
