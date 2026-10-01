'use client';

import { useState, type CSSProperties, type RefCallback } from 'react';

import { PhotoIcon } from '@heroicons/react/24/outline';

import { useNaturalSize, type Probed } from './use-natural-size';
import { useTranslate } from '../../../internal/translate';
import { Spinner } from '../../feedback/spinner';

import type { imageStyle } from './style';
import type { NaturalSize, ViewerItem } from './use-image-group';
import type { SlideProps } from '../../../internal/slides';

export type ImageViewerSlideProps = {
  item: ViewerItem;
  slide: SlideProps;
  near: boolean;
  current: boolean;
  attachArea: RefCallback<HTMLElement>;
  attachBox: RefCallback<HTMLElement>;
  styles: ReturnType<typeof imageStyle>;
};

const sizeFrom = (probed: Probed | undefined) =>
  probed === undefined || probed === 'failed' ? undefined : probed;

const standInFor = (alt: string) =>
  alt.trim() ? ({ role: 'img', 'aria-label': alt } as const) : ({ 'aria-hidden': true } as const);

function boxStyle(shape: NaturalSize, widest: NaturalSize | undefined) {
  return {
    '--image-aspect': shape.width / shape.height,
    ...(widest && { '--image-natural-width': `${widest.width}px` }),
  } as CSSProperties;
}

export function ImageViewerSlide({
  item,
  slide,
  near,
  current,
  attachArea,
  attachBox,
  styles,
}: ImageViewerSlideProps) {
  const t = useTranslate();
  const probedFull = useNaturalSize(item.src, near, item.crossOrigin);
  const probedThumbnail = useNaturalSize(
    item.thumbnailSize ? undefined : item.thumbnail,
    near,
    item.crossOrigin,
  );
  const [painted, setPainted] = useState<string | null>(null);

  const full = sizeFrom(probedFull);
  const failed = probedFull === 'failed';
  const shape = full ?? item.thumbnailSize ?? sizeFrom(probedThumbnail);
  const thumbnailStandsIn = failed && item.thumbnail !== undefined;
  const fullPainted = painted === item.src;

  return (
    <div {...slide} className={styles.slide()}>
      <div
        ref={current ? attachArea : undefined}
        data-image-viewer-area=""
        className={styles.area()}
      >
        {shape && (!failed || thumbnailStandsIn) ? (
          <div
            ref={current ? attachBox : undefined}
            data-image-viewer-box=""
            className={styles.box()}
            style={boxStyle(shape, item.srcSet ? undefined : full)}
          >
            {item.thumbnail && !fullPainted && (
              <img
                src={item.thumbnail}
                alt={thumbnailStandsIn ? item.alt : ''}
                draggable={false}
                className={styles.underlay()}
              />
            )}
            {near && !failed && (
              <img
                src={item.src}
                srcSet={item.srcSet}
                sizes={item.sizes}
                alt={item.alt}
                crossOrigin={item.crossOrigin}
                referrerPolicy={item.referrerPolicy}
                decoding="async"
                draggable={false}
                data-image-viewer-picture=""
                className={styles.picture()}
                onLoad={() => setPainted(item.src)}
              />
            )}
          </div>
        ) : failed ? (
          <p data-image-viewer-notice="" className={styles.notice()}>
            <span {...standInFor(item.alt)}>
              <PhotoIcon aria-hidden="true" />
            </span>
            {t('image.failed')}
          </p>
        ) : near ? (
          <Spinner />
        ) : null}
      </div>
    </div>
  );
}
