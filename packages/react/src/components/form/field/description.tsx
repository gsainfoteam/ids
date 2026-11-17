'use client';

import { useFieldContext, type FieldState } from './context';
import { renderPart, type FieldPartProps } from './part';
import { resolve, stateAttributes } from './state-value';
import { useParagraphRef } from '../../../internal/paragraph';

export type FieldDescriptionProps = FieldPartProps<'p', FieldState>;

export function FieldDescription({
  asChild,
  className,
  style,
  children,
  ref,
  ...rest
}: FieldDescriptionProps) {
  const { state, styles } = useFieldContext('Description');
  const paragraphRef = useParagraphRef('Field.Description', ref);

  return renderPart(
    'Description',
    asChild,
    {
      ...rest,
      ref: paragraphRef,
      'data-field-part': 'description',
      ...stateAttributes(state),
      className: styles.description({ className: resolve(className, state) }),
      style: resolve(style, state),
    },
    resolve(children, state),
    'p',
  );
}

FieldDescription.displayName = 'Field.Description';
