import { useCardContext } from './context';
import { Part, type CardPartProps } from './part';
import { useRegisteredId } from '../../../internal/surface';

export type CardDescriptionProps = CardPartProps;

export function CardDescription({ className, id, ...props }: CardDescriptionProps) {
  const { styles, setDescriptionId } = useCardContext('Card.Description');
  const descriptionId = useRegisteredId(setDescriptionId, id);
  return (
    <Part
      {...props}
      id={descriptionId}
      kind="description"
      className={styles.description({ className })}
    />
  );
}

CardDescription.displayName = 'Card.Description';
