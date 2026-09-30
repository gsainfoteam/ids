'use client';

import {
  isValidElement,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ImageContext, ImageGroupContext } from './context';
import { ImageFallback } from './fallback';
import { ImagePlaceholder } from './placeholder';
import { imageStyle } from './style';
import { useImageGroup, type ImageItem } from './use-image-group';
import { useImageSettledBeforeMount, useImageStatus } from '../../../internal/image-status';
import { resolveState } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { AspectRatio } from '../../layout/aspect-ratio';

import type { Image } from '.';

const ASPECT_WHILE_BROKEN = 4 / 3;

const isPart =
  (part: unknown) =>
  (node: ReactNode): node is ReactElement =>
    isValidElement(node) && elementTypeOf(node) === part;

function aspectOf(width: number | string | undefined, height: number | string | undefined) {
  const across = Number(width);
  const down = Number(height);
  return across > 0 && down > 0 ? across / down : undefined;
}

function OneImageGroup({ children }: { children: ReactNode }) {
  const group = useImageGroup({});
  return <ImageGroupContext value={group}>{children}</ImageGroupContext>;
}

export function ImageRoot(props: Image.Props) {
  const group = use(ImageGroupContext);
  const preview = props.preview ?? group !== null;

  if (preview && group === null)
    return (
      <OneImageGroup>
        <ImageFrame {...props} preview />
      </OneImageGroup>
    );

  return <ImageFrame {...props} preview={preview} />;
}

function ImageFrame({
  src,
  alt,
  ratio,
  preview,
  previewSrc,
  caption,
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
}: Image.Props & { preview: boolean }) {
  const group = use(ImageGroupContext);
  const t = useTranslate();
  const key = useId();
  const name = alt ?? '';

  const current = src || undefined;
  const { status, report } = useImageStatus(current, onStatusChange);
  const imageRef = useRef<HTMLImageElement>(null);
  const mergedRef = useCallback(
    (node: HTMLImageElement | null) => mergeRefs(imageRef, ref)(node),
    [ref],
  );
  useImageSettledBeforeMount(imageRef, current, report);

  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const shown = previewSrc || current;
  const previewable = preview && group !== null && shown !== undefined;
  const register = group?.register;

  const itemNow = (): ImageItem => ({
    src: shown ?? '',
    srcSet: previewSrc ? undefined : srcSet,
    sizes: previewSrc ? undefined : sizes,
    thumbnail: current,
    alt: name,
    caption,
    crossOrigin,
    referrerPolicy,
  });
  const latestItem = useRef(itemNow);
  useLayoutEffect(() => {
    latestItem.current = itemNow;
  });

  useLayoutEffect(() => {
    if (!previewable || !register || !frame) return;
    return register({ key, element: frame, trigger, item: () => latestItem.current() });
  }, [previewable, register, key, frame, trigger]);

  useEffect(() => {
    if (!isDevelopment) return;
    if (alt === undefined)
      console.warn(
        '[IDS] Image: pass alt. Say what the picture shows, or pass alt="" when it only decorates the page.',
      );
    else if (previewable && alt.trim() === '')
      console.warn(
        '[IDS] Image: an image that opens the viewer needs an alt that says what it shows.',
      );
  }, [alt, previewable]);

  const state: Image.State = { status, preview: previewable };
  const styles = imageStyle();
  const index = group?.entries.findIndex((entry) => entry.key === key) ?? -1;
  const expanded = previewable && group !== null && group.open && index === group.value;

  const nodes = flattenFragments(children);
  const placeholder = nodes.find(isPart(ImagePlaceholder)) ?? <ImagePlaceholder />;
  const fallback = nodes.find(isPart(ImageFallback)) ?? <ImageFallback />;
  const overlays = nodes.filter((node) => node !== placeholder && node !== fallback);

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
      onClick={() => group?.openAt(key)}
    >
      {picture}
    </button>
  ) : (
    picture
  );

  const reserveTheBrokenBox =
    ratio === undefined && status === 'error'
      ? { aspectRatio: aspectOf(width, height) ?? ASPECT_WHILE_BROKEN }
      : undefined;
  const frameProps = {
    ref: setFrame,
    'data-image': '',
    'data-status': status,
    'data-preview': previewable ? '' : undefined,
    className: styles.root({ className: resolveState(className, state) }),
    style: { ...reserveTheBrokenBox, ...resolveState(style, state) },
  };

  return (
    <ImageContext value={{ state, alt: name, styles }}>
      {ratio === undefined ? (
        <div {...frameProps}>
          {body}
          {overlays}
        </div>
      ) : (
        <AspectRatio {...frameProps} ratio={ratio}>
          {body}
          {overlays}
        </AspectRatio>
      )}
    </ImageContext>
  );
}
