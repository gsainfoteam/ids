'use client';

import { type ComponentProps } from 'react';

import { formatPlaceholder } from './color';
import { usePicker } from './context';
import { useTranslate } from '../../../internal/translate';
import { mergeProps } from '../../../utils';
import { TextField } from '../../form/text-field';

export type ColorPickerInputProps = Omit<
  ComponentProps<'input'>,
  'value' | 'defaultValue' | 'type' | 'size'
>;

export function ColorPickerInput({ className, style, ...props }: ColorPickerInputProps) {
  const t = useTranslate();

  const c = usePicker('ColorPicker.Input');
  const { input } = c.picker;
  return (
    <TextField
      {...mergeProps(props as Record<string, unknown>, {
        type: 'text',
        'aria-label': props['aria-label'] ?? t('colorPicker.input'),
        autoComplete: 'off',
        autoCorrect: 'off',
        autoCapitalize: 'none',
        spellCheck: false,
        value: input.value,
        placeholder: props.placeholder ?? formatPlaceholder(c.format, c.alpha),
        readOnly: c.state.readOnly,
        'aria-invalid': input.invalid || undefined,
        'data-color-picker-input': '',
        onChange: input.onChange,
        onBlur: input.onBlur,
        onKeyDown: input.onKeyDown,
      })}
      size={c.size}
      disabled={c.state.disabled}
      className={c.styles.input({ className })}
      style={style}
    >
      <TextField.Input className={c.styles.inputText()} />
    </TextField>
  );
}

ColorPickerInput.displayName = 'ColorPicker.Input';
