'use client';

import { TableCellsIcon } from '@heroicons/react/16/solid';

import { useTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { Menu } from '../../../overlay/menu';
import { useEditorContext } from '../context';
import { extensionIsLoaded, hasExtension, useEditorToolProps, type EditorToolProps } from '../tool';
import { useEditorSelector } from '../use-editor-selector';
import { insertTable, NEW_TABLE } from './insert';

import type { IdsMessageKey } from '../../../../internal/messages';
import type { ChainedCommands, Editor as TiptapEditor } from '@tiptap/core';

export type EditorTableProps = EditorToolProps;

type TableCommand = {
  label: IdsMessageKey;
  run: (chain: ChainedCommands) => ChainedCommands;
};

const EDIT_ROWS: readonly TableCommand[] = [
  { label: 'editor.tableAddRowBefore', run: (chain) => chain.addRowBefore() },
  { label: 'editor.tableAddRowAfter', run: (chain) => chain.addRowAfter() },
  { label: 'editor.tableAddColumnBefore', run: (chain) => chain.addColumnBefore() },
  { label: 'editor.tableAddColumnAfter', run: (chain) => chain.addColumnAfter() },
];

const DELETE: readonly TableCommand[] = [
  { label: 'editor.tableDeleteRow', run: (chain) => chain.deleteRow() },
  { label: 'editor.tableDeleteColumn', run: (chain) => chain.deleteColumn() },
  { label: 'editor.tableDelete', run: (chain) => chain.deleteTable() },
];

function tableState(editor: TiptapEditor) {
  if (!hasExtension(editor, 'table')) return { inTable: false, insertable: false };
  return {
    inTable: editor.isActive('table'),
    insertable: editor.can().insertTable(NEW_TABLE),
  };
}

export function EditorTable({ icon, 'aria-label': ariaLabel, className }: EditorTableProps) {
  const t = useTranslate();
  const { editor, editable } = useEditorContext('Editor.Table');
  const tool = useEditorToolProps('Table');
  const loaded = extensionIsLoaded(editor, 'Table', 'table');
  const { inTable, insertable } = useEditorSelector(editor, tableState, {
    inTable: false,
    insertable: false,
  });

  const run = (command: (chain: ChainedCommands) => ChainedCommands) => {
    if (editor) command(editor.chain().focus()).run();
  };

  const item = ({ label, run: command }: TableCommand) => (
    <Menu.Item key={label} disabled={!inTable} onSelect={() => run(command)}>
      {t(label)}
    </Menu.Item>
  );

  return (
    <Menu>
      <Menu.Trigger asChild>
        <IconButton
          {...tool}
          variant="ghost"
          colorScheme="neutral"
          size="tiny"
          icon={icon ?? <TableCellsIcon />}
          aria-label={ariaLabel ?? t('editor.table')}
          className={className}
          disabled={!editable || !loaded}
        />
      </Menu.Trigger>
      <Menu.Content side="bottom" align="start">
        <Menu.Item disabled={inTable || !insertable} onSelect={() => run(insertTable)}>
          {t('editor.tableInsert')}
        </Menu.Item>
        <Menu.Separator />
        {EDIT_ROWS.map(item)}
        <Menu.Separator />
        {DELETE.map(item)}
      </Menu.Content>
    </Menu>
  );
}

EditorTable.displayName = 'Editor.Table';
