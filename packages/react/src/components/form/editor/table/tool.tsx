'use client';

import { Table } from 'lucide-react';

import { EditorTableEditMenu } from './edit-menu';
import { EditorTableSizePicker } from './size-picker';
import { useInternalTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { useInternalEditorContext } from '../context';
import { useInternalEditorSelector } from '../hooks/use-editor-selector';
import { editorMessages } from '../messages-catalog';
import { insertTable, NEW_TABLE_SIZE } from './insert';
import { useInternalEditorToolProps } from '../hooks/use-editor-tool-props';
import { extensionIsLoaded, hasExtension } from '../lib/extensions';
import { type EditorToolProps } from '../parts/tool';

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
  const t = useInternalTranslate(editorMessages);
  const { editor, editable } = useInternalEditorContext('Editor.Table');
  const tool = useInternalEditorToolProps('Table');
  const loaded = extensionIsLoaded(editor, 'Table', 'table');
  const { inTable, insertable } = useInternalEditorSelector(editor, tableState, {
    inTable: false,
    insertable: false,
  });

  const label = ariaLabel ?? t('editor.table');
  const disabled = !editable || !loaded || (!inTable && !insertable);

  const button = (
    <IconButton
      {...tool}
      variant="ghost"
      colorScheme="neutral"
      size="tiny"
      icon={icon ?? <Table />}
      aria-label={label}
      className={className}
      disabled={disabled}
    />
  );

  const tooltip = { label, disabled };

  if (inTable) return <EditorTableEditMenu tooltip={tooltip}>{button}</EditorTableEditMenu>;

  return (
    <EditorTableSizePicker
      tooltip={tooltip}
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
