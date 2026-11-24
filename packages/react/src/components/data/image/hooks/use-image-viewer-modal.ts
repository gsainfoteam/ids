'use client';

import { useState } from 'react';

import { useInternalLayer } from '../../../../internal/overlay';

import type { ImageViewerSource } from '../parts/viewer';

type ModalOptions = {
  source: ImageViewerSource;
  content: HTMLElement | null;
  close: () => void;
};

export function useInternalImageViewerModal({ source, content, close }: ModalOptions) {
  const [stacked, setStacked] = useState(false);

  const layer = useInternalLayer(source.open, {
    kind: 'modal',
    element: () => content,
    anchor: () => source.opener,
    onDismiss: (reason) => {
      if (reason === 'escape-key') close();
    },
    onPositionChange: ({ modalsBelow }) => setStacked(modalsBelow > 0),
  });

  return { layer, stacked };
}
