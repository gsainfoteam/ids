'use client';

import type { ReactElement } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { Popover } from '../../../overlay/popover';
import { useInternalEditorContext } from '../context';
import { useInternalEditorTableSizePicker } from '../hooks/use-editor-table-size-picker';
import { editorMessages } from '../messages-catalog';
import { NEW_TABLE_SIZE, type TableSize } from './insert';
import { cellSelector, COLUMNS, ROWS } from './size-grid';
import { EditorToolTip, type EditorToolTipProps } from '../parts/tool';

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
  const t = useInternalTranslate(editorMessages);
  const { styles } = useInternalEditorContext('Editor.Table');
  const { open, onOpenChange, size, setSize, gridRef, pick, onKeyDown } =
    useInternalEditorTableSizePicker(onPick);

  return (
    <Popover open={open && !disabled} onOpenChange={onOpenChange}>
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
