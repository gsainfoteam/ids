'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useColorFieldContext } from './context';
import { ColorPicker } from '../../data/color-picker';

export type ColorFieldContentProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'children'
> & {
  className?: string;
  children?: ReactNode;
};

export function ColorFieldContent({ children, className, ...props }: ColorFieldContentProps) {
  const c = useColorFieldContext('ColorField.Content');

  return (
    <ColorPicker {...props} {...c.picker} className={className}>
      {children}
    </ColorPicker>
  );
}

ColorFieldContent.displayName = 'ColorField.Content';
