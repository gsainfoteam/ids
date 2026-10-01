import { type ComponentProps } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Breadcrumb, IdsProvider } from '../src';

function RouterLink({
  to,
  onNavigate,
  onClick,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { to: string; onNavigate: (to: string) => void }) {
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
        onNavigate(to);
      }}
    />
  );
}

const crumbs = (labels: string[]) =>
  labels.map((label, index) =>
    index === labels.length - 1 ? (
      <Breadcrumb.Item key={label}>
        <Breadcrumb.Page>{label}</Breadcrumb.Page>
      </Breadcrumb.Item>
    ) : (
      <Breadcrumb.Item key={label}>
        <Breadcrumb.Link href={`#${label}`}>{label}</Breadcrumb.Link>
      </Breadcrumb.Item>
    ),
  );

const visibleTrail = (nav: Element) =>
  [...nav.querySelectorAll('ol > li')].map((item) =>
    item.hasAttribute('data-breadcrumb-separator')
      ? '>'
      : item.hasAttribute('data-breadcrumb-ellipsis')
        ? '...'
        : item.textContent,
  );

test('renders a named nav landmark holding an ordered list with the current page marked', async () => {
  const screen = await render(
    <IdsProvider>
      <Breadcrumb>{crumbs(['Home', 'Products', 'Laptop'])}</Breadcrumb>
    </IdsProvider>,
  );

  const nav = screen.getByRole('navigation', { name: '이동 경로' });
  await expect.element(nav).toBeInTheDocument();
  await expect.element(screen.getByRole('list')).toBeInTheDocument();
  expect(screen.getByRole('listitem').elements()).toHaveLength(3);
  await expect.element(screen.getByText('Laptop')).toHaveAttribute('aria-current', 'page');
  await expect.element(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#Home');
  expect(screen.getByRole('link').elements()).toHaveLength(2);
});

test('an aria-label replaces the default name', async () => {
  const screen = await render(
    <IdsProvider>
      <Breadcrumb aria-label="Docs trail">{crumbs(['Home', 'Docs'])}</Breadcrumb>
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('navigation', { name: 'Docs trail' })).toBeInTheDocument();
});

test('puts a hidden separator between crumbs and none after the last', async () => {
  const screen = await render(
    <IdsProvider>
      <Breadcrumb>
        <>{crumbs(['Home', 'Products'])}</>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Laptop</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb>
    </IdsProvider>,
  );

  const nav = screen.getByRole('navigation').element();
  expect(visibleTrail(nav)).toEqual(['Home', '>', 'Products', '>', 'Laptop']);
  nav
    .querySelectorAll('[data-breadcrumb-separator]')
    .forEach((separator) => expect(separator).toHaveAttribute('aria-hidden', 'true'));
});

test('separator replaces the chevron, and written Separators turn the automatic ones off', async () => {
  const screen = await render(
    <IdsProvider>
      <Breadcrumb separator="/" aria-label="slashes">
        {crumbs(['Home', 'Docs', 'Page'])}
      </Breadcrumb>
      <Breadcrumb aria-label="written">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator>|</Breadcrumb.Separator>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#docs">Docs</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Page</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </IdsProvider>,
  );

  const separatorsOf = (name: string) =>
    [
      ...screen
        .getByRole('navigation', { name })
        .element()
        .querySelectorAll('[data-breadcrumb-separator]'),
    ].map((separator) => separator.textContent);

  expect(separatorsOf('slashes')).toEqual(['/', '/']);
  expect(separatorsOf('written')).toEqual(['|']);
});

test('the default chevron mirrors in a right-to-left page', async () => {
  const screen = await render(
    <IdsProvider>
      <div dir="rtl">
        <Breadcrumb aria-label="rtl">{crumbs(['Home', 'Page'])}</Breadcrumb>
      </div>
      <Breadcrumb aria-label="ltr">{crumbs(['Home', 'Page'])}</Breadcrumb>
    </IdsProvider>,
  );

  const chevron = (name: string) =>
    screen.getByRole('navigation', { name }).element().querySelector('svg')!;

  expect(getComputedStyle(chevron('rtl')).scale).toMatch(/^-1\b/);
  expect(getComputedStyle(chevron('ltr')).scale).not.toMatch(/^-1\b/);
});

test('maxItems keeps the first and the last maxItems - 1 crumbs and folds the rest into a menu', async () => {
  const navigate = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Breadcrumb maxItems={3}>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        {['Docs', 'Components'].map((label) => (
          <Breadcrumb.Item key={label}>
            <Breadcrumb.Link asChild>
              <RouterLink to={`/${label.toLowerCase()}`} onNavigate={navigate}>
                {label}
              </RouterLink>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
        ))}
        {crumbs(['Navigation', 'Breadcrumb'])}
      </Breadcrumb>
      <button type="button">After</button>
    </IdsProvider>,
  );

  const nav = screen.getByRole('navigation').element();
  expect(visibleTrail(nav)).toEqual(['Home', '>', '...', '>', 'Navigation', '>', 'Breadcrumb']);

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  const more = screen.getByRole('button', { name: '숨은 경로 보기' });
  await expect.element(more).toHaveFocus();
  await expect.element(more).toHaveAttribute('aria-haspopup', 'menu');

  await userEvent.keyboard('{Enter}');
  const menu = screen.getByRole('menu', { name: '숨은 경로 보기' });
  await expect.element(menu).toBeVisible();
  await expect.element(screen.getByRole('menuitem', { name: 'Docs' })).toHaveFocus();
  await expect
    .element(screen.getByRole('menuitem', { name: 'Docs' }))
    .toHaveAttribute('href', '/docs');
  expect(menu.element().querySelector('[data-breadcrumb-separator]')).toBeNull();

  await userEvent.keyboard('{ArrowDown}');
  await expect.element(screen.getByRole('menuitem', { name: 'Components' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');

  expect(navigate).toHaveBeenCalledExactlyOnceWith('/components');
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
  await expect.element(more).toHaveFocus();
});

test('maxItems leaves a trail that already fits, and an Ellipsis written by hand', async () => {
  const screen = await render(
    <IdsProvider>
      <Breadcrumb maxItems={3} aria-label="fits">
        {crumbs(['Home', 'Docs', 'Page'])}
      </Breadcrumb>
      <Breadcrumb maxItems={2} aria-label="written">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Ellipsis>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#a">A</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb.Ellipsis>
        {crumbs(['B', 'C'])}
      </Breadcrumb>
    </IdsProvider>,
  );

  const trail = (name: string) => visibleTrail(screen.getByRole('navigation', { name }).element());
  expect(trail('fits')).toEqual(['Home', '>', 'Docs', '>', 'Page']);
  expect(trail('written')).toEqual(['Home', '>', '...', '>', 'B', '>', 'C']);
});

test('a router link placed through asChild keeps its own element and takes the link styles', async () => {
  const navigate = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild className="custom">
            <RouterLink to="/products" onNavigate={navigate}>
              Products
            </RouterLink>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Laptop</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb>
    </IdsProvider>,
  );

  const link = screen.getByRole('link', { name: 'Products' });
  await expect.element(link).toHaveAttribute('href', '/products');
  await expect.element(link).toHaveAttribute('data-breadcrumb-link');
  await expect.element(link).toHaveClass('custom', 'focus-ring');

  await userEvent.click(link);
  expect(navigate).toHaveBeenCalledExactlyOnceWith('/products');
});

test('size sets the text scale of the trail', async () => {
  const screen = await render(
    <IdsProvider>
      <Breadcrumb aria-label="standard">{crumbs(['Home', 'Page'])}</Breadcrumb>
      <Breadcrumb size="tiny" aria-label="tiny">
        {crumbs(['Home', 'Page'])}
      </Breadcrumb>
    </IdsProvider>,
  );

  const fontSize = (name: string) =>
    parseFloat(
      getComputedStyle(screen.getByRole('navigation', { name }).element().querySelector('ol')!)
        .fontSize,
    );

  await expect
    .element(screen.getByRole('navigation', { name: 'tiny' }))
    .toHaveAttribute('data-size', 'tiny');
  expect(fontSize('tiny')).toBeLessThan(fontSize('standard'));
});

test('the English catalog names the landmark and the menu button', async () => {
  const english = { 'breadcrumb.label': 'Breadcrumb', 'breadcrumb.more': 'Show hidden path' };
  const screen = await render(
    <IdsProvider translate={(key) => english[key as keyof typeof english] ?? key}>
      <Breadcrumb maxItems={2}>{crumbs(['Home', 'Docs', 'Page'])}</Breadcrumb>
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  await expect
    .element(screen.getByRole('button', { name: 'Show hidden path' }))
    .toBeInTheDocument();
});

test('server HTML already holds the landmark, the list and the current page', () => {
  const html = renderToString(
    <IdsProvider>
      <Breadcrumb maxItems={2}>{crumbs(['Home', 'Docs', 'Page'])}</Breadcrumb>
    </IdsProvider>,
  );
  const doc = new DOMParser().parseFromString(html, 'text/html');

  expect(doc.querySelector('nav')).toHaveAttribute('aria-label', '이동 경로');
  expect(doc.querySelectorAll('nav > ol > li')).toHaveLength(5);
  expect(doc.querySelector('[aria-current="page"]')).toHaveTextContent('Page');
  expect(doc.querySelector('[aria-haspopup="menu"]')).not.toBeNull();
  expect(doc.querySelector('[role="menu"]')).toBeNull();
});

test('warns in development when the trail is empty', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(
    <IdsProvider>
      <Breadcrumb />
    </IdsProvider>,
  );

  expect(warn).toHaveBeenCalledWith(expect.stringContaining('[IDS] Breadcrumb'));
  await expect.element(page.getByRole('navigation')).toBeInTheDocument();
});
