import { InputRule } from '@tiptap/core';
import { findWrapping } from '@tiptap/pm/transform';

import { calloutKindOf } from '../../../typography/rich-text/schema/callout';

import type { NodeType } from '@tiptap/pm/model';

const TYPED_ALERT = /^\s*>?\s?\[!(note|tip|important|warning|caution)\]\s$/i;

export function typedAlert(callout: NodeType) {
  return new InputRule({
    find: TYPED_ALERT,
    handler: ({ state, range, match }) => {
      const attributes = { kind: calloutKindOf(match[1]) };
      const tr = state.tr.delete(range.from, range.to);
      const $start = tr.doc.resolve(range.from);
      const opensAQuote = $start.node(-1).type.name === 'blockquote' && $start.index(-1) === 0;

      if (opensAQuote) {
        tr.setNodeMarkup($start.before(-1), callout, attributes);
        return;
      }

      const block = $start.blockRange();
      const wrapping = block && findWrapping(block, callout, attributes);
      if (!block || !wrapping) return null;
      tr.wrap(block, wrapping);
    },
  });
}
