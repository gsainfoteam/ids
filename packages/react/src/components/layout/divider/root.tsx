'use client';

import { isValidElement, useId } from 'react';

import { dividerStyle } from './style';
import { invariant } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Divider } from '.';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function DividerRoot({
  orientation = 'horizontal',
  align = 'center',
  decorative = false,
  asChild = false,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: Divider.Props) {
  const labelId = useId();
  const labelled = !asChild && children != null && children !== false && children !== '';
  invariant(
    !asChild || isValidElement(children),
    '`Divider asChild` requires one element to render as, such as an `li` or `hr`.',
  );
  const state: Divider.State = { orientation, labelled, align, decorative };
  const { root, label } = dividerStyle({ orientation, labelled, align });

  const naming = decorative
    ? { 'aria-hidden': true }
    : {
        role: 'separator',
        'aria-orientation': orientation,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy ?? (labelled && !ariaLabel ? labelId : undefined),
      };

  const rootProps = {
    ...rest,
    ...naming,
    'data-divider': '',
    'data-orientation': orientation,
    'data-labelled': labelled ? '' : undefined,
    'data-align': labelled ? align : undefined,
    className: root({ className: resolve(className, state) }),
    style: resolve(style, state),
  };

  if (asChild) return <Slot {...rootProps}>{children}</Slot>;
  return (
    <div {...rootProps}>
      {labelled && (
        <span id={labelId} className={label()}>
          {children}
        </span>
      )}
    </div>
  );
}
