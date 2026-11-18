import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type QRCodeTone = 'theme' | 'dark-on-light' | 'light-on-dark';

export const qrCodeStyle = tv({
  slots: {
    root: [
      'relative inline-block shrink-0 overflow-hidden rounded-standard align-middle',
      '[--qr-code-foreground:var(--ids-color-text-neutral-bold)] [--qr-code-background:var(--ids-color-bg-neutral-subtlest)]',
    ],
    svg: 'block size-full',
    background: 'fill-(--qr-code-background)',
    modules: 'fill-(--qr-code-foreground)',
    finders: 'fill-(--qr-code-foreground)',
    logo: [
      'absolute flex items-center justify-center overflow-hidden text-(--qr-code-foreground)',
      '[&>img]:size-full [&>img]:object-contain [&>svg]:size-full',
    ],
  },
  variants: {
    size: {
      standard: { root: 'size-32' },
      tiny: { root: 'size-24' },
    } satisfies Record<IdsSize, object>,
    tone: {
      theme: {},
      'dark-on-light': {
        root: 'dark:[--qr-code-foreground:var(--ids-color-bg-neutral-subtlest)] dark:[--qr-code-background:var(--ids-color-text-neutral-bold)]',
      },
      'light-on-dark': {
        root: [
          '[--qr-code-foreground:var(--ids-color-bg-neutral-subtlest)] [--qr-code-background:var(--ids-color-text-neutral-bold)]',
          'dark:[--qr-code-foreground:var(--ids-color-text-neutral-bold)] dark:[--qr-code-background:var(--ids-color-bg-neutral-subtlest)]',
        ],
      },
    } satisfies Record<QRCodeTone, object>,
    flush: {
      true: { root: 'rounded-none' },
    },
  },
  defaultVariants: { size: 'standard', tone: 'theme' },
});
