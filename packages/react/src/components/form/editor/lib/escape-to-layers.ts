import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

import { aSuggestionIsOpen } from '../suggestion/keys';

export const LeaveEscapeToTheLayers = Extension.create({
  name: 'idsLeaveEscapeToTheLayers',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            keydown: (view, event) =>
              event.key === 'Escape' && !event.isComposing && !aSuggestionIsOpen(view.state),
          },
        },
      }),
    ];
  },
});
