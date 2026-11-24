'use client';

import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { UserIcon } from '@heroicons/react/24/solid';

import { resolveState, type StateValue } from '../../../../internal/lib/state-props';
import { Slot } from '../../../utility/slot';
import { useInternalAvatarContext } from '../context';
import { useInternalFallbackVisible } from '../hooks/use-avatar';
import { initialsOf } from '../lib/initials';

import type { Avatar } from '..';

const FALLBACK_DELAY = 600;

export type AvatarFallbackProps = Omit<
  ComponentProps<'span'>,
  'className' | 'style' | 'children'
> & {
  delay?: number;
  asChild?: boolean;
  className?: StateValue<string | undefined, Avatar.State>;
  style?: StateValue<CSSProperties | undefined, Avatar.State>;
  children?: StateValue<ReactNode, Avatar.State>;
};

export function AvatarFallback({
  delay = FALLBACK_DELAY,
  asChild,
  className,
  style,
  children,
  ...rest
}: AvatarFallbackProps) {
  const { state, name, imageSrc, styles } = useInternalAvatarContext('Avatar.Fallback');
  const visible = useInternalFallbackVisible(state.status, imageSrc, delay);
  if (!visible) return null;

  const initials = name === undefined ? '' : initialsOf(name);
  const content = resolveState(children, state) ?? (initials || <UserIcon />);
  const props = {
    'aria-hidden': true,
    ...rest,
    'data-avatar-fallback': '',
    className: styles.fallback({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };
  if (asChild === true) return <Slot {...props}>{content}</Slot>;
  return <span {...props}>{content}</span>;
}

AvatarFallback.displayName = 'Avatar.Fallback';
