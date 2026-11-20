import { once } from 'es-toolkit';

import type * as Engine from './engine';
import type * as ImageUploadModule from './image/upload';
import type * as TaskListModule from './task-list/node';
import type { EditorFormat } from './value';
import type { AnyExtension } from '@tiptap/core';
import type { Highlight } from '@tiptap/extension-highlight';
import type * as TableModule from '@tiptap/extension-table';
import type { TextAlign } from '@tiptap/extension-text-align';

export type EditorParts = {
  highlight: boolean;
  taskList: boolean;
  textAlign: boolean;
  table: boolean;
  imageUpload: boolean;
};

export type PartExtensions = {
  highlight: typeof Highlight | undefined;
  taskList: typeof TaskListModule.taskListExtensions | undefined;
  textAlign: typeof TextAlign | undefined;
  table: typeof TableModule | undefined;
  imageUpload: typeof ImageUploadModule | undefined;
};

export type LoadedEngine = {
  key: string;
  engine: typeof Engine;
  markdown: AnyExtension | undefined;
  parts: PartExtensions;
};

export const engineKey = (format: EditorFormat, parts: EditorParts) =>
  [
    format,
    ...Object.entries(parts)
      .filter(([, used]) => used)
      .map(([part]) => part),
  ].join(' ');

const loadTheEngine = once(() => import('./engine'));

const loadMarkdown = once(() => import('@tiptap/markdown').then((module) => module.Markdown));

const loadHighlight = once(() =>
  import('@tiptap/extension-highlight').then((module) => module.Highlight),
);

const loadTaskList = once(() =>
  import('./task-list/node').then((module) => module.taskListExtensions),
);

const loadTextAlign = once(() =>
  import('@tiptap/extension-text-align').then((module) => module.TextAlign),
);

const loadTable = once(() => import('@tiptap/extension-table'));

const loadImageUpload = once(() => import('./image/upload'));

export async function loadEngine(format: EditorFormat, parts: EditorParts): Promise<LoadedEngine> {
  const [engine, markdown, highlight, taskList, textAlign, table, imageUpload] = await Promise.all([
    loadTheEngine(),
    format === 'markdown' ? loadMarkdown() : undefined,
    parts.highlight ? loadHighlight() : undefined,
    parts.taskList ? loadTaskList() : undefined,
    parts.textAlign ? loadTextAlign() : undefined,
    parts.table ? loadTable() : undefined,
    parts.imageUpload ? loadImageUpload() : undefined,
  ]);
  return {
    key: engineKey(format, parts),
    engine,
    markdown,
    parts: { highlight, taskList, textAlign, table, imageUpload },
  };
}
