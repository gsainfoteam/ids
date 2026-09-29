import { type ComponentProps } from 'react';

import { useColorFieldContext } from './context';
import { mergeProps, part } from '../../../utils';
import { cssColor } from '../../data/color-picker/color';

export type ColorFieldSwatchProps = ComponentProps<'span'> & { asChild?: boolean };

const CHECKER =
  'conic-gradient(var(--ids-color-muted) 25%, var(--ids-color-surface) 0 50%, var(--ids-color-muted) 0 75%, var(--ids-color-surface) 0)';

export function ColorFieldSwatch({
  asChild,
  children,
  className,
  style,
  ...props
}: ColorFieldSwatchProps) {
  const c = useColorFieldContext('ColorField.Swatch');

  const { parsed } = c.field.state;
  const fill = parsed ? cssColor(parsed) : undefined;

  return part(
    'span',
    asChild,
    children,
    mergeProps(props, {
      'aria-hidden': true,
      'data-color-field-swatch': '',
      'data-empty': parsed ? undefined : '',
      className: c.styles.swatch({ className }),
      style: fill
        ? {
            ...style,
            backgroundImage: `linear-gradient(${fill}, ${fill}), ${CHECKER}`,
            backgroundSize: '100% 100%, 6px 6px',
          }
        : style,
    }),
  );
}

ColorFieldSwatch.displayName = 'ColorField.Swatch';
