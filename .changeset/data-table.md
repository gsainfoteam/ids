---
'@gsainfoteam/ids-react': minor
---

Add `DataTable`, which renders `@tanstack/react-table` v9 with the `Table` parts. It keeps
TanStack's `columns`, `data`, state shapes and option names, and adds sortable header buttons with
`aria-sort`, row selection with a checkbox column and a mixed select-all, a pagination footer,
keyboard-operable column resizing, an `empty` slot and a `loading` state.
`DataTable.createColumnHelper<Row>()` builds typed columns, and `meta.align` aligns a column.
