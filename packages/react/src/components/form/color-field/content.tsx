'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useColorFieldContext } from './context';
import { ColorPicker } from '../../data/color-picker';
import { PickerDefaultsContext } from '../../data/color-picker/context';

export type ColorFieldContentProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'children'
> & {
  className?: string;
  children?: ReactNode;
};

export function ColorFieldContent({ children, className, ...props }: ColorFieldContentProps) {
  const c = useColorFieldContext('ColorField.Content');
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
