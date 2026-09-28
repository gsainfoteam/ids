import { useState, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Dialog, IdsProvider, Kbd } from '../src';
import { Tooltip, TooltipDelayGroup } from '../src/components/overlay/tooltip';

function Scene({ children }: { children: ReactNode }) {
  return (
    <IdsProvider>
      <TooltipDelayGroup>{children}</TooltipDelayGroup>
    </IdsProvider>
  );
}

function ShownAfterPress({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  return shown ? children : <Button onClick={() => setShown(true)}>Show</Button>;
}

const nextFrames = async (count = 3) => {
  for (let frame = 0; frame < count; frame++) await new Promise(requestAnimationFrame);
};

test('SSR renders only the trigger', () => {
  const html = renderToString(
    <Tooltip content="Save changes">
      <button type="button">Save</button>
    </Tooltip>,
  );
  expect(html).toContain('Save');
  expect(html).not.toContain('Save changes');
});

test('hovering opens after the delay, and leaving closes', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <Scene>
      <Tooltip content="Save changes" onOpenChange={onOpenChange}>
        <Button>Save</Button>
      </Tooltip>
      <Button variant="outline">Elsewhere</Button>
    </Scene>,
  );
  await userEvent.hover(screen.getByRole('button', { name: 'Save' }));
  const tooltip = screen.getByRole('tooltip');
  await expect.element(tooltip, { timeout: 2000 }).toHaveTextContent('Save changes');
  await expect
    .element(screen.getByRole('button', { name: 'Save' }))
    .toHaveAccessibleDescription('Save changes');

  await userEvent.hover(screen.getByRole('button', { name: 'Elsewhere' }));
  await expect.element(tooltip).not.toBeInTheDocument();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('the content is portaled into the IdsProvider root and shown in the top layer', async () => {
  const screen = await render(
    <IdsProvider data-testid="root">
      <ul className="space-y-2">
        <li>
          <Tooltip content="Hint" defaultOpen side="bottom">
            <Button>Item</Button>
          </Tooltip>
        </li>
      </ul>
    </IdsProvider>,
  );
  const tooltip = screen.getByRole('tooltip');
  await expect.element(tooltip).toBeVisible();
  const element = tooltip.element();
  expect(element.parentElement).toBe(screen.getByTestId('root').element());
  expect(element.matches(':popover-open')).toBe(true);
  expect(element).toHaveAttribute('data-side', 'bottom');
});

test('outside an IdsProvider the content renders in place', async () => {
  const screen = await render(
    <div data-testid="place">
      <Tooltip content="Hint" defaultOpen>
        <button type="button">Item</button>
      </Tooltip>
    </div>,
  );
  const tooltip = screen.getByRole('tooltip');
  await expect.element(tooltip).toBeVisible();
  expect(tooltip.element().parentElement).toBe(screen.getByTestId('place').element());
});

test('keyboard focus opens it, and the description joins the one the trigger had', async () => {
  const screen = await render(
    <Scene>
      <input aria-label="Before" data-1p-ignore data-lpignore="true" />
      <p id="own">Also saves drafts</p>
      <Tooltip content="Save changes">
        <Button aria-describedby="own">Save</Button>
      </Tooltip>
    </Scene>,
  );
  await userEvent.click(screen.getByRole('textbox', { name: 'Before' }));
  await userEvent.keyboard('{Tab}');
  const trigger = screen.getByRole('button', { name: 'Save' });
  await expect.element(trigger).toHaveFocus();
  await expect.element(screen.getByRole('tooltip')).toBeVisible();
  const tooltipId = screen.getByRole('tooltip').element().id;
  await expect.element(trigger).toHaveAttribute('aria-describedby', `own ${tooltipId}`);

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('tooltip')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveAttribute('aria-describedby', 'own');
});

test('a press on the trigger closes it, and the focus the press gives does not reopen it', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <Scene>
      <Tooltip content="Save changes" openDelay={0} onOpenChange={onOpenChange}>
        <Button>Save</Button>
      </Tooltip>
    </Scene>,
  );
  const trigger = screen.getByRole('button', { name: 'Save' });
  await userEvent.hover(trigger);
  await expect.element(screen.getByRole('tooltip')).toBeVisible();
  await userEvent.click(trigger);
  await expect.element(trigger).toHaveFocus();
  await expect.element(screen.getByRole('tooltip')).not.toBeInTheDocument();
  await nextFrames();
  expect(screen.getByRole('tooltip').query()).toBeNull();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('Escape closes the tooltip before the dialog it sits in', async () => {
  const screen = await render(
    <Scene>
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Settings</Dialog.Title>
          <input aria-label="Name" data-1p-ignore data-lpignore="true" />
          <Tooltip content="Apply now">
            <Button>Apply</Button>
          </Tooltip>
        </Dialog.Content>
      </Dialog>
    </Scene>,
  );
  await userEvent.click(screen.getByRole('textbox', { name: 'Name' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Apply' })).toHaveFocus();
  const tooltip = screen.getByRole('tooltip');
  await expect.element(tooltip).toBeVisible();

  await userEvent.keyboard('{Escape}');
  await expect.element(tooltip).not.toBeInTheDocument();
  await expect.element(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();

  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
});

test('opening a modal closes every tooltip', async () => {
  const screen = await render(
    <Scene>
      <ShownAfterPress>
        <Tooltip content="Unread messages" defaultOpen>
          <span>Inbox</span>
        </Tooltip>
        <Dialog>
          <Dialog.Trigger>Open settings</Dialog.Trigger>
          <Dialog.Content aria-label="Settings" />
        </Dialog>
      </ShownAfterPress>
    </Scene>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Show' }));
  const tooltip = screen.getByRole('tooltip');
  await expect.element(tooltip).toBeVisible();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Open settings' })).toHaveFocus();
  await expect.element(tooltip).toBeVisible();
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  await expect.element(tooltip).not.toBeInTheDocument();
});

test('focus that a closing dialog returns to the trigger does not reopen its tooltip', async () => {
  const screen = await render(
    <Scene>
      <input aria-label="Before" data-1p-ignore data-lpignore="true" />
      <Dialog>
        <Tooltip content="Change how the app looks">
          <Dialog.Trigger>Open settings</Dialog.Trigger>
        </Tooltip>
        <Dialog.Content aria-label="Settings">
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog>
    </Scene>,
  );
  await userEvent.click(screen.getByRole('textbox', { name: 'Before' }));
  await userEvent.keyboard('{Tab}');
  const trigger = screen.getByRole('button', { name: 'Open settings' });
  await expect.element(trigger).toHaveFocus();
  await expect.element(screen.getByRole('tooltip')).toBeVisible();

  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  await expect.element(screen.getByRole('tooltip')).not.toBeInTheDocument();

  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await nextFrames();
  expect(screen.getByRole('tooltip').query()).toBeNull();

  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('tooltip')).toBeVisible();
});

test('a group opens the next tooltip at once while one was just open', async () => {
  const screen = await render(
    <Scene>
      <Tooltip content="Bold">
        <Button variant="outline">B</Button>
      </Tooltip>
      <Tooltip content="Italic">
        <Button variant="outline">I</Button>
      </Tooltip>
    </Scene>,
  );
  await userEvent.hover(screen.getByRole('button', { name: 'B' }));
  await expect.element(screen.getByRole('tooltip'), { timeout: 2000 }).toHaveTextContent('Bold');
  await userEvent.hover(screen.getByRole('button', { name: 'I' }));
  const italic = screen.getByRole('tooltip');
  await expect.element(italic).toHaveTextContent('Italic');
  await expect.element(italic).toHaveAttribute('data-instant');
  expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
});

test('disabled never opens', async () => {
  const screen = await render(
    <Scene>
      <Tooltip content="Save changes" disabled defaultOpen openDelay={0}>
        <Button>Save</Button>
      </Tooltip>
    </Scene>,
  );
  await userEvent.hover(screen.getByRole('button', { name: 'Save' }));
  await nextFrames();
  expect(screen.getByRole('tooltip').query()).toBeNull();
});

test('the exit keeps the content until its animation ends', async () => {
  const screen = await render(
    <Scene>
      <ShownAfterPress>
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content style={{ transition: 'opacity 60s' }}>
            Save changes
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip>
      </ShownAfterPress>
    </Scene>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Show' }));
  const tooltip = screen.getByRole('tooltip');
  await expect.element(tooltip).toBeVisible();
  expect(tooltip.element().querySelector('[data-tooltip-arrow]')).not.toBeNull();
  for (const animation of tooltip.element().getAnimations()) animation.finish();
  await userEvent.keyboard('{Escape}');
  await expect.element(tooltip).toHaveAttribute('data-ending-style');
  await new Promise(requestAnimationFrame);
  for (const animation of tooltip.element().getAnimations()) animation.finish();
  await expect.element(tooltip).not.toBeInTheDocument();
});

test('development warns about a disabled trigger and focusable content', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(
    <Scene>
      <Tooltip content="Unavailable">
        <button type="button" disabled>
          Save
        </button>
      </Tooltip>
      <Tooltip defaultOpen>
        <Tooltip.Trigger>Help</Tooltip.Trigger>
        <Tooltip.Content>
          <a href="#docs">Read the docs</a>
        </Tooltip.Content>
      </Tooltip>
    </Scene>,
  );
  await expect
    .poll(() => warn.mock.calls.map(([message]) => String(message)))
    .toEqual(
      expect.arrayContaining([
        expect.stringContaining('the trigger is disabled'),
        expect.stringContaining('the content holds a focusable element'),
      ]),
    );
  warn.mockRestore();
});

test('shortcuts in the bubble are tiny keys, described by name', async () => {
  const screen = await render(
    <IdsProvider>
      <Tooltip
        open
        content={
          <>
            저장 <Kbd keys="Mod+S" platform="mac" />
          </>
        }
      >
        <button type="button">저장</button>
      </Tooltip>
      <Tooltip
        open
        content={
          <>
            열기 <Kbd keys="Mod+O" platform="mac" size="standard" />
          </>
        }
      >
        <button type="button">열기</button>
      </Tooltip>
    </IdsProvider>,
  );
  const save = screen.getByRole('button', { name: '저장' });
  await expect.element(save).toHaveAccessibleDescription('저장 커맨드 S');
  const sizes = [...document.querySelectorAll('[data-tooltip-content] [data-kbd-group]')].map(
    (group) => group.getAttribute('data-size'),
  );
  expect(sizes).toEqual(['tiny', 'standard']);
});
