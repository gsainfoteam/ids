import { useState } from 'react';

import { detectPlatform } from '@tanstack/react-hotkeys';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Dialog, IdsProvider, overlay } from '../src';
import { skipWithoutCdp } from './engines';
import { MOD_AS_THE_APP_READS_IT } from './hotkeys';
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
          Copy <Menu.Shortcut keys="Mod+C" />
        </Menu.Item>
        <Menu.Item disabled>Cut</Menu.Item>
        <Menu.Item>Paste</Menu.Item>
        <Menu.Separator />
        <Menu>
          <Menu.Trigger>Share</Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={onEmail}>Email</Menu.Item>
            <Menu.Item>Link</Menu.Item>
          </Menu.Content>
        </Menu>
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

test('hovering a nested trigger opens its submenu, and selecting inside closes the whole tree', async () => {
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

test('a nested trigger is a menuitem of its parent, reached by arrows and typing without opening', async () => {
  const { screen, trigger, item } = await renderActions();
  await userEvent.click(trigger);
  const share = item('Share');
  await expect.element(share).toHaveAttribute('aria-haspopup', 'menu');
  await expect.element(share).toHaveAttribute('aria-expanded', 'false');
  await expect.element(share).not.toHaveAttribute('aria-controls');

  await userEvent.keyboard('sh');
  await expect.element(share).toHaveFocus();
  await expect.element(share).toHaveAttribute('data-highlighted');
  await expect
    .element(screen.getByRole('menu', { name: 'Share 하위 메뉴' }))
    .not.toBeInTheDocument();

  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item('Delete')).toHaveFocus();
  await userEvent.keyboard('{ArrowUp}{ArrowUp}');
  await expect.element(item('Paste')).toHaveFocus();
});

test('a nested trigger matches typing by textValue, and a disabled one is skipped and never opens', async () => {
  const screen = await render(
    <IdsProvider>
      <Menu>
        <Menu.Trigger>Library</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Recent</Menu.Item>
          <Menu>
            <Menu.Trigger textValue="Favorites">
              <span aria-hidden="true">★</span> Favorites
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Report</Menu.Item>
            </Menu.Content>
          </Menu>
          <Menu>
            <Menu.Trigger disabled>Archive</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>2024</Menu.Item>
            </Menu.Content>
          </Menu>
          <Menu.Item>Trash</Menu.Item>
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  const item = (name: string) => screen.getByRole('menuitem', { name });
  screen.getByRole('button', { name: 'Library' }).element().focus();
  await userEvent.keyboard('{Enter}');
  await expect.element(item('Recent')).toHaveFocus();

  await userEvent.keyboard('f');
  await expect.element(item('Favorites')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(item('Trash')).toHaveFocus();

  await expect.element(item('Archive')).toHaveAttribute('aria-disabled', 'true');
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  await userEvent.hover(item('Archive'));
  vi.runOnlyPendingTimers();
  await userEvent.click(item('Archive'), { force: true });
  await expect.element(item('Archive')).toHaveAttribute('aria-expanded', 'false');
  await expect
    .element(screen.getByRole('menu', { name: 'Archive 하위 메뉴' }))
    .not.toBeInTheDocument();
});

test('a nested Menu warns that triggerType belongs to the outermost Menu, and still opens as a submenu', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const screen = await render(
    <IdsProvider>
      <Menu>
        <Menu.Trigger>File</Menu.Trigger>
        <Menu.Content>
          <Menu triggerType="contextmenu">
            <Menu.Trigger>Export</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>PDF</Menu.Item>
            </Menu.Content>
          </Menu>
          <Menu>
            <Menu.Trigger>Share</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Email</Menu.Item>
            </Menu.Content>
          </Menu>
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'File' }));
  await userEvent.hover(screen.getByRole('menuitem', { name: 'Export' }));
  await expect.element(screen.getByRole('menu', { name: 'Export 하위 메뉴' })).toBeVisible();

  const rootOnly = warn.mock.calls.filter(([message]) =>
    String(message).includes('triggerType and hotkey apply only to the outermost Menu'),
  );
  expect(rootOnly).toHaveLength(1);
  warn.mockRestore();
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

function DeepMenu(props: Partial<Menu.Props> & { onNestedOpenChange?: (open: boolean) => void }) {
  const { onNestedOpenChange, ...menuProps } = props;

  return (
    <Menu {...menuProps}>
      <Menu.Trigger>File</Menu.Trigger>
      <Menu.Content>
        <Menu.Item>New</Menu.Item>
        <Menu onOpenChange={onNestedOpenChange}>
          <Menu.Trigger>Export</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>PDF</Menu.Item>
            <Menu>
              <Menu.Trigger>Image</Menu.Trigger>
              <Menu.Content>
                <Menu.Item>PNG</Menu.Item>
                <Menu>
                  <Menu.Trigger>JPEG</Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item>High quality</Menu.Item>
                    <Menu.Item>Low quality</Menu.Item>
                  </Menu.Content>
                </Menu>
              </Menu.Content>
            </Menu>
          </Menu.Content>
        </Menu>
      </Menu.Content>
    </Menu>
  );
}

async function renderDeep(props: Parameters<typeof DeepMenu>[0] = {}, justify = 'flex-start') {
  const screen = await render(
    <IdsProvider>
      <div style={{ display: 'flex', justifyContent: justify }}>
        <DeepMenu {...props} />
      </div>
      <button type="button" style={{ position: 'fixed', bottom: 16, left: 16 }}>
        Outside
      </button>
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'File' });
  const item = (name: string) => screen.getByRole('menuitem', { name });
  const submenu = (name: string) => screen.getByRole('menu', { name: `${name} 하위 메뉴` });

  const openByKeyboard = async () => {
    trigger.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(item('New')).toHaveFocus();
    for (const [sub, first] of [
      ['Export', 'PDF'],
      ['Image', 'PNG'],
      ['JPEG', 'High quality'],
    ] as const) {
      await userEvent.keyboard('{ArrowDown}');
      await expect.element(item(sub)).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(item(first)).toHaveFocus();
    }
  };

  return { screen, trigger, item, submenu, openByKeyboard };
}

test('four levels open with ArrowRight, and ArrowLeft or Escape close only the deepest one', async () => {
  const { screen, trigger, item, submenu, openByKeyboard } = await renderDeep();
  await openByKeyboard();
  await expect.element(submenu('JPEG')).toBeVisible();

  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(submenu('JPEG')).not.toBeInTheDocument();
  await expect.element(item('JPEG')).toHaveFocus();
  await expect.element(submenu('Image')).toBeVisible();

  await userEvent.keyboard('{ArrowRight}');
  await expect.element(item('High quality')).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(item('JPEG')).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(submenu('Image')).not.toBeInTheDocument();
  await expect.element(item('Image')).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(submenu('Export')).not.toBeInTheDocument();
  await expect.element(item('Export')).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('menu', { name: 'File' })).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test('a press outside a four-level tree closes every level once', async () => {
  const onOpenChange = vi.fn();
  const onNestedOpenChange = vi.fn();
  const { screen, openByKeyboard } = await renderDeep({ onOpenChange, onNestedOpenChange });
  await openByKeyboard();

  const outside = screen.getByRole('button', { name: 'Outside' });
  await userEvent.click(outside);
  await expect.element(screen.getByRole('menu', { name: 'File' })).not.toBeInTheDocument();
  expect(screen.container.ownerDocument.querySelectorAll('[data-menu-content]')).toHaveLength(0);
  await expect.element(outside).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  expect(onNestedOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('hovering down four levels and choosing the deepest item closes the whole tree', async () => {
  const onOpenChange = vi.fn();
  const { screen, trigger, item, submenu } = await renderDeep({ onOpenChange });
  await userEvent.click(trigger);
  for (const name of ['Export', 'Image', 'JPEG']) {
    await userEvent.hover(item(name));
    await expect.element(submenu(name)).toBeVisible();
  }

  await userEvent.hover(item('Low quality'));
  await expect.element(item('Low quality')).toHaveFocus();
  await userEvent.click(item('Low quality'));
  await expect.element(screen.getByRole('menu', { name: 'File' })).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('a submenu keeps going the way its parent submenu flipped, and flips back only when out of room', async () => {
  const { submenu, openByKeyboard } = await renderDeep({}, 'flex-end');
  await openByKeyboard();

  const rect = (name: string) => submenu(name).element().getBoundingClientRect();
  const viewport = document.documentElement.clientWidth;

  await expect.element(submenu('Export')).toHaveAttribute('data-side', 'left');
  await expect
    .element(submenu('Image'), { message: 'continues left instead of covering the root menu' })
    .toHaveAttribute('data-side', 'left');
  await expect.element(submenu('JPEG')).toHaveAttribute('data-side', 'right');
  expect(rect('Image').left).toBeLessThan(rect('Export').left);
  for (const name of ['Export', 'Image', 'JPEG']) {
    expect(rect(name).left).toBeGreaterThanOrEqual(8);
    expect(rect(name).right).toBeLessThanOrEqual(viewport - 8);
  }
});

type PaletteProps = Partial<Menu.Props> & {
  onNewFile?: (event: Event) => void;
  onGrid?: (checked: boolean) => void;
};

function Palette({ onNewFile, onGrid, ...props }: PaletteProps) {
  const [grid, setGrid] = useState(false);

  return (
    <Menu triggerType="command" hotkey="Mod+K" {...props}>
      <Menu.Trigger>Commands</Menu.Trigger>
      <Menu.Content>
        <Menu.Search data-1p-ignore data-lpignore="true" />
        <Menu.Group>
          <Menu.Label>Files</Menu.Label>
          <Menu.Item onSelect={onNewFile}>
            New file <Menu.Shortcut keys="Mod+N" />
          </Menu.Item>
          <Menu.Item disabled>Open recent</Menu.Item>
          <Menu.Item>Résumé template</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Label>View</Menu.Label>
          <Menu.CheckboxItem
            checked={grid}
            onCheckedChange={(checked) => {
              setGrid(checked);
              onGrid?.(checked);
            }}
          >
            Show grid
          </Menu.CheckboxItem>
          <Menu.Item textValue="Full width">ＦＵＬＬ ＷＩＤＴＨ</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Label>설정</Menu.Label>
          <Menu.Item>설정 열기</Menu.Item>
        </Menu.Group>
      </Menu.Content>
    </Menu>
  );
}

async function renderPalette(props: PaletteProps = {}) {
  const screen = await render(
    <IdsProvider>
      <button type="button">Before</button>
      <Palette {...props} />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Commands' });
  const palette = screen.getByRole('dialog', { name: '명령' });
  const search = screen.getByRole('combobox', { name: '명령 검색' });
  const listbox = screen.getByRole('listbox');
  const option = (name: string | RegExp) => screen.getByRole('option', { name });
  const shown = () =>
    [...listbox.element().querySelectorAll('[role="option"]')].map((node) =>
      node.textContent?.replace(/\s+/g, ' ').trim(),
    );

  const expectActive = async (name: string | RegExp) => {
    const target = option(name);
    await expect.element(target).toHaveAttribute('aria-selected', 'true');
    await expect.element(search).toHaveAttribute('aria-activedescendant', target.element().id);
  };

  return { screen, trigger, palette, search, listbox, option, shown, expectActive };
}

test('the hotkey toggles the palette, focuses the search and returns focus where it was', async () => {
  const onOpenChange = vi.fn();
  const { screen, palette, search } = await renderPalette({ onOpenChange });
  const before = screen.getByRole('button', { name: 'Before' });
  before.element().focus();

  await userEvent.keyboard(`{${MOD_AS_THE_APP_READS_IT}>}k{/${MOD_AS_THE_APP_READS_IT}}`);
  await expect.element(palette).toBeVisible();
  await expect.element(search).toHaveFocus();

  await userEvent.keyboard(`{${MOD_AS_THE_APP_READS_IT}>}k{/${MOD_AS_THE_APP_READS_IT}}`);
  await expect.element(palette).not.toBeInTheDocument();
  await expect.element(before).toHaveFocus();

  await userEvent.keyboard('k');
  await userEvent.keyboard(
    `{Alt>}{${MOD_AS_THE_APP_READS_IT}>}k{/${MOD_AS_THE_APP_READS_IT}}{/Alt}`,
  );
  await expect.element(palette).not.toBeInTheDocument();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

const CDP_META = 4;
const CDP_CONTROL = 2;

async function pressModK(key: string, { repeats = 0 } = {}) {
  const modifiers = detectPlatform() === 'mac' ? CDP_META : CDP_CONTROL;
  const press = { key, code: 'KeyK', windowsVirtualKeyCode: 75, modifiers };

  await cdp().send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...press });
  for (let repeat = 0; repeat < repeats; repeat++)
    await cdp().send('Input.dispatchKeyEvent', { type: 'rawKeyDown', autoRepeat: true, ...press });
  await cdp().send('Input.dispatchKeyEvent', { type: 'keyUp', ...press });
}

test('the hotkey reads the key position, so a Korean layout opens the palette too', async (context) => {
  skipWithoutCdp(context);
  const { screen, palette, search } = await renderPalette();
  screen.getByRole('button', { name: 'Before' }).element().focus();

  await pressModK('ㅏ');
  await expect.element(palette).toBeVisible();
  await expect.element(search).toHaveFocus();
});

test('holding the hotkey toggles the palette once', async (context) => {
  skipWithoutCdp(context);
  const onOpenChange = vi.fn();
  const { screen, palette } = await renderPalette({ onOpenChange });
  screen.getByRole('button', { name: 'Before' }).element().focus();

  await pressModK('k', { repeats: 5 });
  await expect.element(palette).toBeVisible();
  expect(onOpenChange.mock.calls).toEqual([[true]]);
});

test('the palette is a modal dialog around a combobox and a listbox of options', async () => {
  const { screen, trigger, palette, search, listbox, option, expectActive } = await renderPalette();
  await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);

  await expect.element(palette).toBeVisible();
  await expect.element(palette).toHaveAttribute('aria-modal', 'true');
  await expect
    .element(screen.getByText('Commands'), { message: 'the page behind is aria-hidden' })
    .toHaveAttribute('aria-expanded', 'true');
  await expect.element(search).toHaveFocus();
  await expect.element(search).toHaveAttribute('aria-expanded', 'true');
  await expect.element(search).toHaveAttribute('aria-autocomplete', 'list');
  await expect.element(search).toHaveAttribute('aria-controls', listbox.element().id);
  await expect.element(search).toHaveAttribute('placeholder', '명령 검색…');
  await expect.element(screen.getByRole('group', { name: 'Files' })).toBeVisible();
  await expectActive(/^New file/);
  await expect.element(option('Open recent')).toHaveAttribute('aria-disabled', 'true');
  await expect.element(option('Show grid')).toHaveAttribute('aria-checked', 'false');
  await expect
    .element(screen.getByRole('status'), { message: 'the empty region stays empty' })
    .toHaveTextContent('');
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(true);
});

test('typing filters options ignoring case, accents and width, and hides groups left empty', async () => {
  const { screen, search, option, shown, expectActive } = await renderPalette();
  await userEvent.click(screen.getByRole('button', { name: 'Commands' }));

  await userEvent.fill(search, 'RESUME');
  expect(shown()).toEqual(['Résumé template']);
  await expectActive('Résumé template');
  await expect.element(screen.getByRole('group', { name: 'Files' })).toBeVisible();
  await expect.element(screen.getByRole('group', { name: 'View' })).not.toBeInTheDocument();
  await expect.element(screen.getByRole('group', { name: '설정' })).not.toBeInTheDocument();
  expect(
    [...document.querySelectorAll('[data-menu-separator]')].every((node) =>
      node.hasAttribute('hidden'),
    ),
  ).toBe(true);

  await userEvent.fill(search, 'full w');
  expect(shown()).toEqual(['ＦＵＬＬ ＷＩＤＴＨ']);
  await userEvent.fill(search, 'ｆｕｌｌ');
  expect(shown()).toEqual(['ＦＵＬＬ ＷＩＤＴＨ']);

  await userEvent.fill(search, '설정');
  expect(shown()).toEqual(['설정 열기']);
  await expect.element(screen.getByRole('group', { name: '설정' })).toBeVisible();

  await userEvent.fill(search, 'e');
  expect(shown()).toEqual([expect.stringMatching(/^New file/), 'Open recent', 'Résumé template']);
  await expectActive(/^New file/);
  const [between] = [...document.querySelectorAll('[data-menu-separator]')];
  expect(between?.hasAttribute('hidden')).toBe(true);

  await userEvent.fill(search, 'i');
  expect(shown()).toHaveLength(3);
  await expect.element(option('Show grid')).toBeVisible();
  const separators = [...document.querySelectorAll('[data-menu-separator]')];
  expect(separators.map((node) => node.hasAttribute('hidden'))).toEqual([false, true]);
});

test('an empty result shows the empty text, and clearing the query brings every option back', async () => {
  const { screen, search, shown, expectActive } = await renderPalette();
  await userEvent.click(screen.getByRole('button', { name: 'Commands' }));

  await userEvent.fill(search, 'zzz');
  expect(shown()).toEqual([]);
  await expect.element(screen.getByRole('status')).toHaveTextContent('결과가 없습니다.');
  await expect.element(search).not.toHaveAttribute('aria-activedescendant');
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('dialog')).toBeVisible();

  await userEvent.fill(search, '');
  expect(shown()).toHaveLength(6);
  await expect.element(screen.getByRole('status')).toHaveTextContent('');
  await expectActive(/^New file/);
});

test('arrows, Home and End move the highlight through enabled options and loop', async () => {
  const { screen, search, expectActive } = await renderPalette();
  await userEvent.click(screen.getByRole('button', { name: 'Commands' }));
  await expectActive(/^New file/);

  await userEvent.keyboard('{ArrowDown}');
  await expectActive('Résumé template');
  await userEvent.keyboard('{ArrowUp}');
  await expectActive(/^New file/);
  await userEvent.keyboard('{ArrowUp}');
  await expectActive('설정 열기');
  await userEvent.keyboard('{ArrowDown}');
  await expectActive(/^New file/);
  await userEvent.keyboard('{End}');
  await expectActive('설정 열기');
  await userEvent.keyboard('{Home}');
  await expectActive(/^New file/);
  await expect.element(search).toHaveFocus();
  await expect.element(search).toHaveValue('');
});

test('hovering an option highlights it, and a click selects it without moving focus first', async () => {
  const onGrid = vi.fn();
  const { screen, trigger, search, option, expectActive } = await renderPalette({ onGrid });
  await userEvent.click(trigger);

  await userEvent.hover(option('Show grid'));
  await expectActive('Show grid');
  await expect.element(search).toHaveFocus();
  await userEvent.click(option('Show grid'));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onGrid.mock.calls).toEqual([[true]]);

  await userEvent.click(trigger);
  await expect.element(option('Show grid')).toHaveAttribute('aria-checked', 'true');
});

test('Enter selects the highlighted option and closes, unless onSelect prevents it', async () => {
  const onNewFile = vi.fn();
  const { screen, trigger, search } = await renderPalette({ onNewFile });
  await userEvent.click(trigger);
  await userEvent.fill(search, 'new');
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onNewFile).toHaveBeenCalledTimes(1);
  expect(onNewFile.mock.calls[0]![0]).toBeInstanceOf(Event);

  onNewFile.mockImplementation((event: Event) => event.preventDefault());
  await userEvent.click(trigger);
  await expect.element(search).toHaveValue('');
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await expect.element(search).toHaveFocus();
  expect(onNewFile).toHaveBeenCalledTimes(2);
});

test('Escape and a backdrop click close the palette and return focus', async () => {
  const onOpenChange = vi.fn();
  const { screen, trigger, search } = await renderPalette({ onOpenChange });
  await userEvent.click(trigger);
  await expect.element(search).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();

  await userEvent.click(trigger);
  const backdrop = document.querySelector<HTMLElement>('[data-menu-backdrop]')!;
  await userEvent.click(backdrop, { position: { x: 10, y: 850 } });
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
});

test('Enter and Escape while an IME composes neither select nor close', async (context) => {
  skipWithoutCdp(context);
  const onNewFile = vi.fn();
  const { screen, trigger, search, shown } = await renderPalette({ onNewFile });
  await userEvent.click(trigger);
  await expect.element(search).toHaveFocus();

  const ime = cdp();
  await ime.send('Input.imeSetComposition', { text: '설', selectionStart: 1, selectionEnd: 1 });
  await expect.element(search).toHaveValue('설');
  expect(shown()).toEqual(['설정 열기']);
  for (const key of ['Enter', 'Escape'])
    await ime.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key,
      code: key,
      windowsVirtualKeyCode: 229,
    });
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await expect.element(search).toHaveValue('설');

  await ime.send('Input.insertText', { text: '설' });
  await expect.element(search).toHaveValue('설');
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  expect(onNewFile).not.toHaveBeenCalled();
});

test('a palette opened with overlay.open binds to the item and resolves through an option', async () => {
  await render(<IdsProvider />);
  const picked = overlay.open<string>(({ close }) => (
    <Menu triggerType="command">
      <Menu.Content aria-label="Go to">
        <Menu.Item onSelect={() => close('home')}>Home</Menu.Item>
        <Menu.Item onSelect={() => close('settings')}>Settings</Menu.Item>
      </Menu.Content>
    </Menu>
  ));

  const dialog = page.getByRole('dialog', { name: 'Go to' });
  await expect.element(dialog).toBeVisible();
  await expect.element(page.getByRole('combobox')).toHaveFocus();
  await userEvent.keyboard('set{Enter}');
  await expect(picked).resolves.toBe('settings');
  await expect.element(dialog).not.toBeInTheDocument();
});

test('a nested Menu inside a command palette warns and renders nothing', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const screen = await render(
    <IdsProvider>
      <Menu triggerType="command" defaultOpen>
        <Menu.Content>
          <Menu.Item>Copy</Menu.Item>
          <Menu>
            <Menu.Trigger>Share</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Email</Menu.Item>
            </Menu.Content>
          </Menu>
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  await expect.element(screen.getByRole('option', { name: 'Copy' })).toBeVisible();
  expect(screen.container.ownerDocument.querySelectorAll('[role="option"]')).toHaveLength(1);
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('a Menu nested in a triggerType="command" palette'),
  );
  warn.mockRestore();
});
