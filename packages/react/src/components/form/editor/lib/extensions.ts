import { warnOnce } from '../../../../utils/dev';

import type { Editor as TiptapEditor } from '@tiptap/core';

export const hasExtension = (editor: TiptapEditor, name: string) =>
  editor.extensionManager.extensions.some((extension) => extension.name === name);

function warnTheExtensionIsMissing(part: string) {
  warnOnce(
    `\`<Editor.${part}>\` found no extension to drive. Place it directly in \`<Editor>\` or \`<Editor.BubbleMenu>\`, not inside a component of your own, so Editor sees it and loads the extension.`,
  );
}

export function extensionIsLoaded(editor: TiptapEditor | null, part: string, name?: string) {
  const loaded = name === undefined || editor === null || hasExtension(editor, name);
  if (!loaded) warnTheExtensionIsMissing(part);
  return loaded;
}
