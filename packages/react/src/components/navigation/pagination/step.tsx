'use client';

import type { ComponentProps, MouseEvent, ReactElement } from 'react';

import { usePaginationContext } from './context';
import { usePaginationControl } from './control';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';

export type PaginationStepProps = Omit<
  ComponentProps<'button'>,
  'children' | 'onClick' | 'color'
> & {
  icon?: ReactElement;
  asChild?: boolean;
  children?: ReactElement;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

type StepOptions = {
  part: string;
  direction: 'previous' | 'next';
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
  const t = useTranslate();
  const { page, pageCount } = usePaginationContext(part);
  const atEdge = direction === 'previous' ? page <= 1 : page >= pageCount;
  const target = direction === 'previous' ? Math.max(1, page - 1) : Math.min(pageCount, page + 1);
  const glyph = icon ?? defaultIcon;

  const { context, control, content } = usePaginationControl({
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
    'aria-label': props['aria-label'] ?? t(`pagination.${direction}`),
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
