'use client';

import { ChevronDoubleLeftIcon } from '@heroicons/react/16/solid';

import { PaginationStep, type PaginationStepProps } from './step';

export type PaginationFirstProps = PaginationStepProps;

export function PaginationFirst(props: PaginationFirstProps) {
  return (
    <PaginationStep
      {...props}
      part="Pagination.First"
      direction="first"
      defaultIcon={<ChevronDoubleLeftIcon aria-hidden="true" />}
    />
  );
}

PaginationFirst.displayName = 'Pagination.First';
