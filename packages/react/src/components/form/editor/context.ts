'use client';

import { createContext, use, type KeyboardEvent, type ReactNode } from 'react';

import { invariant } from '../../../utils';

import type { editorStyle } from './style';
import type { IdsSize } from '../../../tokens/types';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { EditorContent } from '@tiptap/react';

export type EditorImages = {
  upload: (files: readonly File[], at: number) => void;
  pending: number;
};

export type EditorContextValue = {
  editor: TiptapEditor | null;
  editable: boolean;
  disabled: boolean;
  readOnly: boolean;
  size: IdsSize;
  contentId: string;
  countId: string;
  maxLength: number | undefined;
  contentAttributes: Record<string, string>;
  bubbles: ReactNode;
  images: EditorImages | null;
  styles: ReturnType<typeof editorStyle>;
  EngineContent: typeof EditorContent | null;
};

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditorContext(part: string) {
  const context = use(EditorContext);
  invariant(context != null, `\`<${part}>\` must be used inside \`<Editor>\`.`);
  return context;
}

export type EditorBarContextValue = {
  id: string;
  tabStop: string | null | undefined;
  onItemFocus: (value: string) => void;
  onItemKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export const EditorBarContext = createContext<EditorBarContextValue | null>(null);
