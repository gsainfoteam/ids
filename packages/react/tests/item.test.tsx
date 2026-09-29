import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Item } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');

function row(props: Item.Props = {}) {
  return (
    <Item {...props}>
      <Item.Media variant="soft">
        <svg />
      </Item.Media>
      <Item.Content>
        <Item.Title>Alice Kim</Item.Title>
        <Item.Description>Sent the slides</Item.Description>
      </Item.Content>
      <Item.Actions>
        <button type="button">Archive</button>
      </Item.Actions>
    </Item>
  );
}

test('SSR: a static row has no role, and every part marks itself', () => {
  const doc = html(row());
  const root = doc.querySelector<HTMLElement>('[data-item]')!;
  expect(root.hasAttribute('role')).toBe(false);
  expect(root.hasAttribute('data-disabled')).toBe(false);
  expect(root.dataset.variant).toBe('ghost');
  expect(root.className).toContain('concentric-p-3');
  for (const part of ['media', 'content', 'title', 'description', 'actions'])
    expect(doc.querySelector(`[data-item-${part}]`), part).not.toBeNull();
  expect(
    doc.querySelector('[data-item-content]')!.className,
    'a second content block keeps its width',
  ).toContain('[&+[data-item-content]]:flex-none');
  const media = doc.querySelector<HTMLElement>('[data-item-media]')!;
  expect(media.dataset.variant).toBe('soft');
  expect(media.className).toContain('group-has-[[data-item-description]]/item:self-start');
});

test('onClick: the title is the button, described by the description, and the row presses around its actions', async () => {
  const opened = vi.fn();
  const archived = vi.fn();
  const screen = await render(
    <Item onClick={opened}>
      <Item.Content>
        <Item.Title>Alice Kim</Item.Title>
        <Item.Description>Hi</Item.Description>
      </Item.Content>
      <Item.Actions>
        <button type="button" onClick={archived}>
          Archive
        </button>
      </Item.Actions>
    </Item>,
  );
  const row = screen.container.querySelector<HTMLElement>('[data-item]')!;
  const title = screen.getByRole('button', { name: 'Alice Kim' });
  expect(row).not.toHaveAttribute('role');
  expect(row).not.toHaveAttribute('tabindex');
  expect(title.element().closest('[data-item-title]')).not.toBeNull();
  await expect.element(title).toHaveAccessibleDescription('Hi');
  await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
  expect([opened.mock.calls.length, archived.mock.calls.length]).toEqual([0, 1]);
  await userEvent.click(screen.getByText('Hi'));
  expect(opened, 'a press anywhere on the row').toHaveBeenCalledOnce();
  title.element().focus();
  await userEvent.keyboard('{Enter}');
  expect(opened).toHaveBeenCalledTimes(2);
});

test('selected on a titled row is reported by the title button', async () => {
  const screen = await render(
    <Item onClick={() => {}} selected>
      <Item.Content>
        <Item.Title>Inbox</Item.Title>
      </Item.Content>
    </Item>,
  );
  await expect
    .element(screen.getByRole('button', { name: 'Inbox' }))
    .toHaveAttribute('aria-pressed', 'true');
  expect(screen.container.querySelector('[data-item]')).not.toHaveAttribute('aria-pressed');
});

test('a pressable row without a title stays a button itself', async () => {
  const screen = await render(<Item onClick={() => {}}>Home</Item>);
  const row = screen.getByRole('button', { name: 'Home' });
  await expect.element(row).toHaveAttribute('data-item');
  await expect.element(row).toHaveAttribute('tabindex', '0');
});

test('selected: aria-pressed on a button row, left out when aria-current says it', async () => {
  const screen = await render(
    <Item onClick={() => {}} selected>
      Home
    </Item>,
  );
  const item = screen.getByText('Home');
  await expect.element(item).toHaveAttribute('aria-pressed', 'true');
  await expect.element(item).toHaveAttribute('data-selected');
  await screen.rerender(
    <Item onClick={() => {}} selected={false}>
      Home
    </Item>,
  );
  await expect.element(item).toHaveAttribute('aria-pressed', 'false');
  await screen.rerender(
    <Item onClick={() => {}} selected aria-current="page">
      Home
    </Item>,
  );
  await expect.element(item).not.toHaveAttribute('aria-pressed');
  await expect.element(item).toHaveAttribute('aria-current', 'page');
  await screen.rerender(<Item selected>Static</Item>);
  const staticRow = screen.getByText('Static');
  await expect
    .element(staticRow, { message: 'a static row has no pressed state' })
    .not.toHaveAttribute('aria-pressed');
  await expect.element(staticRow).toHaveAttribute('data-selected');
});

test('disabled rows are out of the tab order and do not press', async () => {
  const opened = vi.fn();
  const screen = await render(
    <Item onClick={opened} disabled>
      Locked
    </Item>,
  );
  const item = screen.getByRole('button', { name: 'Locked' });
  await expect.element(item).toHaveAttribute('aria-disabled', 'true');
  await expect.element(item).not.toHaveAttribute('tabindex');
  await userEvent.click(item, { force: true });
  expect(opened).not.toHaveBeenCalled();
});

test('asChild: a link row keeps its role and is named by its title', async () => {
  const screen = await render(
    <Item asChild>
      <a href="#home">
        <Item.Title>Home</Item.Title>
      </a>
    </Item>,
  );
  const link = screen.getByRole('link', { name: 'Home' });
  await expect.element(link).toHaveAttribute('data-item');
  await expect.element(link).not.toHaveAttribute('role');
  await expect.element(link).toHaveAttribute('data-interactive');
  await expect
    .element(link)
    .toHaveAttribute('aria-labelledby', screen.container.querySelector('[data-item-title]')!.id);
});

test('Group: a list with an item per row; separators are hidden and size is shared', () => {
  const doc = html(
    <Item.Group size="tiny" aria-label="Menu">
      <Item>One</Item>
      <Item.Separator />
      <Item>Two</Item>
      <li className="own">
        <Item>Three</Item>
      </li>
    </Item.Group>,
  );
  const list = doc.querySelector('ul')!;
  expect(list.getAttribute('role')).toBe('list');
  const children = Array.from(list.children);
  expect(children.map((child) => child.tagName)).toEqual(['LI', 'LI', 'LI', 'LI']);
  expect(children[1]!.getAttribute('aria-hidden')).toBe('true');
  expect(children[1]!.hasAttribute('data-item-separator')).toBe(true);
  expect(children[1]!.hasAttribute('data-divider'), 'the separator is a Divider').toBe(true);
  expect(children[1]!.hasAttribute('role')).toBe(false);
  expect(children[3]!.classList.contains('own'), 'an li is not wrapped again').toBe(true);
  expect(
    Array.from(doc.querySelectorAll<HTMLElement>('[data-item]')).every(
      (item) => item.dataset.size === 'tiny',
    ),
  ).toBe(true);
  const rule = html(<Item.Separator id="rule" />).querySelector('hr')!;
  expect(rule.id).toBe('rule');
  expect(rule.hasAttribute('data-divider')).toBe(true);
  expect(rule.getAttribute('role')).toBe('separator');
  expect(rule.className, 'the hr border does not paint over the line').toMatch(/border-0/);
});

test('dense halves the padding and a group shares it with its rows', () => {
  const doc = html(
    <Item.Group dense aria-label="Files">
      <Item>One</Item>
      <Item size="tiny">Two</Item>
      <Item dense={false}>Three</Item>
    </Item.Group>,
  );
  const [one, two, three] = Array.from(doc.querySelectorAll('[data-item]'));
  expect(one!.hasAttribute('data-dense')).toBe(true);
  expect(one!.className).toMatch(/(^| )min-h-12( |$)/);
  expect(one!.className).toMatch(/(^| )concentric-p-1\.5( |$)/);
  expect(one!.className, 'the standard padding is replaced').not.toMatch(/min-h-14|concentric-p-3/);
  expect(two!.className).toMatch(/(^| )min-h-8( |$)/);
  expect(two!.className).toMatch(/(^| )concentric-p-1( |$)/);
  expect(three!.hasAttribute('data-dense'), 'a row can opt out of the group').toBe(false);
  expect(three!.className).toMatch(/(^| )concentric-p-3( |$)/);
  const plain = html(<Item>x</Item>).querySelector('[data-item]')!;
  expect(plain.hasAttribute('data-dense'), 'rows are not dense by default').toBe(false);
});

test('a truncated title stays on one line within its row', () => {
  const title = (props: Item.Title.Props) =>
    html(
      <Item>
        <Item.Content>
          <Item.Title {...props}>a-very-long-file-name.pdf</Item.Title>
        </Item.Content>
      </Item>,
    ).querySelector('[data-item-title]')!;
  const wrapping = title({});
  expect(wrapping.className).toMatch(/(^| )flex( |$)/);
  expect(wrapping.className, 'titles wrap by default').not.toMatch(/truncate/);
  const cut = title({ truncate: true });
  expect(cut.className).toMatch(/(^| )truncate( |$)/);
  expect(cut.className).toMatch(/(^| )max-w-full( |$)/);
  expect(cut.className).toMatch(/(^| )block( |$)/);
  expect(cut.className, 'a flex box would clip without an ellipsis').not.toMatch(/(^| )flex( |$)/);
  expect(cut.hasAttribute('truncate')).toBe(false);
});

test('a group and its rows shrink with their parent, so a truncated title cannot widen them', () => {
  const doc = html(
    <Item.Group>
      <Item>
        <Item.Title truncate>x</Item.Title>
      </Item>
    </Item.Group>,
  );
  expect(doc.querySelector('[data-item-group]')!.className).toMatch(/(^| )min-w-0( |$)/);
  expect(doc.querySelector('[data-item]')!.className).toMatch(/(^| )min-w-0( |$)/);
});

test('an image fills its media tile', () => {
  const media = (variant: Item.Media.Variant) =>
    html(
      <Item>
        <Item.Media variant={variant}>
          <img alt="" />
        </Item.Media>
      </Item>,
    ).querySelector('[data-item-media]')!;
  for (const variant of ['soft', 'outline'] as const) {
    const tile = media(variant);
    expect(tile.className, variant).toMatch(/(^| )overflow-hidden( |$)/);
    expect(tile.className, variant).toMatch(/\[&>img\]:size-full/);
  }
  expect(media('ghost').className, 'an image without a tile keeps its size').not.toMatch(
    /size-full/,
  );
});

test('className takes the row state', () => {
  const root = html(
    <Item selected className={(state) => (state.selected ? 'on' : 'off')}>
      x
    </Item>,
  ).querySelector('[data-item]')!;
  expect(root.classList.contains('on')).toBe(true);
});

test('parts outside Item throw', () => {
  expect(() => renderToString(<Item.Title>x</Item.Title>)).toThrow(/inside `<Item>`/);
});
