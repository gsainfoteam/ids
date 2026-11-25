import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

import { isComposingKey } from '../../../../internal/lib/keys';
import { aSuggestionIsOpen } from '../suggestion/keys';

export const LeaveEscapeToTheLayers = Extension.create({
  name: 'idsLeaveEscapeToTheLayers',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            keydown: (view, event) =>
              event.key === 'Escape' && !isComposingKey(event) && !aSuggestionIsOpen(view.state),
          },
        },
      }),
    ];
  },
});
