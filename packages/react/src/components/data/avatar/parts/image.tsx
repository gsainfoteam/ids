'use client';

import type { ComponentProps, CSSProperties } from 'react';

import { resolveState, type StateValue } from '../../../../internal/lib/state-props';
import { useInternalAvatarContext } from '../context';
import { useInternalAvatarPicture } from '../hooks/use-avatar-picture';

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
  const mergedRef = useInternalAvatarPicture(current, report, ref);

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
