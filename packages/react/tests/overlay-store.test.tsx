import { useRef, useState, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider } from '../src';
import { OverlayItemContext, useOverlay, useOverlayItem } from '../src/internal/overlay/host';
import { overlay } from '../src/internal/overlay/store';
import { usePresence } from '../src/internal/overlay/use-presence';

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
const finishAnimations = (element: Element) => {
  for (const animation of element.getAnimations()) animation.finish();
};

function BoundBox({ label, children }: { label: string; children?: ReactNode }) {
  const item = useOverlayItem(undefined);
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, ending } = usePresence(item?.open ?? false, {
    elements: () => [ref.current],
    onExitComplete: () => item?.exited(),
  });
  if (!mounted) return null;
  return (
    <OverlayItemContext value={null}>
      <div
        ref={ref}
        role="dialog"
        aria-label={label}
        data-ending-style={ending ? '' : undefined}
        style={{ transition: 'opacity 60s', opacity: ending ? 0 : 1 }}
      >
        {children}
      </div>
    </OverlayItemContext>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      count {count}
    </button>
  );
}

test('open resolves with the value it is closed with, and unbound content leaves at once', async () => {
  const screen = await render(<IdsProvider>page</IdsProvider>);
  const confirmed = overlay.open<boolean>(({ close }) => (
    <button type="button" onClick={() => close(true)}>
      confirm
    </button>
  ));
  await userEvent.click(screen.getByRole('button', { name: 'confirm' }));
  await expect(confirmed).resolves.toBe(true);
  await expect.element(screen.getByRole('button', { name: 'confirm' })).not.toBeInTheDocument();

  const dismissed = overlay.open(({ id }) => <p>notice {id}</p>, { id: 'notice' });
  await expect.element(screen.getByText('notice notice')).toBeInTheDocument();
  overlay.close('notice');
  await expect(dismissed).resolves.toBeUndefined();
});

test('a bound layer stays through its exit, and reopening the id during it keeps the element', async () => {
  const screen = await render(<IdsProvider>page</IdsProvider>);
  const first = overlay.open(() => <BoundBox label="sheet" />, { id: 'sheet' });
  const sheet = screen.getByRole('dialog', { name: 'sheet' });
  await expect.element(sheet).toBeInTheDocument();
  const element = sheet.element();
  await nextFrame();

  overlay.close('sheet', 'first');
  await expect(first).resolves.toBe('first');
  await expect.element(sheet).toHaveAttribute('data-ending-style');

  const second = overlay.open(() => <BoundBox label="sheet" />, { id: 'sheet' });
  await expect.element(sheet).not.toHaveAttribute('data-ending-style');
  expect(sheet.element()).toBe(element);

  overlay.close('sheet', 'second');
  await expect(second).resolves.toBe('second');
  await nextFrame();
  await nextFrame();
  finishAnimations(element);
  await expect.element(sheet).not.toBeInTheDocument();
});

test('opening an open id replaces what it renders and settles the earlier promise', async () => {
  const screen = await render(<IdsProvider>page</IdsProvider>);
  const earlier = overlay.open(() => <Counter />, { id: 'same' });
  await userEvent.click(screen.getByRole('button', { name: 'count 0' }));
  const later = overlay.open(
    ({ close }) => (
      <>
        <Counter />
        <button type="button" onClick={() => close('done')}>
          finish
        </button>
      </>
    ),
    { id: 'same' },
  );
  await expect(earlier).resolves.toBeUndefined();
  await expect.element(screen.getByRole('button', { name: 'count 1' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'finish' }));
  await expect(later).resolves.toBe('done');
});

test('closeAll closes every open item', async () => {
  await render(<IdsProvider>page</IdsProvider>);
  const results = [overlay.open(() => <p>one</p>), overlay.open(() => <p>two</p>)];
  overlay.closeAll();
  await expect(Promise.all(results)).resolves.toEqual([undefined, undefined]);
});

test('only the first outermost provider hosts, and items take the theme they were opened in', async () => {
  function Opener() {
    const scoped = useOverlay();
    return (
      <button type="button" onClick={() => void scoped.open(() => <p>scoped</p>)}>
        open here
      </button>
    );
  }
  const screen = await render(
    <>
      <IdsProvider data-testid="first" color="blue">
        <IdsProvider color="orange" mode="dark">
          <Opener />
        </IdsProvider>
      </IdsProvider>
      <IdsProvider data-testid="second" color="green" />
    </>,
  );
  void overlay.open(() => <p>global</p>);
  const global = screen.getByText('global');
  await expect.element(global).toBeInTheDocument();
  expect(screen.getByText('global').elements()).toHaveLength(1);
  const first = screen.getByTestId('first').element();
  expect(first.contains(global.element())).toBe(true);
  expect(global.element().closest('[data-overlay-item]')).toHaveAttribute('data-color', 'blue');

  await userEvent.click(screen.getByRole('button', { name: 'open here' }));
  const scoped = screen.getByText('scoped').element().closest('[data-overlay-item]');
  expect(scoped).toHaveAttribute('data-color', 'orange');
  expect(scoped).toHaveAttribute('data-mode', 'dark');
  overlay.closeAll();
});

test('unmounting the last host settles everything still open', async () => {
  const screen = await render(<IdsProvider>page</IdsProvider>);
  const pending = overlay.open(() => <BoundBox label="left open" />);
  await expect.element(screen.getByRole('dialog', { name: 'left open' })).toBeInTheDocument();
  await screen.unmount();
  await expect(pending).resolves.toBeUndefined();
});

test('the host adds nothing to server HTML, and only a silent toaster beside an asChild root', async () => {
  const server = new DOMParser().parseFromString(
    renderToString(<IdsProvider>page</IdsProvider>),
    'text/html',
  );
  expect(server.body.children).toHaveLength(1);
  expect(server.body.firstElementChild!.innerHTML).toBe('page');
  const screen = await render(
    <IdsProvider asChild>
      <main>page</main>
    </IdsProvider>,
  );
  expect(screen.container.firstElementChild?.tagName).toBe('MAIN');
  const beside = [...screen.container.children].slice(1);
  expect(beside.every((element) => element.hasAttribute('data-toaster'))).toBe(true);
  expect(beside.every((element) => !element.querySelector('[role]'))).toBe(true);
});
