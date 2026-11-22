'use client';

import { type ReactElement } from 'react';

import { useTranslate } from '../../../../internal/translate';
import { Menu } from '../../../overlay/menu';
import { useEditorContext } from '../context';
import { EditorToolTip, type EditorToolTipProps } from '../tool';
import { useEditorSelector } from '../use-editor-selector';

import type { IdsMessageKey } from '../../../../internal/messages';
import type { ChainedCommands, Editor as TiptapEditor } from '@tiptap/core';

type TableCommand = {
  label: IdsMessageKey;
  run: (chain: ChainedCommands) => ChainedCommands;
};

const ADD: readonly TableCommand[] = [
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

function tableAroundTheSelection(editor: TiptapEditor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth--)
    if ($from.node(depth).type.name === 'table') return $from.node(depth);
  return null;
}

function cellState(editor: TiptapEditor) {
  return {
    headerRow: tableAroundTheSelection(editor)?.firstChild?.firstChild?.type.name === 'tableHeader',
    mergeable: editor.can().mergeCells(),
    splittable: editor.can().splitCell(),
  };
}

export function EditorTableEditMenu({
  tooltip,
  children,
}: {
  tooltip: EditorToolTipProps;
  children: ReactElement;
}) {
  const t = useTranslate();
  const { editor, format } = useEditorContext('Editor.Table');
  const { headerRow, mergeable, splittable } = useEditorSelector(editor, cellState, {
    headerRow: true,
    mergeable: false,
    splittable: false,
  });
  const markdownKeepsOnlyPlainGrids = format === 'markdown';

  const run = (command: (chain: ChainedCommands) => ChainedCommands) => {
    if (editor) command(editor.chain().focus()).run();
  };

  const item = ({ label, run: command }: TableCommand) => (
    <Menu.Item key={label} onSelect={() => run(command)}>
      {t(label)}
    </Menu.Item>
  );

  return (
    <Menu>
      <EditorToolTip {...tooltip}>
        <Menu.Trigger asChild>{children}</Menu.Trigger>
      </EditorToolTip>
      <Menu.Content side="bottom" align="start">
        {ADD.map(item)}
        {!markdownKeepsOnlyPlainGrids && (
          <>
            <Menu.Separator />
            <Menu.CheckboxItem
              checked={headerRow}
              onCheckedChange={() => run((chain) => chain.toggleHeaderRow())}
            >
              {t('editor.tableHeaderRow')}
            </Menu.CheckboxItem>
            <Menu.Item disabled={!mergeable} onSelect={() => run((chain) => chain.mergeCells())}>
              {t('editor.tableMergeCells')}
            </Menu.Item>
            <Menu.Item disabled={!splittable} onSelect={() => run((chain) => chain.splitCell())}>
              {t('editor.tableSplitCell')}
            </Menu.Item>
          </>
        )}
        <Menu.Separator />
        {DELETE.map(item)}
      </Menu.Content>
    </Menu>
  );
}
