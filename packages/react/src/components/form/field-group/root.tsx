'use client';

import { fieldGroupStyle } from './style';
import { FieldGroupContext } from '../field/context';

import type { FieldGroup } from '.';

export function FieldGroupRoot({
  orientation = 'vertical',
  className,
  ...props
}: FieldGroup.Props) {
  return (
    <FieldGroupContext value={orientation}>
      <div
        {...props}
        data-field-group=""
        data-orientation={orientation}
        className={fieldGroupStyle({ orientation, className })}
      />
    </FieldGroupContext>
  );
}
