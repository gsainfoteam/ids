'use client';

import { cloneElement, isValidElement, type ReactNode } from 'react';

import { markerStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { invariant, mergeRefs } from '../../../utils';
import { Divider } from '../../layout/divider';
import { Slot } from '../../utility/slot';
import { Spinner } from '../spinner';

import type { Marker } from '.';

type ChildProps = { children?: ReactNode };

export function MarkerRoot({
  variant = 'default',
  size = 'standard',
  'aria-busy': ariaBusy,
  asChild = false,
  role,
  className,
  style,
  children,
  ref,
  ...rest
}: Marker.Props) {
  const child = asChild && isValidElement<ChildProps>(children) ? children : undefined;
  invariant(
    !asChild || child !== undefined,
    '`Marker asChild` requires one element to render as, such as an `a` or `button`.',
  );

  const busy = ariaBusy === true || ariaBusy === 'true';
  const state: Marker.State = { variant, size, busy };
  const { root, content, line } = markerStyle({ variant, size, busy });

  const props = {
    ...rest,
    role: role ?? (busy && !child ? 'status' : undefined),
    'aria-busy': busy || undefined,
    'data-marker': '',
    'data-variant': variant,
    'data-size': size,
    className: root({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };

  const body = (
    <span className={content()}>
      {busy && <Spinner size={size} aria-hidden />}
      {child ? child.props.children : children}
    </span>
  );

  const drawn =
    variant === 'separator' ? (
      <>
        <Divider asChild aria-hidden className={line()}>
          <span />
        </Divider>
        {body}
        <Divider asChild aria-hidden className={line()}>
          <span />
        </Divider>
      </>
    ) : variant === 'underline' ? (
      <>
        {body}
        <Divider asChild aria-hidden>
          <span />
        </Divider>
      </>
    ) : (
      body
    );

  if (child)
    return (
      <Slot {...props} ref={ref}>
        {cloneElement(child, undefined, drawn)}
      </Slot>
    );
  return (
    <p {...props} ref={mergeRefs(ref)}>
      {drawn}
    </p>
  );
}
