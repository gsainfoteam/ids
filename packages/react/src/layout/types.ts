import { tv, type VariantProps } from 'tailwind-variants';

export const axisVariants = tv({
  variants: {
    mainAxis: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    crossAxis: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
  },
});

export type StackDirection = 'horizontal' | 'vertical';

export function createStackVariants({
  direction,
  base,
}: {
  direction: StackDirection;
  base?: string;
}) {
  return tv({
    extend: axisVariants,
    base: [direction === 'horizontal' ? 'flex-row' : 'flex-col', base],
    variants: {
      fit: {
        fill: direction === 'horizontal' ? 'flex w-full' : 'flex h-full',
        content: 'inline-flex',
      },
    },
    defaultVariants: {
      fit: 'fill',
    },
  });
}

export const stackVariants = createStackVariants({ direction: 'horizontal' });

export type AxisVariantProps = VariantProps<typeof axisVariants>;
export type StackVariantProps = VariantProps<typeof stackVariants>;

export type MainAxis = NonNullable<AxisVariantProps['mainAxis']>;
export type CrossAxis = NonNullable<AxisVariantProps['crossAxis']>;
export type StackFit = NonNullable<StackVariantProps['fit']>;
