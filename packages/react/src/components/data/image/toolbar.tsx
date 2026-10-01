'use client';

import { type ComponentProps } from 'react';

import { ImageViewerClose } from './close';
import { useImageViewerContext } from './context';
import { ImageViewerCounter } from './counter';
import { ImageViewerDownload } from './download';
import { ImageViewerZoomIn } from './zoom-in';
import { ImageViewerZoomOut } from './zoom-out';

export type ImageViewerToolbarProps = ComponentProps<'div'>;

export function ImageViewerToolbar({ className, children, ...rest }: ImageViewerToolbarProps) {
  const viewer = useImageViewerContext('Image.Viewer.Toolbar');

  return (
    <div {...rest} data-image-viewer-toolbar="" className={viewer.styles.toolbar({ className })}>
      {children ?? (
        <>
          <ImageViewerCounter />
          <ImageViewerZoomIn />
          <ImageViewerZoomOut />
          <ImageViewerDownload />
          <ImageViewerClose />
        </>
      )}
    </div>
  );
}

ImageViewerToolbar.displayName = 'Image.Viewer.Toolbar';
