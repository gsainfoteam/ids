'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { Avatar } from '../../../data/avatar';
import { editorMessages } from '../messages-catalog';
import { editorStyle } from '../style';
import { EditorSuggestionPopup } from '../suggestion/popup';

import type { EditorMention } from './node';
import type { SuggestionStore } from '../suggestion/store';

const styles = editorStyle();

export function EditorMentionMenu({ store }: { store: SuggestionStore<EditorMention> }) {
  const t = useInternalTranslate(editorMessages);

  return (
    <EditorSuggestionPopup
      store={store}
      label={t('editor.mentionMenu')}
      keyOf={(mention) => mention.id}
      status={({ loading }) => (loading ? t('editor.mentionSearching') : t('editor.mentionEmpty'))}
    >
      {(mention) => (
        <>
          <Avatar size="tiny" src={mention.avatar} name={mention.label} />
          <span className={styles.mentionText()}>
            <span className={styles.mentionLabel()}>{mention.label}</span>
            {mention.description && (
              <span className={styles.mentionDescription()}>{mention.description}</span>
            )}
          </span>
        </>
      )}
    </EditorSuggestionPopup>
  );
}
