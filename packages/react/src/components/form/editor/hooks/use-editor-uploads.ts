'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { toast } from '../../../feedback/toast/lib/toast-store';
import { isImageFile, type ImageUpload } from '../image/types';

import type { Translate } from '../../../../internal/translate';
import type { FeatureExtensions } from '../lib/load-engine';
import type { Editor as TiptapEditor } from '@tiptap/core';

export function useInternalEditorUploads({
  features,
  onImageUpload,
  t,
}: {
  features: FeatureExtensions | undefined;
  onImageUpload: ImageUpload | undefined;
  t: Translate;
}) {
  const [uploaded] = useState(() => new Set<string>());
  const [pending, setPending] = useState(0);

  const latestUpload = useRef(onImageUpload);
  useLayoutEffect(() => {
    latestUpload.current = onImageUpload;
  });

  const start = (instance: TiptapEditor, files: readonly File[], at: number) => {
    const upload = latestUpload.current;
    const uploadImage = features?.imageUpload?.uploadImage;
    if (!upload || !uploadImage) return;
    const accepted = files.filter(isImageFile);
    for (const file of files.filter((candidate) => !isImageFile(candidate))) toast.error(file.name);
    setPending((count) => count + accepted.length);
    for (const file of accepted)
      void uploadImage(instance, file, at, { upload, uploaded })
        .catch(() => toast.error(t('editor.imageUploadFailed'), { description: file.name }))
        .finally(() => setPending((count) => count - 1));
  };

  return { uploaded, pending, start };
}
