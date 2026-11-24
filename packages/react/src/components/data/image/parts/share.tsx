'use client';

import { ShareIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';

import { useInternalImageViewerContext } from '../context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useInternalTranslate } from '../../../../internal/translate';

export type ImageViewerShareProps = ImageViewerButtonProps;

const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export function ImageViewerShare(props: ImageViewerShareProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.Share');
  const t = useInternalTranslate();
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
    />
  );
}

ImageViewerShare.displayName = 'Image.Viewer.Share';
