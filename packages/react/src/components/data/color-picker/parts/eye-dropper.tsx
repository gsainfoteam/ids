'use client';

import { EyeDropperIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeEventHandlers } from '../../../../utils';
import { IconButton } from '../../../action/icon-button';
import { useInternalPicker } from '../context';
import { useInternalEyeDropperSupport } from '../hooks/use-color-picker';

import type { ColorPicker } from '..';

export function ColorPickerEyeDropper({
  className,
  children,
  onClick,
  ...props
}: ColorPicker.ButtonProps) {
  const t = useInternalTranslate();

  const c = useInternalPicker('ColorPicker.EyeDropper');
  const supported = useInternalEyeDropperSupport();
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
