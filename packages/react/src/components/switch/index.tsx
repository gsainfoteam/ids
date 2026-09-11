import type { ChangeEvent, ComponentProps } from 'react';

import { invariant, tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export function Switch({ size = 'standard', onChange, className, ...rest }: Switch.Props) {
  invariant(
    rest.checked == null || rest.defaultChecked == null,
    '`<Switch>` takes either `checked` or `defaultChecked`, not both.',
  );

  const { root, track, thumb } = Switch.Style({ size });

  return (
    <span className={root()}>
      <input
        type="checkbox"
        role="switch"
        {...rest}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.checked, event)}
        className={track({ className })}
      />
      <span aria-hidden className={thumb()} />
    </span>
  );
}

export namespace Switch {
  export const Style = tv({
    slots: {
      root: 'relative inline-flex shrink-0 items-center align-middle has-disabled:opacity-50',
      track: [
        'peer appearance-none rounded-full shadow-xs',
        'cursor-pointer transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) disabled:cursor-not-allowed',
        'bg-(--ids-color-muted) inset-ring-1 inset-ring-(--ids-color-outline)',
        'checked:bg-(--ids-color-primary) checked:inset-ring-(--ids-color-primary)',
        'focus-ring',
        'motion-reduce:transition-none',
      ],
      thumb: [
        'pointer-events-none absolute left-(--switch-gap) rounded-full bg-(--ids-color-surface) shadow-sm',
        'size-(--switch-thumb) transition-transform motion-reduce:transition-none',
        'peer-checked:translate-x-[calc(var(--switch-track)-var(--switch-thumb)-var(--switch-gap)*2)]',
      ],
    },
    variants: {
      size: {
        standard: {
          root: '[--switch-gap:2px] [--switch-thumb:20px] [--switch-track:44px]',
          track: 'h-6 w-(--switch-track)',
        },
        tiny: {
          root: '[--switch-gap:2px] [--switch-thumb:14px] [--switch-track:32px]',
          track: 'h-4.5 w-(--switch-track)',
        },
      } satisfies Record<IdsSize, { root: string; track: string }>,
    },
    defaultVariants: { size: 'standard' },
  });

  export type Props = Omit<
    ComponentProps<'input'>,
    'type' | 'size' | 'role' | 'className' | 'children' | 'onChange'
  > & {
    size?: IdsSize;
    onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  };
}
