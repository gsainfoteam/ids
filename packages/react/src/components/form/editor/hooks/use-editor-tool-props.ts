'use client';

import { use, type MouseEvent } from 'react';

import { EditorBarContext } from '../context';

const keepFocusWhereItWas = (event: MouseEvent) => event.preventDefault();

export function useInternalEditorToolProps(name: string, { keepFocus = true } = {}) {
  const bar = use(EditorBarContext);

  return {
    onMouseDown: keepFocus ? keepFocusWhereItWas : undefined,
    ...(bar && {
      'data-editor-tool': bar.id,
      'data-value': name,
      tabIndex: bar.tabStop === undefined ? undefined : bar.tabStop === name ? 0 : -1,
      onFocus: () => bar.onItemFocus(name),
      onKeyDown: bar.onItemKeyDown,
    }),
  };
}
