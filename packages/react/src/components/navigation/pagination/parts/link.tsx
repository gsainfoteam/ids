'use client';

import type { ComponentProps, MouseEvent, ReactNode } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { Button } from '../../../action/button';
import { useInternalPaginationControl } from '../hooks/use-pagination-control';

export type PaginationLinkProps = Omit<
  ComponentProps<'button'>,
  'children' | 'onClick' | 'color'
> & {
  page: number;
  asChild?: boolean;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export function PaginationLink({
  page,
  asChild,
  disabled,
  children,
  onClick,
  className,
  ...props
}: PaginationLinkProps) {
  const t = useInternalTranslate();
  const { context, control, content } = useInternalPaginationControl({
    part: 'Pagination.Link',
    target: page,
    asChild,
    disabled,
    children,
    fallback: page,
    onClick,
  });
  const current = page === context.page;

  return (
    <Button
      {...props}
      {...control}
      aria-label={props['aria-label'] ?? t('pagination.page', { page: String(page) })}
      aria-current={current ? 'page' : undefined}
      data-pagination-page=""
      data-current={current ? '' : undefined}
      variant={current ? context.variant : 'ghost'}
      className={context.styles.link({ className })}
    >
      {content}
    </Button>
  );
}

PaginationLink.displayName = 'Pagination.Link';
