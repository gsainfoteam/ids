'use client';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useInternalImageViewerContext } from '../context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useInternalTranslate } from '../../../../internal/translate';

export type ImageViewerCloseProps = ImageViewerButtonProps;

export function ImageViewerClose(props: ImageViewerCloseProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.Close');
  const t = useInternalTranslate();

  return (
    <ViewerButton
      {...props}
      label={t('image.close')}
      glyph={<XMarkIcon aria-hidden="true" />}
      act={viewer.close}
    />
  );
}

ImageViewerClose.displayName = 'Image.Viewer.Close';
