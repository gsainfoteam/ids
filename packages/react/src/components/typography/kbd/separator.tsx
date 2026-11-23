'use client';

import { use, type ComponentProps } from 'react';

import { KbdStyleContext } from './context';
import { kbdStyle } from './style';

export type KbdSeparatorProps = ComponentProps<'span'>;

export function KbdSeparator({ className, children = '+', ...props }: KbdSeparatorProps) {
  const styles = use(KbdStyleContext) ?? kbdStyle();

  return (
    <span {...props} data-kbd-separator="" className={styles.separator({ className })}>
      {children}
    </span>
  );
}

KbdSeparator.displayName = 'Kbd.Separator';
