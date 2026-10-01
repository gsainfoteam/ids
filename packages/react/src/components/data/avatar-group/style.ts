import { tv } from '../../../utils';

import type { AvatarGroupLayout } from './arrange';
import type { IdsSize } from '../../../tokens/types';

export const avatarGroupStyle = tv({
  slots: {
    root: 'inline-flex items-center [--ag-gap:2px]',
    overflow: 'text-(--ids-color-on-surface) tabular-nums',
  },
  variants: {
    digits: {
      short: { overflow: '[&_[data-avatar-fallback]]:text-[length:max(9px,36cqi)]' },
      medium: { overflow: '[&_[data-avatar-fallback]]:text-[length:max(7px,28cqi)]' },
      long: { overflow: '[&_[data-avatar-fallback]]:text-[length:max(6px,22cqi)]' },
    },
    layout: {
      stack: {
        root: '[&>*:not(:first-child,[popover],[data-floating-ui-focus-guard])]:-ms-(--ag-overlap)',
      },
      inline: {},
    } satisfies Record<AvatarGroupLayout, object>,
    size: {
      standard: { root: '[--ag-overlap:--spacing(2.5)]' },
      tiny: { root: '[--ag-overlap:--spacing(1.5)]' },
    } satisfies Record<IdsSize, object>,
  },
  compoundVariants: [
    { layout: 'inline', size: 'standard', class: { root: 'gap-1.5' } },
    { layout: 'inline', size: 'tiny', class: { root: 'gap-1' } },
  ],
  defaultVariants: { layout: 'stack', size: 'standard', digits: 'short' },
});
