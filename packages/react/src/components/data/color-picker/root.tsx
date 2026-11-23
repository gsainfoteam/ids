'use client';

import { use, type ComponentProps, type ReactNode } from 'react';

import { PickerContext, PickerDefaultsContext, useInternalPicker } from './context';
import { useInternalColorPicker } from './hooks/use-color-picker';
import { ColorPickerAlphaSlider } from './parts/alpha-slider';
import { ColorPickerArea } from './parts/area';
import { ColorPickerCopy } from './parts/copy';
import { ColorPickerEyeDropper } from './parts/eye-dropper';
import { ColorPickerHueSlider } from './parts/hue-slider';
import { ColorPickerInput } from './parts/input';
import { ColorPickerSwatches } from './parts/swatches';
import { colorPickerStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { useInternalTranslate } from '../../../internal/translate';
import { containsElementOfType } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { ColorFormat } from './lib/color';
import type { IdsSize } from '../../../tokens/types';

export type ColorPickerSwatchOption = string | { value: string; label?: string };

export type ColorPickerState = {
  disabled: boolean;
  readOnly: boolean;
  empty: boolean;
  alpha: boolean;
};

export type ColorPickerProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'children'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  disabled?: boolean;
  readOnly?: boolean;
  size?: IdsSize;
  className?: string | ((state: ColorPickerState) => string | undefined);
  children?: ReactNode;
};

const ALPHA_SLIDER = new Set<unknown>([ColorPickerAlphaSlider]);

export function ColorPickerRoot({
  value,
  defaultValue,
  onValueChange,
  format = 'hex',
  disabled = false,
  readOnly = false,
  size,
  className,
  children,
  ...props
}: ColorPickerProps) {
  const t = useInternalTranslate();
  const defaults = use(PickerDefaultsContext);
  const alpha = defaults.alpha ?? containsElementOfType(children, ALPHA_SLIDER);
  const swatches = defaults.swatches;

  const picker = useInternalColorPicker({
    value,
    defaultValue,
    onValueChange,
    format,
    alpha,
    disabled,
    readOnly,
  });
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const state: ColorPickerState = { disabled, readOnly, empty: !picker.state.value, alpha };
  const styles = colorPickerStyle({ size: resolvedSize, disabled });
  return (
    <PickerContext value={{ picker, state, format, alpha, swatches, size: resolvedSize, styles }}>
      <div
        role="group"
        {...props}
        aria-label={
          props['aria-label'] ?? (props['aria-labelledby'] ? undefined : t('colorPicker.label'))
        }
        data-color-picker=""
        data-size={resolvedSize}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
      >
        {children ?? <DefaultLayout />}
      </div>
    </PickerContext>
  );
}

function DefaultLayout() {
  const c = useInternalPicker('ColorPicker');
  return (
    <>
      <ColorPickerArea />
      <div className={c.styles.row()}>
        <ColorPickerEyeDropper />
        <div className={c.styles.sliders()}>
          <ColorPickerHueSlider />
          {c.alpha && <ColorPickerAlphaSlider />}
        </div>
      </div>
      <div className={c.styles.row()}>
        <ColorPickerInput />
        <ColorPickerCopy />
      </div>
      {!!c.swatches?.length && <ColorPickerSwatches />}
    </>
  );
}
