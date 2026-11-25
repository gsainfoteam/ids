'use client';

import { isValidElement, type ComponentProps, type ReactElement } from 'react';

import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { TemporalClear } from './clear';
import { TemporalValue } from './value';
import { IconButton } from '../../../components/action/icon-button';
import { elementTypeOf, flattenFragments, invariant, mergeProps, part } from '../../../utils';
import { useInternalTemporalContext } from '../context';

export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };

export function TemporalTrigger({ asChild, children, className, ...props }: TriggerProps) {
  const c = useInternalTemporalContext('Trigger');
  invariant(
    !flattenFragments(children).some(
      (n) => isValidElement(n) && elementTypeOf(n) === TemporalClear,
    ),
    'Clear must be a sibling of Trigger.',
  );
  if (c.hasInput) {
    const button = {
      ...mergeProps(props, c.trigger),
      'aria-label': props['aria-label'] ?? (c.trigger['aria-label'] as string),
      variant: 'ghost' as const,
      size: c.size,
      className: c.styles.button({ className }),
    };
    return asChild ? (
      <IconButton {...button} asChild>
        {children as ReactElement}
      </IconButton>
    ) : (
      <IconButton {...button} icon={(children as ReactElement) ?? <c.icon aria-hidden="true" />} />
    );
  }
  const clearInChevronsPlace = c.hasClear && !c.state.empty;
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <c.icon aria-hidden="true" className={c.styles.icon()} />
        <TemporalValue />
        {!clearInChevronsPlace && (
          <ChevronDownIcon aria-hidden="true" className={c.styles.icon()} />
        )}
      </>
    ),
    mergeProps({ ...props, className }, c.trigger),
  );
}
