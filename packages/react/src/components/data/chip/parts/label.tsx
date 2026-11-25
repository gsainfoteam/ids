'use client';

import { type ComponentProps } from 'react';

import { useInternalRegisteredId } from '../../../../internal/hooks/use-registered-id';
import { Slot } from '../../../utility/slot';
import { useInternalChipContext } from '../context';

export type ChipLabelProps = ComponentProps<'span'> & { asChild?: boolean };

export function ChipLabel({ asChild, className, id, ...props }: ChipLabelProps) {
  const { styles, setLabelId } = useInternalChipContext('Chip.Label');
  const labelId = useInternalRegisteredId(setLabelId, id);
  const Root = asChild === true ? Slot : 'span';
  return (
    <Root {...props} id={labelId} data-chip-label="" className={styles.label({ className })} />
  );
}

ChipLabel.displayName = 'Chip.Label';
