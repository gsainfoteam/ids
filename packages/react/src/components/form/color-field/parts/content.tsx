'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { type PopupPresentation } from '../../../../internal/field-popup';
import { ColorPicker } from '../../../data/color-picker';
import { PickerDefaultsContext } from '../../../data/color-picker/context';
import { useInternalColorFieldContext } from '../context';

export type ColorFieldContentProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'children'
> & {
  className?: string;
  children?: ReactNode;
  narrow?: PopupPresentation;
};

export function ColorFieldContent({
  children,
  className,
  narrow: _readByTheRoot,
  ...props
}: ColorFieldContentProps) {
  const c = useInternalColorFieldContext('ColorField.Content');
  const { alpha, swatches, ...picker } = c.picker;

  return (
    <PickerDefaultsContext value={{ alpha, swatches }}>
      <ColorPicker {...props} {...picker} className={className}>
        {children}
      </ColorPicker>
    </PickerDefaultsContext>
  );
}

ColorFieldContent.displayName = 'ColorField.Content';
