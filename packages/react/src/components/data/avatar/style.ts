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

const squircleSquareMask = cn(
  '[@supports(corner-shape:squircle)]:[@container_style(--ids-corner-shape:squircle)]:[mask-image:linear-gradient(to_var(--avatar-band),transparent_calc(var(--ag-overlap)_+_var(--ag-gap)),#000_0),url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%202%201%27%3E%3Cpath%20fill-rule=%27evenodd%27%20d=%27M0,0H2V1H0ZM0,1L0.002,0.687L0.01,0.558L0.022,0.461L0.039,0.381L0.061,0.313L0.088,0.255L0.121,0.204L0.159,0.159L0.204,0.121L0.255,0.088L0.313,0.061L0.381,0.039L0.461,0.022L0.558,0.01L0.687,0.002L1,0L1.313,0.002L1.442,0.01L1.539,0.022L1.619,0.039L1.687,0.061L1.745,0.088L1.796,0.121L1.841,0.159L1.879,0.204L1.912,0.255L1.939,0.313L1.961,0.381L1.978,0.461L1.99,0.558L1.998,0.687L2,1Z%27/%3E%3C/svg%3E"),url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%202%201%27%3E%3Cpath%20fill-rule=%27evenodd%27%20d=%27M0,0H2V1H0ZM0,0L0.002,0.313L0.01,0.442L0.022,0.539L0.039,0.619L0.061,0.687L0.088,0.745L0.121,0.796L0.159,0.841L0.204,0.879L0.255,0.912L0.313,0.939L0.381,0.961L0.461,0.978L0.558,0.99L0.687,0.998L1,1L1.313,0.998L1.442,0.99L1.539,0.978L1.619,0.961L1.687,0.939L1.745,0.912L1.796,0.879L1.841,0.841L1.879,0.796L1.912,0.745L1.939,0.687L1.961,0.619L1.978,0.539L1.99,0.442L1.998,0.313L2,0Z%27/%3E%3C/svg%3E")]',
  '[@supports(corner-shape:squircle)]:[@container_style(--ids-corner-shape:squircle)]:[--avatar-cut:calc(var(--avatar-radius)_+_var(--ag-gap))]',
  '[@supports(corner-shape:squircle)]:[@container_style(--ids-corner-shape:squircle)]:[mask-size:100%_100%,calc(2_*_var(--avatar-cut))_var(--avatar-cut),calc(2_*_var(--avatar-cut))_var(--avatar-cut)]',
  '[@supports(corner-shape:squircle)]:[@container_style(--ids-corner-shape:squircle)]:[mask-position:0_0,left_calc(var(--avatar-corner-x)_-_var(--avatar-cut))_top_calc(0px_-_var(--ag-gap)),left_calc(var(--avatar-corner-x)_-_var(--avatar-cut))_bottom_calc(0px_-_var(--ag-gap))]',
);

export const avatarStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle',
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
    {
      shape: 'square',
      cutout: ['start', 'end'],
      class: { root: [squareMask, squircleSquareMask] },
    },
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
