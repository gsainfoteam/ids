'use client';

import { useRef, useState, type KeyboardEvent, type ReactElement } from 'react';

import { clamp, range } from 'es-toolkit';

import { keyHandler } from '../../../../internal/keys';
import { useTranslate } from '../../../../internal/translate';
import { Popover } from '../../../overlay/popover';
import { useEditorContext } from '../context';
import { EditorToolTip, type EditorToolTipProps } from '../tool';
import { NEW_TABLE_SIZE, type TableSize } from './insert';

const MOST = { rows: 8, cols: 10 } as const satisfies TableSize;

const ROWS = range(1, MOST.rows + 1);
const COLUMNS = range(1, MOST.cols + 1);

const within = (size: TableSize): TableSize => ({
  rows: clamp(size.rows, 1, MOST.rows),
  cols: clamp(size.cols, 1, MOST.cols),
});

const cellSelector = ({ rows, cols }: TableSize) => `[data-table-size-cell="${rows}x${cols}"]`;

export function EditorTableSizePicker({
  tooltip,
  disabled,
  onPick,
  children,
}: {
  tooltip: EditorToolTipProps;
  disabled: boolean;
  onPick: (size: TableSize) => void;
  children: ReactElement;
}) {
  const t = useTranslate();
  const { styles } = useEditorContext('Editor.Table');
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(NEW_TABLE_SIZE);
  const gridRef = useRef<HTMLDivElement>(null);

  const pick = (picked: TableSize) => {
    setOpen(false);
    onPick(picked);
  };

  const moveTo = (next: TableSize) => {
    const bounded = within(next);
    setSize(bounded);
    gridRef.current?.querySelector<HTMLElement>(cellSelector(bounded))?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) =>
    keyHandler<HTMLButtonElement>({
      ArrowRight: () => moveTo({ ...size, cols: size.cols + 1 }),
      ArrowLeft: () => moveTo({ ...size, cols: size.cols - 1 }),
      ArrowDown: () => moveTo({ ...size, rows: size.rows + 1 }),
      ArrowUp: () => moveTo({ ...size, rows: size.rows - 1 }),
    })(event);

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(next) => {
        if (next) setSize(NEW_TABLE_SIZE);
        setOpen(next);
      }}
    >
      <EditorToolTip {...tooltip}>
        <Popover.Trigger asChild>{children}</Popover.Trigger>
      </EditorToolTip>
      <Popover.Content
        aria-label={t('editor.tableInsert')}
        initialFocus={cellSelector(NEW_TABLE_SIZE)}
        side="bottom"
        align="start"
        className={styles.tableSizePicker()}
      >
        <div
          ref={gridRef}
          role="group"
          aria-label={t('editor.tableInsert')}
          className={styles.tableSizeGrid()}
        >
          {ROWS.map((rows) =>
            COLUMNS.map((cols) => {
              const covered = rows <= size.rows && cols <= size.cols;
              return (
                <button
                  key={`${rows}x${cols}`}
                  type="button"
                  data-table-size-cell={`${rows}x${cols}`}
                  data-covered={covered ? '' : undefined}
                  tabIndex={rows === size.rows && cols === size.cols ? 0 : -1}
                  aria-label={t('editor.tableSize', { rows, cols })}
                  className={styles.tableSizeCell()}
                  onPointerEnter={(event) => event.currentTarget.focus({ preventScroll: true })}
                  onFocus={() => setSize({ rows, cols })}
                  onKeyDown={onKeyDown}
                  onClick={() => pick({ rows, cols })}
                />
              );
            }),
          )}
        </div>
        <p aria-hidden="true" className={styles.tableSizeLabel()}>
          {t('editor.tableSize', size)}
        </p>
      </Popover.Content>
    </Popover>
  );
}
