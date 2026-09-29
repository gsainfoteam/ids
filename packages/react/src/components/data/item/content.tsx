import { useItemContext } from './context';
import { Part, type ItemPartProps } from './part';

export type ItemContentProps = ItemPartProps;

export function ItemContent({ className, ...props }: ItemContentProps) {
  const { styles } = useItemContext('Item.Content');
  return <Part {...props} kind="content" className={styles.content({ className })} />;
}

ItemContent.displayName = 'Item.Content';
