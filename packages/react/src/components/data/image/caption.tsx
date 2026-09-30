'use client';

import { type ComponentProps } from 'react';

import { useImageViewerContext } from './context';

export type ImageCaptionProps = Omit<ComponentProps<'div'>, 'children'>;

export function ImageCaption({ className, ...rest }: ImageCaptionProps) {
  const viewer = useImageViewerContext('Image.Caption');
  const caption = viewer.item?.caption;
  if (caption === undefined || caption === null || caption === false || caption === '') return null;

  return (
    <div {...rest} data-image-viewer-caption="" className={viewer.styles.caption({ className })}>
      {caption}
    </div>
  );
}

ImageCaption.displayName = 'Image.Caption';
