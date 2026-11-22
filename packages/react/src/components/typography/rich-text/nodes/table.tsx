import { Table } from '../../../data/table';

import type { DocumentNodeProps } from './types';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const isHeaderRow = (row: ProseMirrorNode | undefined) =>
  row?.firstChild?.type.name === 'tableHeader';

const cellSpan = (cell: ProseMirrorNode) => ({
  colSpan: cell.attrs.colspan > 1 ? cell.attrs.colspan : undefined,
  rowSpan: cell.attrs.rowspan > 1 ? cell.attrs.rowspan : undefined,
});

export function TableNode({ node, renderElement }: DocumentNodeProps) {
  const [first, ...rest] = node.children;
  const header = isHeaderRow(first) ? first : undefined;
  const body = header ? rest : node.children;
  const render = (row: ProseMirrorNode) => renderElement({ content: row, parent: node });

  return (
    <Table layout="fixed">
      {header && <Table.Header>{render(header)}</Table.Header>}
      <Table.Body>{body.map(render)}</Table.Body>
    </Table>
  );
}

export function TableRowNode({ children }: DocumentNodeProps) {
  return <Table.Row>{children}</Table.Row>;
}

export function TableHeaderNode({ node, children }: DocumentNodeProps) {
  return <Table.Head {...cellSpan(node)}>{children}</Table.Head>;
}

export function TableCellNode({ node, children }: DocumentNodeProps) {
  return <Table.Cell {...cellSpan(node)}>{children}</Table.Cell>;
}
