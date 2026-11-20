import type { ChainedCommands } from '@tiptap/core';

export const NEW_TABLE = { rows: 3, cols: 3, withHeaderRow: true };

const leaveALineAfterATableAtTheEnd = (chain: ChainedCommands) =>
  chain.command(({ tr, state }) => {
    if (tr.doc.lastChild?.type.name === 'table')
      tr.insert(tr.doc.content.size, state.schema.nodes.paragraph.create());
    return true;
  });

export const insertTable = (chain: ChainedCommands) =>
  leaveALineAfterATableAtTheEnd(chain.insertTable(NEW_TABLE));
