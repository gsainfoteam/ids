import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

import { expect, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider } from '../src';
import {
  focusReturnTarget,
  keepAboveLayers,
  ModalLayer,
  raiseInTopLayer,
  showInTopLayer,
  useLayer,
  usePresence,
  withoutTransitions,
  type DismissReason,
  type Layer,
  type LayerKind,
  type LayerPosition,
} from '../src/internal/overlay';

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
const pressOn = (element: Element) =>
  element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
const finishAnimations = (element: Element) => {
  for (const animation of element.getAnimations()) animation.finish();
};
const placed = (top: number) => ({ inset: 'auto', margin: 0, top, left: 400, padding: 8 });

type TestLayerProps = {
  label: string;
  kind?: LayerKind;
  open?: boolean;
  top?: number;
  dismissible?: boolean;
  anchor?: RefObject<HTMLElement | null>;
  onDismiss?: (reason: DismissReason) => void;
  onPositionChange?: (position: LayerPosition) => void;
  onLayer?: (layer: Layer) => void;
  children?: ReactNode;
};

function TestLayer({
  label,
  kind = 'popup',
  open = true,
  top = 200,
  dismissible,
  anchor,
  onDismiss = () => {},
  onPositionChange,
  onLayer,
  children,
}: TestLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const layer = useLayer(open, {
    kind,
    element: () => ref.current,
    anchor: () => anchor?.current ?? null,
    dismissible,
    onDismiss: (reason) => onDismiss(reason),
    onPositionChange,
  });
  useLayoutEffect(() => {
    onLayer?.(layer);
    if (open && ref.current) showInTopLayer(ref.current);
  }, [open, layer, onLayer]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      popover="manual"
      role="group"
      aria-label={label}
      tabIndex={-1}
      style={placed(top)}
    >
      {children}
    </div>
  );
}

test('a top layer box escapes a scaled ancestor and still takes its theme from the DOM', async () => {
  function Lifted() {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => showInTopLayer(ref.current!), []);
    return (
      <div
        ref={ref}
        popover="manual"
        data-testid="lifted"
        style={{ inset: 'auto', margin: 0, left: 10, top: 10, width: 100, height: 40 }}
      />
    );
  }
  const screen = await render(
    <IdsProvider color="orange">
      <div style={{ transform: 'scale(0.5)', transformOrigin: '0 0' }}>
        <div data-testid="fixed" style={{ position: 'fixed', left: 10, top: 80, width: 100 }} />
        <Lifted />
      </div>
    </IdsProvider>,
  );
  const lifted = screen.getByTestId('lifted').element();
  const fixed = screen.getByTestId('fixed').element();
  expect(lifted.getBoundingClientRect().width).toBe(100);
  expect(fixed.getBoundingClientRect().width, 'a plain fixed box shrinks with it').toBe(50);
  const primary = (element: Element) =>
    getComputedStyle(element).getPropertyValue('--ids-color-primary');
  expect(primary(lifted)).toBe(primary(fixed));
  expect(primary(lifted)).not.toBe(primary(document.body));
});

test('Escape closes only the top layer, after inner claims, never while composing', async () => {
  const reasons: string[] = [];
  const screen = await render(
    <>
      <TestLayer label="lower" top={120} onDismiss={(reason) => reasons.push(`lower ${reason}`)} />
      <TestLayer label="upper" onDismiss={(reason) => reasons.push(`upper ${reason}`)}>
        <input aria-label="entry" data-1p-ignore data-lpignore="true" />
        <input
          aria-label="claims"
          data-1p-ignore
          data-lpignore="true"
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.preventDefault();
          }}
        />
      </TestLayer>
    </>,
  );
  await userEvent.click(screen.getByRole('textbox', { name: 'claims' }));
  await userEvent.keyboard('{Escape}');
  expect(reasons, 'an inner handler claimed it').toEqual([]);

  await userEvent.click(screen.getByRole('textbox', { name: 'entry' }));
  await cdp().send('Input.imeSetComposition', { text: 'ㅎ', selectionStart: 1, selectionEnd: 1 });
  await userEvent.keyboard('{Escape}');
  expect(reasons, 'composition keeps every layer').toEqual([]);
  await cdp().send('Input.insertText', { text: 'ㅎ' });

  await userEvent.keyboard('{Escape}');
  expect(reasons).toEqual(['upper escape-key']);
});

test('a layer that cannot be dismissed stops Escape and outside presses at itself', async () => {
  const reasons: string[] = [];
  const prevented: boolean[] = [];
  const screen = await render(
    <div onKeyDown={(event) => prevented.push(event.nativeEvent.defaultPrevented)}>
      <button type="button">outside</button>
      <TestLayer label="lower" top={120} onDismiss={(reason) => reasons.push(`lower ${reason}`)} />
      <TestLayer
        label="upper"
        dismissible={false}
        onDismiss={(reason) => reasons.push(`upper ${reason}`)}
      >
        <button type="button">inside</button>
      </TestLayer>
    </div>,
  );
  screen.getByRole('button', { name: 'inside' }).element().focus();
  await userEvent.keyboard('{Escape}');
  pressOn(screen.getByRole('button', { name: 'outside' }).element());
  expect(reasons).toEqual([]);
  expect(prevented).toEqual([false]);
});

test('a press outside nested popups closes each once and blurs the focused field first', async () => {
  const order: string[] = [];
  const screen = await render(
    <>
      <button type="button">outside</button>
      <TestLayer label="outer" top={120} onDismiss={(reason) => order.push(`outer ${reason}`)}>
        <button type="button">in outer</button>
        <TestLayer label="inner" top={300} onDismiss={(reason) => order.push(`inner ${reason}`)}>
          <input
            aria-label="field"
            data-1p-ignore
            data-lpignore="true"
            onBlur={() => order.push('blur')}
          />
        </TestLayer>
      </TestLayer>
    </>,
  );
  const outside = screen.getByRole('button', { name: 'outside' }).element() as HTMLElement;
  pressOn(screen.getByRole('button', { name: 'in outer' }).element());
  expect(order, 'a press inside the outer only closes the inner').toEqual(['inner outside-press']);

  order.length = 0;
  screen.getByRole('textbox', { name: 'field' }).element().focus();
  pressOn(outside);
  expect(order).toEqual(['blur', 'inner outside-press', 'outer outside-press']);

  order.length = 0;
  outside.focus();
  expect(order, 'the focus the press moves is part of the same close').toEqual([]);
  await userEvent.keyboard('a');
  screen.getByRole('textbox', { name: 'field' }).element().focus();
  outside.focus();
  expect(order).toEqual(['blur', 'inner focus-out', 'outer focus-out']);
});

test('popups opened together keep the outer one lower, whatever mounts first', async () => {
  const reasons: string[] = [];
  const screen = await render(
    <TestLayer label="outer" top={120} onDismiss={(reason) => reasons.push(`outer ${reason}`)}>
      <TestLayer label="inner" top={300} onDismiss={(reason) => reasons.push(`inner ${reason}`)}>
        <button type="button">deep</button>
      </TestLayer>
    </TestLayer>,
  );
  screen.getByRole('button', { name: 'deep' }).element().focus();
  await userEvent.keyboard('{Escape}');
  expect(reasons).toEqual(['inner escape-key']);
});

test('the top modal pulls stray focus back, except to its return target, the toaster and layers above', async () => {
  function Scene({ modal, above }: { modal: boolean; above: boolean }) {
    return (
      <>
        <button type="button">opener</button>
        <button type="button">elsewhere</button>
        <div data-toaster="" aria-live="polite">
          <button type="button">toast action</button>
        </div>
        <TestLayer label="modal" kind="modal" open={modal}>
          <input aria-label="first" data-1p-ignore data-lpignore="true" />
          <input aria-label="second" data-1p-ignore data-lpignore="true" />
        </TestLayer>
        <TestLayer label="above" open={above} top={420}>
          <button type="button">in a layer above</button>
        </TestLayer>
      </>
    );
  }
  const screen = await render(<Scene modal={false} above={false} />);
  const button = (name: string) => screen.getByRole('button', { name }).element() as HTMLElement;
  button('opener').focus();
  await screen.rerender(<Scene modal above={false} />);
  const second = screen.getByRole('textbox', { name: 'second' }).element() as HTMLElement;
  second.focus();

  button('elsewhere').focus();
  expect(document.activeElement).toBe(second);
  button('opener').focus();
  expect(document.activeElement, 'focus may go home while the modal closes').toBe(button('opener'));
  second.focus();
  button('toast action').focus();
  expect(document.activeElement).toBe(button('toast action'));

  await screen.rerender(<Scene modal above />);
  button('in a layer above').focus();
  expect(document.activeElement).toBe(button('in a layer above'));
});

test('stacked modals: only the top one takes Escape, and the lower one knows it is covered', async () => {
  const reasons: string[] = [];
  const lower = vi.fn<(position: LayerPosition) => void>();
  const upper = vi.fn<(position: LayerPosition) => void>();
  function Scene({ second }: { second: boolean }) {
    return (
      <>
        <button type="button">page</button>
        <TestLayer
          label="first"
          kind="modal"
          top={120}
          onDismiss={(reason) => reasons.push(`first ${reason}`)}
          onPositionChange={lower}
        >
          <button type="button">in first</button>
        </TestLayer>
        <TestLayer
          label="second"
          kind="modal"
          open={second}
          onDismiss={(reason) => reasons.push(`second ${reason}`)}
          onPositionChange={upper}
        >
          <button type="button">in second</button>
        </TestLayer>
      </>
    );
  }
  const screen = await render(<Scene second={false} />);
  expect(lower.mock.calls).toEqual([[{ covered: false, modalsBelow: 0 }]]);
  await screen.rerender(<Scene second />);
  expect(lower.mock.lastCall).toEqual([{ covered: true, modalsBelow: 0 }]);
  expect(upper.mock.calls).toEqual([[{ covered: false, modalsBelow: 1 }]]);

  screen.getByRole('button', { name: 'in second' }).element().focus();
  await userEvent.keyboard('{Escape}');
  pressOn(screen.getByRole('button', { name: 'page' }).element());
  expect(reasons, 'modals close through their backdrop, not a press').toEqual([
    'second escape-key',
  ]);

  await screen.rerender(<Scene second={false} />);
  expect(lower.mock.lastCall).toEqual([{ covered: false, modalsBelow: 0 }]);
});

test('a popup under a modal stays open while the modal is used', async () => {
  const reasons: string[] = [];
  function Scene({ modal }: { modal: boolean }) {
    return (
      <TestLayer label="popup" top={120} onDismiss={(reason) => reasons.push(`popup ${reason}`)}>
        <button type="button">opens a modal</button>
        <TestLayer
          label="modal"
          kind="modal"
          open={modal}
          top={300}
          onDismiss={(reason) => reasons.push(`modal ${reason}`)}
        >
          <button type="button">in modal</button>
        </TestLayer>
      </TestLayer>
    );
  }
  const screen = await render(<Scene modal={false} />);
  screen.getByRole('button', { name: 'opens a modal' }).element().focus();
  await screen.rerender(<Scene modal />);
  const inModal = screen.getByRole('button', { name: 'in modal' }).element() as HTMLElement;
  pressOn(inModal);
  inModal.focus();
  await userEvent.keyboard('{Escape}');
  expect(reasons).toEqual(['modal escape-key']);
});

test('tooltips close when a modal opens and when their trigger is pressed', async () => {
  const reasons: string[] = [];
  function Scene({ modal }: { modal: boolean }) {
    const trigger = useRef<HTMLButtonElement>(null);
    return (
      <>
        <button ref={trigger} type="button">
          trigger
        </button>
        <TestLayer
          label="tip"
          kind="tooltip"
          anchor={trigger}
          onDismiss={(reason) => reasons.push(`tip ${reason}`)}
        />
        <TestLayer label="modal" kind="modal" open={modal} top={300} />
      </>
    );
  }
  const screen = await render(<Scene modal={false} />);
  pressOn(screen.getByRole('button', { name: 'trigger' }).element());
  expect(reasons).toEqual(['tip outside-press']);
  await screen.rerender(<Scene modal />);
  expect(reasons).toEqual(['tip outside-press', 'tip covered']);
});

test('focus returns to where it was, or to the trigger of the layer that held it', async () => {
  let dialog: Layer | undefined;
  function Scene({ menu, dialogOpen }: { menu: boolean; dialogOpen: boolean }) {
    const trigger = useRef<HTMLButtonElement>(null);
    return (
      <>
        <button ref={trigger} type="button">
          menu trigger
        </button>
        <TestLayer label="menu" open={menu} top={120} anchor={trigger}>
          <button type="button">menu item</button>
        </TestLayer>
        <TestLayer
          label="dialog"
          kind="modal"
          open={dialogOpen}
          top={300}
          onLayer={(layer) => (dialog = layer)}
        />
      </>
    );
  }
  const screen = await render(<Scene menu dialogOpen={false} />);
  const item = screen.getByRole('button', { name: 'menu item' }).element();
  (item as HTMLElement).focus();
  await screen.rerender(<Scene menu dialogOpen />);
  expect(focusReturnTarget(dialog!)).toBe(item);
  await screen.rerender(<Scene menu={false} dialogOpen />);
  expect(focusReturnTarget(dialog!)).toBe(
    screen.getByRole('button', { name: 'menu trigger' }).element(),
  );
});

test('presence waits for the exit, and reopening during it keeps the element', async () => {
  const onExitComplete = vi.fn();
  function Box({ open }: { open: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const { mounted, ending } = usePresence(open, {
      elements: () => [ref.current],
      onExitComplete,
    });
    if (!mounted) return null;
    return (
      <div
        ref={ref}
        data-testid="box"
        data-ending-style={ending ? '' : undefined}
        style={{ transition: 'opacity 60s', opacity: ending ? 0 : 1 }}
      />
    );
  }
  const screen = await render(<Box open />);
  const box = screen.getByTestId('box');
  await nextFrame();
  await screen.rerender(<Box open={false} />);
  await expect.element(box).toHaveAttribute('data-ending-style');
  await nextFrame();
  await screen.rerender(<Box open />);
  await expect.element(box).not.toHaveAttribute('data-ending-style');
  finishAnimations(box.element());
  await nextFrame();
  await nextFrame();
  await expect.element(box).toBeInTheDocument();
  expect(onExitComplete).not.toHaveBeenCalled();

  await screen.rerender(<Box open={false} />);
  await nextFrame();
  await nextFrame();
  finishAnimations(box.element());
  await expect.element(box).not.toBeInTheDocument();
  expect(onExitComplete).toHaveBeenCalledOnce();
});

test('raising a layer without transitions replays no entry, in it or in its children', async () => {
  const screen = await render(
    <div
      popover="manual"
      data-testid="region"
      className="starting:opacity-0"
      style={{ transition: 'opacity 60s', inset: 'auto', margin: 0, top: 10, left: 10 }}
    >
      <div
        data-testid="toast"
        className="starting:opacity-0"
        style={{ transition: 'opacity 60s', width: 40, height: 20 }}
      />
    </div>,
  );
  const region = screen.getByTestId('region').element() as HTMLElement;
  const toast = screen.getByTestId('toast').element();
  showInTopLayer(region);
  await nextFrame();
  expect(toast.getAnimations().length, 'entering plays').toBeGreaterThan(0);
  finishAnimations(region);
  finishAnimations(toast);

  withoutTransitions(region, () => raiseInTopLayer(region));
  await nextFrame();
  expect(region.getAnimations()).toEqual([]);
  expect(toast.getAnimations()).toEqual([]);
  expect(region.matches(':popover-open')).toBe(true);
});

test('a modal layer: backdrop under the content, the page hidden and locked, Tab kept inside', async () => {
  const raised = vi.fn();
  const stopRaising = keepAboveLayers(raised);
  const onBackdropClick = vi.fn();
  function Modal({ open }: { open: boolean }) {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const layer = useLayer(open, { kind: 'modal', element: () => element, onDismiss: () => {} });
    return (
      <ModalLayer
        open={open}
        layer={layer}
        element={element}
        contentRef={setElement}
        backdrop={{
          'data-testid': 'backdrop',
          style: { inset: 0, margin: 0, width: '100vw', height: '100vh', border: 0 },
        }}
        onBackdropClick={onBackdropClick}
      >
        <div
          popover="manual"
          role="dialog"
          aria-label="modal"
          tabIndex={-1}
          style={{ inset: 'auto', margin: 0, top: 100, left: 100, width: 200, height: 100 }}
        >
          <button type="button">first</button>
          <button type="button">last</button>
        </div>
      </ModalLayer>
    );
  }
  try {
    const screen = await render(
      <>
        <button type="button">page</button>
        <Modal open />
      </>,
    );
    const dialog = screen.getByRole('dialog', { name: 'modal' }).element();
    const backdrop = screen.getByTestId('backdrop').element();
    await expect.poll(() => document.elementFromPoint(150, 150)).toBe(dialog);
    expect(document.elementFromPoint(20, 20)).toBe(backdrop);
    expect(raised).toHaveBeenCalled();
    expect(document.body.hasAttribute('data-scroll-locked')).toBe(true);
    const page = document.querySelector('button')!;
    expect(page.closest('[aria-hidden="true"]'), 'the page is hidden from readers').not.toBeNull();

    (dialog.querySelectorAll('button')[1] as HTMLElement).focus();
    await userEvent.keyboard('{Tab}');
    await expect.poll(() => document.activeElement?.textContent).toBe('first');

    (backdrop as HTMLElement).click();
    expect(onBackdropClick).toHaveBeenCalledOnce();

    await screen.rerender(
      <>
        <button type="button">page</button>
        <Modal open={false} />
      </>,
    );
    expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
    expect(page.closest('[aria-hidden="true"]')).toBeNull();
  } finally {
    stopRaising();
  }
});
