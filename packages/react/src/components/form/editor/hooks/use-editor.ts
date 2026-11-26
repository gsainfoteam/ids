'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';

import type { ImageUpload } from '../image/types';
import type { FindMentions } from '../mention/node';

export type EditorImageUploadOptions = {
  onUpload: ImageUpload;
};

export type EditorMentionOptions = {
  find: FindMentions;
};

export type UseEditorOptions = {
  imageUpload?: EditorImageUploadOptions;
  mentions?: EditorMentionOptions;
};

export type EditorInstance = {
  imageUpload: EditorImageUploadOptions | undefined;
  mentions: EditorMentionOptions | undefined;
};

export function useEditor(options: UseEditorOptions = {}): EditorInstance {
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });

  const uploadsImages = options.imageUpload !== undefined;
  const findsMentions = options.mentions !== undefined;

  return useMemo(
    () => ({
      imageUpload: uploadsImages
        ? {
            onUpload: async (file: File) => {
              const upload = latest.current.imageUpload?.onUpload;
              if (!upload) throw new Error('The image upload was turned off while it ran.');
              return upload(file);
            },
          }
        : undefined,
      mentions: findsMentions
        ? {
            find: (query: string, signal: AbortSignal) =>
              latest.current.mentions?.find(query, signal) ?? [],
          }
        : undefined,
    }),
    [uploadsImages, findsMentions],
  );
}
