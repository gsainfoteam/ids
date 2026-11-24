'use client';

import { useCallback, useRef, type ComponentProps, type CSSProperties } from 'react';

import { useInternalImageSettledBeforeMount } from '../../../../internal/lib/image-status';
import { resolveState, type StateValue } from '../../../../internal/lib/state-props';
import { mergeRefs } from '../../../../utils';
import { useInternalAvatarContext } from '../context';

import type { Avatar } from '..';

export type AvatarImageProps = Omit<
  ComponentProps<'img'>,
  'src' | 'className' | 'style' | 'alt'
> & {
  src?: string;
  className?: StateValue<string | undefined, Avatar.State>;
  style?: StateValue<CSSProperties | undefined, Avatar.State>;
};

export function AvatarImage({
  src,
  className,
  style,
  onLoad,
  onError,
  ref,
  ...rest
}: AvatarImageProps) {
  const { state, imageSrc, report, styles } = useInternalAvatarContext('Avatar.Image');
  const current = src || imageSrc;
  const imageRef = useRef<HTMLImageElement>(null);
  const mergedRef = useCallback(
    (node: HTMLImageElement | null) => mergeRefs(imageRef, ref)(node),
    [ref],
  );
  useInternalImageSettledBeforeMount(imageRef, current, report);

  if (!current || state.status === 'error') return null;
  return (
    <img
      key={current}
      alt=""
      loading="lazy"
      decoding="async"
      {...rest}
      ref={mergedRef}
      src={current}
      data-avatar-image=""
      data-status={state.status}
      onLoad={(event) => {
        report(current, 'loaded');
        onLoad?.(event);
      }}
      onError={(event) => {
        report(current, 'error');
        onError?.(event);
      }}
      className={styles.image({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    />
  );
}

AvatarImage.displayName = 'Avatar.Image';
