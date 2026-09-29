import { useCardContext } from './context';
import { Part, type CardPartProps } from './part';

export type CardMediaProps = CardPartProps;

export function CardMedia({ className, ...props }: CardMediaProps) {
  const { styles } = useCardContext('Card.Media');
  return <Part {...props} kind="media" className={styles.media({ className })} />;
}

CardMedia.displayName = 'Card.Media';
