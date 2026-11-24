'use client';

import { ChevronRightIcon } from '@heroicons/react/16/solid';

import { PaginationStep, type PaginationStepProps } from './step';

export type PaginationNextProps = PaginationStepProps;

export function PaginationNext(props: PaginationNextProps) {
  return (
    <PaginationStep
      {...props}
      part="Pagination.Next"
      direction="next"
      defaultIcon={<ChevronRightIcon aria-hidden="true" />}
    />
  );
}

PaginationNext.displayName = 'Pagination.Next';
