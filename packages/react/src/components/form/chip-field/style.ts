import { fieldTrigger } from '../../../internal/field-surface';
import { listStyles } from '../../../internal/list-styles';
import { tv } from '../../../utils';

import type { ChipFieldVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const chipFieldStyle = tv({
  slots: {
    root: ['relative', fieldTrigger.base, 'flex-wrap gap-1 py-1'],
    adornment: [
      'inline-flex shrink-0 items-center empty:hidden',
      'not-has-[button]:text-(--ids-color-on-muted)',
      'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
      '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
      '[&_button]:p-0',
    ],
    chip: [
      'max-w-full min-w-0 gap-0.5 data-disabled:opacity-60',
      'transition-[color,background-color] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'data-focus-visible:bg-(--ids-color-primary)/15 data-focus-visible:text-(--ids-color-primary)',
    ],
    chipRemove: 'relative ring-0! after:absolute after:-inset-1',
    input: [
      'min-w-20 flex-1 bg-transparent py-1 outline-none',
      'placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
    ],
    icon: 'shrink-0 cursor-pointer text-(--ids-color-on-muted)',
    listArea: listStyles.listArea,
    listbox: listStyles.list,
    item: listStyles.option,
    indicator: listStyles.indicator,
    group: 'flex flex-col',
    groupHeading: listStyles.heading,
    create: [listStyles.option, 'data-invalid:text-(--ids-color-danger)'],
    empty: [listStyles.empty, 'not-data-empty:sr-only'],
    limit: [
      'px-2.5 pt-1.5 pb-1 text-caption-c1-regular text-(--ids-color-on-muted)',
      'not-data-full:sr-only',
    ],
  },
  variants: {
    variant: {
      outline: { root: fieldTrigger.variant.outline },
      soft: { root: fieldTrigger.variant.soft, chip: 'bg-(--ids-color-surface)' },
      ghost: { root: fieldTrigger.variant.ghost },
    } satisfies Record<ChipFieldVariant, object>,
    size: {
      standard: {
        root: [fieldTrigger.size.standard, 'h-auto min-h-(--ids-size-control-standard)'],
        adornment: [
          'gap-1',
          'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
        ],
        chip: 'h-6 px-2.5',
        chipRemove: '[&_svg]:size-3',
        icon: fieldTrigger.icon.standard,
      },
      tiny: {
        root: [fieldTrigger.size.tiny, 'h-auto min-h-(--ids-size-control-tiny)'],
        adornment: [
          'gap-0.5',
          'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
        ],
        chip: 'h-5 px-2',
        chipRemove: '[&_svg]:size-2.5',
        icon: fieldTrigger.icon.tiny,
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
