import { useCardContext } from './context';
import { Part, type CardPartProps } from './part';

export type CardFooterProps = CardPartProps;

export function CardFooter({ className, ...props }: CardFooterProps) {
  const { styles } = useCardContext('Card.Footer');
  return <Part {...props} kind="footer" className={styles.footer({ className })} />;
}

CardFooter.displayName = 'Card.Footer';
