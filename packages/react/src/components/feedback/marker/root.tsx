'use client';

import { cloneElement, isValidElement, type ReactNode } from 'react';

import { markerStyle } from './style';
import { resolveState } from '../../../internal/state-props';
import { invariant, mergeRefs } from '../../../utils';
import { Divider } from '../../layout/divider';
import { Slot } from '../../utility/slot';
import { Spinner } from '../spinner';

import type { Marker } from '.';

type ChildProps = { children?: ReactNode };

export function MarkerRoot({
  variant = 'default',
  size = 'standard',
  pending = false,
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

  const state: Marker.State = { variant, size, pending };
  const { root, content, line } = markerStyle({ variant, size, pending });

  const props = {
    ...rest,
    role: role ?? (pending && !child ? 'status' : undefined),
    'data-marker': '',
    'data-variant': variant,
    'data-size': size,
    'data-pending': pending ? '' : undefined,
    className: root({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };

  const body = (
    <span className={content()}>
      {pending && <Spinner size={size} decorative />}
      {child ? child.props.children : children}
    </span>
  );

  const drawn =
    variant === 'separator' ? (
      <>
        <Divider asChild decorative className={line()}>
          <span />
        </Divider>
        {body}
        <Divider asChild decorative className={line()}>
          <span />
        </Divider>
      </>
    ) : variant === 'underline' ? (
      <>
        {body}
        <Divider asChild decorative>
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
