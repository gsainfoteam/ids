import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi, type MockInstance } from 'vitest';

import { DataTable, IdsProvider, useDataTable } from '../src';
import { testTheme } from './theme';

import type { RowSelectionState } from '@tanstack/table-core';

type Person = { id: string; name: string };

const PEOPLE: Person[] = [
  { id: 'a', name: '김하나' },
  { id: 'b', name: '이둘' },
  { id: 'c', name: '박셋' },
];

const column = DataTable.createColumnHelper<Person>();
const columns = column.columns([column.accessor('name', { header: '이름' })]);

let complaints: MockInstance[] = [];

beforeEach(() => {
  complaints = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
});

afterEach(() => {
  expect(complaints.flatMap((spy) => spy.mock.calls)).toEqual([]);
  for (const spy of complaints) spy.mockRestore();
});

function render(props: { value?: RowSelectionState; defaultValue?: RowSelectionState }) {
  function People() {
    const table = useDataTable({
      data: PEOPLE,
      columns,
      getRowId: (person) => person.id,
      getRowLabel: (person) => person.name,
      selection: {},
    });

    return <DataTable table={table} aria-label="사람" {...props} />;
  }

  return renderToString(
    <IdsProvider theme={testTheme}>
      <People />
    </IdsProvider>,
  );
}

const checkedBoxes = (html: string) =>
  [...html.matchAll(/<input[^>]*type="checkbox"[^>]*>/g)].filter(([tag]) =>
    /\schecked=""/.test(tag),
  ).length;

test('the server HTML already shows the rows a defaultValue selects', () => {
  const html = render({ defaultValue: { a: true, c: true } });

  expect(html).toContain('2개 선택됨');
  expect(checkedBoxes(html)).toBe(2);
});

test('the server HTML already shows the rows a value selects, and a full selection checks the header box', () => {
  const html = render({ value: { a: true, b: true, c: true } });

  expect(html).toContain('3개 선택됨');
  expect(checkedBoxes(html)).toBe(4);
});
