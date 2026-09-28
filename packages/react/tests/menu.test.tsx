import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Dialog, IdsProvider, overlay } from '../src';
import { Menu } from '../src/components/overlay/menu';

type ActionsProps = Partial<Menu.Props> & {
  onCopy?: (event: Event) => void;
  onEmail?: (event: Event) => void;
};

function Actions({ onCopy, onEmail, ...props }: ActionsProps) {
  return (
    <Menu {...props}>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item onSelect={onCopy}>
          Copy <Menu.Shortcut keys="mod+c" />
        </Menu.Item>
        <Menu.Item disabled>Cut</Menu.Item>
        <Menu.Item>Paste</Menu.Item>
        <Menu.Separator />
        <Menu.Sub>
          <Menu.SubTrigger>Share</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item onSelect={onEmail}>Email</Menu.Item>
            <Menu.Item>Link</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Item>Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}

async function renderActions(props: ActionsProps = {}) {
  const screen = await render(
    <IdsProvider>
      <Actions {...props} />
      <button type="button">Outside</button>
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Actions' });
  const item = (name: string | RegExp) => screen.getByRole('menuitem', { name });
  return { screen, trigger, item };
}

test('SSR renders only the trigger', () => {
  const html = renderToString(<Actions />);
  expect(html).toContain('Actions');
  expect(html).not.toContain('role="menu"');
});

test('a click opens the menu focused, Escape closes it and returns focus', async () => {
  const onOpenChange = vi.fn();
  const { screen, trigger } = await renderActions({ onOpenChange });
  await userEvent.click(trigger);
  const menu = screen.getByRole('menu', { name: 'Actions' });
  await expect.element(menu).toBeVisible();
  await expect.element(menu).toHaveFocus();
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect.element(trigger).toHaveAttribute('aria-haspopup', 'menu');

  await userEvent.keyboard('{Escape}');
  await expect.element(menu).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('Enter, Space and ArrowDown focus the first item, ArrowUp the last', async () => {
  const { trigger, item } = await renderActions();
  for (const [key, first] of [
    ['{Enter}', 'Copy'],
    ['{ }', 'Copy'],
    ['{ArrowDown}', 'Copy'],
    ['{ArrowUp}', 'Delete'],
  ] as const) {
    trigger.element().focus();
    await userEvent.keyboard(key);
    await expect.element(item(new RegExp(`^${first}`))).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(trigger).toHaveFocus();
  }
});

test('arrows move through enabled items and loop around the ends', async () => {
  const { trigger, item } = await renderActions();
  trigger.element().focus();
  await userEvent.keyboard('{Enter}');
  await expect.element(item(/^Copy/)).toHaveFocus();
  await expect.element(item(/^Copy/)).toHaveAttribute('data-highlighted');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item('Paste')).toHaveFocus();
  await expect.element(item(/^Copy/)).not.toHaveAttribute('data-highlighted');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item('Share')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item('Delete')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item(/^Copy/)).toHaveFocus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(item('Delete')).toHaveFocus();
  await userEvent.keyboard('{Home}');
  await expect.element(item(/^Copy/)).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(item('Delete')).toHaveFocus();
  await expect.element(item('Cut')).toHaveAttribute('aria-disabled', 'true');
});

test('typing jumps to the enabled item that starts with the letters', async () => {
  const { trigger, item } = await renderActions();
  await userEvent.click(trigger);
  await userEvent.keyboard('c');
  await expect.element(item(/^Copy/)).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await userEvent.click(trigger);
  await userEvent.keyboard('de');
  await expect.element(item('Delete')).toHaveFocus();
});

test('selecting an item closes the menu and returns focus to the trigger', async () => {
  const onCopy = vi.fn();
  const { screen, trigger, item } = await renderActions({ onCopy });
  await userEvent.click(trigger);
  await userEvent.click(item(/^Copy/));
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onCopy).toHaveBeenCalledTimes(1);
  expect(onCopy.mock.calls[0]![0]).toBeInstanceOf(Event);

  trigger.element().focus();
  await userEvent.keyboard('{Enter}');
  await expect.element(item(/^Copy/)).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onCopy).toHaveBeenCalledTimes(2);
});

test('onSelect with preventDefault keeps the menu open, and a disabled item does nothing', async () => {
  const onCopy = vi.fn((event: Event) => event.preventDefault());
  const { screen, trigger, item } = await renderActions({ onCopy });
  await userEvent.click(trigger);
  await userEvent.click(item(/^Copy/));
  await expect.element(item(/^Copy/)).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('{ }');
  expect(onCopy).toHaveBeenCalledTimes(3);
  await userEvent.click(item('Cut'), { force: true });
  await expect.element(screen.getByRole('menu', { name: 'Actions' })).toBeVisible();
});

function ViewMenu({
  onCheckedChange,
  onValueChange,
}: {
  onCheckedChange: (checked: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  const [grid, setGrid] = useState(false);
  const [size, setSize] = useState('small');
  return (
    <Menu>
      <Menu.Trigger>View</Menu.Trigger>
      <Menu.Content>
        <Menu.CheckboxItem
          checked={grid}
          onCheckedChange={(checked) => {
            setGrid(checked);
            onCheckedChange(checked);
          }}
        >
          Show grid
        </Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.RadioGroup
          value={size}
          onValueChange={(value) => {
            setSize(value);
            onValueChange(value);
          }}
        >
          <Menu.Label>Icon size</Menu.Label>
          <Menu.RadioItem value="small">Small</Menu.RadioItem>
          <Menu.RadioItem value="large">Large</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu>
  );
}

test('checkbox and radio items report their state', async () => {
  const onCheckedChange = vi.fn();
  const onValueChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <ViewMenu onCheckedChange={onCheckedChange} onValueChange={onValueChange} />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'View' });
  const grid = screen.getByRole('menuitemcheckbox', { name: 'Show grid' });
  const small = screen.getByRole('menuitemradio', { name: 'Small' });
  const large = screen.getByRole('menuitemradio', { name: 'Large' });

  await userEvent.click(trigger);
  await expect.element(grid).toHaveAttribute('aria-checked', 'false');
  await expect.element(small).toHaveAttribute('aria-checked', 'true');
  await expect.element(large).toHaveAttribute('aria-checked', 'false');
  await expect.element(screen.getByRole('group', { name: 'Icon size' })).toBeVisible();
  await userEvent.click(grid);
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();

  await userEvent.click(trigger);
  await expect.element(grid).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(large);
  await userEvent.click(trigger);
  await expect.element(large).toHaveAttribute('aria-checked', 'true');
  await expect.element(small).toHaveAttribute('aria-checked', 'false');
  await userEvent.click(large);
  expect(onCheckedChange.mock.calls).toEqual([[true]]);
  expect(onValueChange.mock.calls).toEqual([['large']]);
});

test('hovering a sub trigger opens its menu, and selecting inside closes the whole tree', async () => {
  const onEmail = vi.fn();
  const onOpenChange = vi.fn();
  const { screen, trigger, item } = await renderActions({ onEmail, onOpenChange });
  await userEvent.click(trigger);
  await userEvent.hover(item('Share'));
  const submenu = screen.getByRole('menu', { name: 'Share 하위 메뉴' });
  await expect.element(submenu).toBeVisible();
  await expect.element(item('Share')).toHaveAttribute('aria-expanded', 'true');
  await expect.element(item('Share')).toHaveFocus();

  await userEvent.hover(item('Email'));
  await expect.element(item('Email')).toHaveFocus();
  await userEvent.click(item('Email'));
  await expect.element(screen.getByRole('menu', { name: 'Actions' })).not.toBeInTheDocument();
  await expect.element(submenu).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onEmail).toHaveBeenCalledTimes(1);
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('ArrowRight enters a submenu, ArrowLeft and Escape leave only the submenu', async () => {
  const { screen, trigger, item } = await renderActions();
  trigger.element().focus();
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('{ArrowDown}{ArrowDown}');
  await expect.element(item('Share')).toHaveFocus();

  await userEvent.keyboard('{ArrowRight}');
  const submenu = screen.getByRole('menu', { name: 'Share 하위 메뉴' });
  await expect.element(item('Email')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item('Link')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item('Email')).toHaveFocus();

  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(submenu).not.toBeInTheDocument();
  await expect.element(item('Share')).toHaveFocus();

  await userEvent.keyboard('{Enter}');
  await expect.element(item('Email')).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(submenu).not.toBeInTheDocument();
  await expect.element(item('Share')).toHaveFocus();
  await expect.element(screen.getByRole('menu', { name: 'Actions' })).toBeVisible();

  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('menu', { name: 'Actions' })).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test('a press outside closes the whole tree once and leaves focus where it landed', async () => {
  const onOpenChange = vi.fn();
  const { screen, trigger, item } = await renderActions({ onOpenChange });
  trigger.element().focus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(item('Delete')).toHaveFocus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(item('Share')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(item('Email')).toHaveFocus();

  const outside = screen.getByRole('button', { name: 'Outside' });
  await userEvent.click(outside);
  await expect.element(screen.getByRole('menu', { name: 'Actions' })).not.toBeInTheDocument();
  await expect.element(outside).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('Tab closes the menu and returns focus to the trigger', async () => {
  const { screen, trigger, item } = await renderActions();
  trigger.element().focus();
  await userEvent.keyboard('{Enter}');
  await expect.element(item(/^Copy/)).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test('a context menu opens at the pointer', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Menu triggerType="contextmenu" onOpenChange={onOpenChange}>
        <Menu.Trigger data-testid="area" style={{ width: 300, height: 200, margin: 24 }}>
          Right-click here
        </Menu.Trigger>
        <Menu.Content aria-label="Canvas">
          <Menu.Item>Undo</Menu.Item>
          <Menu.Item>Redo</Menu.Item>
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  const area = screen.getByTestId('area');
  const box = area.element().getBoundingClientRect();
  await userEvent.click(area, { button: 'right', position: { x: 60, y: 40 } });
  const menu = screen.getByRole('menu', { name: 'Canvas' });
  await expect.element(menu).toBeVisible();
  await expect.element(menu).toHaveFocus();
  await expect
    .poll(() => {
      const rect = menu.element().getBoundingClientRect();
      return [Math.round(rect.left - box.left), Math.round(rect.top - box.top)];
    })
    .toEqual([62, 40]);

  await userEvent.click(area, { button: 'right', position: { x: 20, y: 150 } });
  await expect
    .poll(() => {
      const rect = menu.element().getBoundingClientRect();
      return [Math.round(rect.left - box.left), Math.round(rect.top - box.top)];
    })
    .toEqual([22, 150]);

  await userEvent.click(area, { position: { x: 250, y: 150 } });
  await expect.element(menu).not.toBeInTheDocument();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('an item that opens a dialog closes the menu first, and the dialog returns focus to the trigger', async () => {
  const screen = await render(
    <IdsProvider>
      <Menu>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            onSelect={() =>
              overlay.open(({ close }) => (
                <Dialog>
                  <Dialog.Content>
                    <Dialog.Title>Rename</Dialog.Title>
                    <Button onClick={() => close()}>Done</Button>
                  </Dialog.Content>
                </Dialog>
              ))
            }
          >
            Rename
          </Menu.Item>
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'File' });
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
  const dialog = screen.getByRole('dialog', { name: 'Rename' });
  await expect.element(dialog).toBeVisible();
  await expect.element(screen.getByRole('button', { name: 'Done' })).toHaveFocus();

  await userEvent.keyboard('{Escape}');
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test('the menu opens below its trigger, aligned to its start', async () => {
  const screen = await render(
    <IdsProvider>
      <div style={{ padding: 48 }}>
        <Actions />
      </div>
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Actions' });
  await userEvent.click(trigger);
  const menu = screen.getByRole('menu', { name: 'Actions' });
  await expect
    .poll(() => {
      const anchor = trigger.element().getBoundingClientRect();
      const rect = menu.element().getBoundingClientRect();
      return [Math.round(rect.left - anchor.left), Math.round(rect.top - anchor.bottom)];
    })
    .toEqual([0, 4]);
});
