'use client';

import { EmptyContext } from './context';
import { useInternalEmptyTitleWarning } from './hooks/use-empty-title-warning';
import { EmptyMedia } from './parts/media';
import { EmptyTitle } from './parts/title';
import { emptyStyle } from './style';
import { containsElementOfType } from '../../../utils';

import type { Empty } from '.';

const EMPTY_MEDIA = new Set<unknown>([EmptyMedia]);
const EMPTY_TITLE = new Set<unknown>([EmptyTitle]);

export function EmptyRoot({
  variant = 'outline',
  size = 'standard',
  align = 'center',
  className,
  children,
  ...rest
}: Empty.Props) {
  const hasMedia = containsElementOfType(children, EMPTY_MEDIA);
  const hasTitle = containsElementOfType(children, EMPTY_TITLE);
  const styles = emptyStyle({ variant, size, align });

  useInternalEmptyTitleWarning(hasTitle);

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
