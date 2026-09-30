'use client';

import { useCallback, useRef, type ComponentProps, type CSSProperties } from 'react';

import { useAvatarContext } from './context';
import { useImageSettledBeforeMount } from '../../../internal/image-status';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { mergeRefs } from '../../../utils';

import type { Avatar } from '.';

export type AvatarImageProps = Omit<ComponentProps<'img'>, 'className' | 'style' | 'alt'> & {
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
  const { state, imageSrc, report, styles } = useAvatarContext('Avatar.Image');
  const current = src || imageSrc;
  const imageRef = useRef<HTMLImageElement>(null);
  const mergedRef = useCallback(
    (node: HTMLImageElement | null) => mergeRefs(imageRef, ref)(node),
    [ref],
  );
  useImageSettledBeforeMount(imageRef, current, report);

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
