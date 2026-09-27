import type { ReactNode } from 'react';

import { cn } from '../src/utils';

// Every Gallery story is built from these parts so that all components read the same way:
// a titled section per axis, a label column on the left, and a matrix for two-axis grids.

export function Showcase({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex w-full max-w-5xl flex-col gap-12', className)}>{children}</div>;
}

export namespace Showcase {
  export function Section({
    title,
    description,
    children,
  }: {
    title: string;
    description?: ReactNode;
    children: ReactNode;
  }) {
    return (
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1 border-b border-(--ids-color-border) pb-2">
          <h2 className="text-subtitle-s2-semibold">{title}</h2>
          {description !== undefined && (
            <p className="text-body-b3-regular text-(--ids-color-on-muted)">{description}</p>
          )}
        </header>
        <div className="flex flex-col gap-3">{children}</div>
      </section>
    );
  }

  export function Row({
    label,
    children,
    className,
  }: {
    label?: ReactNode;
    children: ReactNode;
    className?: string;
  }) {
    return (
      <div className="flex items-center gap-4">
        {label !== undefined && (
          <span className="text-caption-c1-medium w-24 shrink-0 text-(--ids-color-on-muted)">
            {label}
          </span>
        )}
        <div className={cn('flex flex-1 flex-wrap items-center gap-3', className)}>{children}</div>
      </div>
    );
  }

  export function Matrix<Row extends string, Column extends string>({
    rows,
    columns,
    render,
  }: {
    rows: readonly Row[];
    columns: readonly Column[];
    render: (row: Row, column: Column) => ReactNode;
  }) {
    return (
      <div
        className="grid items-center gap-x-4 gap-y-3"
        style={{ gridTemplateColumns: `6rem repeat(${columns.length}, max-content)` }}
      >
        <span />
        {columns.map((column) => (
          <span key={column} className="text-caption-c1-medium text-(--ids-color-on-muted)">
            {column}
          </span>
        ))}
        {rows.flatMap((row) => [
          <span key={row} className="text-caption-c1-medium text-(--ids-color-on-muted)">
            {row}
          </span>,
          ...columns.map((column) => <div key={`${row}:${column}`}>{render(row, column)}</div>),
        ])}
      </div>
    );
  }
}
