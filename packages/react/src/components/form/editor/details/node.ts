import {
  Details,
  DetailsContent,
  DetailsSummary,
  type DetailsOptions,
} from '@tiptap/extension-details';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { EditorDetailsView } from './view';
import { cn } from '../../../../utils';
import { accordionStyle } from '../../../data/accordion/style';

import type { IdsSize } from '../../../../tokens/types';

export type EditorDetailsOptions = DetailsOptions & { size: IdsSize };

const EditorDetailsNode = Details.extend<EditorDetailsOptions>({
  addOptions() {
    return { ...(this.parent?.() as DetailsOptions), size: 'standard' };
  },

  addNodeView() {
    return ReactNodeViewRenderer(EditorDetailsView);
  },
});

function blockDrawnWith(type: string, className: string) {
  return ({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) => {
    const dom = document.createElement('div');
    for (const [name, value] of Object.entries(HTMLAttributes)) dom.setAttribute(name, value);
    dom.dataset.type = type;
    dom.className = className;
    return { dom, contentDOM: dom };
  };
}

export function detailsExtensions(size: IdsSize) {
  const styles = accordionStyle({ variant: 'outline', size });

  return [
    EditorDetailsNode.configure({ persist: true, size }),
    DetailsSummary.extend({
      addNodeView() {
        return blockDrawnWith(
          this.name,
          styles.trigger({ className: cn('block cursor-text pe-8') }),
        );
      },
    }),
    DetailsContent.extend({
      addNodeView() {
        return blockDrawnWith(this.name, styles.body());
      },
    }),
  ];
}
