'use client';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImageCloseProps = ImageViewerButtonProps;

export function ImageClose(props: ImageCloseProps) {
  const viewer = useImageViewerContext('Image.Close');
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

ImageClose.displayName = 'Image.Close';
