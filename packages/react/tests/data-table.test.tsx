import { useState } from 'react';

import { IntlMessageFormat } from 'intl-messageformat';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import englishCatalog from '../messages/en.json';
import { DataTable, IdsProvider, type IdsTranslate } from '../src';

type Person = { id: string; name: string; age: number };

const PEOPLE: Person[] = [
  { id: 'ada', name: 'Ada', age: 36 },
  { id: 'grace', name: 'Grace', age: 85 },
  { id: 'linus', name: 'Linus', age: 54 },
  { id: 'ken', name: 'Ken', age: 81 },
  { id: 'barbara', name: 'Barbara', age: 42 },
];

const person = DataTable.createColumnHelper<Person>();
const columns = person.columns([
  person.accessor('name', { header: 'Name' }),
  person.accessor('age', { header: 'Age', meta: { align: 'end' } }),
]);

const manyPeople = (count: number): Person[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    name: `Person ${index + 1}`,
    age: 20 + index,
  }));

const idOf = (row: Person) => row.id;
const nameOf = (row: Person) => row.name;

function table(props: Partial<DataTable.Props<Person>> = {}) {
  return (
    <IdsProvider>
      <DataTable
        columns={columns}
        data={PEOPLE}
        getRowId={idOf}
        getRowLabel={nameOf}
        aria-label="People"
        {...props}
      />
    </IdsProvider>
  );
}

const namesInOrder = (container: HTMLElement) =>
  [...container.querySelectorAll('tbody tr')].map((row) =>
    [...row.querySelectorAll('td')]
      .map((cell) => cell.textContent)
      .find((text) => /\D/.test(text!)),
  );

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', x: number, y: number) {
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

test('SSR: header, rows and the Korean empty text render on the server', () => {
  const doc = new DOMParser().parseFromString(renderToString(table({ data: [] })), 'text/html');
  expect(doc.querySelector('table')!.getAttribute('aria-label')).toBe('People');
  expect([...doc.querySelectorAll('thead th')].map((th) => th.textContent)).toEqual([
    'Name',
    'Age',
  ]);
  const message = doc.querySelector<HTMLElement>('[data-data-table-message]')!;
  expect(message.textContent).toBe('데이터가 없습니다.');
  expect(message.getAttribute('colspan')).toBe('2');
});

test('a sortable header is a button; clicking cycles aria-sort and the row order', async () => {
  const onSortingChange = vi.fn();
  const screen = await render(table({ onSortingChange }));
  const name = () => screen.getByRole('columnheader', { name: 'Name' });

  await expect.element(name()).not.toHaveAttribute('aria-sort');
  await userEvent.click(screen.getByRole('button', { name: 'Name' }));
  await expect.element(name()).toHaveAttribute('aria-sort', 'ascending');
  expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'name', desc: false }]);
  expect(namesInOrder(screen.container)).toEqual(['Ada', 'Barbara', 'Grace', 'Ken', 'Linus']);

  await userEvent.click(screen.getByRole('button', { name: 'Name' }));
  await expect.element(name()).toHaveAttribute('aria-sort', 'descending');
  expect(namesInOrder(screen.container)).toEqual(['Linus', 'Ken', 'Grace', 'Barbara', 'Ada']);

  await userEvent.click(screen.getByRole('button', { name: 'Name' }));
  await expect.element(name()).not.toHaveAttribute('aria-sort');
  expect(namesInOrder(screen.container)).toEqual(PEOPLE.map((row) => row.name));
});

test('the sort button works from the keyboard and Shift adds a second sort', async () => {
  const onSortingChange = vi.fn();
  const screen = await render(table({ onSortingChange }));

  screen.getByRole('button', { name: 'Age' }).element().focus();
  await userEvent.keyboard('{Enter}');
  await expect
    .element(screen.getByRole('columnheader', { name: 'Age' }))
    .toHaveAttribute('aria-sort', 'descending');

  await userEvent.click(screen.getByRole('button', { name: 'Name' }), { modifiers: ['Shift'] });
  expect(onSortingChange).toHaveBeenLastCalledWith([
    { id: 'age', desc: true },
    { id: 'name', desc: false },
  ]);
});

test('controlled sorting only moves when the app writes it back', async () => {
  const onSortingChange = vi.fn();
  const screen = await render(table({ sorting: [], onSortingChange }));

  await userEvent.click(screen.getByRole('button', { name: 'Name' }));
  expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }]);
  await expect
    .element(screen.getByRole('columnheader', { name: 'Name' }))
    .not.toHaveAttribute('aria-sort');
});

test('enableSorting={false} and a column without sorting render plain headers', async () => {
  const screen = await render(table({ enableSorting: false }));
  await expect.element(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  expect(screen.getByRole('button').elements()).toHaveLength(0);
});

test('row selection: named checkboxes, a mixed select-all, Shift ranges and the count', async () => {
  const onRowSelectionChange = vi.fn();
  const screen = await render(table({ enableRowSelection: true, onRowSelectionChange }));
  const all = screen.getByRole('checkbox', { name: '모든 행 선택' });

  await userEvent.click(screen.getByRole('checkbox', { name: 'Grace 선택' }));
  expect(onRowSelectionChange).toHaveBeenLastCalledWith({ grace: true });
  await expect.element(all).toHaveProperty('indeterminate', true);
  await expect.element(screen.getByRole('row', { name: /Grace/ })).toHaveAttribute('data-selected');
  await expect.element(screen.getByText('1개 선택됨')).toBeVisible();

  await userEvent.click(screen.getByRole('checkbox', { name: 'Ken 선택' }), {
    modifiers: ['Shift'],
  });
  expect(onRowSelectionChange).toHaveBeenLastCalledWith({ grace: true, linus: true, ken: true });

  await userEvent.click(all);
  await expect.element(all).toBeChecked();
  await expect.element(screen.getByText('5개 선택됨')).toBeVisible();

  await userEvent.click(all);
  await expect.element(all).not.toBeChecked();
  expect(onRowSelectionChange).toHaveBeenLastCalledWith({});
});

test('a row that cannot be selected keeps a disabled checkbox; without a label rows are numbered', async () => {
  const screen = await render(
    table({ getRowLabel: undefined, enableRowSelection: (row) => row.original.age < 80 }),
  );

  await expect.element(screen.getByRole('checkbox', { name: '2번째 행 선택' })).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox', { name: '모든 행 선택' }));
  await expect.element(screen.getByRole('checkbox', { name: '1번째 행 선택' })).toBeChecked();
  await expect.element(screen.getByRole('checkbox', { name: '2번째 행 선택' })).not.toBeChecked();
});

test('pagination: ten rows a page, the buttons move and keep focus at the ends', async () => {
  const onPaginationChange = vi.fn();
  const screen = await render(
    table({ data: manyPeople(23), enablePagination: true, onPaginationChange }),
  );
  const status = screen.getByText(/\/ 3 페이지$/);

  await expect.element(status).toHaveTextContent('1 / 3 페이지');
  expect(screen.container.querySelectorAll('tbody tr')).toHaveLength(10);
  await expect
    .element(screen.getByRole('button', { name: '이전 페이지' }))
    .toHaveAttribute('aria-disabled', 'true');

  await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
  expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 10 });
  await expect.element(status).toHaveTextContent('2 / 3 페이지');

  await userEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
  await expect.element(status).toHaveTextContent('3 / 3 페이지');
  expect(screen.container.querySelectorAll('tbody tr')).toHaveLength(3);
  await expect.element(screen.getByRole('button', { name: '마지막 페이지' })).toHaveFocus();

  await userEvent.click(screen.getByRole('button', { name: '첫 페이지' }));
  await expect.element(status).toHaveTextContent('1 / 3 페이지');
});

test('server pagination draws the rows it is given and counts pages from rowCount', async () => {
  function Server() {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 2 });
    const start = pagination.pageIndex * pagination.pageSize;
    return (
      <IdsProvider>
        <DataTable
          columns={columns}
          data={PEOPLE.slice(start, start + pagination.pageSize)}
          getRowId={idOf}
          enablePagination
          manualPagination
          rowCount={PEOPLE.length}
          pagination={pagination}
          onPaginationChange={setPagination}
          aria-label="People"
        />
      </IdsProvider>
    );
  }
  const screen = await render(<Server />);

  await expect.element(screen.getByText('1 / 3 페이지')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
  await expect.element(screen.getByText('2 / 3 페이지')).toBeVisible();
  expect(namesInOrder(screen.container)).toEqual(['Linus', 'Ken']);
});

test('column resizing: a focusable separator per column, sized by keys and by dragging', async () => {
  const screen = await render(table({ enableColumnResizing: true }));
  const handle = () => screen.getByRole('separator', { name: 'Name 열 너비' });
  const width = () => Number(handle().element().getAttribute('aria-valuenow'));
  const col = () => screen.container.querySelector<HTMLElement>('col')!;

  await expect.element(handle()).toHaveAttribute('aria-valuenow', '150');
  await expect.element(handle()).toHaveAttribute('aria-valuemin', '48');
  await expect.element(handle()).toHaveAttribute('aria-valuemax', '960');
  expect(screen.container.querySelector('table')!.className).toContain('table-fixed');

  handle().element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(width).toBe(166);
  await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
  await expect.poll(width).toBe(102);
  await userEvent.keyboard('{Home}');
  await expect.poll(width).toBe(48);
  await userEvent.keyboard('{Enter}');
  await expect.poll(width).toBe(150);
  expect(col().style.width).toBe('150px');

  const box = handle().element().getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  await mouse('mousePressed', x, y);
  await mouse('mouseMoved', x + 20, y);
  await mouse('mouseMoved', x + 40, y);
  await expect.element(handle()).toHaveAttribute('data-resizing');
  await mouse('mouseReleased', x + 40, y);

  await expect.poll(width).toBe(190);
  expect(col().style.width).toBe('190px');
  await expect.element(handle()).not.toHaveAttribute('data-resizing');
});

test('right to left: the arrow that points away from the column widens it', async () => {
  const screen = await render(<div dir="rtl">{table({ enableColumnResizing: true })}</div>);
  const handle = screen.getByRole('separator', { name: 'Name 열 너비' });

  await expect.element(handle).toBeInTheDocument();
  handle.element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '166');
});

test('empty and loading states', async () => {
  const screen = await render(table({ data: [], empty: 'Nobody yet' }));
  await expect.element(screen.getByText('Nobody yet')).toBeVisible();

  await screen.rerender(table({ data: [], loading: true }));
  await expect
    .element(screen.getByRole('table', { name: 'People' }))
    .toHaveAttribute('aria-busy', 'true');
  expect(screen.container.querySelector('[data-data-table-message] [data-spinner]')).not.toBeNull();

  await screen.rerender(table({ loading: true }));
  expect(screen.container.querySelector('[data-data-table-loading] [data-spinner]')).not.toBeNull();
  expect(screen.container.querySelectorAll('tbody tr')).toHaveLength(PEOPLE.length);

  await screen.rerender(table());
  await expect
    .element(screen.getByRole('table', { name: 'People' }))
    .not.toHaveAttribute('aria-busy');
  expect(screen.container.querySelector('[data-data-table-loading]')).toBeNull();
});

test('every string speaks the translation', async () => {
  const english: IdsTranslate = (key, values) => {
    const pattern = key
      .split('.')
      .reduce<unknown>((node, name) => (node as Record<string, unknown>)[name], englishCatalog);
    return new IntlMessageFormat(pattern as string, 'en-US').format(values) as string;
  };
  const screen = await render(
    <IdsProvider translate={english} locale="en-US">
      <DataTable
        columns={columns}
        data={manyPeople(12)}
        getRowId={idOf}
        enableRowSelection
        enablePagination
        enableColumnResizing
        aria-label="People"
      />
      <DataTable columns={columns} data={[]} aria-label="Nobody" />
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeVisible();
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  await expect.element(screen.getByText('12 rows selected')).toBeVisible();
  await expect.element(screen.getByText('Page 1 of 2')).toBeVisible();
  await expect.element(screen.getByRole('button', { name: 'Next page' })).toBeVisible();
  await expect
    .element(screen.getByRole('separator', { name: 'Name column width' }))
    .toBeInTheDocument();
  await expect.element(screen.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
  await expect.element(screen.getByText('No data.')).toBeVisible();
});
