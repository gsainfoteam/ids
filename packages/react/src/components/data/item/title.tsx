import { useItemContext } from './context';
import { Part, type ItemPartProps } from './part';
import { useRegisteredId } from '../../../internal/surface';

export type ItemTitleProps = ItemPartProps & { truncate?: boolean };

export function ItemTitle({ truncate = false, className, id, ...props }: ItemTitleProps) {
  const { styles, setTitleId } = useItemContext('Item.Title');
  const titleId = useRegisteredId(setTitleId, id);
  return (
    <Part {...props} id={titleId} kind="title" className={styles.title({ truncate, className })} />
  );
}

ItemTitle.displayName = 'Item.Title';
