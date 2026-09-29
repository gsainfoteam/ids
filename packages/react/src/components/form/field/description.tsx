'use client';

import { useFieldContext, type FieldState } from './context';
import { renderPart, type FieldPartProps } from './part';
import { resolve, stateAttributes } from './state-value';

export type FieldDescriptionProps = FieldPartProps<'div', FieldState>;

export function FieldDescription({
  asChild,
  className,
  style,
  children,
  ...rest
}: FieldDescriptionProps) {
  const { state, styles } = useFieldContext('Description');

  return renderPart(
    'Description',
    asChild,
    {
      ...rest,
      'data-field-part': 'description',
      ...stateAttributes(state),
      className: styles.description({ className: resolve(className, state) }),
      style: resolve(style, state),
    },
    resolve(children, state),
  );
}

FieldDescription.displayName = 'Field.Description';
