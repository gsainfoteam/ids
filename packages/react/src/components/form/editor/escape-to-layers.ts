import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

export const LeaveEscapeToTheLayers = Extension.create({
  name: 'idsLeaveEscapeToTheLayers',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            keydown: (_view, event) => event.key === 'Escape' && !event.isComposing,
          },
        },
      }),
    ];
  },
});
