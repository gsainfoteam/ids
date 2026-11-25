'use client';

import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { ImageViewerCaption } from './caption';
import { ImageViewerContext } from '../context';
import { useInternalImageViewerPresence } from '../hooks/use-image-viewer-presence';
import { useInternalImageViewerSession } from '../hooks/use-image-viewer-session';
import { isNear } from '../lib/viewer-stage';
import { imageStyle } from '../style';
import { ImageViewerToolbar } from './toolbar';
import { ImageViewerFallback } from './viewer-fallback';
import { ImageViewerSlide } from './viewer-slide';
import { ModalLayer, OverlayItemContext } from '../../../../internal/overlay';
import { SlidesAnnouncer } from '../../../../internal/slides';
import { useInternalTranslate } from '../../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../../utils';

import type { ImageViewerLook, ImageViewerSource } from './viewer';
import type { ImageViewerReport } from '../hooks/use-image-viewer-surfaces';

export type ImageViewerLayerProps = { source: ImageViewerSource; look: ImageViewerLook };

const DEFAULT_PARTS = (
  <>
    <ImageViewerCaption />
    <ImageViewerToolbar />
  </>
);

const isFallback = (node: ReactNode): node is ReactElement =>
  isValidElement(node) && elementTypeOf(node) === ImageViewerFallback;

function ViewerSession({
  source,
  look,
  ending,
  report,
}: ImageViewerLayerProps & { ending: boolean; report: ImageViewerReport }) {
  const t = useInternalTranslate();
  const styles = imageStyle();
  const {
    content,
    attachContent,
    attachBackdrop,
    attachViewport,
    attachArea,
    attachBox,
    slides,
    zoomPan,
    layer,
    stacked,
    current,
    context,
    close,
    onKeyDown,
    notePress,
    closeOnAnEmptyPress,
  } = useInternalImageViewerSession({ source, report, styles });
  const { open, items } = source;
  const count = items.length;
  const parts = flattenFragments(look.children ?? DEFAULT_PARTS);
  const fallback = parts.find(isFallback);
  const chrome = parts.filter((node) => !isFallback(node));

  return (
    <ModalLayer
      open={open}
      layer={layer}
      element={content}
      contentRef={attachContent}
      backdrop={{
        ref: attachBackdrop,
        'data-image-viewer-backdrop': '',
        'data-stacked': stacked ? '' : undefined,
        'data-ending-style': ending ? '' : undefined,
        className: styles.backdrop(),
      }}
      onBackdropClick={close}
    >
      <div
        popover="manual"
        role="dialog"
        aria-modal="true"
        aria-label={look['aria-label'] ?? t('image.viewer')}
        tabIndex={-1}
        data-image-viewer=""
        data-open={open ? '' : undefined}
        data-zoomed={zoomPan.zoomed ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        className={styles.viewer({ className: look.className })}
        style={look.style}
        onKeyDown={onKeyDown}
        onPointerDown={notePress}
        onClick={closeOnAnEmptyPress}
      >
        <section
          ref={attachViewport}
          aria-roledescription={t('carousel.roleDescription')}
          aria-label={t('image.photos')}
          data-image-viewer-stage=""
          className={styles.stage()}
        >
          <div {...slides.trackProps} className={styles.track()}>
            {items.map((item, index) => (
              <ImageViewerSlide
                key={item.key}
                item={item}
                slide={slides.slideProps(index)}
                near={isNear(index, current, count, source.loop)}
                current={index === current}
                attachArea={attachArea}
                attachBox={attachBox}
                styles={styles}
                fallback={fallback}
              />
            ))}
          </div>
        </section>
        <OverlayItemContext value={null}>
          <ImageViewerContext value={context}>{chrome}</ImageViewerContext>
        </OverlayItemContext>
        <SlidesAnnouncer slides={slides} className={styles.announcer()} />
      </div>
    </ModalLayer>
  );
}

export function ImageViewerLayer({ source, look }: ImageViewerLayerProps) {
  const { session, presence, report } = useInternalImageViewerPresence(source);

  if (!presence.mounted) return null;
  return (
    <ViewerSession
      key={session}
      source={source}
      look={look}
      ending={presence.ending}
      report={report}
    />
  );
}
