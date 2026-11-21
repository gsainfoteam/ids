import { PluginKey, type EditorState } from '@tiptap/pm/state';

type SuggestionActivity = { active: boolean };

export const slashMenuKey = new PluginKey<SuggestionActivity>('idsSlashMenu');
export const mentionMenuKey = new PluginKey<SuggestionActivity>('idsMentionMenu');

export const aSuggestionIsOpen = (state: EditorState) =>
  [slashMenuKey, mentionMenuKey].some((key) => key.getState(state)?.active === true);
