import { act, createRef, type ReactNode } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Avatar, Card, IdsProvider, Skeleton } from '../src';
import { skipWithoutCdp } from './engines';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');

const skeletonIn = (root: ParentNode) => root.querySelector<HTMLElement>('[data-skeleton]')!;

const box = (element: Element) => element.getBoundingClientRect();

async function preferMotion(value: 'reduce' | 'no-preference') {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value }],
  });
}

async function withMotion() {
  await preferMotion('no-preference');
  onTestFinished(() => preferMotion('reduce'));
}

function Wrapped({ loading }: { loading: boolean }) {
  return (
    <IdsProvider>
      <button type="button">Before</button>
      <Skeleton loading={loading} data-testid="wrapper">
        <input aria-label="Name" data-1p-ignore data-lpignore="true" />
      </Skeleton>
      <button type="button">After</button>
    </IdsProvider>
  );
}

test('SSR: a shape is an aria-hidden span that names its shape and animation', () => {
  const rect = skeletonIn(html(<Skeleton />));
  expect(rect.tagName).toBe('SPAN');
  expect(rect.getAttribute('aria-hidden')).toBe('true');
  expect(rect.dataset.shape).toBe('rect');
  expect(rect.dataset.animation).toBe('pulse');
  expect(rect.hasAttribute('aria-busy')).toBe(false);
  expect(rect.hasAttribute('data-loading')).toBe(false);
  expect(rect.className).toContain('before:h-4');
  expect(rect.className).toMatch(/\bw-full\b/);
  expect(rect.className).toMatch(/\brounded-standard\b/);
  expect(rect.className).toContain('bg-(--ids-color-muted)');
  expect(rect.className).toContain('animate-skeleton-pulse');
  expect(rect.className).toContain('motion-reduce:animate-none');

  const circle = skeletonIn(html(<Skeleton shape="circle" animation="wave" />));
  expect(circle.dataset.shape).toBe('circle');
  expect(circle.dataset.animation).toBe('wave');
  expect(circle.className).toMatch(/\bsize-10\b/);
  expect(circle.className).toMatch(/\brounded-full\b/);
  expect(circle.className).toContain('animate-skeleton-wave');

  const still = skeletonIn(html(<Skeleton animation="none" className="h-6 w-40" />));
  expect(still.className).not.toMatch(/animate-/);
  expect(still.className).not.toMatch(/\bw-full\b/);
  expect(still.className).toMatch(/\bh-6 w-40\b/);
});

test('SSR: a text shape draws one line box per line and the last of several is shorter', () => {
  const lines = (props: Skeleton.Props) => {
    const root = skeletonIn(html(<Skeleton shape="text" {...props} />));
    return Array.from(root.children, (line) => line.firstElementChild as HTMLElement);
  };

  const three = lines({ lines: 3, className: 'text-body-b3-regular' });
  expect(three).toHaveLength(3);
  for (const bar of three) {
    expect(bar.parentElement!.className).toContain('h-[1lh]');
    expect(bar.className).toContain('h-[1em]');
    expect(bar.className).toMatch(/\brounded-indicator\b/);
    expect(bar.className).toContain('animate-skeleton-pulse');
  }
  expect(three.map((bar) => /\bw-3\/5\b/.test(bar.className))).toEqual([false, false, true]);

  const one = lines({});
  expect(one).toHaveLength(1);
  expect(one[0]!.className).toMatch(/\bw-full\b/);
  expect(lines({ lines: 0 })).toHaveLength(1);
  expect(lines({ lines: Number.NaN })).toHaveLength(1);
  expect(lines({ lines: 2.7 })).toHaveLength(2);

  const root = skeletonIn(html(<Skeleton shape="text" className="text-body-b3-medium w-1/3" />));
  expect(root.className).not.toContain('bg-(--ids-color-muted)');
  expect(root.className).toBe('block text-body-b3-medium w-1/3');
});

test('SSR: wrapping paints the div, marks it busy and puts the children in an inert box', () => {
  const loading = skeletonIn(
    html(
      <Skeleton>
        <button type="button">Save</button>
      </Skeleton>,
    ),
  );
  expect(loading.tagName).toBe('DIV');
  expect(loading.getAttribute('aria-busy')).toBe('true');
  expect(loading.hasAttribute('data-loading')).toBe(true);
  expect(loading.hasAttribute('aria-hidden')).toBe(false);
  expect(loading.hasAttribute('data-shape')).toBe(false);
  expect(loading.hasAttribute('inert')).toBe(false);
  expect(loading.className).toMatch(/\brounded-standard\b/);
  expect(loading.className).toContain('bg-(--ids-color-muted)');
  const content = loading.firstElementChild as HTMLElement;
  expect(content.hasAttribute('data-skeleton-content')).toBe(true);
  expect(content.hasAttribute('inert')).toBe(true);
  expect(content.className).toBe('contents invisible');
  expect(content.firstElementChild!.tagName).toBe('BUTTON');

  const loaded = skeletonIn(
    html(
      <Skeleton loading={false} className="w-40">
        <button type="button">Save</button>
      </Skeleton>,
    ),
  );
  expect(loaded.hasAttribute('aria-busy')).toBe(false);
  expect(loaded.hasAttribute('data-loading')).toBe(false);
  expect(loaded.className).toBe('w-40');
  const loadedContent = loaded.firstElementChild as HTMLElement;
  expect(loadedContent.hasAttribute('data-skeleton-content')).toBe(true);
  expect(loadedContent.hasAttribute('inert')).toBe(false);
  expect(loadedContent.className).toBe('contents');
  expect(loadedContent.firstElementChild!.tagName).toBe('BUTTON');
});

test('SSR: asChild paints the child itself, keeps its radius and makes it inert', () => {
  const tree = (loading: boolean) =>
    html(
      <Skeleton loading={loading} asChild animation="wave">
        <section aria-label="Profile" className="rounded-container shadow-xs">
          <h2>Kim</h2>
        </section>
      </Skeleton>,
    ).querySelector<HTMLElement>('section')!;

  const loading = tree(true);
  expect(loading.hasAttribute('data-skeleton')).toBe(true);
  expect(loading.getAttribute('aria-busy')).toBe('true');
  expect(loading.hasAttribute('inert')).toBe(true);
  expect(loading.hasAttribute('data-loading')).toBe(true);
  expect(loading.dataset.animation).toBe('wave');
  expect(loading.getAttribute('aria-label')).toBe('Profile');
  expect(loading.className).toMatch(/\brounded-container\b/);
  expect(loading.className).not.toMatch(/\brounded-standard\b/);
  expect(loading.className).not.toMatch(/\bshadow-xs\b/);
  expect(loading.className).toContain('animate-skeleton-wave');
  expect(loading.className).toContain('[&_*]:invisible');
  expect(loading.querySelector('[data-skeleton-content]')).toBeNull();

  const loaded = tree(false);
  expect(loaded.hasAttribute('aria-busy')).toBe(false);
  expect(loaded.hasAttribute('inert')).toBe(false);
  expect(loaded.hasAttribute('data-loading')).toBe(false);
  expect(loaded.className).toBe('rounded-container shadow-xs');
  expect(loaded.firstElementChild!.tagName).toBe('H2');
});

test('the server markup hydrates without a mismatch in both modes', async () => {
  const tree = (
    <IdsProvider>
      <Skeleton />
      <Skeleton shape="text" lines={2} />
      <Skeleton>
        <p>Loading text</p>
      </Skeleton>
      <Skeleton loading asChild>
        <Avatar name="Kim" />
      </Skeleton>
    </IdsProvider>
  );
  const skeletonMarkup = (root: ParentNode) =>
    Array.from(root.querySelectorAll('[data-skeleton]'), (element) => element.outerHTML);
  const host = document.createElement('div');
  host.innerHTML = renderToString(tree);
  document.body.append(host);
  const serverMarkup = skeletonMarkup(host);
  const errors = vi.spyOn(console, 'error');
  const recoverable: unknown[] = [];
  const actEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
  onTestFinished(() => {
    errors.mockRestore();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', actEnvironment);
    host.remove();
  });

  const root = await act(async () =>
    hydrateRoot(host, tree, { onRecoverableError: (error) => recoverable.push(error) }),
  );

  expect(recoverable).toEqual([]);
  expect(errors.mock.calls).toEqual([]);
  expect(serverMarkup).toHaveLength(4);
  expect(skeletonMarkup(host)).toEqual(serverMarkup);
  act(() => root.unmount());
});

test('Tab skips the content while loading, and loading false shows the same nodes', async () => {
  const screen = await render(<Wrapped loading />);
  const wrapper = screen.getByTestId('wrapper');
  const input = screen.container.querySelector('input')!;

  await expect.element(wrapper).toHaveAttribute('aria-busy', 'true');
  await expect.element(input).not.toBeVisible();
  await expect.element(screen.getByRole('textbox', { name: 'Name' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Before' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();

  await screen.rerender(<Wrapped loading={false} />);
  await expect.element(wrapper).not.toHaveAttribute('aria-busy');
  await expect.element(wrapper).not.toHaveAttribute('data-loading');
  expect(screen.container.querySelector('input')).toBe(input);
  await expect.element(input).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Before' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
});

test('asChild merges into an IDS component: its radius, its ref and its own props stay', async () => {
  const ref = createRef<HTMLElement>();
  const screen = await render(
    <IdsProvider>
      <Card data-testid="plain">
        <Card.Title>Plain</Card.Title>
      </Card>
      <Skeleton loading asChild ref={ref}>
        <Card data-testid="painted" className="w-60">
          <Card.Title>Painted</Card.Title>
        </Card>
      </Skeleton>
      <span data-testid="muted" className="block bg-(--ids-color-muted)" />
    </IdsProvider>,
  );
  const plain = screen.getByTestId('plain').element();
  const painted = screen.getByTestId('painted').element() as HTMLElement;
  const muted = screen.getByTestId('muted').element();

  expect(ref.current).toBe(painted);
  expect(painted.hasAttribute('data-card')).toBe(true);
  expect(painted.hasAttribute('inert')).toBe(true);
  expect(painted.getAttribute('aria-busy')).toBe('true');
  expect(painted.className).toMatch(/\bw-60\b/);
  expect(getComputedStyle(painted).borderRadius).toBe(getComputedStyle(plain).borderRadius);
  expect(getComputedStyle(painted).backgroundColor).toBe(getComputedStyle(muted).backgroundColor);
  expect(getComputedStyle(painted).boxShadow, 'no layer draws').not.toMatch(/[1-9][\d.]*px/);
  await expect.element(screen.getByText('Painted')).not.toBeVisible();
  await expect.element(screen.getByText('Plain')).toBeVisible();
});

test('asChild on an Avatar keeps its circle and size and hides its initials and ring', async () => {
  const screen = await render(
    <IdsProvider>
      <Avatar name="Lee" data-testid="plain" />
      <Skeleton loading asChild>
        <Avatar name="Kim" data-testid="painted" />
      </Skeleton>
    </IdsProvider>,
  );
  const plain = screen.getByTestId('plain').element();
  const painted = screen.getByTestId('painted').element();

  expect(painted.hasAttribute('inert')).toBe(true);
  expect(getComputedStyle(painted).borderRadius).toBe(getComputedStyle(plain).borderRadius);
  expect([box(painted).width, box(painted).height]).toEqual([box(plain).width, box(plain).height]);
  expect(getComputedStyle(painted, '::after').visibility).toBe('hidden');
  expect(getComputedStyle(plain, '::after').visibility).toBe('visible');
  await expect.element(screen.getByText('K', { exact: true })).not.toBeVisible();
  await expect.element(screen.getByText('L', { exact: true })).toBeVisible();
});

test('a rect is 16px tall until a height, an aspect ratio, insets or a stretch size it', async () => {
  const screen = await render(
    <div className="w-64">
      <Skeleton data-testid="default" />
      <Skeleton data-testid="thin" className="h-2 w-40" />
      <Skeleton data-testid="video" className="aspect-video w-40" />
      <div className="relative h-24 w-40">
        <Skeleton data-testid="inset" className="absolute inset-0" />
      </div>
      <div className="flex h-12">
        <Skeleton data-testid="stretch" className="w-20" />
      </div>
      <Skeleton data-testid="circle" shape="circle" />
      <Skeleton data-testid="large-circle" shape="circle" className="size-12" />
    </div>,
  );
  const size = (id: string) => {
    const { width, height } = box(screen.getByTestId(id).element());
    return [width, height];
  };

  expect(size('default')).toEqual([256, 16]);
  expect(size('thin')).toEqual([160, 8]);
  expect(size('video')).toEqual([160, 90]);
  expect(size('inset')).toEqual([160, 96]);
  expect(size('stretch')).toEqual([80, 48]);
  expect(size('circle')).toEqual([40, 40]);
  expect(size('large-circle')).toEqual([48, 48]);
});

test('text lines are as tall as the text they stand for, with a bar one em high', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="grid w-80 grid-cols-2 items-start gap-4">
        <Skeleton data-testid="b3" shape="text" lines={3} className="text-body-b3-regular" />
        <p data-testid="b3-text" className="text-body-b3-regular">
          One
          <br />
          Two
          <br />
          Three
        </p>
        <Skeleton data-testid="s2" shape="text" className="text-subtitle-s2-semibold" />
        <p data-testid="s2-text" className="text-subtitle-s2-semibold">
          Title
        </p>
        <Skeleton data-testid="c1" shape="text" lines={2} className="text-caption-c1-regular" />
        <p data-testid="c1-text" className="text-caption-c1-regular">
          One
          <br />
          Two
        </p>
      </div>
    </IdsProvider>,
  );
  const height = (id: string) => box(screen.getByTestId(id).element()).height;

  for (const id of ['b3', 's2', 'c1'])
    expect(Math.abs(height(id) - height(`${id}-text`)), id).toBeLessThan(0.5);

  const b3 = screen.getByTestId('b3').element();
  const bars = Array.from(b3.children, (line) => line.firstElementChild!);
  expect(box(bars[0]!).height).toBeCloseTo(parseFloat(getComputedStyle(b3).fontSize), 1);
  expect(box(bars[2]!).width / box(b3).width).toBeCloseTo(0.6, 2);
});

test('with motion reduced both animations stop on the plain muted fill', async (context) => {
  skipWithoutCdp(context);
  await withMotion();
  const screen = await render(
    <IdsProvider>
      <div className="w-40">
        <Skeleton data-testid="pulse" />
        <Skeleton data-testid="wave" animation="wave" />
        <span data-testid="muted" className="block bg-(--ids-color-muted)" />
      </div>
    </IdsProvider>,
  );
  const pulse = screen.getByTestId('pulse').element();
  const wave = screen.getByTestId('wave').element();
  const mutedFill = getComputedStyle(screen.getByTestId('muted').element()).backgroundColor;
  const animationNames = (element: Element) =>
    element.getAnimations().map((animation) => (animation as CSSAnimation).animationName);

  expect(animationNames(pulse)).toEqual(['ids-skeleton-pulse']);
  expect(animationNames(wave)).toEqual(['ids-skeleton-wave']);
  expect(getComputedStyle(wave).backgroundImage).toContain('linear-gradient');

  await preferMotion('reduce');
  await expect.poll(() => animationNames(pulse)).toEqual([]);
  expect(animationNames(wave)).toEqual([]);
  expect(getComputedStyle(pulse).backgroundColor).toBe(mutedFill);
  expect(getComputedStyle(wave).backgroundColor).toBe(mutedFill);
  expect(getComputedStyle(wave).backgroundImage).toBe('none');
});

test('the wave travels in the reading direction and backwards in right-to-left text', async (context) => {
  skipWithoutCdp(context);
  await withMotion();
  const screen = await render(
    <IdsProvider>
      <div className="w-40">
        <Skeleton data-testid="ltr" animation="wave" />
      </div>
      <div dir="rtl" className="w-40">
        <Skeleton data-testid="rtl" animation="wave" />
      </div>
    </IdsProvider>,
  );
  const positionsOver = (element: Element) => {
    const [wave] = element.getAnimations();
    wave!.pause();
    const duration = Number(wave!.effect!.getComputedTiming().duration);
    return Array.from({ length: 10 }, (_, step) => {
      wave!.currentTime = (duration * step) / 10;
      return parseFloat(getComputedStyle(element).backgroundPositionX);
    });
  };
  const steps = (positions: number[]) =>
    positions.slice(1).map((next, index) => next - positions[index]!);

  const ltr = steps(positionsOver(screen.getByTestId('ltr').element()));
  const rtl = steps(positionsOver(screen.getByTestId('rtl').element()));

  expect(ltr.every((step) => step >= 0) && ltr.some((step) => step > 0)).toBe(true);
  expect(rtl.every((step) => step <= 0) && rtl.some((step) => step < 0)).toBe(true);
});
