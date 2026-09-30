'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { ArrowDownTrayIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';

import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type ImageViewerDownloadProps = Omit<ComponentProps<'a'>, 'children' | 'href' | 'color'> & {
  variant?: IdsVariant;
  size?: IdsSize;
  icon?: ReactElement;
};

export function ImageViewerDownload({
  variant = 'ghost',
  size,
  icon,
  download = '',
  ...rest
}: ImageViewerDownloadProps) {
  const viewer = useImageViewerContext('Image.Viewer.Download');
  const t = useTranslate();
  const src = viewer.item?.src;
  if (!src) return null;

  return (
    <IconButton
      asChild
      variant={variant}
      size={size}
      icon={icon ?? <ArrowDownTrayIcon aria-hidden="true" />}
    >
      <a
        {...rest}
        aria-label={rest['aria-label'] ?? t('image.download')}
        href={src}
        download={download}
        data-image-viewer-download=""
      />
    </IconButton>
  );
}

ImageViewerDownload.displayName = 'Image.Viewer.Download';
