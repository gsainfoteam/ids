'use client';

import { Divider } from '../../../layout/divider';
import { useInternalImageViewerContext } from '../context';

export type ImageViewerSeparatorProps = Omit<
  Divider.Props,
  'orientation' | 'aria-hidden' | 'className' | 'children'
> & { className?: string };

export function ImageViewerSeparator({ className, ...rest }: ImageViewerSeparatorProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.Separator');

  return (
    <Divider
      {...rest}
      orientation="vertical"
      aria-hidden
      data-image-viewer-separator=""
      className={viewer.styles.separator({ className })}
    />
  );
}

ImageViewerSeparator.displayName = 'Image.Viewer.Separator';
