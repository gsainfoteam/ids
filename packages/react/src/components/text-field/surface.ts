import { createContext, useContext, type ComponentProps, type RefObject } from 'react';

import { tv, type VariantProps } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export type TextFieldVariant = 'outline' | 'filled' | 'underline';

export type TextFieldInputProps = Omit<
  ComponentProps<'input'>,
  'size' | 'children' | 'className' | 'style' | 'color' | 'disabled'
>;

export type TextFieldContextValue = {
  size: IdsSize;
  disabled?: boolean;
  inputProps: TextFieldInputProps;
  inputRef: RefObject<HTMLInputElement | null>;
  hasValue: boolean;
  trackValue: (value: string) => void;
  clear: () => void;
};

export const TextFieldContext = createContext<TextFieldContextValue | null>(null);

export function useTextFieldContext() {
  return useContext(TextFieldContext);
}

export const textFieldSurface = tv({
  base: [
    'inline-flex w-full min-w-0 items-center',
    'bg-transparent text-(--ids-color-on-surface) transition-all',
    'data-disabled:cursor-not-allowed data-disabled:opacity-40',
  ],
  variants: {
    variant: {
      outline: [
        'inset-ring-1 inset-ring-(--ids-color-outline)',
        'has-[[data-text-field-input]:focus-visible]:outline-2',
        'has-[[data-text-field-input]:focus-visible]:outline-offset-2',
        'has-[[data-text-field-input]:focus-visible]:outline-(--ids-color-primary)',
      ],
      filled: [
        'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent',
        'has-[[data-text-field-input]:focus-visible]:bg-(--ids-color-primary)/15',
        'has-[[data-text-field-input]:focus-visible]:outline-2',
        'has-[[data-text-field-input]:focus-visible]:outline-offset-2',
        'has-[[data-text-field-input]:focus-visible]:outline-(--ids-color-primary)',
      ],
      underline: [
        'rounded-none border-b-2 border-(--ids-color-outline)',
        'has-[[data-text-field-input]:focus-visible]:border-(--ids-color-primary)',
      ],
    } satisfies Record<TextFieldVariant, string[]>,
    size: {
      standard: 'h-11 gap-2 text-body-b2-regular',
      tiny: 'h-8 gap-1.5 text-body-b3-regular',
    } satisfies Record<IdsSize, string>,
  },
  compoundVariants: [
    { variant: 'outline', size: 'standard', class: 'rounded-xl px-3' },
    { variant: 'outline', size: 'tiny', class: 'rounded-lg px-2' },
    { variant: 'filled', size: 'standard', class: 'rounded-xl px-3' },
    { variant: 'filled', size: 'tiny', class: 'rounded-lg px-2' },
    { variant: 'underline', size: 'standard', class: 'px-1' },
    { variant: 'underline', size: 'tiny', class: 'px-0.5' },
  ],
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
      standard: ['gap-1', 'not-has-[button]:text-body-b2-regular not-has-[button]:[&_svg]:size-5'],
      tiny: ['gap-0.5', 'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-4'],
    } satisfies Record<IdsSize, string[]>,
  },
  defaultVariants: {
    size: 'standard',
  },
});

export type TextFieldSurfaceProps = VariantProps<typeof textFieldSurface>;
