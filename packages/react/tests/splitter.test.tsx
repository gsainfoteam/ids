import { useState, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Dialog, Drawer, IdsProvider, Menu, Splitter } from '../src';
import { skipWithoutCdp } from './engines';

type Point = { x: number; y: number };

const PANELS_SHARE_400PX_BESIDE_ONE_HANDLE = { width: 401, height: 160 };
const PANELS_SHARE_400PX_BESIDE_TWO_HANDLES = { width: 402, height: 160 };
const PANELS_SHARE_200PX_BESIDE_ONE_HANDLE = { width: 201, height: 120 };
const TALL = { width: 160, height: 401 };

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const panelsOf = (root: Element) => [
  ...root.querySelectorAll<HTMLElement>(':scope > [data-splitter-panel]'),
];
const handlesOf = (root: Element) => [
  ...root.querySelectorAll<HTMLElement>(
    ':scope > [role=separator], :scope > [data-splitter-handle-group] > [role=separator]',
  ),
];
const growOf = (root: Element) => panelsOf(root).map((panel) => Number(panel.style.flexGrow));
const rootOf = (handle: Locator) => handle.element().closest<HTMLElement>('[data-splitter]')!;
const valueNow = (handle: Locator) => Number(handle.element().getAttribute('aria-valuenow'));

function centerOf(element: Element): Point {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

const shifted = ({ x, y }: Point, dx: number, dy = 0): Point => ({ x: x + dx, y: y + dy });

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
const press = (point: Point) => mouse('mousePressed', point);
const drag = (point: Point) => mouse('mouseMoved', point);
const release = (point: Point) => mouse('mouseReleased', point);

async function keydownPrevented(keys: string, key: string) {
  const prevented: boolean[] = [];
  const observe = (event: KeyboardEvent) => {
    if (event.key === key) prevented.push(event.defaultPrevented);
  };
  window.addEventListener('keydown', observe);
  try {
    await userEvent.keyboard(keys);
  } finally {
    window.removeEventListener('keydown', observe);
  }
  return prevented;
}

function modifiedArrowPrevented(target: Element, modifier: 'ctrlKey' | 'altKey' | 'metaKey') {
  const syntheticSinceRealOnesNavigateOrCloseTheTestPage = new KeyboardEvent('keydown', {
    key: 'ArrowLeft',
    code: 'ArrowLeft',
    [modifier]: true,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(syntheticSinceRealOnesNavigateOrCloseTheTestPage);
  return syntheticSinceRealOnesNavigateOrCloseTheTestPage.defaultPrevented;
}

function Sized({
  size,
  children,
}: {
  size: { width: number; height: number };
  children: ReactNode;
}) {
  return <div style={size}>{children}</div>;
}

test('SSR: panels grow by their default sizes, the rest share what is left, handles carry the separator ARIA', () => {
  const doc = parse(
    renderToString(
      <Splitter id="ide">
        <Splitter.Panel id="files" defaultSize={30} minSize={10} maxSize={60}>
          Files
        </Splitter.Panel>
        <Splitter.Panel>Editor</Splitter.Panel>
        <Splitter.Panel defaultSize={20}>Preview</Splitter.Panel>
      </Splitter>,
    ),
  );
  const root = doc.getElementById('ide')!;
  expect(growOf(root)).toEqual([30, 50, 20]);

  const [first, second] = handlesOf(root);
  expect(handlesOf(root), 'one handle is inserted between each pair').toHaveLength(2);
  expect(
    first!.getAttribute('aria-orientation'),
    'side by side panels meet at a vertical line',
  ).toBe('vertical');
  expect(first!.getAttribute('aria-controls'), 'the primary panel only').toBe('files');
  expect(first!.getAttribute('aria-valuenow')).toBe('30');
  expect(first!.getAttribute('aria-valuemin')).toBe('10');
  expect(first!.getAttribute('aria-valuemax')).toBe('60');
  expect(first!.getAttribute('aria-valuetext')).toBe('30%');
  expect(first!.getAttribute('aria-label')).toBe('패널 크기 조절');
  expect(first!.tabIndex).toBe(0);
  expect(second!.getAttribute('aria-controls')).toBe(panelsOf(root)[1]!.id);
  expect(doc.querySelectorAll('[dir]'), 'the direction is inherited, never forced').toHaveLength(0);

  const vertical = parse(
    renderToString(
      <Splitter orientation="vertical" defaultValue={[70, 30]}>
        <Splitter.Panel>Top</Splitter.Panel>
        <Splitter.Handle aria-label="Terminal height" />
        <Splitter.Panel>Bottom</Splitter.Panel>
      </Splitter>,
    ),
  );
  const handle = vertical.querySelector('[role=separator]')!;
  expect(handle.getAttribute('aria-orientation')).toBe('horizontal');
  expect(handle.getAttribute('aria-label')).toBe('Terminal height');
  expect(growOf(vertical.querySelector('[data-splitter]')!)).toEqual([70, 30]);
});

test('SSR: a collapsed panel is inert, and its handle offers a button to expand it', () => {
  const doc = parse(
    renderToString(
      <Splitter defaultValue={[0, 100]}>
        <Splitter.Panel id="sidebar" minSize={20} collapsible>
          <button type="button">Hidden</button>
        </Splitter.Panel>
        <Splitter.Panel>Editor</Splitter.Panel>
      </Splitter>,
    ),
  );
  const [sidebar] = panelsOf(doc.querySelector('[data-splitter]')!);
  expect(sidebar!.hasAttribute('inert')).toBe(true);
  expect(sidebar!.hasAttribute('data-collapsed')).toBe(true);
  const handle = doc.querySelector('[role=separator]')!;
  expect(handle.getAttribute('aria-valuetext')).toBe('접힘');
  expect(handle.getAttribute('aria-valuemin'), 'collapsing is the smallest size').toBe('0');
  const toggle = doc.querySelector('[data-splitter-toggle]')!;
  expect(toggle.getAttribute('aria-label')).toBe('패널 펼치기');
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(toggle.getAttribute('aria-controls')).toBe('sidebar');
});

test('keyboard: arrows move 16px, Shift 64px, Home and End reach the bounds, one commit per key sequence', async () => {
  const changes: number[][] = [];
  const commits: number[][] = [];
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter
        onValueChange={(value) => changes.push(value)}
        onValueCommit={(value) => commits.push(value)}
      >
        <Splitter.Panel defaultSize={50} minSize={20} maxSize={80}>
          A
        </Splitter.Panel>
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  handle.element().focus();

  await userEvent.keyboard('{ArrowRight}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '54');
  expect(commits).toEqual([[54, 46]]);

  await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '38');

  await userEvent.keyboard('{ArrowRight>3}');
  await expect.poll(() => valueNow(handle)).toBe(50);
  expect(commits, 'nothing is committed while the key is held').toHaveLength(2);
  await userEvent.keyboard('{/ArrowRight}');
  expect(commits.at(-1)).toEqual([50, 50]);
  expect(commits).toHaveLength(3);

  await userEvent.keyboard('{End}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '80');
  await userEvent.keyboard('{Home}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '20');
  await userEvent.keyboard('{Home}');
  expect(commits.at(-1)).toEqual([20, 80]);
  expect(changes.at(-1)).toEqual([20, 80]);

  expect(
    await keydownPrevented('{ArrowLeft}', 'ArrowLeft'),
    'a handled key does not scroll',
  ).toEqual([true]);
  expect(await keydownPrevented('{ArrowDown}', 'ArrowDown'), 'the cross axis is the page').toEqual([
    false,
  ]);
  expect(
    (['ctrlKey', 'altKey', 'metaKey'] as const).map((modifier) =>
      modifiedArrowPrevented(handle.element(), modifier),
    ),
    'an arrow with another modifier stays the browser’s',
  ).toEqual([false, false, false]);
  expect(valueNow(handle)).toBe(20);
});

test('keyboard: vertical splitters use ↑ ↓, and right-to-left flips ← →', async () => {
  const screen = await render(
    <Sized size={TALL}>
      <Splitter orientation="vertical">
        <Splitter.Panel defaultSize={50}>Top</Splitter.Panel>
        <Splitter.Panel>Bottom</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const vertical = screen.getByRole('separator');
  vertical.element().focus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(vertical).toHaveAttribute('aria-valuenow', '54');
  await userEvent.keyboard('{ArrowRight}');
  await userEvent.keyboard('{ArrowUp}{ArrowUp}');
  await expect.element(vertical).toHaveAttribute('aria-valuenow', '46');

  await screen.rerender(
    <div key="rtl" dir="rtl" style={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter>
        <Splitter.Panel defaultSize={50}>Start</Splitter.Panel>
        <Splitter.Panel>End</Splitter.Panel>
      </Splitter>
    </div>,
  );
  const rtl = screen.getByRole('separator');
  const [start] = panelsOf(rootOf(rtl));
  expect(
    start!.getBoundingClientRect().left,
    'the first panel stands on the right',
  ).toBeGreaterThan(rtl.element().getBoundingClientRect().left);
  rtl.element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect
    .element(rtl, { message: '← moves the line left, growing the start panel' })
    .toHaveAttribute('aria-valuenow', '54');
  await userEvent.keyboard('{ArrowRight}{ArrowRight}');
  await expect.element(rtl).toHaveAttribute('aria-valuenow', '46');
});

test('collapse: Enter and the handle button fold the panel and restore its size, arrows open it to its minimum', async () => {
  const commits: number[][] = [];
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter onValueCommit={(value) => commits.push(value)}>
        <Splitter.Panel id="sidebar" defaultSize={30} minSize={20} collapsible>
          <button type="button">Inside</button>
        </Splitter.Panel>
        <Splitter.Panel>Editor</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  const sidebar = () => panelsOf(rootOf(handle))[0]!;

  handle.element().focus();
  await userEvent.keyboard('{Enter}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '0');
  await expect.element(handle).toHaveAttribute('aria-valuetext', '접힘');
  await expect.element(sidebar()).toHaveAttribute('inert');
  expect(commits).toEqual([[0, 100]]);
  await userEvent.keyboard('{Enter}');
  await expect
    .element(handle, { message: 'Enter restores the size before it folded' })
    .toHaveAttribute('aria-valuenow', '30');
  await expect.element(sidebar()).not.toHaveAttribute('inert');

  const toggle = screen.getByRole('button', { name: '패널 접기' });
  await expect.element(toggle).toHaveAttribute('aria-controls', 'sidebar');
  await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(toggle);
  await expect.element(handle).toHaveAttribute('aria-valuenow', '0');
  const expand = screen.getByRole('button', { name: '패널 펼치기' });
  await expect.element(expand).toHaveAttribute('aria-expanded', 'false');
  expect(commits.at(-1)).toEqual([0, 100]);
  await userEvent.click(expand);
  await expect.element(handle).toHaveAttribute('aria-valuenow', '30');
  expect(commits.at(-1)).toEqual([30, 70]);

  handle.element().focus();
  await userEvent.keyboard('{Home}');
  await expect
    .element(handle, { message: 'Home reaches the smallest size, folded' })
    .toHaveAttribute('aria-valuenow', '0');
  await userEvent.keyboard('{ArrowRight}');
  await expect
    .element(handle, { message: 'one step opens it to its minimum' })
    .toHaveAttribute('aria-valuenow', '20');
  await userEvent.keyboard('{ArrowLeft}');
  await expect
    .element(handle, { message: 'one step below the minimum folds it' })
    .toHaveAttribute('aria-valuenow', '0');
});

test('collapse: a collapsible panel after the handle folds toward the end', async () => {
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter defaultValue={[75, 25]}>
        <Splitter.Panel>Editor</Splitter.Panel>
        <Splitter.Panel minSize={20} collapsible>
          Inspector
        </Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '100');
  handle.element().focus();
  await userEvent.keyboard('{Enter}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '75');
});

test('three panels: a handle pushes past a panel at its minimum, a written handle keeps its place', async () => {
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_TWO_HANDLES}>
      <Splitter defaultValue={[20, 30, 50]}>
        <Splitter.Panel>A</Splitter.Panel>
        <Splitter.Panel minSize={10}>B</Splitter.Panel>
        <Splitter.Handle className="custom-handle" data-testid="written" />
        <Splitter.Panel minSize={10}>C</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const [first, second] = screen.getByRole('separator').all();
  expect(second!.element().classList.contains('custom-handle')).toBe(true);
  expect(first!.element().classList.contains('custom-handle')).toBe(false);
  first!.element().focus();
  await userEvent.keyboard('{End}');
  await expect.poll(() => growOf(rootOf(first!))).toEqual([80, 10, 10]);
});

test('controlled: the parent decides, a parent that does not follow keeps its layout', async () => {
  const changes: number[][] = [];
  function Parent({ follow }: { follow: boolean }) {
    const [layout, setLayout] = useState([40, 60]);
    return (
      <>
        <button type="button" onClick={() => setLayout([25, 75])}>
          Quarter
        </button>
        <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
          <Splitter
            value={layout}
            onValueChange={(next) => {
              changes.push(next);
              if (follow) setLayout(next);
            }}
          >
            <Splitter.Panel>A</Splitter.Panel>
            <Splitter.Panel>B</Splitter.Panel>
          </Splitter>
        </Sized>
      </>
    );
  }

  const screen = await render(<Parent follow={false} />);
  const handle = screen.getByRole('separator');
  handle.element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(() => changes).toEqual([[44, 56]]);
  expect(valueNow(handle)).toBe(40);
  await userEvent.click(screen.getByRole('button', { name: 'Quarter' }));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '25');
  expect(growOf(rootOf(handle))).toEqual([25, 75]);

  await screen.rerender(<Parent key="following" follow />);
  const following = screen.getByRole('separator');
  following.element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(following).toHaveAttribute('aria-valuenow', '36');
});

test('pointer: the handle follows a drag, clamps at the bounds and commits once on release', async (context) => {
  skipWithoutCdp(context);
  const changes: number[][] = [];
  const commits: number[][] = [];
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter
        onValueChange={(value) => changes.push(value)}
        onValueCommit={(value) => commits.push(value)}
      >
        <Splitter.Panel defaultSize={50} maxSize={80}>
          A
        </Splitter.Panel>
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  const start = centerOf(handle.element());

  await press(start);
  await expect.element(handle, { message: 'the pressed handle takes focus' }).toHaveFocus();
  await expect.element(rootOf(handle)).toHaveAttribute('data-dragging');
  await drag(shifted(start, 40));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '60');
  await drag(shifted(start, 400));
  await expect
    .element(handle, { message: 'a drag past the maximum stops there' })
    .toHaveAttribute('aria-valuenow', '80');
  expect(commits).toEqual([]);
  await drag(shifted(start, -20));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '45');
  await release(shifted(start, -20));
  expect(commits).toEqual([[45, 55]]);
  expect(changes.at(-1)).toEqual([45, 55]);
  await expect.element(rootOf(handle)).not.toHaveAttribute('data-dragging');
  await expect.element(handle).toHaveAttribute('data-orientation', 'horizontal');

  const moved = centerOf(handle.element());
  await press(moved);
  await release(moved);
  expect(commits, 'a press without a move commits nothing').toHaveLength(1);
});

test('pointer: right-to-left and vertical drags move the line with the pointer', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <div key="rtl" dir="rtl" style={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter>
        <Splitter.Panel defaultSize={50}>Start</Splitter.Panel>
        <Splitter.Panel>End</Splitter.Panel>
      </Splitter>
    </div>,
  );
  const rtl = screen.getByRole('separator');
  const from = centerOf(rtl.element());
  await press(from);
  await drag(shifted(from, 40));
  await expect
    .element(rtl, { message: 'the start panel stands on the right and shrinks' })
    .toHaveAttribute('aria-valuenow', '40');
  await release(shifted(from, 40));
  expect(rtl.element().getBoundingClientRect().left - from.x).toBeCloseTo(40 - 0.5, 0);

  await screen.rerender(
    <Sized key="vertical" size={TALL}>
      <Splitter orientation="vertical">
        <Splitter.Panel defaultSize={50}>Top</Splitter.Panel>
        <Splitter.Panel>Bottom</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const vertical = screen.getByRole('separator');
  const top = centerOf(vertical.element());
  await press(top);
  await drag(shifted(top, 0, -100));
  await expect.element(vertical).toHaveAttribute('aria-valuenow', '25');
  await release(shifted(top, 0, -100));
});

test('pointer: dragging a collapsible panel past half its minimum folds it', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter>
        <Splitter.Panel defaultSize={30} minSize={20} collapsible>
          Sidebar
        </Splitter.Panel>
        <Splitter.Panel>Editor</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  const start = centerOf(handle.element());
  await press(start);
  await drag(shifted(start, -60));
  await expect
    .element(handle, { message: 'above half the minimum it holds the minimum' })
    .toHaveAttribute('aria-valuenow', '20');
  await drag(shifted(start, -90));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '0');
  await drag(shifted(start, -60));
  await expect
    .element(handle, { message: 'moving back within the drag reopens it' })
    .toHaveAttribute('aria-valuenow', '20');
  await release(shifted(start, -60));
});

test('a double click on a handle restores the default layout', async () => {
  const commits: number[][] = [];
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter onValueCommit={(value) => commits.push(value)}>
        <Splitter.Panel defaultSize={30}>A</Splitter.Panel>
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  handle.element().focus();
  await userEvent.keyboard('{End}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '100');
  await userEvent.dblClick(handle);
  await expect.element(handle).toHaveAttribute('aria-valuenow', '30');
  expect(commits).toEqual([
    [100, 0],
    [30, 70],
  ]);
});

test('nested splitters resize on their own axis only', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter>
        <Splitter.Panel defaultSize={50}>Files</Splitter.Panel>
        <Splitter.Panel>
          <Splitter orientation="vertical">
            <Splitter.Panel defaultSize={50}>Editor</Splitter.Panel>
            <Splitter.Panel>Terminal</Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const [outer, inner] = screen.getByRole('separator').all();
  await expect.element(inner!).toHaveAttribute('aria-orientation', 'horizontal');
  const innerCenter = centerOf(inner!.element());
  await press(innerCenter);
  await drag(shifted(innerCenter, 0, 40));
  await expect.element(inner!).toHaveAttribute('aria-valuenow', '75');
  await release(shifted(innerCenter, 0, 40));
  expect(valueNow(outer!)).toBe(50);

  outer!.element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(outer!).toHaveAttribute('aria-valuenow', '54');
  expect(valueNow(inner!)).toBe(75);
});

test('an in-place Menu option lying over a handle is chosen without starting a resize', async (context) => {
  skipWithoutCdp(context);
  const chosen = vi.fn();
  const changes: number[][] = [];
  const screen = await render(
    <IdsProvider>
      <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
        <Splitter onValueChange={(value) => changes.push(value)}>
          <Splitter.Panel defaultSize={50}>
            <div className="flex justify-end">
              <Menu>
                <Menu.Trigger>Actions</Menu.Trigger>
                <Menu.Content className="w-56">
                  <Menu.Item onSelect={chosen}>Rename the file</Menu.Item>
                </Menu.Content>
              </Menu>
            </div>
          </Splitter.Panel>
          <Splitter.Panel>Editor</Splitter.Panel>
        </Splitter>
      </Sized>
    </IdsProvider>,
  );
  const handle = screen.getByRole('separator');
  await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
  const option = screen.getByRole('menuitem', { name: 'Rename the file' });
  await expect.element(option).toBeVisible();

  const line = centerOf(handle.element());
  const item = option.element().getBoundingClientRect();
  expect(item.left, 'the option spans the handle line').toBeLessThan(line.x);
  expect(item.right).toBeGreaterThan(line.x);
  const overTheHandle = { x: line.x, y: item.top + item.height / 2 };

  await press(overTheHandle);
  await drag(shifted(overTheHandle, 30));
  await release(shifted(overTheHandle, 30));
  expect(chosen).toHaveBeenCalledTimes(1);
  expect(changes).toEqual([]);
  expect(valueNow(handle)).toBe(50);
  await expect.element(rootOf(handle)).not.toHaveAttribute('data-dragging');
});

test('parts: asChild handles and panels, and parts outside Splitter throw', async () => {
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter>
        <Splitter.Panel asChild defaultSize={40}>
          <aside aria-label="Files">Files</aside>
        </Splitter.Panel>
        <Splitter.Handle asChild>
          <hr className="grip" />
        </Splitter.Handle>
        <Splitter.Panel asChild>
          <main>Editor</main>
        </Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  expect(handle.element().tagName).toBe('HR');
  expect(handle.element().classList.contains('grip')).toBe(true);
  await expect
    .element(screen.getByRole('complementary', { name: 'Files' }))
    .toHaveAttribute('data-splitter-panel');
  expect(growOf(rootOf(handle))).toEqual([40, 60]);

  expect(() => renderToString(<Splitter.Panel />)).toThrow(/inside Splitter/);
  expect(() => renderToString(<Splitter.Handle />)).toThrow(/inside Splitter/);
  expect(() =>
    renderToString(
      <Splitter>
        <Splitter.Panel>
          <div>
            <Splitter.Handle />
          </div>
        </Splitter.Panel>
        <Splitter.Panel />
      </Splitter>,
    ),
  ).toThrow(/direct child/);
});

test('development warnings: one panel, defaults past 100 and handles outside a gap', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter>
        <Splitter.Handle />
        <Splitter.Panel>Alone</Splitter.Panel>
      </Splitter>
      <Splitter>
        <Splitter.Panel defaultSize={70}>A</Splitter.Panel>
        <Splitter.Panel defaultSize={60}>B</Splitter.Panel>
      </Splitter>
    </Sized>,
  );

  await expect
    .poll(() => warn.mock.calls.map(([message]) => String(message)))
    .toEqual([
      '[IDS] Splitter needs at least two Splitter.Panel children; it has 1.',
      '[IDS] Splitter: 1 Splitter.Handle not drawn. A handle goes between two panels, one per gap.',
      '[IDS] Splitter: the default sizes add up to 130%, past 100%. They are scaled down to fit.',
    ]);
});

test('keyboard: an arrow pushes past a panel already at its minimum, Home stops at that panel', async () => {
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_TWO_HANDLES}>
      <Splitter defaultValue={[30, 10, 60]}>
        <Splitter.Panel>A</Splitter.Panel>
        <Splitter.Panel minSize={10}>B</Splitter.Panel>
        <Splitter.Panel>C</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const [, second] = screen.getByRole('separator').all();
  second!.element().focus();

  await userEvent.keyboard('{ArrowLeft}');
  await expect.poll(() => growOf(rootOf(second!))).toEqual([26, 10, 64]);
  expect(valueNow(second!), 'the panel before the handle stays at its minimum').toBe(10);
  await userEvent.keyboard('{Home}');
  expect(growOf(rootOf(second!)), 'Home moves only the panel before the handle').toEqual([
    26, 10, 64,
  ]);
});

test('pointer: Escape during a drag puts the layout back, reports it and commits nothing', async (context) => {
  skipWithoutCdp(context);
  const changes: number[][] = [];
  const commits: number[][] = [];
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter
        onValueChange={(value) => changes.push(value)}
        onValueCommit={(value) => commits.push(value)}
      >
        <Splitter.Panel defaultSize={50}>A</Splitter.Panel>
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  const start = centerOf(handle.element());

  await press(start);
  await drag(shifted(start, 40));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '60');
  await userEvent.keyboard('{Escape}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '50');
  expect(changes).toEqual([
    [60, 40],
    [50, 50],
  ]);
  await expect.element(handle).not.toHaveAttribute('data-dragging');
  await expect.element(rootOf(handle)).not.toHaveAttribute('data-dragging');

  await drag(shifted(start, 80));
  await release(shifted(start, 80));
  await nextFrame();
  expect(valueNow(handle), 'the rest of the press moves nothing').toBe(50);
  expect(commits).toEqual([]);
});

test('pointer: Escape during a drag inside a Dialog cancels the drag and leaves the Dialog open', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <IdsProvider>
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Layout</Dialog.Title>
          <Sized size={PANELS_SHARE_200PX_BESIDE_ONE_HANDLE}>
            <Splitter>
              <Splitter.Panel defaultSize={50}>A</Splitter.Panel>
              <Splitter.Panel>B</Splitter.Panel>
            </Splitter>
          </Sized>
        </Dialog.Content>
      </Dialog>
    </IdsProvider>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Layout' });
  await expect.element(dialog).toBeVisible();
  const handle = screen.getByRole('separator');
  const start = centerOf(handle.element());

  await press(start);
  await drag(shifted(start, 20));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '60');
  await userEvent.keyboard('{Escape}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '50');
  await release(shifted(start, 20));
  await expect.element(dialog).toBeInTheDocument();

  await userEvent.keyboard('{Escape}');
  await expect.element(dialog).not.toBeInTheDocument();
});

test('pointer: handles show a resize cursor, which the page keeps with no text selection while dragging', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <>
      <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
        <Splitter>
          <Splitter.Panel defaultSize={50}>A</Splitter.Panel>
          <Splitter.Panel>B</Splitter.Panel>
        </Splitter>
      </Sized>
      <Sized size={TALL}>
        <Splitter orientation="vertical">
          <Splitter.Panel defaultSize={50}>Top</Splitter.Panel>
          <Splitter.Panel>Bottom</Splitter.Panel>
        </Splitter>
      </Sized>
    </>,
  );
  const [across, down] = screen.getByRole('separator').all();
  const drags = [
    { handle: across!, cursor: 'ew-resize', by: (point: Point) => shifted(point, 40) },
    { handle: down!, cursor: 'ns-resize', by: (point: Point) => shifted(point, 0, 40) },
  ];

  for (const { handle, cursor, by } of drags) {
    expect(getComputedStyle(handle.element()).cursor).toBe(cursor);
    const start = centerOf(handle.element());
    await press(start);
    await drag(by(start));
    await expect.element(handle).toHaveAttribute('data-dragging');
    expect(document.documentElement.style.cursor).toBe(cursor);
    expect(document.documentElement.style.userSelect).toBe('none');
    await release(by(start));
    expect(document.documentElement.style.cursor).toBe('');
    expect(document.documentElement.style.userSelect).toBe('');
  }
});

test('pointer: the handle ends where the pointer is released and commits that once', async (context) => {
  skipWithoutCdp(context);
  const commits: number[][] = [];
  const screen = await render(
    <Sized size={PANELS_SHARE_400PX_BESIDE_ONE_HANDLE}>
      <Splitter onValueCommit={(value) => commits.push(value)}>
        <Splitter.Panel defaultSize={50}>A</Splitter.Panel>
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </Sized>,
  );
  const handle = screen.getByRole('separator');
  const start = centerOf(handle.element());

  await press(start);
  await release(shifted(start, -40));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '40');
  expect(commits).toEqual([[40, 60]]);
});

test('pointer: a handle removed during its drag ends the drag and commits nothing', async (context) => {
  skipWithoutCdp(context);
  const commits: number[][] = [];
  const layout = (names: string[]) => (
    <Sized size={PANELS_SHARE_400PX_BESIDE_TWO_HANDLES}>
      <Splitter onValueCommit={(value) => commits.push(value)}>
        {names.map((name) => (
          <Splitter.Panel key={name}>{name}</Splitter.Panel>
        ))}
      </Splitter>
    </Sized>
  );
  const screen = await render(layout(['A', 'B', 'C']));
  const [, second] = screen.getByRole('separator').all();
  const root = rootOf(second!);
  const start = centerOf(second!.element());

  await press(start);
  await drag(shifted(start, 20));
  await expect.element(root).toHaveAttribute('data-dragging');
  await screen.rerender(layout(['A', 'B']));
  await expect.element(root).not.toHaveAttribute('data-dragging');
  expect(panelsOf(root).filter((panel) => panel.hasAttribute('data-dragging'))).toEqual([]);
  await release(shifted(start, 20));
  expect(commits).toEqual([]);
});

test('a Splitter inside a bottom Drawer resizes its panels without dragging the Drawer', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <IdsProvider>
      <Drawer side="bottom" defaultOpen>
        <Drawer.Content>
          <Drawer.Title>Panels</Drawer.Title>
          <Sized size={TALL}>
            <Splitter orientation="vertical">
              <Splitter.Panel defaultSize={50}>Top</Splitter.Panel>
              <Splitter.Panel>Bottom</Splitter.Panel>
            </Splitter>
          </Sized>
        </Drawer.Content>
      </Drawer>
    </IdsProvider>,
  );
  const drawer = screen.getByRole('dialog', { name: 'Panels' });
  await expect.element(drawer).toBeVisible();
  const sheet = document.querySelector<HTMLElement>('[data-drawer-content]')!;
  const handle = screen.getByRole('separator');
  const start = centerOf(handle.element());

  await press(start);
  await drag(shifted(start, 0, 20));
  await drag(shifted(start, 0, 60));
  await expect.element(handle).toHaveAttribute('aria-valuenow', '65');
  expect(sheet.style.transform, 'the sheet stays where it opened').toBe('');
  await release(shifted(start, 0, 60));
  await expect.element(drawer).toBeInTheDocument();
});
