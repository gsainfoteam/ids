'use client';

import { type ComponentProps } from 'react';

import { useBubbleContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { Slot } from '../../utility/slot';

export type BubbleReactionsProps = ComponentProps<'div'> & { asChild?: boolean };

export function BubbleReactions({
  asChild = false,
  className,
  'aria-label': label,
  ...props
}: BubbleReactionsProps) {
  const { styles, overlap } = useBubbleContext('Bubble.Reactions');
  const t = useTranslate();
  const Root = asChild ? Slot : 'div';

  return (
    <Root
      role="group"
      aria-label={label ?? t('bubble.reactions')}
      {...props}
      data-bubble-reactions=""
      data-overlap={overlap ? '' : undefined}
      className={styles.reactions({ className })}
    />
  );
}

BubbleReactions.displayName = 'Bubble.Reactions';
