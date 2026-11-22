import type { ChainedCommands } from '@tiptap/core';

export type TableSize = { rows: number; cols: number };

export const NEW_TABLE_SIZE: TableSize = { rows: 3, cols: 3 };

const leaveALineAfterATableAtTheEnd = (chain: ChainedCommands) =>
  chain.command(({ tr, state }) => {
    if (tr.doc.lastChild?.type.name === 'table')
      tr.insert(tr.doc.content.size, state.schema.nodes.paragraph.create());
    return true;
  });

export const insertTable = (chain: ChainedCommands, size: TableSize = NEW_TABLE_SIZE) =>
  leaveALineAfterATableAtTheEnd(chain.insertTable({ ...size, withHeaderRow: true }));
