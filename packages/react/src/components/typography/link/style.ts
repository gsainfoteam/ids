import { tv } from '../../../utils';

export const linkStyle = tv({
  slots: {
    root: [
      'cursor-pointer rounded-indicator outline-none focus-ring box-decoration-clone',
      'underline-offset-[0.2em] transition-[color,text-decoration-color]',
      'duration-(--ids-motion-fast) motion-reduce:transition-none',
    ],
    newTab: 'ms-[0.125em] inline-block size-[0.875em] align-[-0.0625em] rtl:-scale-x-100',
  },
  variants: {
    colorScheme: {
      accent: { root: 'text-(--ids-color-accent)' },
      neutral: { root: 'text-inherit hover:text-(--ids-color-on-surface)' },
    },
    underline: {
      always: { root: 'underline decoration-current/40 hover:decoration-current' },
      hover: { root: 'no-underline hover:underline focus-visible:underline' },
    },
  },
  defaultVariants: { colorScheme: 'accent', underline: 'always' },
});
