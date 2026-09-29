'use client';

import { useFieldContext, type FieldState } from './context';
import { renderPart, type FieldPartProps } from './part';
import { resolve, stateAttributes } from './state-value';

export type FieldHintProps = FieldPartProps<'div', FieldState>;

export function FieldHint({ asChild, className, style, children, ...rest }: FieldHintProps) {
  const { state, styles } = useFieldContext('Hint');

  if (state.invalid) return null;

  return renderPart(
    'Hint',
    asChild,
    {
      ...rest,
      'data-field-part': 'hint',
      ...stateAttributes(state),
      className: styles.hint({ className: resolve(className, state) }),
      style: resolve(style, state),
    },
    resolve(children, state),
  );
}

FieldHint.displayName = 'Field.Hint';
