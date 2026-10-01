import { useState, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Dialog, IdsProvider, Select, overlay } from '../src';

const finishAnimations = (element: Element) => {
  for (const animation of element.getAnimations()) animation.finish();
};

function Settings(props: Partial<Dialog.Props> & { children?: ReactNode }) {
  return (
    <Dialog {...props}>
      <Dialog.Trigger>Open settings</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Description>Change how the app looks.</Dialog.Description>
        </Dialog.Header>
        <input aria-label="Name" data-1p-ignore data-lpignore="true" />
        {props.children}
        <Dialog.Footer>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

test('SSR renders only the trigger', () => {
  const html = renderToString(<Settings />);
  expect(html).toContain('Open settings');
  expect(html).not.toContain('Settings</h2>');
});

test('opening focuses the first field, Tab stays inside, Escape closes and returns focus', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Settings onOpenChange={onOpenChange} />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Open settings' });
  const triggerElement = trigger.element();
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Settings' });
  await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
  await expect.element(dialog).toHaveAccessibleDescription('Change how the app looks.');
  expect(
    triggerElement.closest('[aria-hidden="true"]'),
    'the page is hidden from readers',
  ).not.toBeNull();
  expect(triggerElement).toHaveAttribute('aria-expanded', 'true');
  await expect.element(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '닫기' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();

  await userEvent.keyboard('{Escape}');
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('a backdrop click closes once and the content does not', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Settings defaultOpen onOpenChange={onOpenChange} />
    </IdsProvider>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Settings' });
  await userEvent.click(dialog, { position: { x: 20, y: 20 } });
  expect(onOpenChange).not.toHaveBeenCalled();
  const backdrop = document.querySelector<HTMLElement>('[data-dialog-backdrop]')!;
  await userEvent.click(page.elementLocator(backdrop), { position: { x: 5, y: 5 } });
  await expect.element(dialog).not.toBeInTheDocument();
  expect(onOpenChange.mock.calls).toEqual([[false]]);
});

test('Escape closes a Select inside first, then the dialog', async () => {
  const screen = await render(
    <IdsProvider>
      <Settings defaultOpen>
        <Select aria-label="Theme">
          <Select.Item value="light">Light</Select.Item>
          <Select.Item value="dark">Dark</Select.Item>
        </Select>
      </Settings>
    </IdsProvider>,
  );
  const select = screen.getByRole('combobox', { name: 'Theme' });
  await userEvent.click(select);
  await expect.element(screen.getByRole('listbox')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('listbox')).not.toBeInTheDocument();
  await expect.element(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  await expect.element(select).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
});

test('a dialog that cannot be dismissed ignores Escape and the backdrop', async () => {
  const screen = await render(
    <IdsProvider>
      <Settings defaultOpen dismissible={false} role="alertdialog" />
    </IdsProvider>,
  );
  const dialog = screen.getByRole('alertdialog', { name: 'Settings' });
  await expect.element(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await userEvent.click(page.elementLocator(document.querySelector('[data-dialog-backdrop]')!), {
    position: { x: 5, y: 5 },
  });
  await expect.element(dialog).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await expect.element(dialog).not.toBeInTheDocument();
});

test('the exit keeps the dialog until its animation ends, then reports completion', async () => {
  const onOpenChangeComplete = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Dialog defaultOpen onOpenChangeComplete={onOpenChangeComplete}>
        <Dialog.Content aria-label="Slow" style={{ transition: 'opacity 60s' }} />
      </Dialog>
    </IdsProvider>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Slow' });
  await expect.element(dialog).toBeVisible();
  finishAnimations(dialog.element());
  await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
  await userEvent.keyboard('{Escape}');
  await expect.element(dialog).toHaveAttribute('data-ending-style');
  await new Promise(requestAnimationFrame);
  finishAnimations(dialog.element());
  await expect.element(dialog).not.toBeInTheDocument();
  expect(onOpenChangeComplete.mock.calls).toEqual([[true], [false]]);
});

test('overlay.open resolves with the value closed with, or undefined when dismissed', async () => {
  const screen = await render(<IdsProvider>page</IdsProvider>);
  const confirm = () =>
    overlay.open<boolean>(({ close }) => (
      <Dialog role="alertdialog">
        <Dialog.Content>
          <Dialog.Title>Delete?</Dialog.Title>
          <Button onClick={() => close(true)}>Delete</Button>
        </Dialog.Content>
      </Dialog>
    ));
  const accepted = confirm();
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await expect(accepted).resolves.toBe(true);
  await expect.element(screen.getByRole('alertdialog')).not.toBeInTheDocument();

  const dismissed = confirm();
  await expect.element(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect(dismissed).resolves.toBeUndefined();
});

test('a dialog opened from a dialog stays usable and the one under it steps back', async () => {
  function Scene() {
    const [answer, setAnswer] = useState('none');
    return (
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Outer</Dialog.Title>
          <p>answer {answer}</p>
          <Button
            onClick={async () => {
              const value = await overlay.open<string>(({ close }) => (
                <Dialog>
                  <Dialog.Content>
                    <Dialog.Title>Inner</Dialog.Title>
                    <Button onClick={() => close('yes')}>Yes</Button>
                  </Dialog.Content>
                </Dialog>
              ));
              setAnswer(value ?? 'dismissed');
            }}
          >
            Ask
          </Button>
        </Dialog.Content>
      </Dialog>
    );
  }
  const screen = await render(
    <IdsProvider>
      <Scene />
    </IdsProvider>,
  );
  const outer = screen.getByRole('dialog', { name: 'Outer' }).element();
  await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
  await expect.element(screen.getByRole('dialog', { name: 'Inner' })).toBeInTheDocument();
  await expect.poll(() => outer.hasAttribute('data-nested-open')).toBe(true);
  const backdrops = document.querySelectorAll('[data-dialog-backdrop]');
  expect(backdrops[1]).toHaveAttribute('data-stacked');
  await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
  await expect.element(screen.getByText('answer yes')).toBeInTheDocument();
  await expect.poll(() => outer.hasAttribute('data-nested-open')).toBe(false);
  await expect.element(screen.getByRole('button', { name: 'Ask' })).toHaveFocus();
});
