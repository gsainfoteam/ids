import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Table } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');

const PEOPLE = ['Ada', 'Grace', 'Linus', 'Ken'];

function people(props: Table.Props = {}, rowProps: (index: number) => Table.RowProps = () => ({})) {
  return (
    <Table aria-label="People" {...props}>
      <Table.Caption>Staff</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head align="end">Age</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {PEOPLE.map((name, index) => (
          <Table.Row key={name} {...rowProps(index)}>
            <Table.Head>{name}</Table.Head>
            <Table.Cell align="end">{30 + index}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Head>Total</Table.Head>
          <Table.Cell align="end">126</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
}

function colorOf(variable: string) {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${variable})`;
  document.querySelector('[data-color]')!.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

test('SSR: a native table inside a scroll area, with its parts, scopes and alignment', () => {
  const doc = html(people({ className: 'max-h-40', size: 'tiny' }));
  const root = doc.querySelector<HTMLElement>('[data-table]')!;
  const table = root.querySelector('table')!;

  expect(root.hasAttribute('data-scroll-area')).toBe(true);
  expect(root.className).toContain('max-h-40');
  expect(root.dataset.size).toBe('tiny');
  expect(table.getAttribute('aria-label')).toBe('People');
  expect(table.querySelector('caption')!.textContent).toBe('Staff');
  expect([...table.children].map((child) => child.tagName)).toEqual([
    'CAPTION',
    'THEAD',
    'TBODY',
    'TFOOT',
  ]);
  expect(table.querySelector('thead th')!.getAttribute('scope')).toBe('col');
  expect(table.querySelector('tbody th')!.getAttribute('scope')).toBe('row');
  expect(table.querySelector('tfoot th')!.getAttribute('scope')).toBe('row');
  expect(table.querySelector('tbody td')!.getAttribute('data-align')).toBe('end');
  expect(table.querySelector('tbody td')!.className).toContain('text-end');
});

test('rows name themselves by their cells, and a row header is a rowheader', async () => {
  const screen = await render(<IdsProvider>{people()}</IdsProvider>);

  await expect.element(screen.getByRole('table', { name: 'People' })).toBeInTheDocument();
  await expect.element(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
  await expect.element(screen.getByRole('rowheader', { name: 'Grace' })).toBeInTheDocument();
  expect(screen.getByRole('row').elements()).toHaveLength(PEOPLE.length + 2);
});

test('a row with onClick presses anywhere and hovers; selection stays a data attribute', async () => {
  const pressed = vi.fn();
  const screen = await render(
    <IdsProvider>
      {people({}, (index) => ({ onClick: () => pressed(PEOPLE[index]), selected: index === 1 }))}
    </IdsProvider>,
  );

  await userEvent.click(screen.getByRole('cell', { name: '32' }));
  expect(pressed).toHaveBeenLastCalledWith('Linus');

  const grace = screen.getByRole('row', { name: /Grace/ }).element();
  expect(grace.hasAttribute('data-selected')).toBe(true);
  expect(grace.hasAttribute('aria-selected')).toBe(false);
  expect(grace.hasAttribute('role')).toBe(false);
  expect(grace.className).toContain('cursor-pointer');

  const header = screen.getByRole('row', { name: /Name/ }).element();
  expect(header.hasAttribute('data-hoverable')).toBe(false);
});

test('the neutral ladder: stripe muted, hover a step up, selected the press step', async () => {
  const screen = await render(
    <IdsProvider>
      <p>Outside</p>
      {people({ striped: true, highlightOnHover: true }, (index) => ({ selected: index === 2 }))}
    </IdsProvider>,
  );
  await userEvent.hover(screen.getByText('Outside'));
  const row = (name: string) => screen.getByRole('row', { name: new RegExp(name) });
  const background = (name: string) => getComputedStyle(row(name).element()).backgroundColor;

  await expect.element(row('Ada')).toBeInTheDocument();
  expect(background('Ada')).toBe('rgba(0, 0, 0, 0)');
  expect(background('Grace')).toBe(colorOf('--ids-color-muted'));
  expect(background('Linus')).toBe(colorOf('--ids-color-muted-hover'));

  await userEvent.hover(row('Ada'));
  await expect.poll(() => background('Ada')).toBe(colorOf('--ids-color-muted'));
  await userEvent.hover(row('Grace'));
  await expect.poll(() => background('Grace')).toBe(colorOf('--ids-color-muted-hover'));
  await userEvent.hover(row('Linus'));
  await expect.poll(() => background('Linus')).toBe(colorOf('--ids-color-muted-active'));
});

test('stickyHeader keeps the header row in view while the body scrolls', async () => {
  const screen = await render(
    <IdsProvider>
      <Table stickyHeader aria-label="Long" className="max-h-40">
        <Table.Header>
          <Table.Row>
            <Table.Head>Row</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from({ length: 30 }, (_, index) => (
            <Table.Row key={index}>
              <Table.Cell>{index}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </IdsProvider>,
  );
  const header = screen.getByRole('columnheader', { name: 'Row' });
  await expect.element(header).toBeVisible();
  const viewport = screen.container.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
  const top = viewport.getBoundingClientRect().top;

  await userEvent.wheel(screen.getByRole('cell', { name: '3', exact: true }), {
    delta: { y: 300 },
  });

  await expect.poll(() => viewport.scrollTop).toBeGreaterThan(100);
  expect(header.element().getBoundingClientRect().top).toBeCloseTo(top, 0);
});

test('a wide table scrolls sideways and the scroll area takes a Tab stop', async () => {
  const screen = await render(
    <IdsProvider>
      <button type="button">Before</button>
      <Table aria-label="Wide" className="w-60">
        <Table.Body>
          <Table.Row>
            {Array.from({ length: 12 }, (_, index) => (
              <Table.Cell key={index} className="whitespace-nowrap">
                Column number {index}
              </Table.Cell>
            ))}
          </Table.Row>
        </Table.Body>
      </Table>
    </IdsProvider>,
  );
  const root = screen.container.querySelector<HTMLElement>('[data-table]')!;
  const viewport = root.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
  await expect.poll(() => root.hasAttribute('data-overflow-x')).toBe(true);

  await userEvent.click(screen.getByRole('button', { name: 'Before' }));
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(viewport);
  await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
  await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0);
});

test('parts outside a Table throw a pointed error', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderToString(<Table.Row />)).toThrow(
    '`<Table.Row>` must be used inside `<Table>`.',
  );
  vi.restoreAllMocks();
});
