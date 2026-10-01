import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const breadcrumbStyle = tv({
  slots: {
    root: 'min-w-0',
    list: 'm-0 flex list-none flex-wrap items-center p-0 break-words text-(--ids-color-on-muted)',
    item: 'inline-flex min-w-0 items-center',
    link: [
      'inline-flex items-center rounded-indicator text-inherit no-underline outline-none focus-ring',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
      'hover:text-(--ids-color-on-surface) [&_svg]:shrink-0',
    ],
    page: 'inline-flex items-center text-(--ids-color-on-surface) [&_svg]:shrink-0',
    separator: 'inline-flex shrink-0 items-center select-none rtl:[&>svg]:-scale-x-100',
    ellipsis: [
      '-my-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-standard',
      'bg-transparent text-inherit outline-none focus-ring',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
      'hover:bg-(--ids-color-muted) hover:text-(--ids-color-on-surface)',
      'active:bg-(--ids-color-muted-hover) data-popup-open:bg-(--ids-color-muted-hover)',
      'data-popup-open:text-(--ids-color-on-surface)',
    ],
  },
  variants: {
    size: {
      standard: {
        list: 'gap-1.5 text-body-b3-regular',
        link: 'gap-1.5 [&_svg]:size-(--ids-size-icon-standard)',
        page: 'gap-1.5 text-body-b3-medium [&_svg]:size-(--ids-size-icon-standard)',
        separator: '[&>svg]:size-(--ids-size-icon-tiny)',
        ellipsis: 'size-7 [&_svg]:size-(--ids-size-icon-standard)',
      },
      tiny: {
        list: 'gap-1 text-caption-c1-regular',
        link: 'gap-1 [&_svg]:size-(--ids-size-icon-tiny)',
        page: 'gap-1 text-caption-c1-medium [&_svg]:size-(--ids-size-icon-tiny)',
        separator: '[&>svg]:size-3',
        ellipsis: 'size-6 [&_svg]:size-(--ids-size-icon-tiny)',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
