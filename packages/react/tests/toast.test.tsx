import { useState } from 'react';

import { detectPlatform } from '@tanstack/react-hotkeys';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, onTestFinished, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Dialog, IdsProvider } from '../src';
import { DefaultToaster, Toaster, toast } from '../src/components/feedback/toast';

type Point = { x: number; y: number };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
const regionOf = () => document.querySelector<HTMLElement>('[data-toaster-region]')!;
const toastsIn = () => [...document.querySelectorAll<HTMLElement>('[data-toast]')];
const toastNamed = (text: string) => toastsIn().find((node) => node.textContent?.includes(text))!;
const variable = (node: HTMLElement, name: string) => node.style.getPropertyValue(name);
const finishAnimations = (element: Element) => {
  for (const animation of element.getAnimations({ subtree: true })) animation.finish();
};

afterEach(() => {
  toast.dismissAll();
});

async function mount(props: Toaster.Props = {}) {
  const screen = await render(
    <IdsProvider>
      <button type="button">page</button>
      <Toaster {...props} />
    </IdsProvider>,
  );
  await userEvent.hover(screen.getByRole('button', { name: 'page' }));
  return screen;
}

function centerOf(node: Element): Point {
  const box = node.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', { x, y }: Point) {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    x: frame.left + x * scale,
    y: frame.top + y * scale,
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
  });
}

async function drag(node: Element, by: Point, { holdFor = 0 } = {}) {
  const start = centerOf(node);
  await mouse('mousePressed', start);
  const steps = 4;
  for (let step = 1; step <= steps; step++)
    await mouse('mouseMoved', {
      x: start.x + (by.x * step) / steps,
      y: start.y + (by.y * step) / steps,
    });
  if (holdFor > 0) await wait(holdFor);
  await mouse('mouseReleased', { x: start.x + by.x, y: start.y + by.y });
}

function hideTheTab(hidden: boolean) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (hidden ? 'hidden' : 'visible'),
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

test('SSR renders nothing for the toaster, with or without toasts waiting', () => {
  const without = renderToString(<IdsProvider>page</IdsProvider>);
  expect(
    renderToString(
      <IdsProvider>
        page
        <Toaster />
      </IdsProvider>,
    ),
  ).toBe(without);
  toast('queued');
  expect(
    renderToString(
      <IdsProvider>
        page
        <DefaultToaster />
      </IdsProvider>,
    ),
  ).toBe(without);
});

test('the empty region is a live region with no role and stays out of the top layer', async () => {
  const screen = await mount();
  await expect.element(screen.getByRole('button', { name: 'page' })).toBeInTheDocument();
  const live = document.querySelector<HTMLElement>('[data-toaster]')!;
  expect(live.getAttribute('aria-live')).toBe('polite');
  expect(live.contains(regionOf())).toBe(true);
  expect(regionOf().matches(':popover-open')).toBe(false);
  expect(regionOf().hasAttribute('role')).toBe(false);
  expect(
    document.querySelectorAll('[role="status"], [role="alert"], [role="region"]'),
  ).toHaveLength(0);
});

test('a toast shows in a named region, and its close button dismisses it', async () => {
  const onDismiss = vi.fn();
  const screen = await mount();
  toast('Saved', { description: 'Your draft is safe.', onDismiss });
  const status = screen.getByRole('status');
  await expect.element(status).toHaveTextContent('SavedYour draft is safe.');
  await expect.element(screen.getByRole('region', { name: '알림' })).toBeVisible();
  expect(regionOf().matches(':popover-open')).toBe(true);
  expect(status.element().querySelector('[data-toast-icon]'), 'neutral has no icon').toBeNull();

  await userEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
  await expect.element(status).not.toBeInTheDocument();
  expect(onDismiss).toHaveBeenCalledOnce();
  await expect.poll(() => regionOf().matches(':popover-open')).toBe(false);
  expect(regionOf().hasAttribute('role')).toBe(false);
});

test('warnings and errors interrupt, the rest wait their turn', async () => {
  const screen = await mount();
  toast.info('Info');
  toast.success('Success');
  toast.warning('Warning');
  toast.error('Error');
  await expect.element(screen.getByRole('status').filter({ hasText: 'Info' })).toBeInTheDocument();
  await expect
    .element(screen.getByRole('status').filter({ hasText: 'Success' }))
    .toBeInTheDocument();
  await expect
    .element(screen.getByRole('alert').filter({ hasText: 'Warning' }))
    .toBeInTheDocument();
  await expect.element(screen.getByRole('alert').filter({ hasText: 'Error' })).toBeInTheDocument();
  expect(toastNamed('Error').dataset.colorScheme).toBe('danger');
  expect(toastNamed('Success').querySelector('[data-toast-icon] svg')).not.toBeNull();
});

test('a toast leaves after its duration, and an endless one stays', async () => {
  const onAutoClose = vi.fn();
  const onDismiss = vi.fn();
  const screen = await mount();
  toast('Sticky', { duration: Infinity });
  toast('Brief', { duration: 150, onAutoClose, onDismiss });
  await expect.element(screen.getByText('Brief')).toBeInTheDocument();
  await expect.element(screen.getByText('Brief')).not.toBeInTheDocument();
  expect(onAutoClose).toHaveBeenCalledOnce();
  expect(onDismiss).not.toHaveBeenCalled();
  await wait(300);
  await expect.element(screen.getByText('Sticky')).toBeInTheDocument();
});

test('updating by id keeps the element and restarts its clock', async () => {
  const screen = await mount();
  const id = toast.loading('Uploading');
  const status = screen.getByRole('status');
  await expect.element(status).toHaveTextContent('Uploading');
  const element = status.element();
  expect(element).toHaveAttribute('aria-busy', 'true');
  expect(element.querySelector('[data-spinner]')).not.toBeNull();
  await wait(200);
  await expect.element(status, { message: 'loading does not time out' }).toBeInTheDocument();

  expect(toast.success('Uploaded', { id, duration: Infinity })).toBe(id);
  await expect.element(status).toHaveTextContent('Uploaded');
  expect(status.element()).toBe(element);
  expect(element).not.toHaveAttribute('aria-busy');
  expect(element.querySelector('[data-spinner]')).toBeNull();
  expect(toastsIn()).toHaveLength(1);
});

test('toast.promise goes from loading to the settled message', async () => {
  const screen = await mount();
  let resolve!: (name: string) => void;
  toast.promise(new Promise<string>((done) => (resolve = done)), {
    loading: 'Saving',
    success: (name) => `Saved ${name}`,
    error: 'Could not save',
  });
  await expect.element(screen.getByRole('status')).toHaveTextContent('Saving');
  resolve('notes.md');
  await expect.element(screen.getByRole('status')).toHaveTextContent('Saved notes.md');
  expect(toastsIn()[0]!.dataset.colorScheme).toBe('success');

  toast.promise(() => Promise.reject(new Error('offline')), {
    success: 'Saved',
    error: (reason) => `Failed: ${(reason as Error).message}`,
  });
  await expect.element(screen.getByRole('alert')).toHaveTextContent('Failed: offline');

  toast.promise(Promise.resolve(), { loading: 'Quiet' });
  await expect.element(screen.getByText('Quiet')).not.toBeInTheDocument();
});

test('hovering pauses the clock and expands the stack', async () => {
  const screen = await mount();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  toast('Hold me', { duration: 300 });
  const status = screen.getByRole('status');
  await userEvent.hover(status);
  await expect.element(page.elementLocator(regionOf())).toHaveAttribute('data-expanded');
  await expect.poll(() => vi.getTimerCount(), { message: 'the clock stops' }).toBe(0);
  vi.advanceTimersByTime(500);
  await expect.element(status).toBeInTheDocument();

  await userEvent.hover(screen.getByRole('button', { name: 'page' }));
  await expect.poll(() => vi.getTimerCount(), { message: 'the clock runs again' }).toBe(1);
  vi.advanceTimersByTime(300);
  await expect.element(status).not.toBeInTheDocument();
});

test('F6 and Alt+T move focus into the region and back, which pauses the clock', async () => {
  const screen = await mount();
  const pageButton = screen.getByRole('button', { name: 'page' });
  pageButton.element().focus();
  await userEvent.keyboard('{F6}');
  await expect.element(pageButton, { message: 'no toasts, no hotkey' }).toHaveFocus();

  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  toast('Focus me', { duration: 300 });
  const region = screen.getByRole('region', { name: '알림' });
  await expect.element(region).toHaveAttribute('aria-keyshortcuts', 'F6 Alt+T');
  await userEvent.keyboard('{F6}');
  await expect.element(region).toHaveFocus();
  await expect.poll(() => vi.getTimerCount(), { message: 'the clock stops' }).toBe(0);
  vi.advanceTimersByTime(500);
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '알림 닫기' })).toHaveFocus();
  await userEvent.keyboard('{F6}');
  await expect.element(pageButton).toHaveFocus();

  await userEvent.keyboard('{Alt>}t{/Alt}');
  await expect.element(region).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(pageButton).toHaveFocus();
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
});

async function holdF6({ repeats }: { repeats: number }) {
  const press = { key: 'F6', code: 'F6', windowsVirtualKeyCode: 117 };

  await cdp().send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...press });
  for (let repeat = 0; repeat < repeats; repeat++)
    await cdp().send('Input.dispatchKeyEvent', { type: 'rawKeyDown', autoRepeat: true, ...press });
  await cdp().send('Input.dispatchKeyEvent', { type: 'keyUp', ...press });
}

test('Alt+T needs exactly Alt, and a held F6 moves focus once', async () => {
  const screen = await mount();
  const pageButton = screen.getByRole('button', { name: 'page' });
  pageButton.element().focus();
  toast('Exact', { duration: Infinity });
  const region = screen.getByRole('region', { name: '알림' });

  await userEvent.keyboard('{Control>}{Alt>}t{/Alt}{/Control}');
  await userEvent.keyboard('{Alt>}{Shift>}t{/Shift}{/Alt}');
  await expect.element(pageButton, { message: 'extra modifiers do not match' }).toHaveFocus();

  await holdF6({ repeats: 3 });
  await expect.element(region).toHaveFocus();
});

test('a custom hotkey replaces Alt+T and is announced with Mod resolved', async () => {
  const screen = await mount({ hotkey: 'Mod+Shift+Y' });
  const pageButton = screen.getByRole('button', { name: 'page' });
  pageButton.element().focus();
  toast('Custom', { duration: Infinity });
  const region = screen.getByRole('region', { name: '알림' });
  const resolved = detectPlatform() === 'mac' ? 'Shift+Meta+Y' : 'Control+Shift+Y';

  await expect.element(region).toHaveAttribute('aria-keyshortcuts', `F6 ${resolved}`);

  await userEvent.keyboard('{Alt>}t{/Alt}');
  await expect.element(pageButton).toHaveFocus();

  await userEvent.keyboard('{ControlOrMeta>}{Shift>}y{/Shift}{/ControlOrMeta}');
  await expect.element(region).toHaveFocus();
});

test('a hidden tab pauses the clock', async () => {
  onTestFinished(() => {
    delete (document as { visibilityState?: unknown }).visibilityState;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const screen = await mount();
  hideTheTab(true);
  toast('While away', { duration: 200 });
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  await wait(400);
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  hideTheTab(false);
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
});

test('the stack: newest in front, the rest peek behind, smaller, until hovered', async () => {
  await mount({ gap: 10 });
  toast('First', { duration: Infinity });
  toast('Second', { duration: Infinity, description: 'with a second line' });
  toast('Third', { duration: Infinity });
  await expect.poll(() => toastsIn().length).toBe(3);
  const [third, second, first] = toastsIn().map((node) => node) as [
    HTMLElement,
    HTMLElement,
    HTMLElement,
  ];
  expect(third.textContent).toContain('Third');
  expect(third).toHaveAttribute('data-front');
  expect([third, second, first].map((node) => variable(node, '--toasts-before'))).toEqual([
    '0',
    '1',
    '2',
  ]);
  const heights = [third, second, first].map((node) =>
    parseFloat(variable(node, '--initial-height')),
  );
  expect(heights[1]).toBeGreaterThan(heights[0]!);
  expect(variable(second, '--offset')).toBe(`${heights[0]! + 10}px`);
  expect(variable(first, '--offset')).toBe(`${heights[0]! + heights[1]! + 20}px`);
  expect(variable(regionOf(), '--front-toast-height')).toBe(`${heights[0]}px`);
  expect(getComputedStyle(second).scale).toBe('0.95');
  expect(getComputedStyle(first).scale).toBe('0.9');
  expect(second.offsetHeight, 'behind toasts take the front height').toBe(heights[0]);

  await userEvent.hover(page.elementLocator(third));
  await expect.poll(() => getComputedStyle(second).scale).toBe('1');
  expect(second.offsetHeight).toBe(heights[1]);
  expect(second.getBoundingClientRect().bottom).toBeCloseTo(
    third.getBoundingClientRect().top - 10,
    0,
  );
});

test('past max, older toasts hide and wait with their clock stopped', async () => {
  await mount({ max: 2 });
  toast('Oldest', { duration: 150 });
  toast('Middle', { duration: Infinity });
  const newest = toast('Newest', { duration: Infinity });
  await expect.poll(() => toastsIn().length).toBe(3);
  const oldest = toastNamed('Oldest');
  expect(oldest).not.toHaveAttribute('data-visible');
  expect(oldest.inert).toBe(true);
  await wait(300);
  expect(oldest.isConnected).toBe(true);

  toast.dismiss(newest);
  await expect.poll(() => oldest.hasAttribute('data-visible')).toBe(true);
  await expect.poll(() => oldest.isConnected).toBe(false);
});

test('a swipe toward the edge dismisses, a short slow one springs back', async () => {
  const onDismiss = vi.fn();
  const screen = await mount();
  toast('Swipe me', { duration: Infinity, onDismiss });
  const status = screen.getByRole('status');
  await expect.element(status).toBeVisible();

  await drag(status.element(), { x: 0, y: 20 }, { holdFor: 400 });
  await expect.element(status).not.toHaveAttribute('data-swiping');
  expect(variable(status.element() as HTMLElement, '--swipe-y')).toBe('0px');
  expect(onDismiss).not.toHaveBeenCalled();

  await drag(status.element(), { x: 0, y: -80 });
  expect(onDismiss, 'away from the edge is resisted').not.toHaveBeenCalled();

  await drag(status.element(), { x: 0, y: 80 });
  await expect.element(status).not.toBeInTheDocument();
  expect(onDismiss).toHaveBeenCalledOnce();

  toast('Sideways', { duration: Infinity });
  await expect.element(screen.getByRole('status')).toBeVisible();
  await drag(screen.getByRole('status').element(), { x: 90, y: 0 });
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
});

test('an explicit Toaster replaces the default one, which returns when it leaves', async () => {
  function App() {
    const [own, setOwn] = useState(true);
    return (
      <IdsProvider>
        <button type="button" onClick={() => setOwn(false)}>
          drop
        </button>
        {own && <Toaster placement="top-center" />}
        <DefaultToaster />
      </IdsProvider>
    );
  }
  const screen = await render(<App />);
  toast('Hello', { duration: Infinity });
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  expect(document.querySelectorAll('[data-toaster]')).toHaveLength(1);
  expect(regionOf().dataset.placement).toBe('top-center');
  expect(regionOf().getBoundingClientRect().top).toBeLessThan(100);

  await userEvent.click(screen.getByRole('button', { name: 'drop' }));
  await expect.poll(() => regionOf()?.dataset.placement).toBe('bottom-right');
  expect(document.querySelectorAll('[data-toaster]')).toHaveLength(1);
  await expect.element(screen.getByRole('status')).toHaveTextContent('Hello');
});

function OpenDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <Button>Open</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Editor</Dialog.Title>
        <input aria-label="Title" data-1p-ignore data-lpignore="true" />
      </Dialog.Content>
    </Dialog>
  );
}

test('a toast above an open Dialog takes clicks and focus without closing it', async () => {
  const onOpenChange = vi.fn();
  const onUndo = vi.fn();
  const screen = await render(
    <IdsProvider>
      <OpenDialog onOpenChange={onOpenChange} />
      <Toaster />
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  const dialog = screen.getByRole('dialog', { name: 'Editor' });
  await expect.element(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();

  toast('Deleted', { duration: Infinity, action: { label: 'Undo', onClick: onUndo } });
  await expect
    .element(screen.getByRole('status'), { message: 'the modal does not hide the toaster' })
    .toMatchTextContent('Deleted');
  await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(onUndo).toHaveBeenCalledOnce();
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
  await expect.element(dialog).toBeInTheDocument();

  toast('Again', { duration: Infinity });
  await userEvent.keyboard('{F6}');
  await expect.element(screen.getByRole('region', { name: '알림' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
  await expect
    .element(dialog, { message: 'Escape in the toaster is not for the dialog' })
    .toBeInTheDocument();
  expect(onOpenChange.mock.calls).toEqual([[true]]);
});

test('raising the toaster over a newly opened Dialog replays no entry', async () => {
  const screen = await render(
    <IdsProvider>
      <OpenDialog />
      <Toaster />
    </IdsProvider>,
  );
  toast('Already here', {
    duration: Infinity,
    style: { transition: 'opacity 60s, translate 60s, scale 60s' },
  });
  const status = screen.getByRole('status');
  await expect.element(status).toBeVisible();
  await nextFrame();
  const node = status.element() as HTMLElement;
  expect(node.getAnimations().length, 'the toast enters').toBeGreaterThan(0);
  finishAnimations(node);

  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  await expect.element(screen.getByRole('dialog', { name: 'Editor' })).toBeVisible();
  await nextFrame();
  expect(node.getAnimations()).toEqual([]);
  const { x, y } = centerOf(node);
  expect(node.contains(document.elementFromPoint(x, y)), 'the toast is above the backdrop').toBe(
    true,
  );
});

test('the default toaster reads no media query', async () => {
  const matchMedia = vi.spyOn(window, 'matchMedia');
  const listened = vi.spyOn(MediaQueryList.prototype, 'addEventListener');
  onTestFinished(() => {
    matchMedia.mockRestore();
    listened.mockRestore();
  });
  await render(<DefaultToaster />);
  toast('Wide or narrow', { duration: Infinity });
  await expect.poll(() => toastsIn().length).toBe(1);
  expect(matchMedia).not.toHaveBeenCalled();
  expect(listened).not.toHaveBeenCalled();
});

test('below 640px the stack spans the screen, wider screens get a fixed column', async () => {
  onTestFinished(() => page.viewport(414, 896));
  await mount();
  toast('Wide', { duration: Infinity });
  await expect.poll(() => toastsIn().length).toBe(1);
  expect(regionOf().getBoundingClientRect().width).toBe(window.innerWidth - 32);
  await page.viewport(1024, 768);
  await expect.poll(() => regionOf().getBoundingClientRect().width).toBe(356);
  expect(window.innerWidth - regionOf().getBoundingClientRect().right).toBe(24);
});

test('the icon, text, action and close button of a toast share one vertical center', async () => {
  const screen = await render(
    <IdsProvider>
      <Toaster />
    </IdsProvider>,
  );
  toast.success('저장했습니다', {
    duration: Infinity,
    action: { label: '되돌리기', onClick: () => {} },
  });
  toast.info('점검이 예정돼 있습니다', {
    duration: Infinity,
    description: '자세한 내용은 설정에서 확인하세요.',
  });
  await expect.element(screen.getByText('저장했습니다')).toBeVisible();
  await expect.element(screen.getByText('점검이 예정돼 있습니다')).toBeVisible();

  const middle = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
  };
  for (const toastElement of document.querySelectorAll('[data-toaster] [data-toast-title]')) {
    const body = toastElement.closest('[data-toast-title]')!.parentElement!.parentElement!;
    const center = middle(body);
    const parts = [...body.children].filter((child) => child.getBoundingClientRect().height > 0);
    for (const part of parts) expect(Math.abs(middle(part) - center)).toBeLessThan(1);
  }
});
