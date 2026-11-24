'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { Translate } from '../../../../internal/translate';
import type { IdsSize } from '../../../../tokens/types';
import type { LoadedEngine } from '../lib/load-engine';
import type { FindMentions } from '../mention/node';
import type { Editor as TiptapEditor } from '@tiptap/core';

type StartUploads = (instance: TiptapEditor, files: File[], at: number) => void;

function taskLabelIn(t: Translate) {
  return (text: string) =>
    text === '' ? t('editor.taskItemEmpty') : t('editor.taskItem', { text });
}

export function useInternalEditorSetup({
  loaded,
  size,
  maxLength,
  withHandle,
  uploaded,
  startUploads,
  mentions,
  t,
}: {
  loaded: LoadedEngine | null;
  size: IdsSize;
  maxLength: number | undefined;
  withHandle: boolean;
  uploaded: ReadonlySet<string>;
  startUploads: StartUploads;
  mentions: FindMentions | undefined;
  t: Translate;
}) {
  const latest = useRef({ startUploads, mentions, t });
  useLayoutEffect(() => {
    latest.current = { startUploads, mentions, t };
  });

  const [callIntoTheLatestRender] = useState(() => ({
    startUploads: ((instance, files, at) =>
      latest.current.startUploads(instance, files, at)) satisfies StartUploads,
    taskLabel: (text: string) => taskLabelIn(latest.current.t)(text),
    t: ((key, values) => latest.current.t(key, values)) satisfies Translate,
    findMentions: ((query, signal) =>
      latest.current.mentions?.(query, signal) ?? []) satisfies FindMentions,
  }));

  return useMemo(
    () =>
      loaded?.engine.extensionsFor({
        size,
        maxLength,
        markdown: loaded.markdown,
        features: loaded.features,
        images: { uploaded, start: callIntoTheLatestRender.startUploads },
        taskLabel: callIntoTheLatestRender.taskLabel,
        t: callIntoTheLatestRender.t,
        findMentions: callIntoTheLatestRender.findMentions,
        withHandle,
      }),
    [loaded, size, maxLength, uploaded, callIntoTheLatestRender, withHandle],
  );
}
