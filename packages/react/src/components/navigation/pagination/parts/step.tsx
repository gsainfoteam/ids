'use client';

import type { ComponentProps, MouseEvent, ReactElement } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { useInternalPaginationContext } from '../context';
import { useInternalPaginationControl } from '../hooks/use-pagination-control';
import { stepTarget, type StepDirection } from '../lib/step-target';

import type { IdsMessageKey } from '../../../../internal/messages';

export type PaginationStepProps = Omit<
  ComponentProps<'button'>,
  'children' | 'onClick' | 'color'
> & {
  icon?: ReactElement;
  asChild?: boolean;
  children?: ReactElement;
  focusableWhenDisabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

const STEP_NAME_KEY = {
  first: 'pagination.first',
  previous: 'common.previous',
  next: 'common.next',
  last: 'pagination.last',
} as const satisfies Record<StepDirection, IdsMessageKey>;

type StepOptions = {
  part: string;
  direction: StepDirection;
  defaultIcon: ReactElement;
};

export function PaginationStep({
  part,
  direction,
  defaultIcon,
  icon,
  asChild,
  disabled,
  children,
  onClick,
  className,
  ...props
}: PaginationStepProps & StepOptions) {
  const t = useInternalTranslate();
  const { page, pageCount } = useInternalPaginationContext(part);
  const towardStart = direction === 'first' || direction === 'previous';
  const atEdge = towardStart ? page <= 1 : page >= pageCount;
  const target = stepTarget(direction, page, pageCount);
  const glyph = icon ?? defaultIcon;

  const { context, control, content } = useInternalPaginationControl({
    part,
    target,
    asChild,
    disabled: disabled || atEdge,
    children,
    fallback: glyph,
    onClick,
  });

  const shared = {
    ...props,
    ...control,
    'aria-label': props['aria-label'] ?? t(STEP_NAME_KEY[direction]),
    [`data-pagination-${direction}`]: '',
    variant: 'ghost' as const,
    className: context.styles.arrow({ className }),
  };

  if (control.asChild)
    return (
      <IconButton {...shared} asChild icon={glyph}>
        {content as ReactElement}
      </IconButton>
    );
  return <IconButton {...shared} asChild={false} icon={glyph} />;
}
