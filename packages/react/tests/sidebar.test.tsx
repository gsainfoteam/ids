import { useState, type ReactNode } from 'react';

import { Cog6ToothIcon, DocumentTextIcon, HomeIcon, InboxIcon } from '@heroicons/react/24/outline';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, onTestFinished, test, vi, type Mock } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Badge, IdsProvider, Sidebar } from '../src';
import { skipWithoutCdp } from './engines';
import { MOD_AS_THE_APP_READS_IT } from './hotkeys';

const DESKTOP = { width: 1024, height: 768 };
const PHONE = { width: 414, height: 896 };

afterEach(async () => {
  await page.viewport(PHONE.width, PHONE.height);
  document.cookie = 'sidebar=; path=/; max-age=0';
});

function Menu() {
  return (
    <>
      <Sidebar.Group label="워크스페이스">
        <Sidebar.Item value="/" href="#home">
          <HomeIcon />홈
        </Sidebar.Item>
        <Sidebar.Item value="/inbox" href="#inbox">
          <InboxIcon />
          받은편지함
          <Badge content={3} />
        </Sidebar.Item>
      </Sidebar.Group>
      <Sidebar.Group label="설정">
        <Sidebar.Item>
          <Cog6ToothIcon />
          설정
          <Sidebar.Item value="/settings/account" href="#account">
            계정
          </Sidebar.Item>
          <Sidebar.Item value="/settings/alerts" href="#alerts">
            알림
          </Sidebar.Item>
        </Sidebar.Item>
      </Sidebar.Group>
    </>
  );
}

const ui = (children: ReactNode) => <IdsProvider>{children}</IdsProvider>;

const pressShortcut = () =>
  userEvent.keyboard(`{${MOD_AS_THE_APP_READS_IT}>}b{/${MOD_AS_THE_APP_READS_IT}}`);

test('an aside holds a labelled nav, labelled groups and list items, and marks the current page', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(
      <Sidebar value="/inbox" aria-label="주 메뉴">
        <Menu />
      </Sidebar>,
    ),
  );

  await expect.element(screen.getByRole('complementary', { name: '주 메뉴' })).toBeVisible();
  const nav = screen.getByRole('navigation', { name: '주 메뉴' });
  await expect.element(nav).toBeVisible();
  await expect.element(nav.getByRole('region', { name: '워크스페이스' })).toBeVisible();
  await expect.element(nav.getByRole('listitem').first()).toBeVisible();

  const inbox = nav.getByRole('link', { name: '받은편지함' });
  await expect.element(inbox).toHaveAttribute('aria-current', 'page');
  await expect.element(inbox).toHaveAttribute('data-selected', '');
  await expect.element(nav.getByRole('link', { name: '홈' })).not.toHaveAttribute('aria-current');
});

test('collapsible adds a collapse button to the header that hides the labels and shows them in tooltips', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onCollapsedChange = vi.fn();
  const screen = await render(
    ui(
      <Sidebar value="/" collapsible onCollapsedChange={onCollapsedChange}>
        <Sidebar.Header>로고</Sidebar.Header>
        <Menu />
      </Sidebar>,
    ),
  );

  const toggle = screen.getByRole('button', { name: '사이드바 접기' });
  await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(toggle);

  expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
  const expand = screen.getByRole('button', { name: '사이드바 펼치기' });
  await expect.element(expand).toHaveAttribute('aria-expanded', 'false');
  await expect.element(screen.getByRole('complementary')).toHaveAttribute('data-collapsed', '');

  const home = screen.getByRole('link', { name: '홈' });
  await expect.element(home).toBeVisible();
  await userEvent.hover(home);
  await expect.element(screen.getByRole('tooltip')).toHaveTextContent('홈');
});

test('Mod+B collapses and expands, and persist writes the state to a cookie', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(
      <Sidebar collapsible persist="sidebar">
        <Menu />
      </Sidebar>,
    ),
  );

  await expect.element(screen.getByRole('button', { name: '사이드바 접기' })).toBeVisible();
  await pressShortcut();
  await expect.element(screen.getByRole('button', { name: '사이드바 펼치기' })).toBeVisible();
  expect(document.cookie).toContain('sidebar=true');

  await pressShortcut();
  await expect.element(screen.getByRole('button', { name: '사이드바 접기' })).toBeVisible();
  expect(document.cookie).toContain('sidebar=false');
});

test('Mod+B typed in a text field stays with the field', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onCollapsedChange = vi.fn();
  const screen = await render(
    ui(
      <div className="flex">
        <Sidebar collapsible onCollapsedChange={onCollapsedChange}>
          <Menu />
        </Sidebar>
        <main>
          <input aria-label="본문" data-1p-ignore data-lpignore="true" />
        </main>
      </div>,
    ),
  );

  await userEvent.click(screen.getByRole('textbox', { name: '본문' }));
  await pressShortcut();

  await expect.element(screen.getByRole('button', { name: '사이드바 접기' })).toBeVisible();
  expect(onCollapsedChange).not.toHaveBeenCalled();
});

test('defaultCollapsed renders the icon rail in the server HTML', () => {
  const html = renderToString(
    ui(
      <Sidebar collapsible defaultCollapsed>
        <Menu />
      </Sidebar>,
    ),
  );

  expect(html).toContain('data-collapsed=""');
  expect(html).toContain('aria-label="사이드바 펼치기"');
});

test('the inset body is a Card in the server HTML, and a plain main beside other variants', () => {
  const insetOf = (variant: Sidebar.Variant) =>
    new DOMParser()
      .parseFromString(
        renderToString(
          ui(
            <Sidebar.Provider>
              <Sidebar variant={variant}>
                <Menu />
              </Sidebar>
              <Sidebar.Inset>본문</Sidebar.Inset>
            </Sidebar.Provider>,
          ),
        ),
        'text/html',
      )
      .querySelector('main[data-sidebar-inset]')!;

  expect(insetOf('inset').className).toContain('shadow-xs');
  expect(insetOf('sidebar').className).not.toContain('shadow-xs');
});

test('a nested item opens as an accordion, and as a menu in the icon rail', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(
      <Sidebar value="/settings/alerts" collapsible>
        <Menu />
      </Sidebar>,
    ),
  );

  const settings = screen.getByRole('button', { name: '설정' });
  await expect.element(settings).toHaveAttribute('aria-expanded', 'true');
  await expect
    .element(screen.getByRole('link', { name: '알림' }))
    .toHaveAttribute('aria-current', 'page');
  await userEvent.click(settings);
  await expect.element(settings).toHaveAttribute('aria-expanded', 'false');

  await userEvent.click(screen.getByRole('button', { name: '사이드바 접기' }));
  const railSettings = screen.getByRole('button', { name: '설정' });
  await expect.element(railSettings).toHaveAttribute('data-selected', '');
  await userEvent.click(railSettings);
  const alerts = screen.getByRole('menuitem', { name: '알림' });
  await expect.element(alerts).toHaveAttribute('aria-current', 'page');
  await expect.element(alerts).toHaveAttribute('href', '#alerts');
});

test('a collapsible group folds its list', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(
      <Sidebar>
        <Sidebar.Group label="즐겨찾기" collapsible>
          <Sidebar.Item href="#a">문서</Sidebar.Item>
        </Sidebar.Group>
      </Sidebar>,
    ),
  );

  const label = screen.getByRole('button', { name: '즐겨찾기' });
  await expect.element(screen.getByRole('link', { name: '문서' })).toBeVisible();
  await userEvent.click(label);
  await expect.element(label).toHaveAttribute('aria-expanded', 'false');
  await expect.element(screen.getByRole('link', { name: '문서' })).not.toBeInTheDocument();
});

test('below 640px the trigger opens the sidebar in a drawer that a press on an item closes', async () => {
  const screen = await render(
    ui(
      <Sidebar value="/">
        <Menu />
      </Sidebar>,
    ),
  );

  const open = screen.getByRole('button', { name: '메뉴 열기' });
  await expect.element(open).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(open);

  const drawer = screen.getByRole('dialog', { name: '사이드바' });
  await expect.element(drawer).toBeVisible();
  await userEvent.click(drawer.getByRole('link', { name: '받은편지함' }));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});

test('with a Provider, a Trigger outside the sidebar shares its state and offcanvas takes the panel out', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(
      <Sidebar.Provider>
        <Sidebar collapsible="offcanvas" variant="inset">
          <Sidebar.Header>로고</Sidebar.Header>
          <Menu />
        </Sidebar>
        <Sidebar.Inset>
          <Sidebar.Trigger data-testid="outside" />
          본문
        </Sidebar.Inset>
      </Sidebar.Provider>,
    ),
  );

  const outside = screen.getByTestId('outside');
  await expect.element(outside).toHaveAttribute('aria-expanded', 'true');
  await expect.element(screen.getByRole('main')).toHaveTextContent('본문');
  await userEvent.click(outside);

  await expect.element(outside).toHaveAttribute('aria-expanded', 'false');
  const panel = document.querySelector('[data-sidebar-panel]')!;
  expect(panel.hasAttribute('inert')).toBe(true);
  await userEvent.click(outside);
  await expect.element(outside).toHaveAttribute('aria-expanded', 'true');
  expect(panel.hasAttribute('inert')).toBe(false);
});

test('offcanvas or inset without a Provider warns in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(
    ui(
      <Sidebar collapsible="offcanvas" variant="inset">
        <Menu />
      </Sidebar>,
    ),
  );

  expect(warn).toHaveBeenCalledWith(expect.stringContaining('collapsible="offcanvas"'));
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('variant="inset"'));
});

test('items nest to any depth, as accordions in the panel and as nested menus in the icon rail', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(
      <Sidebar value="frontend-issues" collapsible>
        <Sidebar.Item value="info">
          <HomeIcon />
          인포팀
          <Sidebar.Item value="info-issues" href="#info-issues">
            팀 이슈
          </Sidebar.Item>
          <Sidebar.Item value="frontend">
            프론트엔드
            <Sidebar.Item value="frontend-issues" href="#frontend-issues">
              프론트엔드 이슈
            </Sidebar.Item>
          </Sidebar.Item>
        </Sidebar.Item>
      </Sidebar>,
    ),
  );

  await expect
    .element(screen.getByRole('link', { name: '프론트엔드 이슈' }))
    .toHaveAttribute('aria-current', 'page');
  await expect
    .element(screen.getByRole('button', { name: '프론트엔드' }))
    .toHaveAttribute('aria-expanded', 'true');

  await userEvent.click(screen.getByRole('button', { name: '사이드바 접기' }));
  await userEvent.click(screen.getByRole('button', { name: '인포팀' }));
  await userEvent.click(screen.getByRole('menuitem', { name: '프론트엔드' }));
  await expect
    .element(screen.getByRole('menuitem', { name: '프론트엔드 이슈' }))
    .toHaveAttribute('aria-current', 'page');
});

type Doc = { id: string; label: string; children?: Doc[] };

const DOCS: Doc[] = [
  { id: 'roadmap', label: '로드맵' },
  {
    id: 'ids',
    label: 'IDS',
    children: [
      { id: 'minutes', label: '회의록' },
      { id: 'tokens', label: '토큰' },
    ],
  },
  { id: 'shuttle', label: '셔틀' },
];

function Docs({
  onItemsChange,
  canMove,
}: {
  onItemsChange: Mock;
  canMove?: Sidebar.Group.ItemsProps<Doc>['canMove'];
}) {
  const [docs, setDocs] = useState(DOCS);

  return (
    <Sidebar>
      <Sidebar.Group
        label="문서"
        items={docs}
        canMove={canMove}
        onItemsChange={(next, move) => {
          onItemsChange(move);
          setDocs(next);
        }}
      >
        {(doc) => (
          <Sidebar.Item value={doc.id} href={`#${doc.id}`}>
            <DocumentTextIcon />
            {doc.label}
          </Sidebar.Item>
        )}
      </Sidebar.Group>
    </Sidebar>
  );
}

const rowOrder = () =>
  [...document.querySelectorAll('[data-sidebar-item]')].map((row) => row.textContent);

const lastMove = (onItemsChange: Mock) => {
  const move = onItemsChange.mock.lastCall?.[0] as Sidebar.Group.Move<Doc>;
  return {
    item: move.item.id,
    from: [move.from.parent?.id ?? null, move.from.index],
    to: [move.to.parent?.id ?? null, move.to.index],
    between: [move.to.previousSibling?.id ?? null, move.to.nextSibling?.id ?? null],
  };
};

test('items render each row through the function and place the children under it', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(ui(<Docs onItemsChange={vi.fn()} />));

  await screen.getByRole('button', { name: 'IDS' }).click();
  await expect.element(screen.getByRole('link', { name: '토큰' })).toBeVisible();
  expect(rowOrder()).toEqual(['로드맵', 'IDS', '회의록', '토큰', '셔틀']);
});

test('Space picks a row up, the arrows choose a place, Enter drops it there and Escape cancels', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(ui(<Docs onItemsChange={onItemsChange} />));
  const shuttle = () => screen.getByRole('link', { name: '셔틀' });

  await expect.element(shuttle()).toHaveAttribute('aria-describedby');
  shuttle().element().focus();

  await userEvent.keyboard(' ');
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Escape}');
  expect(onItemsChange).not.toHaveBeenCalled();
  await expect.element(shuttle()).toHaveFocus();

  await userEvent.keyboard(' ');
  await userEvent.keyboard('{ArrowUp}');
  await userEvent.keyboard('{Enter}');
  expect(lastMove(onItemsChange)).toEqual({
    item: 'shuttle',
    from: [null, 2],
    to: ['ids', 0],
    between: [null, 'minutes'],
  });
  await expect.element(shuttle()).toBeVisible();
  await expect.element(shuttle()).toHaveFocus();
  await expect
    .element(screen.getByRole('button', { name: 'IDS' }))
    .toHaveAttribute('aria-expanded', 'true');
  expect(rowOrder()).toEqual(['로드맵', 'IDS', '셔틀', '회의록', '토큰']);

  await userEvent.keyboard(' ');
  await userEvent.keyboard('{ArrowUp}');
  await userEvent.keyboard(' ');
  expect(lastMove(onItemsChange)).toEqual({
    item: 'shuttle',
    from: ['ids', 0],
    to: [null, 1],
    between: ['roadmap', 'ids'],
  });
  await expect.element(shuttle()).toHaveFocus();
  expect(rowOrder()).toEqual(['로드맵', '셔틀', 'IDS', '회의록', '토큰']);
  expect(onItemsChange).toHaveBeenCalledTimes(2);
});

test('the arrows only stop at places canMove allows', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(
    ui(<Docs onItemsChange={onItemsChange} canMove={({ to }) => to.parent === null} />),
  );

  screen.getByRole('link', { name: '셔틀' }).element().focus();
  await userEvent.keyboard(' ');
  await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
  await userEvent.keyboard('{Enter}');

  expect(lastMove(onItemsChange)).toEqual({
    item: 'shuttle',
    from: [null, 2],
    to: [null, 0],
    between: [null, 'roadmap'],
  });
});

const frameOffset = (x: number, y: number) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + x * scale, y: frame.top + y * scale };
};

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', x: number, y: number) {
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    ...frameOffset(x, y),
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
  });
}

async function drag(from: Element, to: Element, fraction: number, shiftX = 0) {
  const start = from.getBoundingClientRect();
  const end = to.getBoundingClientRect();
  const startX = start.left + 16;
  const startY = start.top + start.height / 2;
  const endX = startX + shiftX;
  const endY = end.top + end.height * fraction;

  await mouse('mousePressed', startX, startY);
  for (let step = 1; step <= 8; step++)
    await mouse('mouseMoved', startX + (shiftX * step) / 8, startY + ((endY - startY) * step) / 8);
  await new Promise(requestAnimationFrame);
  await mouse('mouseReleased', endX, endY);
}

test('dragging a row drops it before, after or inside the row under the pointer', async (context) => {
  skipWithoutCdp(context);
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(ui(<Docs onItemsChange={onItemsChange} />));
  const row = (name: string) => screen.getByRole('link', { name }).element();

  await drag(row('셔틀'), row('로드맵'), 0.1);
  await expect.poll(rowOrder).toEqual(['셔틀', '로드맵', 'IDS', '회의록', '토큰']);
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'shuttle', to: [null, 0] });
  expect(location.hash).not.toBe('#roadmap');

  await drag(row('로드맵'), screen.getByRole('button', { name: 'IDS' }).element(), 0.5);
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'roadmap', to: ['ids', 0] });

  await drag(row('셔틀'), row('셔틀'), 0.5);
  expect(onItemsChange).toHaveBeenCalledTimes(2);
});

test('a row that canMove keeps closed splits into before and after', async (context) => {
  skipWithoutCdp(context);
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(
    ui(<Docs onItemsChange={onItemsChange} canMove={({ to }) => to.parent?.id !== 'roadmap'} />),
  );
  const row = (name: string) => screen.getByRole('link', { name }).element();

  await drag(row('셔틀'), row('로드맵'), 0.6);
  await expect.poll(rowOrder).toEqual(['로드맵', '셔틀', 'IDS', '회의록', '토큰']);
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'shuttle', to: [null, 1] });
});

test('a row canMove keeps out of drops at the nearest place it allows', async (context) => {
  skipWithoutCdp(context);
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(
    ui(<Docs onItemsChange={onItemsChange} canMove={({ to }) => to.parent === null} />),
  );
  const row = (name: string) => screen.getByRole('link', { name }).element();

  await screen.getByRole('button', { name: 'IDS' }).click();
  await expect.element(screen.getByRole('link', { name: '회의록' })).toBeVisible();

  await drag(row('셔틀'), row('회의록'), 0.5);
  await expect.poll(rowOrder).toEqual(['로드맵', '셔틀', 'IDS', '회의록', '토큰']);
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'shuttle', to: [null, 1] });
});

test('the line after an open row sits below its children', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(
    ui(<Docs onItemsChange={onItemsChange} canMove={({ to }) => to.parent === null} />),
  );

  screen.getByRole('link', { name: '셔틀' }).element().focus();
  await userEvent.keyboard(' ');
  await userEvent.keyboard('{ArrowUp}');
  await userEvent.keyboard('{Enter}');
  await screen.getByRole('button', { name: 'IDS' }).click();
  await expect.element(screen.getByRole('link', { name: '토큰' })).toBeVisible();

  screen.getByRole('link', { name: '로드맵' }).element().focus();
  await userEvent.keyboard(' ');
  await userEvent.keyboard('{ArrowDown}{ArrowDown}');

  const line = document.querySelector('[data-position="after"]')!.getBoundingClientRect();
  const tokens = screen.getByRole('link', { name: '토큰' }).element().getBoundingClientRect();
  const ids = screen.getByRole('button', { name: 'IDS' }).element().getBoundingClientRect();
  expect(line.top).toBeGreaterThan(tokens.top + tokens.height / 2);
  expect(line.left).toBeLessThan(ids.left + 8);

  await userEvent.keyboard('{Enter}');
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'roadmap', to: [null, 2] });
});

test('at the end of an open row the preview’s left edge picks the depth', async (context) => {
  skipWithoutCdp(context);
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(ui(<Docs onItemsChange={onItemsChange} />));
  const row = (name: string) => screen.getByRole('link', { name }).element();

  await screen.getByRole('button', { name: 'IDS' }).click();
  await expect.element(screen.getByRole('link', { name: '토큰' })).toBeVisible();
  const indent =
    row('토큰').getBoundingClientRect().left - row('로드맵').getBoundingClientRect().left;

  await drag(row('로드맵'), row('토큰'), 0.9);
  await expect.poll(rowOrder).toEqual(['IDS', '회의록', '토큰', '로드맵', '셔틀']);
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'roadmap', to: [null, 1] });

  await drag(row('셔틀'), row('토큰'), 0.9, indent);
  await expect.poll(rowOrder).toEqual(['IDS', '회의록', '토큰', '셔틀', '로드맵']);
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'shuttle', to: ['ids', 2] });
});

test('below the last row a drag lands at the nearest place', async (context) => {
  skipWithoutCdp(context);
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onItemsChange = vi.fn();
  const screen = await render(ui(<Docs onItemsChange={onItemsChange} />));
  const row = (name: string) => screen.getByRole('link', { name }).element();
  const shuttle = row('셔틀').getBoundingClientRect();

  await drag(row('로드맵'), row('셔틀'), 1 + 12 / shuttle.height);
  await expect.poll(rowOrder).toEqual(['IDS', '회의록', '토큰', '셔틀', '로드맵']);
  expect(lastMove(onItemsChange)).toMatchObject({ item: 'roadmap', to: [null, 2] });
});

test('one place draws one line, whichever row the pointer is over', async (context) => {
  skipWithoutCdp(context);
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(<Docs onItemsChange={vi.fn()} canMove={({ to }) => to.parent === null} />),
  );
  const rect = (name: string) =>
    screen.getByRole('link', { name }).element().getBoundingClientRect();
  const ids = screen.getByRole('button', { name: 'IDS' }).element().getBoundingClientRect();
  const shuttle = rect('셔틀');
  const x = shuttle.left + 16;
  const line = () => {
    const drawn = document.querySelector('[data-position]');
    return drawn && `${drawn.getAttribute('data-position')} ${drawn.getBoundingClientRect().top}`;
  };

  await mouse('mousePressed', x, shuttle.top + shuttle.height / 2);
  await mouse('mouseMoved', x, shuttle.top);
  await mouse('mouseMoved', x, rect('로드맵').top + rect('로드맵').height * 0.75);
  await expect.poll(line).toMatch(/^before /);
  const belowTheRoadmap = line();
  await mouse('mouseMoved', x, ids.top + ids.height * 0.25);
  await expect.poll(line).toBe(belowTheRoadmap);
  await mouse('mouseReleased', x, ids.top + ids.height * 0.25);
});
