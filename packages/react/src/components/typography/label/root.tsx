'use client';

import { cloneElement, isValidElement, type ReactNode } from 'react';

import { labelStyle } from './style';
import { useLabel } from './use-label';
import { invariant, mergeEventHandlers, mergeProps } from '../../../utils';

import type { Label } from '.';

type ChildProps = { id?: string; htmlFor?: string; children?: ReactNode };

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function LabelRoot({
  size = 'standard',
  required,
  disabled,
  invalid = false,
  asChild = false,
  id,
  htmlFor,
  onClick,
  className,
  style,
  children,
  ref,
  ...rest
}: Label.Props) {
  const child = asChild && isValidElement<ChildProps>(children) ? children : undefined;
  invariant(
    !asChild || child !== undefined,
    '`Label asChild` requires one element to render as, such as a `span` or `h3`.',
  );
  const {
    labelId,
    labelRef,
    state: mirrored,
    onLabelClick,
  } = useLabel({
    id: id ?? child?.props.id,
    htmlFor: htmlFor ?? child?.props.htmlFor,
    disabled,
    required,
    ref,
  });
  const state: Label.State = { ...mirrored, invalid };
  const { root, marker } = labelStyle({ size });

  const props = {
    ...rest,
    ref: labelRef,
    id: labelId,
    htmlFor,
    onClick: mergeEventHandlers(onClick, onLabelClick),
    'data-label': '',
    'data-disabled': state.disabled ? '' : undefined,
    'data-required': state.required ? '' : undefined,
    'data-invalid': state.invalid ? '' : undefined,
    className: root({ className: resolve(className, state) }),
    style: resolve(style, state),
  };
  const asterisk = state.required && (
    <span aria-hidden="true" data-label-required="" className={marker()}>
      *
    </span>
  );

  if (child)
    return cloneElement(child, mergeProps(child.props, props), child.props.children, asterisk);
  return (
    <label {...props}>
      {children}
      {asterisk}
    </label>
  );
}
