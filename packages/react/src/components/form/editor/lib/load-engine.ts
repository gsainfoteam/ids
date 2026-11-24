import { once } from 'es-toolkit';

import type { EditorFormat } from './value';
import type { IdsSize } from '../../../../tokens/types';
import type * as Engine from '../parts/engine';
import type { AnyExtension } from '@tiptap/core';

const FEATURE_LOADERS = {
  highlight: once(() =>
    import('../../../typography/rich-text/schema/color').then((module) => module.DocumentHighlight),
  ),
  textColor: once(() =>
    import('../../../typography/rich-text/schema/color').then((module) => module.DocumentTextColor),
  ),
  subscript: once(() =>
    import('../../../typography/rich-text/schema/script').then(
      (module) => module.DocumentSubscript,
    ),
  ),
  superscript: once(() =>
    import('../../../typography/rich-text/schema/script').then(
      (module) => module.DocumentSuperscript,
    ),
  ),
  taskList: once(() => import('../task-list/node').then((module) => module.taskListExtensions)),
  textAlign: once(() => import('@tiptap/extension-text-align').then((module) => module.TextAlign)),
  table: once(() =>
    Promise.all([import('@tiptap/extension-table'), import('../table/node')]).then(
      ([module, { tableExtensions }]) =>
        (size: IdsSize) =>
          tableExtensions(module, size),
    ),
  ),
  imageUpload: once(() => import('../image/upload')),
  callout: once(() => import('../callout/node').then((module) => module.EditorCalloutNode)),
  details: once(() => import('../details/node').then((module) => module.detailsExtensions)),
  mention: once(() => import('../mention')),
};

export type EditorFeature = keyof typeof FEATURE_LOADERS;

export const EDITOR_FEATURES = Object.keys(FEATURE_LOADERS) as EditorFeature[];

export type FeatureExtensions = {
  [Feature in EditorFeature]?: Awaited<ReturnType<(typeof FEATURE_LOADERS)[Feature]>>;
};

export type LoadedEngine = {
  key: string;
  engine: typeof Engine;
  markdown: AnyExtension | undefined;
  features: FeatureExtensions;
};

export const engineKey = (format: EditorFormat, features: readonly EditorFeature[]) =>
  [format, ...features].join(' ');

const loadTheEngine = once(() => import('../parts/engine'));

const loadMarkdown = once(() => import('@tiptap/markdown').then((module) => module.Markdown));

const loadFeatures = async (features: readonly EditorFeature[]): Promise<FeatureExtensions> =>
  Object.fromEntries(
    await Promise.all(
      features.map(async (feature) => [feature, await FEATURE_LOADERS[feature]()] as const),
    ),
  );

export async function loadEngine(
  format: EditorFormat,
  features: readonly EditorFeature[],
): Promise<LoadedEngine> {
  const [engine, markdown, loaded] = await Promise.all([
    loadTheEngine(),
    format === 'markdown' ? loadMarkdown() : undefined,
    loadFeatures(features),
  ]);
  return { key: engineKey(format, features), engine, markdown, features: loaded };
}
