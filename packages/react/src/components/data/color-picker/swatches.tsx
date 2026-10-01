'use client';

import { isValidElement, type ComponentProps } from 'react';

import { usePicker } from './context';
import { ColorPickerSwatch, type ColorPickerSwatchProps } from './swatch';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { RadioGroup } from '../../form/radio-group';

import type { ColorPickerSwatchOption } from '.';

export type ColorPickerSwatchesProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'role'
>;

const NO_FORM_OWNER = '';
const swatchValue = (swatch: ColorPickerSwatchOption) =>
  typeof swatch === 'string' ? swatch : swatch.value;

export function ColorPickerSwatches({ className, children, ...props }: ColorPickerSwatchesProps) {
  const t = useTranslate();

  const c = usePicker('ColorPicker.Swatches');
  const values = children
    ? flattenFragments(children).flatMap((node) =>
        isValidElement<ColorPickerSwatchProps>(node) && elementTypeOf(node) === ColorPickerSwatch
          ? [node.props.value]
          : [],
      )
    : (c.swatches ?? []).map(swatchValue);
  return (
    <RadioGroup
      {...props}
      aria-label={props['aria-label'] ?? t('colorPicker.swatches')}
      value={values.find((item) => c.picker.actions.isCurrent(item)) ?? null}
      orientation="horizontal"
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      form={NO_FORM_OWNER}
      data-color-picker-swatches=""
      className={c.styles.swatches({ className })}
    >
      {children ??
        (c.swatches ?? []).map((swatch, index) => (
          <ColorPickerSwatch
            key={`${swatchValue(swatch)}-${index}`}
            value={swatchValue(swatch)}
            label={typeof swatch === 'string' ? undefined : swatch.label}
          />
        ))}
    </RadioGroup>
  );
}

ColorPickerSwatches.displayName = 'ColorPicker.Swatches';
