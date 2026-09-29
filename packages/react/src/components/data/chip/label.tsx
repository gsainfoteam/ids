import { type ComponentProps } from 'react';

import { useChipContext } from './context';
import { useRegisteredId } from '../../../internal/surface';
import { Slot } from '../../utility/slot';

export type ChipLabelProps = ComponentProps<'span'> & { asChild?: boolean };

export function ChipLabel({ asChild, className, id, ...props }: ChipLabelProps) {
  const { styles, setLabelId } = useChipContext('Chip.Label');
  const labelId = useRegisteredId(setLabelId, id);
  const Root = asChild === true ? Slot : 'span';
  return (
    <Root {...props} id={labelId} data-chip-label="" className={styles.label({ className })} />
  );
}

ChipLabel.displayName = 'Chip.Label';
