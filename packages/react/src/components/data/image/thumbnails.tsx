'use client';

import { useEffect, useRef, type ComponentProps } from 'react';

import { useImageViewerContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { ScrollArea } from '../../layout/scroll-area';

export type ImageThumbnailsProps = Omit<ComponentProps<'div'>, 'children'>;

export function ImageThumbnails({ className, ...rest }: ImageThumbnailsProps) {
  const viewer = useImageViewerContext('Image.Thumbnails');
  const t = useTranslate();
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

ImageThumbnails.displayName = 'Image.Thumbnails';
