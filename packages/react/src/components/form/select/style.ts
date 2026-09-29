import { fieldAction, fieldTrigger } from '../../../internal/field-surface';
import { listStyles } from '../../../internal/list-styles';
import { tv } from '../../../utils';

import type { SelectVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const selectStyle = tv({
  slots: {
    root: ['relative', fieldTrigger.base],
    trigger: [
      'flex h-full min-w-0 flex-1 cursor-pointer items-center self-stretch bg-transparent text-start outline-none',
      'disabled:cursor-not-allowed data-readonly:cursor-default',
    ],
    value: 'flex min-w-0 flex-1 items-center gap-1 data-placeholder:text-(--ids-color-on-muted)',
    valueText: 'truncate',
    more: 'shrink-0 text-(--ids-color-on-muted)',
    icon: 'inline-flex shrink-0 text-(--ids-color-on-muted)',
    clear: fieldAction.base,
    listArea: listStyles.listArea,
    listbox: listStyles.list,
    item: listStyles.option,
    indicator: listStyles.indicator,
    group: 'flex flex-col',
    groupHeading: listStyles.heading,
    separator: listStyles.separator,
    empty: [listStyles.empty, 'not-data-empty:sr-only'],
  },
  variants: {
    variant: {
      outline: { root: fieldTrigger.variant.outline },
      soft: { root: fieldTrigger.variant.soft },
      ghost: { root: fieldTrigger.variant.ghost },
    } satisfies Record<SelectVariant, object>,
    size: {
      standard: {
        root: 'h-(--ids-size-control-standard) rounded-standard text-body-b3-regular',
        trigger: 'gap-2 px-3',
        icon: '[&_svg]:size-(--ids-size-icon-standard)',
        clear: fieldAction.unpadded.standard,
      },
      tiny: {
        root: 'h-(--ids-size-control-tiny) rounded-standard text-caption-c1-regular',
        trigger: 'gap-1.5 px-2.5',
        icon: '[&_svg]:size-(--ids-size-icon-tiny)',
        clear: fieldAction.unpadded.tiny,
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
