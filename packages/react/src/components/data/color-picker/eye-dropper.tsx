'use client';

import { EyeDropperIcon } from '@heroicons/react/16/solid';

import { usePicker } from './context';
import { useEyeDropperSupport } from './use-color-picker';
import { useTranslate } from '../../../internal/translate';
import { mergeEventHandlers } from '../../../utils';
import { IconButton } from '../../action/icon-button';

import type { ColorPicker } from '.';

export function ColorPickerEyeDropper({
  className,
  children,
  onClick,
  ...props
}: ColorPicker.ButtonProps) {
  const t = useTranslate();

  const c = usePicker('ColorPicker.EyeDropper');
  const supported = useEyeDropperSupport();
  if (!supported) return null;
  return (
    <IconButton
      {...props}
      aria-label={props['aria-label'] ?? t('colorPicker.eyeDropper')}
      disabled={c.state.disabled || c.state.readOnly}
      data-color-picker-eyedropper=""
      variant="outline"
      size={c.size}
      icon={children ?? <EyeDropperIcon aria-hidden="true" />}
      className={c.styles.tool({ className })}
      onClick={mergeEventHandlers(onClick, c.picker.actions.pickFromScreen)}
    />
  );
}

ColorPickerEyeDropper.displayName = 'ColorPicker.EyeDropper';
