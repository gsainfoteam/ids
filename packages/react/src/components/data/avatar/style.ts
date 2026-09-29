import { cn, tv } from '../../../utils';

import type { AvatarShape } from './context';
import type { IdsSize } from '../../../tokens/types';

const circleMask = cn(
  '[mask-image:radial-gradient(50%_50%_at_var(--avatar-hole-x)_50%,transparent_calc(100%_+_var(--ag-gap)),#000_calc(100%_+_var(--ag-gap)_+_0.5px))]',
);
const squareMask = cn(
  '[mask-image:linear-gradient(to_var(--avatar-band),transparent_calc(var(--ag-overlap)_+_var(--ag-gap)),#000_0),radial-gradient(circle_calc(var(--avatar-radius)_+_var(--ag-gap))_at_var(--avatar-corner-x)_100%,transparent_100%,#000_calc(100%_+_0.5px)),radial-gradient(circle_calc(var(--avatar-radius)_+_var(--ag-gap))_at_var(--avatar-corner-x)_0%,transparent_100%,#000_calc(100%_+_0.5px))]',
  '[mask-size:100%_100%,100%_var(--avatar-radius),100%_var(--avatar-radius)]',
  '[mask-position:0_0,0_0,0_100%] [mask-repeat:no-repeat]',
);

export const avatarStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle',
      'bg-(--ids-color-muted) text-(--ids-color-on-muted) select-none @container',
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
      'after:inset-ring-1 after:inset-ring-(--ids-color-on-surface)/8',
    ],
    image: 'absolute inset-0 size-full object-cover',
    fallback: [
      'inline-flex size-full items-center justify-center font-medium',
      'text-[length:max(10px,40cqi)] leading-none [&_svg]:size-[62%]',
    ],
  },
  variants: {
    shape: {
      circle: { root: 'rounded-full' },
      square: { root: 'rounded-(--avatar-radius)' },
    } satisfies Record<AvatarShape, object>,
    size: {
      standard: { root: 'size-10 [--avatar-radius:var(--ids-radius-standard)]' },
      tiny: { root: 'size-6 [--avatar-radius:var(--ids-radius-indicator)]' },
    } satisfies Record<IdsSize, object>,
    cutout: { start: {}, end: {}, none: {} },
  },
  compoundVariants: [
    { shape: 'circle', cutout: ['start', 'end'], class: { root: circleMask } },
    { shape: 'square', cutout: ['start', 'end'], class: { root: squareMask } },
    {
      shape: 'circle',
      cutout: 'start',
      class: {
        root: 'ltr:[--avatar-hole-x:calc(var(--ag-overlap)_-_50%)] rtl:[--avatar-hole-x:calc(150%_-_var(--ag-overlap))]',
      },
    },
    {
      shape: 'circle',
      cutout: 'end',
      class: {
        root: 'ltr:[--avatar-hole-x:calc(150%_-_var(--ag-overlap))] rtl:[--avatar-hole-x:calc(var(--ag-overlap)_-_50%)]',
      },
    },
    {
      shape: 'square',
      cutout: 'start',
      class: {
        root: [
          'ltr:[--avatar-band:right] rtl:[--avatar-band:left]',
          'ltr:[--avatar-corner-x:calc(var(--ag-overlap)_-_var(--avatar-radius))]',
          'rtl:[--avatar-corner-x:calc(100%_-_var(--ag-overlap)_+_var(--avatar-radius))]',
        ],
      },
    },
    {
      shape: 'square',
      cutout: 'end',
      class: {
        root: [
          'ltr:[--avatar-band:left] rtl:[--avatar-band:right]',
          'ltr:[--avatar-corner-x:calc(100%_-_var(--ag-overlap)_+_var(--avatar-radius))]',
          'rtl:[--avatar-corner-x:calc(var(--ag-overlap)_-_var(--avatar-radius))]',
        ],
      },
    },
  ],
  defaultVariants: { shape: 'circle', size: 'standard', cutout: 'none' },
});
