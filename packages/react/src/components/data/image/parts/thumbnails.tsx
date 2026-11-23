'use client';

import { useEffect, useRef, type ComponentProps } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { ScrollArea } from '../../../layout/scroll-area';
import { useInternalImageViewerContext } from '../context';

export type ImageViewerThumbnailsProps = Omit<ComponentProps<'div'>, 'children'>;

export function ImageViewerThumbnails({ className, ...rest }: ImageViewerThumbnailsProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.Thumbnails');
  const t = useInternalTranslate();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-current]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [viewer.index]);

  if (viewer.count <= 1) return null;

  return (
    <ScrollArea
      {...rest}
      orientation="horizontal"
      data-image-viewer-thumbnails=""
      className={viewer.styles.thumbnails({ className })}
    >
      <ScrollArea.Viewport
        ref={listRef}
        role="group"
        aria-label={t('image.thumbnails')}
        className={viewer.styles.thumbnailList()}
      >
        {viewer.items.map((item, index) => {
          const current = index === viewer.index;
          const name =
            item.alt.trim() || t('slides.slide', { index: index + 1, count: viewer.count });

          return (
            <button
              key={item.key}
              type="button"
              aria-label={name}
              aria-current={current || undefined}
              data-current={current ? '' : undefined}
              className={viewer.styles.thumbnail()}
              onClick={() => viewer.goTo(index)}
            >
              <img
                src={item.thumbnail ?? item.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className={viewer.styles.thumbnailImage()}
              />
            </button>
          );
        })}
      </ScrollArea.Viewport>
    </ScrollArea>
  );
}

ImageViewerThumbnails.displayName = 'Image.Viewer.Thumbnails';
