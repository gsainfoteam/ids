'use client';

import { useInternalFieldContext, type FieldState } from '../context';
import { renderPart, type FieldPartProps } from '../lib/part';
import { resolve, stateAttributes } from '../lib/state-value';

export type FieldHintProps = FieldPartProps<'div', FieldState>;

export function FieldHint({ asChild, className, style, children, ...rest }: FieldHintProps) {
  const { state, styles } = useInternalFieldContext('Hint');

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
