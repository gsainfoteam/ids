'use client';

import { type ComponentProps, type MouseEvent } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { Button } from '../../../action/button';
import { useInternalImageViewerContext } from '../context';

import type { SurfaceVariant } from '../../../../internal/surfaces/lib/control-surface';
import type { IdsSize } from '../../../../tokens/types';

export type ImageViewerZoomResetProps = Omit<ComponentProps<'button'>, 'children' | 'color'> & {
  variant?: SurfaceVariant;
  size?: IdsSize;
};

export function ImageViewerZoomReset({
  variant = 'ghost',
  size,
  className,
  disabled,
  onClick,
  ...rest
}: ImageViewerZoomResetProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.ZoomReset');
  const t = useInternalTranslate();
  const percent = Math.round(viewer.zoom * 100);

  return (
    <Button
      {...rest}
      aria-label={rest['aria-label'] ?? t('image.zoomReset', { percent })}
      variant={variant}
      size={size}
      disabled={disabled || !viewer.canResetZoom}
      focusableWhenDisabled
      data-image-viewer-zoom-reset=""
      className={viewer.styles.zoomReset({ className })}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) viewer.resetZoom();
      }}
    >
      {t('image.zoomLevel', { percent })}
    </Button>
  );
}

ImageViewerZoomReset.displayName = 'Image.Viewer.ZoomReset';
