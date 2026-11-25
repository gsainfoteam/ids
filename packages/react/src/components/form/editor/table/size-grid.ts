import { clamp, range } from 'es-toolkit';

import type { TableSize } from './insert';

const MOST = { rows: 8, cols: 10 } as const satisfies TableSize;

export const ROWS = range(1, MOST.rows + 1);
export const COLUMNS = range(1, MOST.cols + 1);

export const within = (size: TableSize): TableSize => ({
  rows: clamp(size.rows, 1, MOST.rows),
  cols: clamp(size.cols, 1, MOST.cols),
});

export const cellSelector = ({ rows, cols }: TableSize) =>
  `[data-table-size-cell="${rows}x${cols}"]`;
