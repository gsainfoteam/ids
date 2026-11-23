---
"@gsainfoteam/ids-react": major
---

DataTable takes its behaviour from a `useDataTable()` hook and draws its screen from parts.

- `const table = useDataTable({ columns, data, getRowId, getRowLabel, sorting, selection, pagination, columnSizing })`
  returns the TanStack table, and `<DataTable table={table}>` draws it. Each feature is on when its
  object is given; sorting, pagination and column sizing hold their state as a `value` /
  `defaultValue` / `onValueChange` trio:
  - `sorting: { multiple, removable, manual, … }` replaces `enableSorting`, `enableMultiSort`,
    `enableSortingRemoval`, `manualSorting`, `sorting`, `defaultSorting` and `onSortingChange`.
    Sorting is now off until `sorting` is given.
  - `selection: { multiple, enabled(row) }` replaces `enableRowSelection` and
    `enableMultiRowSelection`. The selected rows are the root's `value`, `defaultValue` and
    `onValueChange` (in place of `rowSelection`, `defaultRowSelection` and `onRowSelectionChange`),
    so a react-hook-form or TanStack Form `Field` binds them like any other control.
  - `pagination: { manual, rowCount, … }` replaces `enablePagination`, `manualPagination`,
    `rowCount`, `pagination`, `defaultPagination` and `onPaginationChange`.
  - `columnSizing: {}` replaces `enableColumnResizing`, and can hold the widths as a trio.
- `DataTable.Toolbar`, `DataTable.Content`, `DataTable.Pagination`, `DataTable.Caption` and
  `DataTable.Empty` replace `caption` and `empty`. Without layout parts the table draws Content and
  a toolbar holding the selected count and the pager, as before.
- `loading` is `aria-busy`.
- `striped` is `variant="striped"`. `stickyHeader` and `highlightOnHover` are gone: the header
  always sticks inside a DataTable given a height, and a row always shows the hover state layer.
- `DataTable.Sorting`, `.RowSelection` and `.Pagination` are `DataTable.SortingState`,
  `.RowSelectionState` and `.PaginationState`.
- DataTable fills its parent's width and stays within the height the parent gives, scrolling its
  rows inside; size it by wrapping it, not with `className`. `DataTable.Toolbar` places its
  children together at the end of the row.
- Its `data-*` attributes are no longer documented. Read the state from the hook's values, the
  root's `value` and the TanStack table instead.
