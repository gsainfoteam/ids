import { createContext, useContext, type ComponentProps, type RefObject } from 'react';

import { fieldSurface, type FieldSurfaceVariant } from '../../../internal/field-surface';
import { tv, type VariantProps } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type TextFieldVariant = FieldSurfaceVariant;

export type TextFieldInputProps = Omit<
  ComponentProps<'input'>,
  'size' | 'children' | 'className' | 'style' | 'color' | 'disabled'
>;

export type TextFieldContextValue = {
  size: IdsSize;
  disabled?: boolean;
  inputProps: TextFieldInputProps;
  inputRef: RefObject<HTMLInputElement | null>;
};

export const TextFieldContext = createContext<TextFieldContextValue | null>(null);

export function useTextFieldContext() {
  return useContext(TextFieldContext);
}

export const textFieldSurface = tv({
  base: ['inline-flex w-full min-w-0 items-center', fieldSurface.base],
  variants: {
    variant: fieldSurface.variant,
    size: fieldSurface.size,
  },
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
  },
});

export const textFieldAdornment = tv({
  base: [
    'inline-flex shrink-0 items-center empty:hidden',
    'not-has-[button]:text-(--ids-color-on-muted)',
    'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
    '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
    '[&_button]:p-0',
  ],
  variants: {
    size: {
      standard: [
        'gap-1',
        'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
      ],
      tiny: [
        'gap-0.5',
        'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
      ],
    } satisfies Record<IdsSize, string[]>,
  },
  defaultVariants: {
    size: 'standard',
  },
});

export type TextFieldSurfaceProps = VariantProps<typeof textFieldSurface>;
