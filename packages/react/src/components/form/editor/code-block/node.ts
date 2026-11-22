import { CodeBlock } from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { codeHighlight } from './highlight';
import { EditorCodeBlockView } from './view';

export const EditorCodeBlockNode = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(EditorCodeBlockView);
  },

  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), codeHighlight];
  },
});
