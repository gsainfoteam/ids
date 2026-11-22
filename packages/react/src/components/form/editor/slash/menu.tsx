'use client';

import { useTranslate } from '../../../../internal/translate';
import { EditorSuggestionPopup } from '../suggestion/popup';

import type { EditorBlock } from '../blocks/catalog';
import type { SuggestionStore } from '../suggestion/store';

export function EditorSlashMenu({ store }: { store: SuggestionStore<EditorBlock> }) {
  const t = useTranslate();

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
