import { type ComponentProps } from 'react';

import { useSelectContext } from './context';
import { SelectIcon } from './icon';
import { SelectValue } from './value';
import { resolveState } from '../../../internal/state-props';
import { mergeProps, part } from '../../../utils';

import type { SelectState } from '.';

export type SelectTriggerProps = Omit<ComponentProps<'button'>, 'className'> & {
  asChild?: boolean;
  className?: string | ((state: SelectState) => string | undefined);
};

export function SelectTrigger({ asChild, children, className, ...props }: SelectTriggerProps) {
  const c = useSelectContext('Select.Trigger');

  return part(
    'button',
    asChild,
    children ?? (
      <>
        <SelectValue />
        <SelectIcon />
      </>
    ),
    mergeProps(props, {
      ...c.triggerProps,
      className: c.styles.trigger({ className: resolveState(className, c.state) }),
    }),
  );
}

SelectTrigger.displayName = 'Select.Trigger';
