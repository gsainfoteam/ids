import { once } from 'es-toolkit';

import type * as Engine from './engine';
import type * as TaskListModule from './task-item-node';
import type { EditorFormat } from './value';
import type { AnyExtension } from '@tiptap/core';
import type { Highlight } from '@tiptap/extension-highlight';
import type { TextAlign } from '@tiptap/extension-text-align';

export type EditorParts = { highlight: boolean; taskList: boolean; textAlign: boolean };

export type PartExtensions = {
  highlight: typeof Highlight | undefined;
  taskList: typeof TaskListModule.taskListExtensions | undefined;
  textAlign: typeof TextAlign | undefined;
};

export type LoadedEngine = {
  key: string;
  engine: typeof Engine;
  markdown: AnyExtension | undefined;
  parts: PartExtensions;
};

export const engineKey = (format: EditorFormat, { highlight, taskList, textAlign }: EditorParts) =>
  [format, highlight && 'highlight', taskList && 'taskList', textAlign && 'textAlign']
    .filter(Boolean)
    .join(' ');

const loadTheEngine = once(() => import('./engine'));

const loadMarkdown = once(() => import('@tiptap/markdown').then((module) => module.Markdown));

const loadHighlight = once(() =>
  import('@tiptap/extension-highlight').then((module) => module.Highlight),
);

const loadTaskList = once(() =>
  import('./task-item-node').then((module) => module.taskListExtensions),
);

const loadTextAlign = once(() =>
  import('@tiptap/extension-text-align').then((module) => module.TextAlign),
);

export async function loadEngine(format: EditorFormat, parts: EditorParts): Promise<LoadedEngine> {
  const [engine, markdown, highlight, taskList, textAlign] = await Promise.all([
    loadTheEngine(),
    format === 'markdown' ? loadMarkdown() : undefined,
    parts.highlight ? loadHighlight() : undefined,
    parts.taskList ? loadTaskList() : undefined,
    parts.textAlign ? loadTextAlign() : undefined,
  ]);
  return { key: engineKey(format, parts), engine, markdown, parts: { highlight, taskList, textAlign } };
}
