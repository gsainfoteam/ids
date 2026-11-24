'use client';

import { type ComponentProps } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { Slot } from '../../../utility/slot';
import { useInternalBubbleContext } from '../context';

export type BubbleReactionsProps = ComponentProps<'div'> & { asChild?: boolean };

export function BubbleReactions({
  asChild = false,
  className,
  'aria-label': label,
  ...props
}: BubbleReactionsProps) {
  const { styles, overlap } = useInternalBubbleContext('Bubble.Reactions');
  const t = useInternalTranslate();
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
