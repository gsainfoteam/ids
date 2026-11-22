'use client';

import { Table } from 'lucide-react';

import { useTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { useEditorContext } from '../context';
import { extensionIsLoaded, hasExtension, useEditorToolProps, type EditorToolProps } from '../tool';
import { useEditorSelector } from '../use-editor-selector';
import { EditorTableEditMenu } from './edit-menu';
import { insertTable, NEW_TABLE_SIZE } from './insert';
import { EditorTableSizePicker } from './size-picker';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorTableProps = EditorToolProps;

function tableState(editor: TiptapEditor) {
  if (!hasExtension(editor, 'table')) return { inTable: false, insertable: false };
  return {
    inTable: editor.isActive('table'),
    insertable: editor.can().insertTable({ ...NEW_TABLE_SIZE, withHeaderRow: true }),
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

  const button = (
    <IconButton
      {...tool}
      variant="ghost"
      colorScheme="neutral"
      size="tiny"
      icon={icon ?? <Table />}
      aria-label={ariaLabel ?? t('editor.table')}
      className={className}
      disabled={!editable || !loaded || (!inTable && !insertable)}
    />
  );

  if (inTable) return <EditorTableEditMenu>{button}</EditorTableEditMenu>;

  return (
    <EditorTableSizePicker
      disabled={!insertable}
      onPick={(size) => {
        if (editor) insertTable(editor.chain().focus(), size).run();
      }}
    >
      {button}
    </EditorTableSizePicker>
  );
}

EditorTable.displayName = 'Editor.Table';
