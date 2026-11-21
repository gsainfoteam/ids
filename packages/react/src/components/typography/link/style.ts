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
      primary: { root: 'scheme-primary text-scheme' },
      secondary: { root: 'scheme-secondary text-scheme' },
      tertiary: { root: 'scheme-tertiary text-scheme' },
      neutral: {
        root: 'scheme-neutral text-inherit hover:text-scheme aria-[current=page]:text-primary',
      },
    },
    underline: {
      always: { root: 'underline decoration-current/40 hover:decoration-current' },
      hover: { root: 'no-underline hover:underline focus-visible:underline' },
      none: { root: 'no-underline' },
    },
  },
  defaultVariants: { colorScheme: 'primary', underline: 'always' },
});
