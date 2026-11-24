'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalChipContext } from '../context';

export type ChipIconProps = ComponentProps<'span'> & { asChild?: boolean };

export function ChipIcon({ asChild, className, ...props }: ChipIconProps) {
  const { styles } = useInternalChipContext('Chip.Icon');
  const Root = asChild === true ? Slot : 'span';
  return <Root aria-hidden {...props} data-chip-icon="" className={styles.icon({ className })} />;
}

ChipIcon.displayName = 'Chip.Icon';
