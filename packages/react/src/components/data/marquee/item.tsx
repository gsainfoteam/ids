'use client';

import { type ComponentProps } from 'react';

import { useMarqueeContext } from './context';
import { Slot } from '../../utility/slot';

export type MarqueeItemProps = ComponentProps<'div'> & { asChild?: boolean };

export function MarqueeItem({ asChild, className, ...props }: MarqueeItemProps) {
  const { styles } = useMarqueeContext('Marquee.Item');
  const Root = asChild === true ? Slot : 'div';

  return <Root {...props} data-marquee-item="" className={styles.item({ className })} />;
}

MarqueeItem.displayName = 'Marquee.Item';
