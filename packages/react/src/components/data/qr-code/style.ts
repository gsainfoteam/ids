import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type QRCodeTone = 'theme' | 'dark-on-light' | 'light-on-dark';

export const qrCodeStyle = tv({
  slots: {
    root: 'relative inline-block shrink-0 overflow-hidden rounded-standard align-middle',
    svg: 'block size-full',
    background: '',
    modules: 'fill-current',
    finders: 'fill-current',
    logo: [
      'absolute flex items-center justify-center overflow-hidden',
      '[&>img]:size-full [&>img]:object-contain [&>svg]:size-full',
    ],
  },
  variants: {
    size: {
      standard: { root: 'size-32' },
      tiny: { root: 'size-24' },
    } satisfies Record<IdsSize, object>,
    tone: {
      theme: {
        root: 'text-[color:var(--qr-code-foreground,var(--ids-color-text-neutral-bold))]',
        background: 'fill-[var(--qr-code-background,var(--ids-color-bg-neutral-subtlest))]',
      },
      'dark-on-light': {
        root: 'text-[color:var(--qr-code-foreground,var(--ids-color-text-qr-code-light))]',
        background: 'fill-[var(--qr-code-background,var(--ids-color-bg-qr-code-light))]',
      },
      'light-on-dark': {
        root: 'text-[color:var(--qr-code-foreground,var(--ids-color-text-qr-code-dark))]',
        background: 'fill-[var(--qr-code-background,var(--ids-color-bg-qr-code-dark))]',
      },
    } satisfies Record<QRCodeTone, object>,
    flush: {
      true: { root: 'rounded-none' },
    },
  },
  defaultVariants: { size: 'standard', tone: 'theme' },
});
