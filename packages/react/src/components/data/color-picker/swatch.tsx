'use client';

import { type CSSProperties } from 'react';

import { cssColor, parseColor } from './color';
import { usePicker } from './context';
import { overChecker } from './gradient';
import { Radio } from '../../form/radio';
import { useRadioGroupContext } from '../../form/radio-group/context';

export type ColorPickerSwatchProps = Omit<
  Radio.Props,
  | 'value'
  | 'checked'
  | 'defaultChecked'
  | 'onCheckedChange'
  | 'name'
  | 'className'
  | 'style'
  | 'children'
> & {
  value: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

const NO_DOT = false;

export function ColorPickerSwatch({
  value,
  label,
  className,
  style,
  ...props
}: ColorPickerSwatchProps) {
  const c = usePicker('ColorPicker.Swatch');
  const grouped = useRadioGroupContext() !== null;
  const parsed = parseColor(value);
  if (!parsed) return null;
  return (
    <Radio
      {...props}
      value={value}
      checked={grouped ? undefined : c.picker.actions.isCurrent(value)}
      onCheckedChange={(checked) => {
        if (checked) c.picker.actions.chooseSwatch(value);
      }}
      aria-label={label ?? value}
      title={label ?? value}
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      data-color-picker-swatch=""
      className={c.styles.swatch({ className })}
      style={{ ...style, ...overChecker(cssColor(parsed)) }}
    >
      {NO_DOT}
    </Radio>
  );
}

ColorPickerSwatch.displayName = 'ColorPicker.Swatch';
