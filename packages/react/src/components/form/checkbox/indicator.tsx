'use client';

import { use, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { CheckIcon, MinusIcon } from '@heroicons/react/16/solid';

import { dataState, resolve, type StateProp } from './checkbox-state';
import { CheckboxContext } from './context';
import { invariant } from '../../../utils';
import { Slot } from '../../utility/slot';

export type CheckboxIndicatorProps = Omit<
  ComponentProps<'span'>,
  'className' | 'style' | 'children'
> & {
  asChild?: boolean;
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children?: StateProp<ReactNode>;
};

export function CheckboxIndicator({
  asChild,
  className,
  style,
  children,
  ...props
}: CheckboxIndicatorProps) {
  const context = use(CheckboxContext);
  invariant(context, 'Checkbox.Indicator must be rendered inside Checkbox.');
  const { state, styles } = context;
  const content = resolve(children, state) ?? (state.indeterminate ? <MinusIcon /> : <CheckIcon />);
  const shared = {
    ...props,
    'aria-hidden': true,
    'data-state': dataState(state),
    className: styles.indicator({ className: resolve(className, state) }),
    style: resolve(style, state),
  };
  return asChild ? <Slot {...shared}>{content}</Slot> : <span {...shared}>{content}</span>;
}

CheckboxIndicator.displayName = 'Checkbox.Indicator';
