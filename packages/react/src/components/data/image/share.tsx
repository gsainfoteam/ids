'use client';

import { ShareIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImageViewerShareProps = ImageViewerButtonProps;

const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export function ImageViewerShare(props: ImageViewerShareProps) {
  const viewer = useImageViewerContext('Image.Viewer.Share');
  const t = useTranslate();
  const item = viewer.item;
  if (!item || !canShare()) return null;

  const share = () => {
    const url = new URL(item.src, document.baseURI).href;
    navigator.share({ title: item.alt.trim() || undefined, url }).catch(noop);
  };

  return (
    <ViewerButton
      {...props}
      label={t('image.share')}
      glyph={<ShareIcon aria-hidden="true" />}
      act={share}
      quiet
    />
  );
}

ImageViewerShare.displayName = 'Image.Viewer.Share';
