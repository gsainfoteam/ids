'use client';

import { ChevronLeftIcon } from '@heroicons/react/16/solid';

import { PaginationStep, type PaginationStepProps } from './step';

export type PaginationPreviousProps = PaginationStepProps;

export function PaginationPrevious(props: PaginationPreviousProps) {
  return (
    <PaginationStep
      {...props}
      part="Pagination.Previous"
      direction="previous"
      defaultIcon={<ChevronLeftIcon aria-hidden="true" />}
    />
  );
}

PaginationPrevious.displayName = 'Pagination.Previous';
