import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { EditorTableView } from './view';
import { cn } from '../../../../utils';
import { tableStyle } from '../../../data/table/style';

import type { IdsSize } from '../../../../tokens/types';
import type * as TiptapTable from '@tiptap/extension-table';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

type TableModule = typeof TiptapTable;

const tableClassesKey = new PluginKey('idsTableClasses');

function classesOfTheTableParts(size: IdsSize): Record<string, string> {
  const styles = tableStyle({ variant: 'outline', size, layout: 'fixed' });
  return {
    tableRow: styles.row({ section: 'body' }),
    tableHeader: styles.head({ section: 'header', className: cn('bg-block whitespace-normal') }),
    tableCell: styles.cell({ section: 'body', className: cn('align-top') }),
  };
}

function decorateTableParts(doc: ProseMirrorNode, classes: Record<string, string>) {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    const className = classes[node.type.name];
    if (className)
      decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: className }));
    return !node.isTextblock;
  });
  return DecorationSet.create(doc, decorations);
}

const TableClasses = Extension.create<{ size: IdsSize }>({
  name: 'idsTableClasses',

  addOptions() {
    return { size: 'standard' };
  },

  addProseMirrorPlugins() {
    const classes = classesOfTheTableParts(this.options.size);

    return [
      new Plugin<DecorationSet>({
        key: tableClassesKey,
        state: {
          init: (_, state) => decorateTableParts(state.doc, classes),
          apply: (tr, decorations) =>
            tr.docChanged ? decorateTableParts(tr.doc, classes) : decorations,
        },
        props: {
          decorations: (state) => tableClassesKey.getState(state) as DecorationSet,
        },
      }),
    ];
  },
});

export function tableExtensions(
  { Table, TableRow, TableHeader, TableCell }: TableModule,
  size: IdsSize,
) {
  const ScrollingTable = Table.extend<TiptapTable.TableOptions & { size: IdsSize }>({
    addOptions() {
      return { ...(this.parent?.() as TiptapTable.TableOptions), size };
    },

    addNodeView() {
      return ReactNodeViewRenderer(EditorTableView, { contentDOMElementTag: 'tbody' });
    },
  });

  return [
    ScrollingTable.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    TableClasses.configure({ size }),
  ];
}
