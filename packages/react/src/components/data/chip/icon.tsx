import { type ComponentProps } from 'react';

import { useChipContext } from './context';
import { Slot } from '../../utility/slot';

export type ChipIconProps = ComponentProps<'span'> & { asChild?: boolean };

export function ChipIcon({ asChild, className, ...props }: ChipIconProps) {
  const { styles } = useChipContext('Chip.Icon');
  const Root = asChild === true ? Slot : 'span';
  return <Root aria-hidden {...props} data-chip-icon="" className={styles.icon({ className })} />;
}

ChipIcon.displayName = 'Chip.Icon';
