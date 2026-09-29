import { useItemContext } from './context';
import { Part, type ItemPartProps } from './part';

import type { ItemVariant } from '.';

export type ItemMediaProps = ItemPartProps & { variant?: ItemVariant };

export function ItemMedia({ variant = 'ghost', className, ...props }: ItemMediaProps) {
  const { styles } = useItemContext('Item.Media');
  return (
    <Part
      {...props}
      kind="media"
      data-variant={variant}
      className={styles.media({ media: variant, className })}
    />
  );
}

ItemMedia.displayName = 'Item.Media';
