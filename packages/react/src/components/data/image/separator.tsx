'use client';

import { useImageViewerContext } from './context';
import { Divider } from '../../layout/divider';

export type ImageViewerSeparatorProps = Omit<
  Divider.Props,
  'orientation' | 'decorative' | 'className' | 'children'
> & { className?: string };

export function ImageViewerSeparator({ className, ...rest }: ImageViewerSeparatorProps) {
  const viewer = useImageViewerContext('Image.Viewer.Separator');

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
