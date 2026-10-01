'use client';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImageViewerCloseProps = ImageViewerButtonProps;

export function ImageViewerClose(props: ImageViewerCloseProps) {
  const viewer = useImageViewerContext('Image.Viewer.Close');
  const t = useTranslate();

  return (
    <ViewerButton
      {...props}
      label={t('image.close')}
      glyph={<XMarkIcon aria-hidden="true" />}
      act={viewer.close}
      quiet
    />
  );
}

ImageViewerClose.displayName = 'Image.Viewer.Close';
