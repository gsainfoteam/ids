'use client';

import { TableContext } from './context';
import { tableStyle } from './style';
import { ScrollArea } from '../../layout/scroll-area';

import type { Table } from '.';

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function TableRoot({
  variant = 'outline',
  size = 'standard',
  layout = 'auto',
  striped = false,
  stickyHeader = false,
  highlightOnHover = false,
  className,
  style,
  children,
  ...props
}: Table.Props) {
  const styles = tableStyle({ variant, size, layout, striped, stickyHeader });

  return (
    <TableContext value={{ styles, highlightOnHover }}>
      <ScrollArea
        orientation="both"
        size={size}
        data-table=""
        data-variant={variant}
        data-size={size}
        data-layout={layout}
        data-striped={flag(striped)}
        data-sticky-header={flag(stickyHeader)}
        className={styles.root({ className })}
        style={style}
      >
        <ScrollArea.Viewport className={styles.viewport()}>
          <table {...props} className={styles.table()}>
            {children}
          </table>
        </ScrollArea.Viewport>
      </ScrollArea>
    </TableContext>
  );
}
