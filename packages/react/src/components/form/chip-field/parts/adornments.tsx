'use client';

import { isValidElement, type ReactNode } from 'react';

export type ChipAdornmentsProps = { items: ReactNode[]; className: string };

export function ChipAdornments({ items, className }: ChipAdornmentsProps) {
  return items.map((item, index) => (
    <span
      key={(isValidElement(item) && item.key) || index}
      data-chip-field-adornment=""
      className={className}
    >
      {item}
    </span>
  ));
}
