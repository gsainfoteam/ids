'use client';

import { isValidElement, use, type ReactElement, type ReactNode } from 'react';

import { ImageContext, ImageGroupContext } from './context';
import { useInternalImageAltWarning } from './hooks/use-image-alt-warning';
import { useInternalImageGroup } from './hooks/use-image-group';
import { useInternalImagePicture } from './hooks/use-image-picture';
import { useInternalImagePreview } from './hooks/use-image-preview';
import { aspectOf } from './lib/image-size';
import { ImageFallback } from './parts/fallback';
import { ImageCaption, type ImageCaptionProps } from './parts/image-caption';
import { ImagePlaceholder } from './parts/placeholder';
import { ImageViewer, preloadImageViewer } from './parts/viewer';
import { imageStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { useInternalTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Image } from '.';

const ASPECT_WHILE_BROKEN = 4 / 3;

const isPart =
  <P = unknown,>(part: unknown) =>
  (node: ReactNode): node is ReactElement<P> =>
    isValidElement(node) && elementTypeOf(node) === part;

const warmTheViewer = () => void preloadImageViewer();

function OneImageGroup({ children }: { children: ReactNode }) {
  const group = useInternalImageGroup({});
  return (
    <ImageGroupContext value={group}>
      {children}
      <ImageViewer />
    </ImageGroupContext>
  );
}

type ImageFrameProps = Omit<Image.Props, 'preview'> & {
  preview: boolean;
  previewSrc: string | undefined;
};

export function ImageRoot({ preview: previewProp, ...props }: Image.Props) {
  const group = use(ImageGroupContext);
  const preview = previewProp === undefined ? group !== null : previewProp !== false;
  const previewSrc = typeof previewProp === 'object' ? previewProp.src || undefined : undefined;

  if (preview && group === null)
    return (
      <OneImageGroup>
        <ImageFrame {...props} preview previewSrc={previewSrc} />
      </OneImageGroup>
    );

  return <ImageFrame {...props} preview={preview} previewSrc={previewSrc} />;
}

function ImageFrame({
  src,
  alt,
  preview,
  previewSrc,
  onStatusChange,
  srcSet,
  sizes,
  width,
  height,
  crossOrigin,
  referrerPolicy,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  ref,
  className,
  style,
  children,
  ...rest
}: ImageFrameProps) {
  const t = useInternalTranslate();
  const name = alt ?? '';

  const nodes = flattenFragments(children);
  const placeholder = nodes.find(isPart(ImagePlaceholder)) ?? <ImagePlaceholder />;
  const fallback = nodes.find(isPart(ImageFallback)) ?? <ImageFallback />;
  const caption = nodes.find(isPart<ImageCaptionProps>(ImageCaption));
  const overlays = nodes.filter(
    (node) => node !== placeholder && node !== fallback && node !== caption,
  );

  const current = src || undefined;
  const { status, report, imageRef, mergedRef } = useInternalImagePicture(
    current,
    onStatusChange,
    ref,
  );
  const { previewable, expanded, setFrame, setTrigger, openViewer } = useInternalImagePreview({
    preview,
    current,
    previewSrc,
    srcSet,
    alt: name,
    caption: caption?.props.children,
    crossOrigin,
    referrerPolicy,
    imageRef,
  });
  useInternalImageAltWarning(alt, previewable);

  const state: Image.State = { status, preview: previewable };
  const styles = imageStyle();

  const picture = (
    <>
      {placeholder}
      {current && status !== 'error' ? (
        <img
          key={current}
          {...rest}
          ref={mergedRef}
          src={current}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          crossOrigin={crossOrigin}
          referrerPolicy={referrerPolicy}
          loading={loading}
          decoding={decoding}
          data-image-picture=""
          className={styles.image()}
          onLoad={(event) => {
            report(current, 'loaded');
            onLoad?.(event);
          }}
          onError={(event) => {
            report(current, 'error');
            onError?.(event);
          }}
        />
      ) : null}
      {fallback}
    </>
  );

  const body = previewable ? (
    <button
      ref={setTrigger}
      type="button"
      data-image-trigger=""
      data-field-input=""
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-label={name.trim() ? t('image.preview', { alt: name }) : t('image.previewUntitled')}
      data-popup-open={expanded ? '' : undefined}
      className={styles.trigger()}
      onPointerEnter={warmTheViewer}
      onFocus={warmTheViewer}
      onClick={openViewer}
    >
      {picture}
    </button>
  ) : (
    picture
  );

  const reserveTheBrokenBox =
    status === 'error'
      ? { aspectRatio: aspectOf(width, height) ?? ASPECT_WHILE_BROKEN }
      : undefined;

  return (
    <ImageContext value={{ state, alt: name, styles }}>
      <div
        ref={setFrame}
        data-image=""
        data-status={status}
        data-preview={previewable ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
        style={{ ...reserveTheBrokenBox, ...resolveState(style, state) }}
      >
        {body}
        {overlays}
      </div>
    </ImageContext>
  );
}
