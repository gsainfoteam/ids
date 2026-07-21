import {
  createContext,
  useContext,
  type Ref,
} from 'react';

import { tv, type VariantProps } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export type TextFieldVariant = 'outline' | 'filled' | 'underline';

export type TextFieldGroupContextValue = {
  size: IdsSize;
  disabled?: boolean;
  inputRef: Ref<HTMLInputElement>;
};

export const TextFieldGroupContext = createContext<TextFieldGroupContextValue | null>(null);

export function useTextFieldGroupContext() {
  return useContext(TextFieldGroupContext);
}

/** 필드 표면 스타일. standalone `<TextField>`와 `<TextFieldGroup>` 셸이 공유한다. */
export const textFieldSurface = tv({
  base: [
    'w-full min-w-0',
    'bg-transparent text-(--ids-color-on-surface) transition-all',
    'data-disabled:cursor-not-allowed data-disabled:opacity-40',
  ],
  variants: {
    as: {
      /** 순수 TextField — 자기 자신에 focus ring */
      field: '',
      /** TextFieldGroup 셸 — 내부 input focus로 ring */
      group: 'inline-flex items-center',
    },
    variant: {
      outline: 'inset-ring-1 inset-ring-(--ids-color-outline)',
      filled: 'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent',
      underline: 'rounded-none border-b-2 border-(--ids-color-outline)',
    } satisfies Record<TextFieldVariant, string>,
    size: {
      standard: 'h-11 text-body-b2-regular',
      tiny: 'h-8 text-body-b3-regular',
    } satisfies Record<IdsSize, string>,
  },
  compoundVariants: [
    {
      as: 'field',
      variant: 'outline',
      class:
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ids-color-primary)',
    },
    {
      as: 'field',
      variant: 'filled',
      class: [
        'focus-visible:bg-(--ids-color-primary)/15',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ids-color-primary)',
      ],
    },
    {
      as: 'field',
      variant: 'underline',
      class: 'focus-visible:border-(--ids-color-primary)',
    },
    {
      as: 'group',
      variant: 'outline',
      class: [
        'has-[[data-text-field]:focus-visible]:outline-2',
        'has-[[data-text-field]:focus-visible]:outline-offset-2',
        'has-[[data-text-field]:focus-visible]:outline-(--ids-color-primary)',
      ],
    },
    {
      as: 'group',
      variant: 'filled',
      class: [
        'has-[[data-text-field]:focus-visible]:bg-(--ids-color-primary)/15',
        'has-[[data-text-field]:focus-visible]:outline-2',
        'has-[[data-text-field]:focus-visible]:outline-offset-2',
        'has-[[data-text-field]:focus-visible]:outline-(--ids-color-primary)',
      ],
    },
    {
      as: 'group',
      variant: 'underline',
      class: 'has-[[data-text-field]:focus-visible]:border-(--ids-color-primary)',
    },
    { as: 'group', size: 'standard', class: 'gap-2' },
    { as: 'group', size: 'tiny', class: 'gap-1.5' },
    { variant: 'outline', size: 'standard', class: 'rounded-xl px-3' },
    { variant: 'outline', size: 'tiny', class: 'rounded-lg px-2' },
    { variant: 'filled', size: 'standard', class: 'rounded-xl px-3' },
    { variant: 'filled', size: 'tiny', class: 'rounded-lg px-2' },
    { variant: 'underline', size: 'standard', class: 'px-1' },
    { variant: 'underline', size: 'tiny', class: 'px-0.5' },
  ],
  defaultVariants: {
    as: 'field',
    variant: 'outline',
    size: 'standard',
  },
});

export type TextFieldSurfaceProps = VariantProps<typeof textFieldSurface>;
