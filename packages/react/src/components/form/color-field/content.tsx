'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useColorFieldContext } from './context';
import { type PopupPresentation } from '../../../internal/field-popup';
import { ColorPicker } from '../../data/color-picker';

export type ColorFieldContentProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'children'
> & {
  className?: string;
  children?: ReactNode;
  mobileVariant?: PopupPresentation;
};

export function ColorFieldContent({
  children,
  className,
  mobileVariant: _readByTheRoot,
  ...props
}: ColorFieldContentProps) {
  const c = useColorFieldContext('ColorField.Content');

  return (
    <ColorPicker {...props} {...c.picker} className={className}>
      {children}
    </ColorPicker>
  );
}

ColorFieldContent.displayName = 'ColorField.Content';
