'use client';

import { type ComponentProps } from 'react';

import { ImageViewerClose } from './close';
import { useImageViewerContext } from './context';
import { ImageViewerCounter } from './counter';
import { ImageViewerDownload } from './download';
import { ImageViewerNext } from './next';
import { ImageViewerPrev } from './prev';
import { ImageViewerSeparator } from './separator';
import { ImageViewerZoomIn } from './zoom-in';
import { ImageViewerZoomOut } from './zoom-out';
import { ImageViewerZoomReset } from './zoom-reset';

export type ImageViewerToolbarProps = ComponentProps<'div'>;

export function ImageViewerToolbar({ className, children, ...rest }: ImageViewerToolbarProps) {
  const viewer = useImageViewerContext('Image.Viewer.Toolbar');
  const several = viewer.count > 1;

  return (
    <div {...rest} data-image-viewer-toolbar="" className={viewer.styles.toolbar({ className })}>
      {children ?? (
        <>
          {several && (
            <>
              <ImageViewerPrev />
              <ImageViewerCounter />
              <ImageViewerNext />
              <ImageViewerSeparator />
            </>
          )}
          <ImageViewerZoomOut />
          <ImageViewerZoomReset className="max-sm:hidden" />
          <ImageViewerZoomIn />
          <ImageViewerSeparator />
          <ImageViewerDownload />
          <ImageViewerSeparator />
          <ImageViewerClose />
        </>
      )}
    </div>
  );
}

ImageViewerToolbar.displayName = 'Image.Viewer.Toolbar';
