import { useState, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, IdsProvider, overlay } from '../src';
import { Popover } from '../src/components/overlay/popover';

afterEach(() => {
  vi.restoreAllMocks();
});

const finishAnimations = (element: Element) => {
  for (const animation of element.getAnimations()) animation.finish();
};

function Share(props: Partial<Popover.Props> & { children?: ReactNode; initialFocus?: string }) {
  const { children, initialFocus, ...rest } = props;
  return (
    <Popover {...rest}>
      <Popover.Trigger>Share</Popover.Trigger>
      <Popover.Content initialFocus={initialFocus}>
        <Popover.Title>Share link</Popover.Title>
        <Popover.Description>Anyone with the link can view.</Popover.Description>
        <input aria-label="Link" data-1p-ignore data-lpignore="true" />
        {children}
        <Popover.Close>Done</Popover.Close>
      </Popover.Content>
    </Popover>
  );
}

test('SSR renders only the trigger', () => {
  const html = renderToString(<Share />);
  expect(html).toContain('Share');
  expect(html).not.toContain('Share link');
});

test('a click opens it beside the trigger without moving focus, and a second click closes it', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Share onOpenChange={onOpenChange} />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Share' });
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Share link' });
  await expect.element(dialog).toBeVisible();
  await expect.element(dialog).toHaveAccessibleDescription('Anyone with the link can view.');
  expect(dialog.element()).not.toHaveAttribute('aria-modal');
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  await expect.element(trigger).toHaveAttribute('aria-controls', dialog.element().id);
  await expect.element(trigger).toHaveAttribute('data-popup-open');
  await expect.element(trigger).toHaveFocus();
  expect(dialog.element()).toHaveAttribute('data-side', 'bottom');
  expect(dialog.element().matches(':popover-open')).toBe(true);

  await userEvent.click(trigger);
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('initialFocus moves focus in, and Escape closes and returns it to the trigger', async () => {
  const screen = await render(
    <IdsProvider>
      <Share initialFocus="input" />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Share' });
  await userEvent.click(trigger);
  await expect.element(screen.getByRole('textbox', { name: 'Link' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test('Popover.Close closes and returns focus to the trigger', async () => {
  const screen = await render(
    <IdsProvider>
      <Share defaultOpen />
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(screen.getByRole('button', { name: 'Share' })).toHaveFocus();
});

test('a press outside closes it once and leaves focus where the press put it', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <p>Outside text</p>
      <Share initialFocus="input" onOpenChange={onOpenChange} />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Share' });
  await userEvent.click(trigger);
  await expect.element(screen.getByRole('textbox', { name: 'Link' })).toHaveFocus();
  await userEvent.click(screen.getByText('Outside text'));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  expect(trigger.element()).not.toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('a press inside the outer popover closes only the inner one; outside both closes each once', async () => {
  const onOuterChange = vi.fn();
  const onInnerChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <p>Page</p>
      <Popover onOpenChange={onOuterChange}>
        <Popover.Trigger>Outer</Popover.Trigger>
        <Popover.Content aria-label="Outer panel">
          <p>Outer body</p>
          <Popover onOpenChange={onInnerChange}>
            <Popover.Trigger>Inner</Popover.Trigger>
            <Popover.Content aria-label="Inner panel" side="right">
              <p>Inner body</p>
            </Popover.Content>
          </Popover>
        </Popover.Content>
      </Popover>
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Outer' }));
  await userEvent.click(screen.getByRole('button', { name: 'Inner' }));
  const inner = screen.getByRole('dialog', { name: 'Inner panel' });
  await expect.element(inner).toBeVisible();
  await userEvent.click(screen.getByText('Inner body'));
  await expect.element(inner).toBeVisible();

  await userEvent.click(screen.getByText('Outer body'));
  await expect.element(inner).not.toBeInTheDocument();
  await expect.element(screen.getByRole('dialog', { name: 'Outer panel' })).toBeVisible();

  await userEvent.click(screen.getByRole('button', { name: 'Inner' }));
  await expect.element(screen.getByRole('dialog', { name: 'Inner panel' })).toBeVisible();
  await userEvent.click(screen.getByText('Page'));
  await expect.element(screen.getByRole('dialog', { name: 'Outer panel' })).not.toBeInTheDocument();
  await expect.element(screen.getByRole('dialog', { name: 'Inner panel' })).not.toBeInTheDocument();
  expect(onOuterChange.mock.calls).toEqual([[true], [false]]);
  expect(onInnerChange.mock.calls).toEqual([[true], [false], [true], [false]]);
});

function HoverCard(props: Partial<Popover.Props>) {
  return (
    <>
      <p>Away</p>
      <Popover triggerType="hover" openDelay={0} closeDelay={0} {...props}>
        <Popover.Trigger>Profile</Popover.Trigger>
        <Popover.Content aria-label="Profile card" side="bottom">
          <p>Card body</p>
        </Popover.Content>
      </Popover>
    </>
  );
}

test('hover opens it, the pointer can travel into the content, and leaving both closes it', async () => {
  const screen = await render(
    <IdsProvider>
      <HoverCard />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Profile' });
  await userEvent.hover(trigger);
  const card = screen.getByRole('dialog', { name: 'Profile card' });
  await expect.element(card).toBeVisible();
  await userEvent.hover(screen.getByText('Card body'));
  await expect.element(card).toBeVisible();
  await userEvent.hover(screen.getByText('Away'));
  await expect.element(card).not.toBeInTheDocument();
});

test('a click on a hover trigger keeps it open after the pointer leaves', async () => {
  const screen = await render(
    <IdsProvider>
      <HoverCard />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Profile' });
  await userEvent.click(trigger);
  const card = screen.getByRole('dialog', { name: 'Profile card' });
  await expect.element(card).toBeVisible();
  await userEvent.hover(screen.getByText('Away'));
  await new Promise(requestAnimationFrame);
  await expect.element(card).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(card).not.toBeInTheDocument();
});

test('a modal popover holds focus inside and hides the page', async () => {
  const screen = await render(
    <IdsProvider>
      <Popover modal>
        <Popover.Trigger>Edit</Popover.Trigger>
        <Popover.Content aria-label="Edit name">
          <input aria-label="Name" data-1p-ignore data-lpignore="true" />
          <Popover.Close>Save</Popover.Close>
        </Popover.Content>
      </Popover>
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Edit' });
  const triggerElement = trigger.element();
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Edit name' });
  await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
  await expect.element(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  expect(triggerElement.closest('[aria-hidden="true"]')).not.toBeNull();

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();

  const backdrop = document.querySelector<HTMLElement>('[data-popover-backdrop]')!;
  await userEvent.click(page.elementLocator(backdrop), { position: { x: 5, y: 5 } });
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test('Popover.Arrow is drawn at the edge facing the trigger', async () => {
  const screen = await render(
    <IdsProvider>
      <div style={{ marginLeft: 150 }}>
        <Popover defaultOpen>
          <Popover.Trigger>Info</Popover.Trigger>
          <Popover.Content aria-label="Info panel">
            <Popover.Arrow />
            Pro plan only.
          </Popover.Content>
        </Popover>
      </div>
    </IdsProvider>,
  );
  const content = screen.getByRole('dialog', { name: 'Info panel' });
  await expect.element(content).toBeVisible();
  const arrow = content.element().querySelector('[data-popover-arrow]')!;
  expect(arrow).not.toBeNull();
  await expect
    .poll(() => {
      const arrowBox = arrow.getBoundingClientRect();
      const contentBox = content.element().getBoundingClientRect();
      return arrowBox.bottom <= contentBox.top + 1;
    })
    .toBe(true);
  const triggerBox = screen.getByRole('button', { name: 'Info' }).element().getBoundingClientRect();
  const arrowBox = arrow.getBoundingClientRect();
  const arrowCenter = arrowBox.left + arrowBox.width / 2;
  expect(Math.abs(arrowCenter - (triggerBox.left + triggerBox.width / 2))).toBeLessThan(2);
});

test('it flips to the other side when the preferred side has no room', async () => {
  const screen = await render(
    <IdsProvider>
      <div style={{ position: 'fixed', bottom: 8, left: 8 }}>
        <Popover defaultOpen>
          <Popover.Trigger>Bottom</Popover.Trigger>
          <Popover.Content aria-label="Flipped" side="bottom" style={{ height: 200 }}>
            Tall
          </Popover.Content>
        </Popover>
      </div>
    </IdsProvider>,
  );
  const content = screen.getByRole('dialog', { name: 'Flipped' });
  await expect.element(content).toHaveAttribute('data-side', 'top');
  const triggerBox = screen
    .getByRole('button', { name: 'Bottom' })
    .element()
    .getBoundingClientRect();
  expect(content.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(triggerBox.top);
});

test('an anchor positions it against another element', async () => {
  function Scene() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
      <>
        <div ref={setAnchor} style={{ marginLeft: 200, width: 40, height: 20 }}>
          anchor
        </div>
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          {anchor && (
            <Popover.Content aria-label="Anchored" anchor={anchor} align="start" className="w-40">
              Body
            </Popover.Content>
          )}
        </Popover>
      </>
    );
  }
  const screen = await render(
    <IdsProvider>
      <Scene />
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  const content = screen.getByRole('dialog', { name: 'Anchored' });
  await expect.element(content).toBeVisible();
  const anchorBox = screen.getByText('anchor').element().getBoundingClientRect();
  await expect
    .poll(() => content.element().getBoundingClientRect().left)
    .toBeCloseTo(anchorBox.left, 0);
  expect(content.element().getBoundingClientRect().top).toBeCloseTo(anchorBox.bottom + 8, 0);
});

test('overlay.open binds a popover without an open prop and resolves its value', async () => {
  const screen = await render(
    <IdsProvider>
      <span>anchor spot</span>
    </IdsProvider>,
  );
  const anchor = screen.getByText('anchor spot').element();
  const ask = () =>
    overlay.open<string>(({ close }) => (
      <Popover>
        <Popover.Content aria-label="Quick pick" anchor={anchor}>
          <Button onClick={() => close('red')}>Red</Button>
        </Popover.Content>
      </Popover>
    ));
  const picked = ask();
  await userEvent.click(screen.getByRole('button', { name: 'Red' }));
  await expect(picked).resolves.toBe('red');
  await expect.element(screen.getByRole('dialog', { name: 'Quick pick' })).not.toBeInTheDocument();

  const dismissed = ask();
  await expect.element(screen.getByRole('dialog', { name: 'Quick pick' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(dismissed).resolves.toBeUndefined();
});

test('the exit keeps the content until its animation ends, then reports completion', async () => {
  const onOpenChangeComplete = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Popover defaultOpen onOpenChangeComplete={onOpenChangeComplete}>
        <Popover.Trigger>Slow</Popover.Trigger>
        <Popover.Content aria-label="Slow panel" style={{ transition: 'opacity 60s' }} />
      </Popover>
    </IdsProvider>,
  );
  const content = screen.getByRole('dialog', { name: 'Slow panel' });
  await expect.element(content).toBeVisible();
  finishAnimations(content.element());
  await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
  await userEvent.keyboard('{Escape}');
  await expect.element(content).toHaveAttribute('data-ending-style');
  await new Promise(requestAnimationFrame);
  finishAnimations(content.element());
  await expect.element(content).not.toBeInTheDocument();
  expect(onOpenChangeComplete.mock.calls).toEqual([[true], [false]]);
});

test('development warns about a content with nothing to sit next to, and about a second content', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(
    <IdsProvider>
      <Popover>
        <Popover.Content aria-label="Lost" />
      </Popover>
      <Popover>
        <Popover.Trigger>Twice</Popover.Trigger>
        <Popover.Content aria-label="One" />
        <Popover.Content aria-label="Two" />
      </Popover>
    </IdsProvider>,
  );
  await expect
    .poll(() => warn.mock.calls.map(([message]) => String(message)))
    .toEqual(
      expect.arrayContaining([
        expect.stringContaining('add Popover.Trigger, or pass anchor'),
        expect.stringContaining('render one Popover.Content per Popover'),
      ]),
    );
});
