'use client';

import { type ComponentProps } from 'react';

import { useImageViewerContext } from './context';

export type ImageViewerCaptionProps = Omit<ComponentProps<'div'>, 'children'>;

export function ImageViewerCaption({ className, ...rest }: ImageViewerCaptionProps) {
  const viewer = useImageViewerContext('Image.Viewer.Caption');
  const caption = viewer.item?.caption;
  if (caption === undefined || caption === null || caption === false || caption === '') return null;

  return (
    <div {...rest} data-image-viewer-caption="" className={viewer.styles.caption({ className })}>
      {caption}
    </div>
  );
}

ImageViewerCaption.displayName = 'Image.Viewer.Caption';
