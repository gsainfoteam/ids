import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { EditorDetailsView } from './view';

const EditorDetailsNode = Details.extend({
  addNodeView() {
    return ReactNodeViewRenderer(EditorDetailsView);
  },
});

const SummaryDrawnAsText = DetailsSummary.extend({
  addNodeView() {
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('div');
      dom.dataset.type = this.name;
      for (const [name, value] of Object.entries(HTMLAttributes)) dom.setAttribute(name, value);
      return { dom, contentDOM: dom };
    };
  },
});

const ContentHiddenByItsDetails = DetailsContent.extend({
  addNodeView() {
    return null;
  },
});

export const detailsExtensions = [
  EditorDetailsNode.configure({ persist: true }),
  SummaryDrawnAsText,
  ContentHiddenByItsDetails,
];
