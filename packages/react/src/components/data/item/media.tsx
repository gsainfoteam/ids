'use client';

import { useItemContext } from './context';
import { Part, type ItemPartProps } from './part';
import { useMediaSize } from './use-media-size';
import { mergeRefs } from '../../../utils';

import type { ItemVariant } from '.';

export type ItemMediaProps = ItemPartProps & { variant?: ItemVariant };

export function ItemMedia({ variant = 'ghost', className, ref, ...props }: ItemMediaProps) {
  const { styles } = useItemContext('Item.Media');
  const sizeRef = useMediaSize(variant !== 'ghost');

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
