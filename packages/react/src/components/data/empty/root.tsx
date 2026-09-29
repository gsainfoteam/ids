'use client';

import { useEffect } from 'react';

import { EmptyContext } from './context';
import { EmptyMedia } from './media';
import { emptyStyle } from './style';
import { EmptyTitle } from './title';
import { containsElementOfType } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Empty } from '.';

const EMPTY_MEDIA = new Set<unknown>([EmptyMedia]);
const EMPTY_TITLE = new Set<unknown>([EmptyTitle]);

export function EmptyRoot({
  variant = 'ghost',
  size = 'standard',
  align = 'center',
  className,
  children,
  ...rest
}: Empty.Props) {
  const hasMedia = containsElementOfType(children, EMPTY_MEDIA);
  const hasTitle = containsElementOfType(children, EMPTY_TITLE);
  const styles = emptyStyle({ variant, size, align });

  useEffect(() => {
    if (isDevelopment && !hasTitle) console.warn('[IDS] Empty: give it an Empty.Title.');
  }, [hasTitle]);

  return (
    <EmptyContext value={{ styles }}>
      <div
        {...rest}
        data-empty=""
        data-variant={variant}
        data-size={size}
        data-align={align}
        className={styles.root({ className })}
      >
        {!hasMedia && <EmptyMedia />}
        {children}
      </div>
    </EmptyContext>
  );
}
