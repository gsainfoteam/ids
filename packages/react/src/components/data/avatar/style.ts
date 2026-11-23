import { cn, tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

const circleMask = cn(
  '[mask-image:radial-gradient(50%_50%_at_var(--avatar-hole-x)_50%,transparent_calc(100%_+_var(--ag-gap)),#000_calc(100%_+_var(--ag-gap)_+_0.5px))]',
);

export const avatarStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full align-middle',
      'bg-neutral-soft text-neutral select-none @container',
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
      'after:inset-ring-1 after:inset-ring-(--ids-color-text-neutral-strong)/8',
    ],
    image: 'absolute inset-0 size-full object-cover',
    fallback: [
      'inline-flex size-full items-center justify-center font-medium',
      'text-[length:max(10px,40cqi)] leading-none [&_svg]:size-[62%]',
    ],
  },
  variants: {
    size: {
      standard: { root: 'size-10' },
      tiny: { root: 'size-6' },
    } satisfies Record<IdsSize, object>,
    cutout: { start: {}, end: {}, none: {} },
  },
  compoundVariants: [
    { cutout: ['start', 'end'], class: { root: circleMask } },
    {
      cutout: 'start',
      class: {
        root: 'ltr:[--avatar-hole-x:calc(var(--ag-overlap)_-_50%)] rtl:[--avatar-hole-x:calc(150%_-_var(--ag-overlap))]',
      },
    },
    {
      cutout: 'end',
      class: {
        root: 'ltr:[--avatar-hole-x:calc(150%_-_var(--ag-overlap))] rtl:[--avatar-hole-x:calc(var(--ag-overlap)_-_50%)]',
      },
    },
  ],
  defaultVariants: { size: 'standard', cutout: 'none' },
});
