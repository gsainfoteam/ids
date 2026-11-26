'use client';

import { TableContext } from './context';
import { tableStyle } from './style';
import { ScrollArea } from '../../layout/scroll-area';

import type { Table } from '.';

export function TableRoot({
  variant = 'outline',
  size = 'standard',
  layout = 'auto',
  className,
  style,
  children,
  ...props
}: Table.Props) {
  const styles = tableStyle({ variant, size, layout });

  return (
    <TableContext value={{ styles }}>
      <ScrollArea
        orientation="both"
        fade="x"
        size={size}
        data-table=""
        data-variant={variant}
        data-size={size}
        data-layout={layout}
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
