'use client';

import { isValidElement, useId } from 'react';

import { dividerStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { invariant, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Divider } from '.';

export function DividerRoot({
  orientation = 'horizontal',
  align = 'center',
  asChild = false,
  ref,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-hidden': ariaHidden,
  ...rest
}: Divider.Props) {
  const labelId = useId();
  const labelled = !asChild && children != null && children !== false && children !== '';
  invariant(
    !asChild || isValidElement(children),
    '`Divider asChild` requires one element to render as, such as an `li` or `hr`.',
  );
  const decorative = ariaHidden === true || ariaHidden === 'true';
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
    className: root({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  };

  if (asChild)
    return (
      <Slot {...rootProps} ref={ref}>
        {children}
      </Slot>
    );
  if (!labelled) return <hr {...rootProps} ref={mergeRefs(ref)} />;
  return (
    <div {...rootProps} ref={mergeRefs(ref)}>
      <span id={labelId} className={label()}>
        {children}
      </span>
    </div>
  );
}
