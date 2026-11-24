'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalMarqueeContext } from '../context';

export type MarqueeItemProps = ComponentProps<'div'> & { asChild?: boolean };

export function MarqueeItem({ asChild, className, ...props }: MarqueeItemProps) {
  const { styles } = useInternalMarqueeContext('Marquee.Item');
  const Root = asChild === true ? Slot : 'div';

  return <Root {...props} data-marquee-item="" className={styles.item({ className })} />;
}

MarqueeItem.displayName = 'Marquee.Item';
