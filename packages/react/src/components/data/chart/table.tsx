'use client';

import { useChartContext } from './context';
import { useFormatValue } from './use-format-value';
import { Table } from '../table';

export type ChartTableProps = Omit<Table.Props, 'children'>;

export function ChartTable(props: ChartTableProps) {
  const { table, titleId, locale } = useChartContext('Chart.Table');
  const format = useFormatValue(locale);
  if (!table) return null;

  return (
    <Table aria-labelledby={titleId} {...props} data-chart-table="">
      <Table.Header>
        <Table.Row>
          <Table.Head>{table.category.label}</Table.Head>
          {table.series.map((series) => (
            <Table.Head key={series.key} align="end">
              {series.label}
            </Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {table.rows.map((row) => (
          <Table.Row key={row.id}>
            <Table.Head>{row.category}</Table.Head>
            {row.values.map((value, index) => (
              <Table.Cell key={table.series[index]!.key} align="end" className="tabular-nums">
                {format(value)}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

ChartTable.displayName = 'Chart.Table';
