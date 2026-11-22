import { matchesKeyboardEvent, type Hotkey } from '@tanstack/react-hotkeys';

import { isComposingKey } from '../../../../internal/keys';

import type { PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';

export type SuggestionView<Item> = {
  open: boolean;
  items: readonly Item[];
  loading: boolean;
  query: string;
  highlighted: number;
  anchor: (() => DOMRect | null) | null;
};

export type SuggestionStore<Item> = ReturnType<typeof createSuggestionStore<Item>>;

const NEXT: readonly Hotkey[] = ['ArrowDown', 'Control+N'];
const PREVIOUS: readonly Hotkey[] = ['ArrowUp', 'Control+P'];
const CHOOSE: readonly Hotkey[] = ['Enter', 'Tab'];

const pressed = (event: KeyboardEvent, hotkeys: readonly Hotkey[]) =>
  hotkeys.some((hotkey) => matchesKeyboardEvent(event, hotkey));

export function createSuggestionStore<Item>(key: PluginKey) {
  const closed: SuggestionView<Item> = {
    open: false,
    items: [],
    loading: false,
    query: '',
    highlighted: 0,
    anchor: null,
  };
  let view = closed;
  let pick: ((item: Item) => void) | null = null;
  const listeners = new Set<() => void>();

  const publish = (next: SuggestionView<Item>) => {
    view = next;
    for (const listener of listeners) listener();
  };

  const show = (props: SuggestionProps<Item, Item>) => {
    pick = props.command;
    publish({
      open: true,
      items: props.items,
      loading: props.loading,
      query: props.query,
      highlighted: 0,
      anchor: props.clientRect ?? null,
    });
  };

  const move = (step: number) => {
    const count = view.items.length;
    if (count === 0) return;
    publish({ ...view, highlighted: (view.highlighted + step + count) % count });
  };

  const choose = (index = view.highlighted) => {
    const item = view.items[index];
    if (item === undefined || !pick) return false;
    pick(item);
    return true;
  };

  const onKeyDown = ({ event }: SuggestionKeyDownProps) => {
    if (isComposingKey(event)) return false;
    if (pressed(event, NEXT)) {
      move(1);
      return true;
    }
    if (pressed(event, PREVIOUS)) {
      move(-1);
      return true;
    }
    return pressed(event, CHOOSE) && choose();
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => view,
    highlight: (index: number) => publish({ ...view, highlighted: index }),
    choose,
    dismiss: (editorView: EditorView) =>
      editorView.dispatch(editorView.state.tr.setMeta(key, { exit: true })),
    pluginKey: key,
    render: () => ({
      onStart: show,
      onUpdate: show,
      onExit: () => {
        pick = null;
        publish(closed);
      },
      onKeyDown,
    }),
  };
}
