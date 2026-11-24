'use client';

import { ChevronDoubleRightIcon } from '@heroicons/react/16/solid';

import { PaginationStep, type PaginationStepProps } from './step';

export type PaginationLastProps = PaginationStepProps;

export function PaginationLast(props: PaginationLastProps) {
  return (
    <PaginationStep
      {...props}
      part="Pagination.Last"
      direction="last"
      defaultIcon={<ChevronDoubleRightIcon aria-hidden="true" />}
    />
  );
}

PaginationLast.displayName = 'Pagination.Last';
