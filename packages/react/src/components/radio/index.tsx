import type { ChangeEvent, ComponentProps } from 'react';

import { invariant, tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export function Radio({
  size = 'standard',
  invalid = false,
  onChange,
  className,
  ...rest
}: Radio.Props) {
  invariant(
    rest.checked == null || rest.defaultChecked == null,
    '`<Radio>` takes either `checked` or `defaultChecked`, not both.',
  );

  const { root, box, dot } = Radio.Style({ size, invalid });

  return (
    <span className={root()}>
      <input
        {...rest}
        type="radio"
        aria-invalid={invalid || undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.checked, event)}
        className={box({ className })}
      />
      <span aria-hidden className={dot()} />
    </span>
  );
}

export namespace Radio {
  export const Style = tv({
    slots: {
      root: 'relative inline-grid shrink-0 place-items-center align-middle has-disabled:opacity-50',
      box: [
        'peer col-start-1 row-start-1 size-full appearance-none rounded-full shadow-xs',
        'cursor-pointer transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) disabled:cursor-not-allowed',
        'bg-(--ids-color-surface) inset-ring-1 inset-ring-(--ids-color-outline)',
        'enabled:hover:bg-(--ids-color-primary)/10',
        'checked:inset-ring-2 checked:inset-ring-(--radio-fill)',
        'focus-ring',
        'motion-reduce:transition-none',
      ],
      dot: [
        'pointer-events-none col-start-1 row-start-1 rounded-full bg-(--radio-fill)',
        'scale-0 transition-transform peer-checked:scale-100',
        'motion-reduce:transition-none',
      ],
    },
    variants: {
      size: {
        standard: { root: 'size-5', dot: 'size-2.5' },
        tiny: { root: 'size-4', dot: 'size-2' },
      } satisfies Record<IdsSize, { root: string; dot: string }>,
      invalid: {
        true: {
          root: '[--radio-fill:var(--ids-color-danger)]',
          box: 'inset-ring-(--ids-color-danger)',
        },
        false: { root: '[--radio-fill:var(--ids-color-primary)]' },
      },
    },
    defaultVariants: { size: 'standard', invalid: false },
  });

  export type Props = Omit<
    ComponentProps<'input'>,
    'type' | 'size' | 'className' | 'children' | 'onChange'
  > & {
    size?: IdsSize;
    invalid?: boolean;
    onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  };
}
