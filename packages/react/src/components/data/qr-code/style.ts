import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type QRCodeVariant = 'theme' | 'light' | 'dark';

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
    variant: {
      theme: {
        root: 'text-[color:var(--qr-code-foreground,var(--ids-color-text-neutral-strong))]',
        background: 'fill-[var(--qr-code-background,var(--ids-color-bg-base))]',
      },
      light: {
        root: 'text-[color:var(--qr-code-foreground,var(--ids-color-text-qr-code))]',
        background: 'fill-[var(--qr-code-background,var(--ids-color-bg-qr-code))]',
      },
      dark: {
        root: 'text-[color:var(--qr-code-foreground,var(--ids-color-text-qr-code-inverse))]',
        background: 'fill-[var(--qr-code-background,var(--ids-color-bg-qr-code-inverse))]',
      },
    } satisfies Record<QRCodeVariant, object>,
    flush: {
      true: { root: 'rounded-none' },
    },
  },
  defaultVariants: { size: 'standard', variant: 'theme' },
});
