'use client';

import { isValidElement, type ComponentProps, type PointerEvent } from 'react';

import { useTooltipContext } from './context';
import { mergeProps, part } from '../../../utils';

export type TooltipTriggerProps = ComponentProps<'button'> & { asChild?: boolean };

const joinIds = (...ids: Array<unknown>) =>
  ids.filter((id) => typeof id === 'string' && id !== '').join(' ') || undefined;

export function TooltipTrigger({ asChild, children, ...props }: TooltipTriggerProps) {
  const { tooltip } = useTooltipContext('Tooltip.Trigger');

  const reference = tooltip.getReferenceProps({
    onPointerDown: (event: PointerEvent<HTMLElement>) =>
      tooltip.closeByTriggerPress(event.nativeEvent),
  });

  const ownDescription =
    asChild && isValidElement<ComponentProps<'button'>>(children)
      ? children.props['aria-describedby']
      : props['aria-describedby'];

  return part(
    asChild ? 'span' : 'button',
    asChild,
    children,
    mergeProps(props, {
      ...reference,
      ref: tooltip.setTrigger,
      type: asChild ? undefined : 'button',
      'aria-describedby': joinIds(ownDescription, reference['aria-describedby']),
      'data-popup-open': tooltip.open ? '' : undefined,
    }),
  );
}

TooltipTrigger.displayName = 'Tooltip.Trigger';
