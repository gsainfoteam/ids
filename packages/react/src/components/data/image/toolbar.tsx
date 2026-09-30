'use client';

import { type ComponentProps } from 'react';

import { ImageClose } from './close';
import { useImageViewerContext } from './context';
import { ImageCounter } from './counter';
import { ImageDownload } from './download';
import { ImageZoomIn } from './zoom-in';
import { ImageZoomOut } from './zoom-out';

export type ImageToolbarProps = ComponentProps<'div'>;

export function ImageToolbar({ className, children, ...rest }: ImageToolbarProps) {
  const viewer = useImageViewerContext('Image.Toolbar');

  return (
    <div {...rest} data-image-viewer-toolbar="" className={viewer.styles.toolbar({ className })}>
      {children ?? (
        <>
          <ImageCounter />
          <ImageZoomIn />
          <ImageZoomOut />
          <ImageDownload />
          <ImageClose />
        </>
      )}
    </div>
  );
}

ImageToolbar.displayName = 'Image.Toolbar';
