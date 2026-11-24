'use client';

import { useInternalItemContext } from '../context';
import { Part, type ItemPartProps } from './part';
import { mergeRefs } from '../../../../utils';
import { useInternalMediaSize } from '../hooks/use-media-size';

import type { ItemVariant } from '..';

export type ItemMediaProps = ItemPartProps & { variant?: ItemVariant };

export function ItemMedia({ variant = 'ghost', className, ref, ...props }: ItemMediaProps) {
  const { styles } = useInternalItemContext('Item.Media');
  const sizeRef = useInternalMediaSize(variant !== 'ghost');

  return (
    <Part
      {...props}
      ref={mergeRefs(sizeRef, ref)}
      kind="media"
      data-variant={variant}
      className={styles.media({ media: variant, className })}
    />
  );
}

ItemMedia.displayName = 'Item.Media';
