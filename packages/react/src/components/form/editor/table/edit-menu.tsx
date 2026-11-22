'use client';

import { type ReactElement } from 'react';

import { TrashIcon } from '@heroicons/react/16/solid';
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  PanelTop,
  TableCellsMerge,
  TableCellsSplit,
} from 'lucide-react';

import { useTranslate } from '../../../../internal/translate';
import { Menu } from '../../../overlay/menu';
import { useEditorContext } from '../context';
import { EditorToolTip, type EditorToolTipProps } from '../tool';
import { useEditorSelector } from '../use-editor-selector';

import type { IdsMessageKey } from '../../../../internal/messages';
import type { ChainedCommands, Editor as TiptapEditor } from '@tiptap/core';

type TableCommand = {
  label: IdsMessageKey;
  icon: ReactElement;
  run: (chain: ChainedCommands) => ChainedCommands;
};

const ADD: readonly TableCommand[] = [
  {
    label: 'editor.tableAddRowBefore',
    icon: <BetweenHorizontalStart />,
    run: (chain) => chain.addRowBefore(),
  },
  {
    label: 'editor.tableAddRowAfter',
    icon: <BetweenHorizontalEnd />,
    run: (chain) => chain.addRowAfter(),
  },
  {
    label: 'editor.tableAddColumnBefore',
    icon: <BetweenVerticalStart />,
    run: (chain) => chain.addColumnBefore(),
  },
  {
    label: 'editor.tableAddColumnAfter',
    icon: <BetweenVerticalEnd />,
    run: (chain) => chain.addColumnAfter(),
  },
];

const DELETE_PARTS: readonly TableCommand[] = [
  { label: 'editor.tableDeleteRow', icon: <TrashIcon />, run: (chain) => chain.deleteRow() },
  { label: 'editor.tableDeleteColumn', icon: <TrashIcon />, run: (chain) => chain.deleteColumn() },
];

const DELETE_THE_TABLE: TableCommand = {
  label: 'editor.tableDelete',
  icon: <TrashIcon />,
  run: (chain) => chain.deleteTable(),
};

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

export function EditorTableMenuItems({ deletesTheTable = true }: { deletesTheTable?: boolean }) {
  const t = useTranslate();
  const { editor, format, styles } = useEditorContext('Editor.Table');
  const { headerRow, mergeable, splittable } = useEditorSelector(editor, cellState, {
    headerRow: true,
    mergeable: false,
    splittable: false,
  });
  const markdownKeepsOnlyPlainGrids = format === 'markdown';
  const deletes = deletesTheTable ? [...DELETE_PARTS, DELETE_THE_TABLE] : DELETE_PARTS;

  const run = (command: (chain: ChainedCommands) => ChainedCommands) => {
    if (editor) command(editor.chain().focus()).run();
  };

  const item = ({ label, icon, run: command }: TableCommand, className?: string) => (
    <Menu.Item key={label} className={className} onSelect={() => run(command)}>
      {icon}
      {t(label)}
    </Menu.Item>
  );

  return (
    <>
      {ADD.map((command) => item(command))}
      {!markdownKeepsOnlyPlainGrids && (
        <>
          <Menu.Separator />
          <Menu.CheckboxItem
            checked={headerRow}
            onCheckedChange={() => run((chain) => chain.toggleHeaderRow())}
          >
            <PanelTop />
            {t('editor.tableHeaderRow')}
          </Menu.CheckboxItem>
          <Menu.Item disabled={!mergeable} onSelect={() => run((chain) => chain.mergeCells())}>
            <TableCellsMerge />
            {t('editor.tableMergeCells')}
          </Menu.Item>
          <Menu.Item disabled={!splittable} onSelect={() => run((chain) => chain.splitCell())}>
            <TableCellsSplit />
            {t('editor.tableSplitCell')}
          </Menu.Item>
        </>
      )}
      <Menu.Separator />
      {deletes.map((command) => item(command, styles.destructiveItem()))}
    </>
  );
}

export function EditorTableEditMenu({
  tooltip,
  children,
}: {
  tooltip: EditorToolTipProps;
  children: ReactElement;
}) {
  return (
    <Menu>
      <EditorToolTip {...tooltip}>
        <Menu.Trigger asChild>{children}</Menu.Trigger>
      </EditorToolTip>
      <Menu.Content side="bottom" align="start">
        <EditorTableMenuItems />
      </Menu.Content>
    </Menu>
  );
}
