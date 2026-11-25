'use client';

import { use, useLayoutEffect } from 'react';

import { useInternalEditorSelector } from './use-editor-selector';
import { FieldNotifyContext } from '../../field/context';
import { formText, isEmptyValue, type EditorValue } from '../lib/value';

import type { Editor as TiptapEditor } from '@tiptap/core';

export function useInternalEditorSubmitted(
  editor: TiptapEditor | null,
  current: EditorValue | undefined,
) {
  const notifyField = use(FieldNotifyContext);

  const empty = useInternalEditorSelector(
    editor,
    (instance) => instance.isEmpty,
    isEmptyValue(current),
  );

  const submitted = formText(current, empty);
  useLayoutEffect(() => {
    notifyField?.();
  }, [notifyField, submitted]);

  return { empty, submitted };
}
