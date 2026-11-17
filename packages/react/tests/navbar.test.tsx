import { type ReactNode } from 'react';

import { afterEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, IdsProvider, Navbar } from '../src';
import { testTheme } from './theme';

const DESKTOP = { width: 1024, height: 768 };
const PHONE = { width: 414, height: 896 };

afterEach(async () => {
  await page.viewport(PHONE.width, PHONE.height);
});

const ui = (children: ReactNode) => <IdsProvider theme={testTheme}>{children}</IdsProvider>;

function Bar({ value, trigger }: { value?: string; trigger?: ReactNode }) {
  return (
    <Navbar value={value}>
      <a href="#home">GIST 인포팀</a>
      <Navbar.Nav>
        <Navbar.Item value="/notices" href="#notices">
          공지
        </Navbar.Item>
        <Navbar.Item value="/groups" asChild>
          <a href="#groups">그룹</a>
        </Navbar.Item>
        <Navbar.Item value="/shuttle" href="#shuttle">
          셔틀
        </Navbar.Item>
      </Navbar.Nav>
      <Button size="tiny">로그인</Button>
      {trigger}
    </Navbar>
  );
}

test('a banner holds a labelled nav with a list of links, and marks the current page', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(ui(<Bar value="/groups" />));

  await expect.element(screen.getByRole('banner')).toBeVisible();
  const nav = screen.getByRole('navigation', { name: '주 메뉴' });
  await expect.element(nav).toBeVisible();
  expect(nav.getByRole('listitem').elements()).toHaveLength(3);

  const groups = nav.getByRole('link', { name: '그룹' });
  await expect.element(groups).toHaveAttribute('aria-current', 'page');
  await expect.element(groups).toHaveAttribute('href', '#groups');
  await expect.element(nav.getByRole('link', { name: '공지' })).not.toHaveAttribute('aria-current');
  expect(getComputedStyle(groups.element()).textDecorationLine).toBe('none');
  await expect.element(screen.getByRole('button', { name: '메뉴 열기' })).not.toBeInTheDocument();
});

test('children before Nav sit at the start and children after it at the end', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(ui(<Bar value="/notices" />));

  const home = screen.getByRole('link', { name: 'GIST 인포팀' }).element().getBoundingClientRect();
  const nav = screen.getByRole('navigation').element().getBoundingClientRect();
  const login = screen.getByRole('button', { name: '로그인' }).element().getBoundingClientRect();

  expect(home.right).toBeLessThanOrEqual(nav.left);
  expect(nav.right).toBeLessThan(login.left);
  expect(window.innerWidth - login.right).toBeLessThan(32);
});

test('Tab walks the start, the links and the end in order', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    ui(
      <>
        <button type="button">앞</button>
        <Bar value="/notices" />
      </>,
    ),
  );

  screen.getByRole('button', { name: '앞' }).element().focus();
  const order = ['GIST 인포팀', '공지', '그룹', '셔틀'];
  for (const name of order) {
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('link', { name })).toHaveFocus();
  }
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '로그인' })).toHaveFocus();
});

test('Item passes its props and onClick to the link', async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
  const screen = await render(
    ui(
      <Navbar>
        <Navbar.Nav aria-label="학교">
          <Navbar.Item href="#notices" onClick={onClick} data-testid="notices">
            공지
          </Navbar.Item>
        </Navbar.Nav>
      </Navbar>,
    ),
  );

  const link = screen.getByRole('navigation', { name: '학교' }).getByRole('link', { name: '공지' });
  await expect.element(link).toHaveAttribute('data-testid', 'notices');
  await userEvent.click(link);
  expect(onClick).toHaveBeenCalledOnce();
});

test('below 640px the nav hides and the menu button opens it in a drawer that a press on an item closes', async () => {
  const onClick = vi.fn();
  const screen = await render(
    ui(
      <Navbar value="/shuttle">
        <a href="#home">GIST 인포팀</a>
        <Navbar.Nav>
          <Navbar.Item value="/notices" href="#notices" onClick={onClick}>
            공지
          </Navbar.Item>
          <Navbar.Item value="/shuttle" href="#shuttle">
            셔틀
          </Navbar.Item>
        </Navbar.Nav>
      </Navbar>,
    ),
  );

  await expect.element(screen.getByRole('navigation')).not.toBeInTheDocument();
  const trigger = screen.getByRole('button', { name: '메뉴 열기' });
  await expect.element(trigger).toBeVisible();
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

  await userEvent.click(trigger);
  const drawer = screen.getByRole('dialog', { name: '주 메뉴' });
  await expect.element(drawer).toBeVisible();
  await expect.element(drawer.getByRole('navigation', { name: '주 메뉴' })).toBeVisible();
  await expect
    .element(drawer.getByRole('link', { name: '셔틀' }))
    .toHaveAttribute('aria-current', 'page');

  await userEvent.click(drawer.getByRole('link', { name: '공지' }));
  expect(onClick).toHaveBeenCalledOnce();
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Escape and the close button close the drawer and return focus to the menu button', async () => {
  const screen = await render(ui(<Bar value="/notices" />));
  const trigger = screen.getByRole('button', { name: '메뉴 열기' });

  await userEvent.click(trigger);
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();

  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('dialog').getByRole('button', { name: '닫기' }));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test('the drawer closes when the screen grows past 640px', async () => {
  const screen = await render(ui(<Bar value="/notices" />));

  await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});

test('a MenuTrigger placed by the app replaces the automatic one', async () => {
  const screen = await render(
    ui(<Bar value="/notices" trigger={<Navbar.MenuTrigger aria-label="메뉴" />} />),
  );

  expect(screen.getByRole('button', { name: /메뉴/ }).elements()).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: '메뉴' }));
  await expect.element(screen.getByRole('dialog', { name: '주 메뉴' })).toBeVisible();
});

test('a Navbar without Nav has no menu button and no drawer', async () => {
  const screen = await render(
    ui(
      <Navbar>
        <a href="#home">GIST 인포팀</a>
      </Navbar>,
    ),
  );

  await expect.element(screen.getByRole('link', { name: 'GIST 인포팀' })).toBeVisible();
  expect(screen.getByRole('button').elements()).toHaveLength(0);
});

test('bordered draws a divider under the bar, and sticky pins the header to the top', async () => {
  const screen = await render(
    ui(
      <>
        <Navbar data-testid="plain">
          <span>기본</span>
        </Navbar>
        <Navbar data-testid="bare" bordered={false} sticky>
          <span>선 없음</span>
        </Navbar>
      </>,
    ),
  );

  const plain = screen.getByTestId('plain').element();
  const bare = screen.getByTestId('bare').element();
  expect(plain.querySelector('[data-divider]')).not.toBeNull();
  expect(bare.querySelector('[data-divider]')).toBeNull();
  expect(getComputedStyle(plain).position).toBe('static');
  expect(getComputedStyle(bare).position).toBe('sticky');
  expect(getComputedStyle(bare).top).toBe('0px');
});
