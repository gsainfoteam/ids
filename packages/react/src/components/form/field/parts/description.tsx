'use client';

import { useInternalParagraphRef } from '../../../../internal/hooks/use-paragraph-ref';
import { useInternalFieldContext, type FieldState } from '../context';
import { renderPart, type FieldPartProps } from '../lib/part';
import { resolve, stateAttributes } from '../lib/state-value';

export type FieldDescriptionProps = FieldPartProps<'p', FieldState>;

export function FieldDescription({
  asChild,
  className,
  style,
  children,
  ref,
  ...rest
}: FieldDescriptionProps) {
  const { state, styles } = useInternalFieldContext('Description');
  const paragraphRef = useInternalParagraphRef('Field.Description', ref);

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
