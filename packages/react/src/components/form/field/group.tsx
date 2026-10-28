'use client';

import { type ComponentProps } from 'react';

import { FieldGroupContext, type FieldOrientation } from './context';
import { fieldStyle } from './style';

export type FieldGroupProps = ComponentProps<'div'> & { orientation?: FieldOrientation };

export function FieldGroup({ orientation = 'vertical', className, ...props }: FieldGroupProps) {
  return (
    <FieldGroupContext value={orientation}>
      <div
        {...props}
        data-field-group=""
        data-orientation={orientation}
        className={fieldStyle({ orientation }).group({ className })}
      />
    </FieldGroupContext>
  );
}

FieldGroup.displayName = 'Field.Group';
