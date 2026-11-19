import { fieldTrigger } from '../../../internal/field-surface';
import { listStyles } from '../../../internal/list-styles';
import { tv } from '../../../utils';

import type { ChipFieldVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const chipFieldStyle = tv({
  slots: {
    root: ['relative', fieldTrigger.base],
    values: 'flex min-w-0 flex-1 flex-wrap items-center gap-1',
    adornment: [
      'inline-flex shrink-0 items-center empty:hidden',
      'not-has-[button]:text-neutral',
      'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
      '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
      '[&_button]:p-0',
    ],
    chip: [
      'max-w-full min-w-0 gap-0.5 data-disabled:opacity-60',
      'transition-[color,background-color] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'data-focus-visible:bg-primary-subtle data-focus-visible:text-on-primary-subtle',
    ],
    chipRemove: 'relative ring-0! after:absolute after:-inset-1',
    inputSizer: 'inline-grid min-w-0 flex-auto',
    input: [
      'col-start-1 row-start-1 w-full min-w-0 bg-transparent py-0 outline-none',
      'placeholder:text-neutral disabled:cursor-not-allowed',
    ],
    inputMirror: 'invisible col-start-1 row-start-1 h-0 min-w-2 whitespace-pre',
    icon: 'shrink-0 cursor-pointer text-neutral',
    listArea: listStyles.listArea,
    listbox: listStyles.list,
    item: listStyles.option,
    indicator: listStyles.indicator,
    group: 'flex flex-col',
    groupHeading: listStyles.heading,
    create: [listStyles.option, 'data-invalid:text-danger'],
    empty: [listStyles.empty, 'not-data-empty:sr-only'],
    limit: ['px-2.5 pt-1.5 pb-1 text-caption-c1-regular text-neutral', 'not-data-full:sr-only'],
  },
  variants: {
    variant: {
      outline: { root: fieldTrigger.variant.outline },
      soft: { root: fieldTrigger.variant.soft, chip: 'bg-neutral-subtlest' },
      ghost: { root: fieldTrigger.variant.ghost },
    } satisfies Record<ChipFieldVariant, object>,
    size: {
      standard: {
        root: [
          fieldTrigger.size.standard,
          'h-auto min-h-(--ids-size-control-standard) py-1.5',
          'not-data-empty:has-[>[data-chip-field-values]:first-child]:ps-1.5',
        ],
        adornment: [
          'gap-1',
          'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
        ],
        chip: 'h-6 px-2.5',
        inputSizer: 'not-first:ps-1.5',
        input: 'h-6',
        chipRemove: '[&_svg]:size-3',
        icon: fieldTrigger.icon.standard,
      },
      tiny: {
        root: [
          fieldTrigger.size.tiny,
          'h-auto min-h-(--ids-size-control-tiny) py-1.5',
          'not-data-empty:has-[>[data-chip-field-values]:first-child]:ps-1.5',
        ],
        adornment: [
          'gap-0.5',
          'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
        ],
        chip: 'h-5 px-2',
        inputSizer: 'not-first:ps-1',
        input: 'h-5',
        chipRemove: '[&_svg]:size-2.5',
        icon: fieldTrigger.icon.tiny,
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
