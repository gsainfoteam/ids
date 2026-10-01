import { useState, type ComponentProps, type MouseEvent } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Pagination } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const nav = () => page.getByRole('navigation', { name: '페이지 탐색' });
const pageButton = (n: number) => page.getByRole('button', { name: `${n}페이지`, exact: true });
const previous = () => page.getByRole('button', { name: '이전 페이지' });
const next = () => page.getByRole('button', { name: '다음 페이지' });
const labels = () =>
  [...document.querySelectorAll('[data-pagination-item]')].map((item) =>
    item.querySelector('[data-pagination-ellipsis]')
      ? '…'
      : (item.querySelector('[data-pagination-page]')?.textContent ?? item.textContent ?? ''),
  );

function RouterLink({
  to,
  navigate,
  ...props
}: ComponentProps<'a'> & { to: string; navigate: (to: string) => void }) {
  return (
    <a
      {...props}
      href={to}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigate(to);
      }}
    />
  );
}

test('SSR: a named nav landmark holding a list, the current page and disabled ends', () => {
  const doc = parse(renderToString(<Pagination defaultPage={1} pageCount={20} />));
  const landmark = doc.querySelector('nav')!;
  expect(landmark.getAttribute('aria-label')).toBe('페이지 탐색');
  expect(landmark.querySelector(':scope > ul')).not.toBeNull();
  const items = [...doc.querySelectorAll('ul > li')];
  expect(items).toHaveLength(9);
  const currentPage = doc.querySelector('[aria-current="page"]')!;
  expect(currentPage.textContent).toBe('1');
  expect(currentPage.getAttribute('aria-label')).toBe('1페이지');
  expect(doc.querySelector('[data-pagination-previous]')!.hasAttribute('disabled')).toBe(true);
  expect(doc.querySelector('[data-pagination-next]')!.hasAttribute('disabled')).toBe(false);
  expect(doc.querySelector('[data-pagination-ellipsis]')!.getAttribute('aria-hidden')).toBe('true');
});

test('button mode: pages, previous and next move the page and report it', async () => {
  const onPageChange = vi.fn();
  await render(<Pagination pageCount={20} onPageChange={onPageChange} />);

  await expect.element(nav()).toBeInTheDocument();
  await expect.element(previous()).toBeDisabled();
  expect(labels()).toEqual(['', '1', '2', '3', '4', '5', '…', '20', '']);

  await userEvent.click(next());
  expect(onPageChange).toHaveBeenLastCalledWith(2);
  await expect.element(pageButton(2)).toHaveAttribute('aria-current', 'page');
  await expect.element(previous()).toBeEnabled();

  await userEvent.click(pageButton(5));
  expect(onPageChange).toHaveBeenLastCalledWith(5);
  expect(labels()).toEqual(['', '1', '…', '4', '5', '6', '…', '20', '']);

  await userEvent.click(pageButton(20));
  await expect.element(next()).toBeDisabled();
  expect(labels()).toEqual(['', '1', '…', '16', '17', '18', '19', '20', '']);

  await userEvent.click(previous());
  expect(onPageChange).toHaveBeenLastCalledWith(19);
  onPageChange.mockClear();
  await userEvent.click(pageButton(19));
  expect(onPageChange).not.toHaveBeenCalled();
});

test('controlled: the page stays until the owner changes it', async () => {
  const onPageChange = vi.fn();
  const screen = await render(<Pagination page={3} pageCount={5} onPageChange={onPageChange} />);

  await userEvent.click(next());
  expect(onPageChange).toHaveBeenCalledWith(4);
  await expect.element(pageButton(3)).toHaveAttribute('aria-current', 'page');

  await screen.rerender(<Pagination page={4} pageCount={5} onPageChange={onPageChange} />);
  await expect.element(pageButton(4)).toHaveAttribute('aria-current', 'page');
});

test('keyboard: arrows step, Home and End jump, and focus follows the current page', async () => {
  const onPageChange = vi.fn();
  await render(<Pagination defaultPage={3} pageCount={10} onPageChange={onPageChange} />);

  await userEvent.click(pageButton(3));
  await expect.element(pageButton(3)).toHaveFocus();

  await userEvent.keyboard('{ArrowRight}');
  expect(onPageChange).toHaveBeenLastCalledWith(4);
  await expect.element(pageButton(4)).toHaveFocus();
  await expect.element(pageButton(4)).toHaveAttribute('aria-current', 'page');

  await userEvent.keyboard('{End}');
  await expect.element(pageButton(10)).toHaveFocus();
  await expect.element(next()).toBeDisabled();

  onPageChange.mockClear();
  await userEvent.keyboard('{ArrowRight}');
  expect(onPageChange).not.toHaveBeenCalled();

  await userEvent.keyboard('{Home}');
  await expect.element(pageButton(1)).toHaveFocus();
  expect(onPageChange).toHaveBeenLastCalledWith(1);

  await userEvent.keyboard('{Tab}');
  await expect.element(pageButton(2)).toHaveFocus();
});

test('keyboard: on previous or next, the arrows keep focus on that button', async () => {
  await render(<Pagination defaultPage={5} pageCount={10} />);

  await userEvent.click(next());
  await expect.element(pageButton(6)).toHaveAttribute('aria-current', 'page');
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(pageButton(7)).toHaveAttribute('aria-current', 'page');
  await expect.element(next()).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(pageButton(6)).toHaveAttribute('aria-current', 'page');
  await expect.element(next()).toHaveFocus();
});

test('keyboard: modified arrows and IME are left alone', async () => {
  const onPageChange = vi.fn();
  await render(<Pagination defaultPage={5} pageCount={10} onPageChange={onPageChange} />);

  await userEvent.click(pageButton(5));
  await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
  expect(onPageChange).not.toHaveBeenCalled();
});

test('keyboard: right-to-left swaps the arrows and flips the chevrons', async () => {
  await render(
    <div dir="rtl">
      <Pagination defaultPage={5} pageCount={10} />
    </div>,
  );

  await userEvent.click(pageButton(5));
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(pageButton(6)).toHaveAttribute('aria-current', 'page');
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(pageButton(5)).toHaveAttribute('aria-current', 'page');

  const chevron = document.querySelector('[data-pagination-previous] svg')!;
  expect(getComputedStyle(chevron).scale).toMatch(/^-1/);
});

test('link mode: getHref renders anchors and the disabled end has no href', async () => {
  const onPageChange = vi.fn();
  await render(
    <Pagination
      defaultPage={1}
      pageCount={5}
      getHref={(n) => `#page-${n}`}
      onPageChange={onPageChange}
    />,
  );

  const link = (n: number) => page.getByRole('link', { name: `${n}페이지`, exact: true });
  await expect.element(link(1)).toHaveAttribute('href', '#page-1');
  await expect.element(link(1)).toHaveAttribute('aria-current', 'page');
  await expect.element(link(3)).toHaveAttribute('href', '#page-3');

  const disabledPrevious = page.getByRole('link', { name: '이전 페이지' });
  await expect.element(disabledPrevious).toHaveAttribute('aria-disabled', 'true');
  await expect.element(disabledPrevious).not.toHaveAttribute('href');
  await expect
    .element(page.getByRole('link', { name: '다음 페이지' }))
    .toHaveAttribute('href', '#page-2');

  await userEvent.click(link(3));
  expect(onPageChange).toHaveBeenLastCalledWith(3);
  await expect.element(link(3)).toHaveAttribute('aria-current', 'page');
  expect(location.hash).toBe('#page-3');
  history.replaceState(null, '', location.pathname + location.search);
});

test('link mode: asChild wraps a router link and fills in the page number and chevrons', async () => {
  const navigate = vi.fn();

  function Routed() {
    const [current, setCurrent] = useState(4);
    return (
      <Pagination page={current} pageCount={10}>
        <Pagination.List>
          {(entry) => {
            if (entry.type === 'ellipsis') return <Pagination.Ellipsis />;
            const to = `/posts?page=${entry.page}`;
            const go = (target: string) => {
              navigate(target);
              setCurrent(entry.page);
            };
            const routerLink = <RouterLink to={to} navigate={go} />;
            if (entry.type === 'previous')
              return <Pagination.Previous asChild>{routerLink}</Pagination.Previous>;
            if (entry.type === 'next')
              return <Pagination.Next asChild>{routerLink}</Pagination.Next>;
            return (
              <Pagination.Link page={entry.page} asChild>
                {routerLink}
              </Pagination.Link>
            );
          }}
        </Pagination.List>
      </Pagination>
    );
  }

  await render(<Routed />);

  const link = (n: number) => page.getByRole('link', { name: `${n}페이지`, exact: true });
  await expect.element(link(4)).toHaveTextContent('4');
  await expect.element(link(4)).toHaveAttribute('aria-current', 'page');
  await expect.element(link(4)).toHaveAttribute('href', '/posts?page=4');
  expect(document.querySelector('[data-pagination-previous] svg')).not.toBeNull();

  await userEvent.click(page.getByRole('link', { name: '다음 페이지' }));
  expect(navigate).toHaveBeenLastCalledWith('/posts?page=5');
  await expect.element(link(5)).toHaveAttribute('aria-current', 'page');

  await userEvent.click(link(5));
  await userEvent.keyboard('{ArrowRight}');
  expect(navigate).toHaveBeenLastCalledWith('/posts?page=6');
  await expect.element(link(6)).toHaveFocus();
});

test('composition: static parts and a render function may return their own Item', async () => {
  await render(
    <Pagination defaultPage={2} pageCount={3}>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={2}>둘</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Ellipsis>···</Pagination.Ellipsis>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next />
        </Pagination.Item>
      </Pagination.List>
    </Pagination>,
  );

  await expect.element(pageButton(2)).toHaveTextContent('둘');
  await expect.element(pageButton(2)).toHaveAttribute('aria-current', 'page');
  await userEvent.click(next());
  await expect.element(pageButton(2)).not.toHaveAttribute('aria-current');
  await expect.element(next()).toBeDisabled();

  const screen = await render(
    <Pagination defaultPage={1} pageCount={2}>
      <Pagination.List>
        {(entry) => (
          <Pagination.Item className="custom-item">
            {entry.type === 'page' ? <Pagination.Link page={entry.page} /> : null}
          </Pagination.Item>
        )}
      </Pagination.List>
    </Pagination>,
  );
  expect(screen.container.querySelectorAll('li.custom-item')).toHaveLength(4);
  expect(screen.container.querySelectorAll('li li')).toHaveLength(0);
});

test('variant styles the current page, size reaches every control, disabled stops them all', async () => {
  await render(<Pagination defaultPage={2} pageCount={3} variant="outline" size="tiny" />);

  await expect.element(pageButton(2)).toHaveAttribute('data-variant', 'outline');
  await expect.element(pageButton(1)).toHaveAttribute('data-variant', 'ghost');
  for (const control of document.querySelectorAll('[data-pagination-control]'))
    expect(control.getAttribute('data-size')).toBe('tiny');

  await render(<Pagination defaultPage={2} pageCount={3} disabled />);
  const controls = [...document.querySelectorAll<HTMLButtonElement>('nav[data-disabled] button')];
  expect(controls).toHaveLength(5);
  expect(controls.every((control) => control.disabled)).toBe(true);
});

test('out-of-range pages clamp and warn in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(<Pagination page={9} pageCount={5} />);

  await expect.element(pageButton(5)).toHaveAttribute('aria-current', 'page');
  expect(warn).toHaveBeenCalledWith('[IDS] Pagination: page (9) is greater than pageCount (5).');

  warn.mockClear();
  await render(<Pagination page={0} pageCount={5} />);
  expect(warn).toHaveBeenCalledWith('[IDS] Pagination: page (0) must be 1 or greater.');

  warn.mockClear();
  await render(<Pagination page={1} pageCount={0} />);
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test('labels follow the provider translation', async () => {
  const english: Record<string, string> = {
    'pagination.label': 'Pagination',
    'pagination.previous': 'Previous page',
    'pagination.next': 'Next page',
  };
  await render(
    <IdsProvider
      translate={(key, values) =>
        key === 'pagination.page' ? `Page ${values?.page}` : english[key]
      }
    >
      <Pagination defaultPage={1} pageCount={3} />
    </IdsProvider>,
  );

  await expect.element(page.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  await expect.element(page.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
  await expect.element(page.getByRole('button', { name: 'Next page' })).toBeEnabled();
});
