'use client';

import { useTranslate } from '../../../../internal/translate';
import { editorMessages } from '../messages-catalog';
import { EditorSuggestionPopup } from '../suggestion/popup';

import type { EditorBlock } from '../blocks/catalog';
import type { SuggestionStore } from '../suggestion/store';

export function EditorSlashMenu({ store }: { store: SuggestionStore<EditorBlock> }) {
  const t = useTranslate(editorMessages);

  return (
    <EditorSuggestionPopup
      store={store}
      label={t('editor.slashMenu')}
      keyOf={(block) => block.id}
      status={() => t('editor.slashMenuEmpty')}
    >
      {(block) => (
        <>
          {block.icon}
          {block.label(t)}
        </>
      )}
    </EditorSuggestionPopup>
  );
}
