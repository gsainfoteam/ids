import { once } from 'es-toolkit';

import type * as Engine from './engine';
import type { EditorFormat } from './value';
import type { AnyExtension } from '@tiptap/core';

export type LoadedEngine = {
  format: EditorFormat;
  engine: typeof Engine;
  markdown: AnyExtension | undefined;
};

const loadTheEngine = once(() => import('./engine'));

const loadMarkdown = once(() => import('@tiptap/markdown').then((module) => module.Markdown));

export async function loadEngine(format: EditorFormat): Promise<LoadedEngine> {
  const [engine, markdown] = await Promise.all([
    loadTheEngine(),
    format === 'markdown' ? loadMarkdown() : undefined,
  ]);
  return { format, engine, markdown };
}
