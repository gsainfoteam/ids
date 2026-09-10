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
      root: 'relative inline-flex shrink-0 items-center align-middle has-disabled:opacity-40',
      track: [
        'peer appearance-none rounded-full',
        'cursor-pointer transition-colors disabled:cursor-not-allowed',
        'bg-(--ids-color-muted) inset-ring-1 inset-ring-(--ids-color-outline)',
        'checked:bg-(--ids-color-primary) checked:inset-ring-(--ids-color-primary)',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ids-color-primary)',
        'motion-reduce:transition-none',
      ],
      thumb: [
        'pointer-events-none absolute left-(--switch-gap) rounded-full bg-(--ids-color-surface) shadow-sm',
        'transition-transform peer-checked:translate-x-(--switch-travel)',
        'motion-reduce:transition-none',
      ],
    },
    variants: {
      size: {
        standard: {
          root: '[--switch-gap:2px] [--switch-travel:16px]',
          track: 'h-6 w-11',
          thumb: 'size-5',
        },
        tiny: {
          root: '[--switch-gap:2px] [--switch-travel:12px]',
          track: 'h-4.5 w-8',
          thumb: 'size-3.5',
        },
      } satisfies Record<IdsSize, { root: string; track: string; thumb: string }>,
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
