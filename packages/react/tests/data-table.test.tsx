import { useEffect, useState } from 'react';

import { useForm as useTanStackForm } from '@tanstack/react-form';
import { IntlMessageFormat } from 'intl-messageformat';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import englishCatalog from '../messages/en.json';
import { DataTable, IdsProvider, useDataTable, type IdsTranslate } from '../src';
import { skipWithoutCdp } from './engines';
import { testTheme } from './theme';
import { Field as RhfField } from '../src/react-hook-form';
import { Field as TanStackField } from '../src/tanstack-form';

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

type Options = Partial<DataTable.Options<Person>>;
type RootProps = Partial<Omit<DataTable.Props<Person>, 'table'>>;

function People({ options, ...props }: RootProps & { options: Options }) {
  const people = useDataTable({
    columns,
    data: PEOPLE,
    getRowId: idOf,
    getRowLabel: nameOf,
    sorting: {},
    ...options,
  });
  return <DataTable table={people} aria-label="People" {...props} />;
}

function table(options: Options = {}, props: RootProps = {}) {
  return (
    <IdsProvider theme={testTheme}>
      <People options={options} {...props} />
    </IdsProvider>
  );
}

const namesInOrder = (container: HTMLElement) =>
  [...container.querySelectorAll('tbody tr')].map((row) =>
    [...row.querySelectorAll('td')]
      .map((cell) => cell.textContent)
      .find((text) => /\D/.test(text!)),
  );

function colorOf(variable: string) {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${variable})`;
  document.querySelector('[data-mode]')!.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

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

test('SSR: header, rows and the empty cell render on the server', () => {
  const doc = new DOMParser().parseFromString(renderToString(table({ data: [] })), 'text/html');
  expect(doc.querySelector('table')!.getAttribute('aria-label')).toBe('People');
  expect([...doc.querySelectorAll('thead th')].map((th) => th.textContent)).toEqual([
    'Name',
    'Age',
  ]);
  const message = doc.querySelector<HTMLElement>('[data-data-table-message]')!;
  expect(message.textContent).toBe('');
  expect(message.getAttribute('colspan')).toBe('2');
});

test('a sortable header is a button; clicking cycles aria-sort and the row order', async () => {
  const onSortingChange = vi.fn();
  const screen = await render(table({ sorting: { onValueChange: onSortingChange } }));
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
  const screen = await render(table({ sorting: { onValueChange: onSortingChange } }));

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
  const screen = await render(table({ sorting: { value: [], onValueChange: onSortingChange } }));

  await userEvent.click(screen.getByRole('button', { name: 'Name' }));
  expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }]);
  await expect
    .element(screen.getByRole('columnheader', { name: 'Name' }))
    .not.toHaveAttribute('aria-sort');
});

test('the sort icon hides until hover or focus, and a sorted column shows it in primary', async () => {
  const screen = await render(table({ sorting: { defaultValue: [{ id: 'age', desc: true }] } }));
  const icon = (name: string) =>
    screen.getByRole('button', { name }).element().querySelector('svg:last-child')!;

  await userEvent.hover(screen.getByRole('cell', { name: 'Barbara' }));
  await expect.poll(() => getComputedStyle(icon('Name')).opacity).toBe('0');
  expect(getComputedStyle(icon('Age')).opacity).toBe('1');
  expect(getComputedStyle(icon('Age')).color).toBe(colorOf('--ids-color-text-primary'));

  await userEvent.hover(screen.getByRole('button', { name: 'Name' }));
  await expect.poll(() => getComputedStyle(icon('Name')).opacity).toBe('1');
});

test('outline sets the table on a neutral tray and divides the columns', async () => {
  const screen = await render(table({ pagination: {} }));
  const root = screen.container.querySelector<HTMLElement>('[data-data-table]')!;
  const toolbar = root.querySelector('[data-data-table-toolbar]')!;
  const firstCell = root.querySelector('tbody td')!;

  await expect.element(screen.getByRole('table')).toBeVisible();
  expect(getComputedStyle(root).backgroundColor).toBe(colorOf('--ids-color-bg-neutral-soft'));
  expect(getComputedStyle(root.querySelector('thead')!).backgroundColor).toBe(
    colorOf('--ids-color-bg-block'),
  );
  expect(root.contains(toolbar)).toBe(true);
  expect(getComputedStyle(firstCell).borderInlineEndWidth).toBe('1px');
  expect(getComputedStyle(root.querySelector('tbody td:last-child')!).borderInlineEndWidth).toBe(
    '0px',
  );
});

test('ghost keeps the plain table with no tray', async () => {
  const screen = await render(table({}, { variant: 'ghost' }));
  const root = screen.container.querySelector<HTMLElement>('[data-data-table]')!;

  await expect.element(screen.getByRole('table')).toBeVisible();
  expect(getComputedStyle(root).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(getComputedStyle(root.querySelector('tbody td')!).borderInlineEndWidth).toBe('0px');
});

test('striped tints every other body row with bg-block and keeps the tray', async () => {
  const screen = await render(table({}, { variant: 'striped' }));
  const root = screen.container.querySelector<HTMLElement>('[data-data-table]')!;
  const [first, second] = root.querySelectorAll('tbody tr');

  await expect.element(screen.getByRole('table')).toBeVisible();
  expect(getComputedStyle(root).backgroundColor).toBe(colorOf('--ids-color-bg-neutral-soft'));
  expect(getComputedStyle(first).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(getComputedStyle(second).backgroundColor).toBe(colorOf('--ids-color-bg-block'));
});

test('the header sticks to the top of the scrolling table', async () => {
  const screen = await render(table());
  await expect.element(screen.getByRole('table')).toBeVisible();
  expect(getComputedStyle(screen.container.querySelector('thead')!).position).toBe('sticky');
});

test('parts render in the order written, and the toolbar leads with the selected count', async () => {
  const screen = await render(
    table(
      { selection: {}, pagination: {} },
      {
        defaultValue: { ada: true },
        children: [
          <DataTable.Toolbar key="toolbar">
            <button type="button">Export</button>
          </DataTable.Toolbar>,
          <DataTable.Content key="content" />,
          <DataTable.Pagination key="pagination" />,
          <DataTable.Caption key="caption">Team</DataTable.Caption>,
        ],
      },
    ),
  );
  const root = screen.container.querySelector('[data-data-table]')!;

  await expect.element(screen.getByRole('table', { name: 'People' })).toBeVisible();
  expect([...root.children].map((child) => child.firstElementChild?.tagName ?? '')).toEqual([
    'P',
    'DIV',
    'NAV',
  ]);
  const toolbar = root.querySelector('[data-data-table-toolbar]')!;
  expect(toolbar.textContent).toBe('1개 선택됨Export');
  expect(root.querySelector('caption')!.textContent).toBe('Team');
});

test('without sorting the headers are plain text', async () => {
  const screen = await render(table({ sorting: undefined }));
  await expect.element(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  expect(screen.getByRole('button').elements()).toHaveLength(0);
});

test('row selection: named checkboxes, a mixed select-all, Shift ranges and the count', async () => {
  const onRowSelectionChange = vi.fn();
  const screen = await render(table({ selection: {} }, { onValueChange: onRowSelectionChange }));
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

test('controlled selection only moves when the app writes it back, and an outside value shows', async () => {
  const onValueChange = vi.fn();
  const screen = await render(table({ selection: {} }, { value: { ken: true }, onValueChange }));

  await expect.element(screen.getByRole('checkbox', { name: 'Ken 선택' })).toBeChecked();
  await userEvent.click(screen.getByRole('checkbox', { name: 'Ada 선택' }));
  expect(onValueChange).toHaveBeenLastCalledWith({ ken: true, ada: true });
  await expect.element(screen.getByRole('checkbox', { name: 'Ada 선택' })).not.toBeChecked();

  await screen.rerender(table({ selection: {} }, { value: { ada: true }, onValueChange }));
  await expect.element(screen.getByRole('checkbox', { name: 'Ada 선택' })).toBeChecked();
  await expect.element(screen.getByRole('checkbox', { name: 'Ken 선택' })).not.toBeChecked();
});

test('a react-hook-form Field binds the selection with no wiring', async () => {
  let methods!: UseFormReturn<{ invitees: DataTable.RowSelectionState }>;
  function Invite() {
    const form = useForm<{ invitees: DataTable.RowSelectionState }>({
      defaultValues: { invitees: { grace: true } },
    });
    const people = useDataTable({
      columns,
      data: PEOPLE,
      getRowId: idOf,
      getRowLabel: nameOf,
      selection: {},
    });
    useEffect(() => {
      methods = form;
    });
    return (
      <IdsProvider theme={testTheme}>
        <FormProvider {...form}>
          <RhfField name="invitees" controlMode="value">
            <RhfField.Label>Invitees</RhfField.Label>
            <DataTable table={people} />
          </RhfField>
        </FormProvider>
      </IdsProvider>
    );
  }
  const screen = await render(<Invite />);

  await expect.element(screen.getByRole('checkbox', { name: 'Grace 선택' })).toBeChecked();
  await userEvent.click(screen.getByRole('checkbox', { name: 'Ada 선택' }));
  expect(methods.getValues('invitees')).toEqual({ grace: true, ada: true });

  methods.reset({ invitees: { ken: true } });
  await expect.element(screen.getByRole('checkbox', { name: 'Ken 선택' })).toBeChecked();
  await expect.element(screen.getByRole('checkbox', { name: 'Grace 선택' })).not.toBeChecked();
});

test('a TanStack Form Field binds the selection with no wiring', async () => {
  const useInviteForm = () =>
    useTanStackForm({ defaultValues: { invitees: { ken: true } as DataTable.RowSelectionState } });
  let form!: ReturnType<typeof useInviteForm>;
  function Invite() {
    const api = useInviteForm();
    const people = useDataTable({
      columns,
      data: PEOPLE,
      getRowId: idOf,
      getRowLabel: nameOf,
      selection: {},
    });
    useEffect(() => {
      form = api;
    });
    return (
      <IdsProvider theme={testTheme}>
        <api.Field name="invitees">
          {(field) => (
            <TanStackField field={field} controlMode="value">
              <TanStackField.Label>Invitees</TanStackField.Label>
              <DataTable table={people} />
            </TanStackField>
          )}
        </api.Field>
      </IdsProvider>
    );
  }
  const screen = await render(<Invite />);

  await expect.element(screen.getByRole('checkbox', { name: 'Ken 선택' })).toBeChecked();
  await userEvent.click(screen.getByRole('checkbox', { name: 'Barbara 선택' }));
  await expect.poll(() => form.getFieldValue('invitees')).toEqual({ ken: true, barbara: true });
});

test('a selection checkbox sits on the same center line as the text beside it', async () => {
  const screen = await render(table({ selection: {}, sorting: undefined }));
  const centerOf = (rect: DOMRect) => rect.top + rect.height / 2;
  const textCenter = (cell: Element) => {
    const range = document.createRange();
    range.selectNodeContents(cell.querySelector('span') ?? cell);
    return centerOf(range.getBoundingClientRect());
  };

  await expect.element(screen.getByRole('row', { name: /Ada/ })).toBeInTheDocument();
  for (const row of [
    screen.getByRole('row').first().element(),
    screen.getByRole('row', { name: /Ada/ }).element(),
  ]) {
    const [selectCell, nameCell] = row.children;
    const checkbox = selectCell.querySelector('[data-checkbox]')!;
    expect(centerOf(checkbox.getBoundingClientRect())).toBeCloseTo(textCenter(nameCell), 0);
  }
});

test('a row that cannot be selected keeps a disabled checkbox; without a label rows are numbered', async () => {
  const screen = await render(
    table({ getRowLabel: undefined, selection: { enabled: (row) => row.original.age < 80 } }),
  );

  await expect.element(screen.getByRole('checkbox', { name: '2번째 행 선택' })).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox', { name: '모든 행 선택' }));
  await expect.element(screen.getByRole('checkbox', { name: '1번째 행 선택' })).toBeChecked();
  await expect.element(screen.getByRole('checkbox', { name: '2번째 행 선택' })).not.toBeChecked();
});

test('pagination: ten rows a page, the buttons move and keep focus at the ends', async () => {
  const onPaginationChange = vi.fn();
  const screen = await render(
    table({ data: manyPeople(23), pagination: { onValueChange: onPaginationChange } }),
  );
  const status = screen.getByText(/\/ 3$/);

  await expect.element(status).toHaveTextContent('1 / 3');
  expect(screen.container.querySelectorAll('tbody tr')).toHaveLength(10);
  await expect
    .element(screen.getByRole('button', { name: '이전' }))
    .toHaveAttribute('aria-disabled', 'true');

  await userEvent.click(screen.getByRole('button', { name: '다음' }));
  expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 10 });
  await expect.element(status).toHaveTextContent('2 / 3');

  await userEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
  await expect.element(status).toHaveTextContent('3 / 3');
  expect(screen.container.querySelectorAll('tbody tr')).toHaveLength(3);
  await expect.element(screen.getByRole('button', { name: '마지막 페이지' })).toHaveFocus();

  await userEvent.click(screen.getByRole('button', { name: '첫 페이지' }));
  await expect.element(status).toHaveTextContent('1 / 3');
});

test('server pagination draws the rows it is given and counts pages from rowCount', async () => {
  function Server() {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 2 });
    const start = pagination.pageIndex * pagination.pageSize;
    const people = useDataTable({
      columns,
      data: PEOPLE.slice(start, start + pagination.pageSize),
      getRowId: idOf,
      pagination: {
        manual: true,
        rowCount: PEOPLE.length,
        value: pagination,
        onValueChange: setPagination,
      },
    });
    return (
      <IdsProvider theme={testTheme}>
        <DataTable table={people} aria-label="People" />
      </IdsProvider>
    );
  }
  const screen = await render(<Server />);

  await expect.element(screen.getByText('1 / 3')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: '다음' }));
  await expect.element(screen.getByText('2 / 3')).toBeVisible();
  expect(namesInOrder(screen.container)).toEqual(['Linus', 'Ken']);
});

test('column resizing: a focusable separator per column, sized by keys and by dragging', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(table({ columnSizing: {} }));
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
  const screen = await render(<div dir="rtl">{table({ columnSizing: {} })}</div>);
  const handle = screen.getByRole('separator', { name: 'Name 열 너비' });

  await expect.element(handle).toBeInTheDocument();
  handle.element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '166');
});

test('empty and loading states', async () => {
  const screen = await render(
    table({ data: [] }, { children: <DataTable.Empty>Nobody yet</DataTable.Empty> }),
  );
  await expect.element(screen.getByText('Nobody yet')).toBeVisible();

  await screen.rerender(table({ data: [] }, { 'aria-busy': true }));
  await expect
    .element(screen.getByRole('table', { name: 'People' }))
    .toHaveAttribute('aria-busy', 'true');
  expect(screen.container.querySelector('[data-data-table-message] [data-spinner]')).not.toBeNull();

  await screen.rerender(table({}, { 'aria-busy': true }));
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
  function Everything() {
    const people = useDataTable({
      columns,
      data: manyPeople(12),
      getRowId: idOf,
      selection: {},
      pagination: {},
      columnSizing: {},
    });
    const nobody = useDataTable({ columns, data: [] });
    return (
      <>
        <DataTable table={people} aria-label="People" />
        <DataTable table={nobody} aria-label="Nobody" />
      </>
    );
  }
  const screen = await render(
    <IdsProvider theme={testTheme} translate={english} locale="en-US">
      <Everything />
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeVisible();
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
  await expect.element(screen.getByText('12 selected')).toBeVisible();
  await expect.element(screen.getByText('1 / 2')).toBeVisible();
  await expect.element(screen.getByRole('button', { name: 'Next' })).toBeVisible();
  await expect
    .element(screen.getByRole('separator', { name: 'Name column width' }))
    .toBeInTheDocument();
  await expect.element(screen.getByRole('navigation', { name: 'People' })).toBeVisible();
});
