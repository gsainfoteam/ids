'use client';

import { type ComponentProps } from 'react';

import { ColorFieldClear } from './clear';
import { useInternalColorFieldContext } from '../context';
import { ColorFieldSwatch } from './swatch';
import { ColorFieldValue } from './value';
import { resolveState } from '../../../../internal/lib/state-props';
import { flattenFragments, invariant, mergeProps, part } from '../../../../utils';
import { isType } from '../lib/is-type';

import type { ColorFieldState } from '..';

export type ColorFieldTriggerProps = Omit<ComponentProps<'button'>, 'className'> & {
  asChild?: boolean;
  className?: string | ((state: ColorFieldState) => string | undefined);
};

export function ColorFieldTrigger({
  asChild,
  children,
  className,
  ...props
}: ColorFieldTriggerProps) {
  const c = useInternalColorFieldContext('ColorField.Trigger');
  invariant(
    !flattenFragments(children).some(isType(ColorFieldClear)),
    'ColorField.Clear must be a sibling of Trigger, not inside its button.',
  );

  return part(
    'button',
    asChild,
    children ?? (
      <>
        <ColorFieldSwatch />
        <ColorFieldValue />
      </>
    ),
    mergeProps(props, {
      ...c.triggerProps,
      className: c.styles.trigger({ className: resolveState(className, c.state) }),
    }),
  );
}

ColorFieldTrigger.displayName = 'ColorField.Trigger';
