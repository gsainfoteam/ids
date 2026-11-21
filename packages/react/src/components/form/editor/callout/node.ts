import { ReactNodeViewRenderer } from '@tiptap/react';

import { typedAlert } from './input-rule';
import { EditorCalloutView } from './view';
import { Callout } from '../../../typography/rich-text/schema/callout';

export const EditorCalloutNode = Callout.extend({
  addNodeView() {
    return ReactNodeViewRenderer(EditorCalloutView);
  },

  addInputRules() {
    return [typedAlert(this.type)];
  },
});
