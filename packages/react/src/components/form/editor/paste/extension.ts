import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

import { cleanPastedHtml } from './clean-html';

export const CleanPastedHtml = Extension.create({
  name: 'idsCleanPastedHtml',
  addProseMirrorPlugins() {
    return [new Plugin({ props: { transformPastedHTML: cleanPastedHtml } })];
  },
});
