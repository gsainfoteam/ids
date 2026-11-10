import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Item } from '../src';

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
  expect(media.className).toContain('mt-(--item-media-inset)');
  expect(media.className).toContain('size-[calc(var(--item-row)*var(--item-media-ratio))]');
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

test('Group variant: bordered draws seams between square rows, separated spaces outlined rows', async () => {
  const group = (variant: Item.Group.Variant) => (
    <Item.Group variant={variant} aria-label={variant}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item variant="soft">Three</Item>
    </Item.Group>
  );
  const screen = await render(
    <>
      {group('bordered')}
      {group('separated')}
      {group('ghost')}
    </>,
  );
  const rows = (name: string) =>
    Array.from(
      screen.getByRole('list', { name }).element().querySelectorAll<HTMLElement>('[data-item]'),
    );
  const seams = (name: string) =>
    Array.from(screen.getByRole('list', { name }).element().children).map(
      (li) => getComputedStyle(li).borderBottomWidth,
    );

  expect(seams('bordered')).toEqual(['1px', '1px', '0px']);
  expect(rows('bordered').map((row) => getComputedStyle(row).borderRadius)).toEqual([
    '0px',
    '0px',
    '0px',
  ]);

  const separated = screen.getByRole('list', { name: 'separated' }).element();
  expect(getComputedStyle(separated).rowGap).toBe('8px');
  expect(seams('separated')).toEqual(['0px', '0px', '0px']);
  expect(rows('separated').map((row) => row.dataset.variant)).toEqual([
    'outline',
    'outline',
    'soft',
  ]);

  expect(rows('ghost').map((row) => row.dataset.variant)).toEqual(['ghost', 'ghost', 'soft']);
  expect(getComputedStyle(screen.getByRole('list', { name: 'ghost' }).element()).rowGap).toBe(
    'normal',
  );
});

test('Group ordered: an ol a screen reader counts, still a list in Safari', async () => {
  const ref = vi.fn();
  const screen = await render(
    <Item.Group ordered ref={ref} aria-label="Steps">
      <Item>Verify email</Item>
      <Item.Separator />
      <Item>Choose a name</Item>
    </Item.Group>,
  );
  const list = screen.getByRole('list', { name: 'Steps' });

  await expect.element(list).toBeInTheDocument();
  expect(list.element().tagName).toBe('OL');
  expect(ref).toHaveBeenCalledWith(list.element());
  expect(screen.getByRole('listitem').all()).toHaveLength(2);
  expect(html(<Item.Group aria-label="x" />).querySelector('ul')).not.toBeNull();
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

const WRAPPING_DESCRIPTION =
  'A description long enough to wrap onto a second line inside this narrow row, and a little more.';

function insets(media: Element) {
  const row = media.closest('[data-item]')!;
  const outer = row.getBoundingClientRect();
  const box = media.getBoundingClientRect();
  return {
    padding: parseFloat(getComputedStyle(row).paddingTop),
    start: box.left - outer.left,
    top: box.top - outer.top,
    bottom: outer.bottom - box.bottom,
    width: box.width,
    height: box.height,
    icon: media.querySelector('svg')!.getBoundingClientRect().width,
  };
}

const tileCases = (['standard', 'tiny'] as const).flatMap((size) =>
  (['title', 'one line', 'caption line', 'two lines', 'tall action'] as const).map(
    (text, index) => ({ size, text, media: index % 2 === 0 ? ('soft' as const) : ('outline' as const) }),
  ),
);

const RATIO = { standard: 8 / 14, tiny: 7 / 11 };

function rowHeight(tile: Element) {
  return tile.closest('[data-item]')!.getBoundingClientRect().height;
}

function oneLineRow(row: Element) {
  const line = (part: string) =>
    parseFloat(getComputedStyle(row.querySelector(`[data-item-${part}]`)!).lineHeight);
  return line('title') + 2 + line('description') + parseFloat(getComputedStyle(row).paddingTop) * 2;
}

test('a tile and the space around it scale with the row up to one line of description', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-72 flex-col gap-2">
        {tileCases.map(({ size, text, media }, index) => (
          <Item key={index} variant="outline" size={size}>
            <Item.Media variant={media}>
              <svg />
            </Item.Media>
            <Item.Content>
              <Item.Title>Report.pdf</Item.Title>
              {text === 'one line' && <Item.Description>16 B</Item.Description>}
              {text === 'caption line' && (
                <Item.Description className="text-caption-c1-regular">16 B</Item.Description>
              )}
              {text === 'two lines' && <Item.Description>{WRAPPING_DESCRIPTION}</Item.Description>}
            </Item.Content>
            {text === 'tall action' && (
              <Item.Actions>
                <button type="button" className={size === 'standard' ? 'h-10' : 'h-8'}>
                  Remove
                </button>
              </Item.Actions>
            )}
          </Item>
        ))}
      </div>
    </IdsProvider>,
  );
  const tiles = Array.from(screen.container.querySelectorAll('[data-item-media]'));
  const heights = new Map<string, number>();

  for (const [index, tile] of tiles.entries()) {
    const { size, text } = tileCases[index]!;
    const label = `${size}, ${text}`;
    const row = tile.closest('[data-item]')!;
    const scaledRow = text === 'two lines' ? oneLineRow(row) : 0;
    await expect
      .poll(
        () => {
          const { start, top, bottom, height } = insets(tile);
          const scaled = text === 'two lines' ? scaledRow : rowHeight(tile);
          const vertical = text === 'two lines' ? 0 : Math.abs(bottom - top);
          return Math.max(Math.abs(height - scaled * RATIO[size]), Math.abs(start - top), vertical);
        },
        { message: `${label}: the tile and its inset keep their share of the row` },
      )
      .toBeLessThanOrEqual(1);
    const { top, bottom, width, height, icon } = insets(tile);
    if (text === 'two lines') expect(bottom, `${label}: stays at the top`).toBeGreaterThan(top + 5);
    expect(Math.abs(width - height), `${label}: square`).toBeLessThanOrEqual(1);
    expect(icon, `${label}: the icon is half its tile`).toBeCloseTo(height / 2, 0);
    heights.set(label, height);
  }
  for (const size of ['standard', 'tiny']) {
    expect(heights.get(`${size}, title`)).toBe(size === 'standard' ? 32 : 28);
    expect(heights.get(`${size}, one line`)).toBeGreaterThan(heights.get(`${size}, title`)!);
    expect(heights.get(`${size}, two lines`)).toBeCloseTo(heights.get(`${size}, one line`)!, 0);
  }
});

test('a tile keeps its size in the top corner once its text wraps', async () => {
  const screen = await render(
    <IdsProvider>
      <Item variant="outline" className="w-96">
        <Item.Media variant="soft">
          <svg />
        </Item.Media>
        <Item.Content>
          <Item.Title>Quarterly report.pdf</Item.Title>
          <Item.Description>Wraps once the row narrows.</Item.Description>
        </Item.Content>
      </Item>
    </IdsProvider>,
  );
  const row = screen.container.querySelector<HTMLElement>('[data-item]')!;
  const tile = row.querySelector('[data-item-media]')!;
  const oneLine = insets(tile);
  expect(Math.abs(oneLine.bottom - oneLine.top)).toBeLessThanOrEqual(1);

  row.style.width = '160px';

  await expect.poll(() => rowHeight(tile)).toBeGreaterThan(oneLineRow(row) + 10);
  const { start, top, bottom, height } = insets(tile);
  expect(height).toBeCloseTo(oneLine.height, 0);
  expect(top).toBeCloseTo(oneLine.top, 0);
  expect(start).toBeCloseTo(top, 0);
  expect(bottom).toBeGreaterThan(top + 10);
});

test('a bare icon keeps its size and is centred on the row', async () => {
  const screen = await render(
    <IdsProvider>
      <Item variant="outline" className="w-72">
        <Item.Media>
          <svg />
        </Item.Media>
        <Item.Content>
          <Item.Title>Report.pdf</Item.Title>
          <Item.Description>{WRAPPING_DESCRIPTION}</Item.Description>
        </Item.Content>
      </Item>
    </IdsProvider>,
  );
  const { padding, start, top, bottom, icon } = insets(
    screen.container.querySelector('[data-item-media]')!,
  );

  expect(icon).toBe(16);
  expect(Math.abs(start - padding)).toBeLessThanOrEqual(1);
  expect(Math.abs(top - bottom)).toBeLessThanOrEqual(1);
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

test('Item.Actions mutes a bare icon and keeps the color an icon sets', async () => {
  const screen = await render(
    <IdsProvider>
      <Item>
        <Item.Content>
          <Item.Title>Build</Item.Title>
        </Item.Content>
        <Item.Actions>
          <svg data-testid="bare" />
          <svg data-testid="colored" className="text-(--ids-color-danger)" />
        </Item.Actions>
        <span data-testid="probe" className="text-(--ids-color-on-muted)">
          <span data-testid="danger" className="text-(--ids-color-danger)" />
        </span>
      </Item>
    </IdsProvider>,
  );
  const color = (id: string) => getComputedStyle(screen.getByTestId(id).element()).color;

  expect(color('bare')).toBe(color('probe'));
  expect(color('colored')).toBe(color('danger'));
});
