import {
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { CheckIcon, ClipboardDocumentIcon, EyeDropperIcon } from '@heroicons/react/16/solid';

import { cssColor, formatPlaceholder, parseColor, type ColorFormat } from './color';
import { useClipboardSupport, useColorPicker, useEyeDropperSupport } from './use-color-picker';
import { flattenParts, resolveState } from '../../../internal/field-popup';
import { fieldSurface } from '../../../internal/field-surface';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps, tv } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';

export type { ColorFormat } from './color';

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
  alpha?: boolean;
  swatches?: ColorPickerSwatchOption[];
  disabled?: boolean;
  readOnly?: boolean;
  size?: IdsSize;
  className?: string | ((state: ColorPickerState) => string | undefined);
  children?: ReactNode;
};

type Context = {
  picker: ReturnType<typeof useColorPicker>;
  state: ColorPickerState;
  format: ColorFormat;
  alpha: boolean;
  swatches: ColorPickerSwatchOption[] | undefined;
  thumb: number;
  styles: ReturnType<typeof ColorPicker.Style>;
};

const PickerContext = createContext<Context | null>(null);
const SwatchesContext = createContext<{ tabStop: string | undefined } | null>(null);

function usePicker(part: string) {
  const context = use(PickerContext);
  invariant(context, `${part} must be rendered inside ColorPicker.`);
  return context;
}

// Translucent colors are drawn over a checkerboard so their transparency shows. The squares use
// the theme's surface and muted colors, so they read in light and dark alike.
const CHECKER =
  'conic-gradient(var(--ids-color-muted) 25%, var(--ids-color-surface) 0 50%, var(--ids-color-muted) 0 75%, var(--ids-color-surface) 0)';
const HUES = 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';
const overChecker = (css: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${css}, ${css}), ${CHECKER}`,
  backgroundSize: '100% 100%, 8px 8px',
});
// The thumb stays inside its track, so it travels the track's length minus its own width.
const thumbLeft = (ratio: number, thumb: number) =>
  `calc(${ratio} * (100% - ${thumb}px) + ${thumb / 2}px)`;
const swatchValue = (swatch: ColorPickerSwatchOption) =>
  typeof swatch === 'string' ? swatch : swatch.value;

export function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  format = 'hex',
  alpha = false,
  swatches,
  disabled = false,
  readOnly = false,
  size,
  className,
  children,
  ...props
}: ColorPickerProps) {
  const picker = useColorPicker({
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
  const styles = ColorPicker.Style({ size: resolvedSize });
  return (
    <PickerContext
      value={{
        picker,
        state,
        format,
        alpha,
        swatches,
        thumb: resolvedSize === 'tiny' ? 14 : 16,
        styles,
      }}
    >
      <div
        role="group"
        {...props}
        aria-label={
          props['aria-label'] ?? (props['aria-labelledby'] ? undefined : messages.colorPicker.label)
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
  const c = usePicker('ColorPicker');
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

// Two range inputs carry the area for assistive technology, one per axis, since a slider has a
// single value. The arrow keys move either axis from whichever input has focus, and only the
// first is in the Tab order; the second is still reachable by a screen reader's own navigation.
function ColorPickerArea({ className, style, ...props }: ColorPicker.AreaProps) {
  const c = usePicker('ColorPicker.Area');
  const { color, rgba } = c.picker.state;
  const saturation = Math.round(color.s * 100);
  const brightness = Math.round(color.v * 100);
  const valueText = messages.colorPicker.areaValue(saturation, brightness);
  const channel = {
    type: 'range',
    min: 0,
    max: 100,
    step: 1,
    'aria-valuetext': valueText,
    'aria-roledescription': messages.colorPicker.twoD,
    'aria-readonly': c.state.readOnly || undefined,
    disabled: c.state.disabled,
    className: c.styles.channel(),
    onKeyDown: c.picker.area.onKeyDown,
  } as const;
  return (
    <div
      {...mergeProps(props, {
        onPointerDown: c.picker.area.onPointerDown,
        onPointerMove: c.picker.area.onPointerMove,
      })}
      role="group"
      aria-label={props['aria-label'] ?? messages.colorPicker.area}
      dir="ltr"
      data-color-picker-area=""
      data-disabled={c.state.disabled ? '' : undefined}
      className={c.styles.area({ className })}
      style={{
        ...style,
        backgroundColor: `hsl(${color.h} 100% 50%)`,
        backgroundImage:
          'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}
    >
      <span
        aria-hidden="true"
        className={c.styles.areaThumb()}
        style={{
          left: `${color.s * 100}%`,
          top: `${(1 - color.v) * 100}%`,
          backgroundColor: cssColor({ ...rgba, alpha: 1 }),
        }}
      />
      <input
        {...channel}
        aria-label={messages.colorPicker.saturation}
        value={saturation}
        onChange={(event) => c.picker.actions.onChannelChange('saturation', event)}
      />
      <input
        {...channel}
        aria-label={messages.colorPicker.brightness}
        aria-orientation="vertical"
        tabIndex={-1}
        value={brightness}
        onChange={(event) => c.picker.actions.onChannelChange('brightness', event)}
      />
    </div>
  );
}

function ColorPickerHueSlider({ className, style, ...props }: ColorPicker.SliderProps) {
  const c = usePicker('ColorPicker.HueSlider');
  const { color } = c.picker.state;
  const hue = Math.round(color.h);
  const handlers = c.picker.slider('hue', c.thumb);
  return (
    <div
      {...mergeProps(props, {
        onPointerDown: handlers.onPointerDown,
        onPointerMove: handlers.onPointerMove,
      })}
      dir="ltr"
      data-color-picker-hue=""
      data-disabled={c.state.disabled ? '' : undefined}
      className={c.styles.slider({ className })}
      style={{ ...style, backgroundImage: HUES }}
    >
      <span
        aria-hidden="true"
        className={c.styles.sliderThumb()}
        style={{
          left: thumbLeft(color.h / 360, c.thumb),
          backgroundColor: `hsl(${color.h} 100% 50%)`,
        }}
      />
      <input
        type="range"
        min={0}
        max={360}
        step={1}
        value={hue}
        aria-label={props['aria-label'] ?? messages.colorPicker.hue}
        aria-valuetext={messages.colorPicker.hueValue(hue)}
        aria-readonly={c.state.readOnly || undefined}
        disabled={c.state.disabled}
        className={c.styles.channel()}
        onChange={(event) => c.picker.actions.onChannelChange('hue', event)}
        onKeyDown={handlers.onKeyDown}
      />
    </div>
  );
}

function ColorPickerAlphaSlider({ className, style, ...props }: ColorPicker.SliderProps) {
  const c = usePicker('ColorPicker.AlphaSlider');
  if (!c.alpha) return null;
  const { color, rgba } = c.picker.state;
  const percent = Math.round(color.a * 100);
  const handlers = c.picker.slider('alpha', c.thumb);
  return (
    <div
      {...mergeProps(props, {
        onPointerDown: handlers.onPointerDown,
        onPointerMove: handlers.onPointerMove,
      })}
      dir="ltr"
      data-color-picker-alpha=""
      data-disabled={c.state.disabled ? '' : undefined}
      className={c.styles.slider({ className })}
      style={{
        ...style,
        backgroundImage: `linear-gradient(to right, transparent, ${cssColor({ ...rgba, alpha: 1 })}), ${CHECKER}`,
        backgroundSize: '100% 100%, 8px 8px',
      }}
    >
      <span
        aria-hidden="true"
        className={c.styles.sliderThumb()}
        style={{ left: thumbLeft(color.a, c.thumb), ...overChecker(cssColor(rgba)) }}
      />
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        aria-label={props['aria-label'] ?? messages.colorPicker.alpha}
        aria-valuetext={messages.colorPicker.percent(percent)}
        aria-readonly={c.state.readOnly || undefined}
        disabled={c.state.disabled}
        className={c.styles.channel()}
        onChange={(event) => c.picker.actions.onChannelChange('alpha', event)}
        onKeyDown={handlers.onKeyDown}
      />
    </div>
  );
}

function ColorPickerInput({ className, ...props }: ColorPicker.InputProps) {
  const c = usePicker('ColorPicker.Input');
  const { input } = c.picker;
  return (
    <input
      {...mergeProps(props as Record<string, unknown>, {
        type: 'text',
        'aria-label': props['aria-label'] ?? messages.colorPicker.input,
        autoComplete: 'off',
        autoCorrect: 'off',
        autoCapitalize: 'none',
        spellCheck: false,
        value: input.value,
        placeholder: props.placeholder ?? formatPlaceholder(c.format, c.alpha),
        disabled: c.state.disabled,
        readOnly: c.state.readOnly,
        'aria-invalid': input.invalid || undefined,
        'data-color-picker-input': '',
        className: c.styles.input({ className }),
        onChange: input.onChange,
        onBlur: input.onBlur,
        onKeyDown: input.onKeyDown,
      })}
    />
  );
}

function ColorPickerEyeDropper({ className, children, ...props }: ColorPicker.ButtonProps) {
  const c = usePicker('ColorPicker.EyeDropper');
  const supported = useEyeDropperSupport();
  if (!supported) return null;
  return (
    <button
      {...mergeProps(props as Record<string, unknown>, {
        type: 'button' as const,
        'aria-label': props['aria-label'] ?? messages.colorPicker.eyeDropper,
        disabled: c.state.disabled || c.state.readOnly,
        'data-color-picker-eyedropper': '',
        className: c.styles.tool({ className }),
        onClick: c.picker.actions.pickFromScreen,
      })}
    >
      {children ?? <EyeDropperIcon aria-hidden="true" />}
    </button>
  );
}

function ColorPickerCopy({ className, children, ...props }: ColorPicker.ButtonProps) {
  const c = usePicker('ColorPicker.Copy');
  const supported = useClipboardSupport();
  if (!supported) return null;
  const { copied, parsed } = c.picker.state;
  return (
    <>
      <button
        {...mergeProps(props as Record<string, unknown>, {
          type: 'button' as const,
          'aria-label':
            props['aria-label'] ??
            (copied ? messages.colorPicker.copied : messages.colorPicker.copy),
          disabled: c.state.disabled || !parsed,
          'data-color-picker-copy': '',
          'data-copied': copied ? '' : undefined,
          className: c.styles.tool({ className }),
          onClick: c.picker.actions.copy,
        })}
      >
        {children ??
          (copied ? (
            <CheckIcon aria-hidden="true" />
          ) : (
            <ClipboardDocumentIcon aria-hidden="true" />
          ))}
      </button>
      <span role="status" className={c.styles.channel()}>
        {copied ? messages.colorPicker.copied : ''}
      </span>
    </>
  );
}

function ColorPickerSwatches({ className, children, ...props }: ColorPicker.SwatchesProps) {
  const c = usePicker('ColorPicker.Swatches');
  const values = children
    ? flattenParts(children).flatMap((node) =>
        isValidElement<ColorPicker.SwatchProps>(node) && node.type === ColorPickerSwatch
          ? [node.props.value]
          : [],
      )
    : (c.swatches ?? []).map(swatchValue);
  const readable = values.filter((item) => parseColor(item));
  // One Tab stop for the whole palette: the chosen swatch, or the first.
  const tabStop = readable.find((item) => c.picker.actions.isCurrent(item)) ?? readable[0];
  return (
    <SwatchesContext value={{ tabStop }}>
      <div
        {...mergeProps(props as Record<string, unknown>, {
          role: 'radiogroup',
          'aria-label': props['aria-label'] ?? messages.colorPicker.swatches,
          'aria-readonly': c.state.readOnly || undefined,
          'data-color-picker-swatches': '',
          className: c.styles.swatches({ className }),
          onKeyDown: c.picker.actions.onSwatchesKeyDown,
        })}
      >
        {children ??
          (c.swatches ?? []).map((swatch, index) => (
            <ColorPickerSwatch
              key={`${swatchValue(swatch)}-${index}`}
              value={swatchValue(swatch)}
              label={typeof swatch === 'string' ? undefined : swatch.label}
            />
          ))}
      </div>
    </SwatchesContext>
  );
}

function ColorPickerSwatch({ value, label, className, style, ...props }: ColorPicker.SwatchProps) {
  const c = usePicker('ColorPicker.Swatch');
  const group = use(SwatchesContext);
  const parsed = parseColor(value);
  // An unreadable color is skipped rather than drawn as an empty square.
  if (!parsed) return null;
  const checked = c.picker.actions.isCurrent(value);
  return (
    <button
      {...mergeProps(props as Record<string, unknown>, {
        type: 'button' as const,
        role: 'radio',
        'aria-checked': checked,
        'aria-label': label ?? value,
        title: label ?? value,
        tabIndex: group ? (group.tabStop === value ? 0 : -1) : undefined,
        disabled: c.state.disabled,
        'data-color-picker-swatch': '',
        className: c.styles.swatch({ className }),
        style: { ...style, ...overChecker(cssColor(parsed)) },
        onClick: () => c.picker.actions.chooseSwatch(value),
      })}
    />
  );
}

export namespace ColorPicker {
  export type Props = ColorPickerProps;
  export type State = ColorPickerState;
  export type SwatchOption = ColorPickerSwatchOption;

  export type AreaProps = Omit<ComponentProps<'div'>, 'children'>;
  export type SliderProps = Omit<ComponentProps<'div'>, 'children'>;
  export type InputProps = Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'type'>;
  export type ButtonProps = ComponentProps<'button'>;
  export type SwatchesProps = ComponentProps<'div'>;
  export type SwatchProps = Omit<ComponentProps<'button'>, 'value' | 'children'> & {
    value: string;
    label?: string;
  };

  export const Area = ColorPickerArea;
  export const HueSlider = ColorPickerHueSlider;
  export const AlphaSlider = ColorPickerAlphaSlider;
  export const Input = ColorPickerInput;
  export const EyeDropper = ColorPickerEyeDropper;
  export const Copy = ColorPickerCopy;
  export const Swatches = ColorPickerSwatches;
  export const Swatch = ColorPickerSwatch;

  const thumb = [
    'pointer-events-none absolute rounded-full border-2 border-white',
    'shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.3)]',
    'transition-[box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
  ];

  export const Style = tv({
    slots: {
      root: 'grid w-full min-w-0 gap-3 text-(--ids-color-on-surface) data-disabled:opacity-50',
      area: [
        'group/area relative w-full cursor-crosshair touch-none rounded-standard select-none',
        'inset-ring-1 inset-ring-(--ids-color-on-surface)/10 data-disabled:cursor-not-allowed',
      ],
      areaThumb: [
        thumb,
        '-translate-x-1/2 -translate-y-1/2',
        'group-has-[input:focus-visible]/area:ring-[3px] group-has-[input:focus-visible]/area:ring-(--ids-color-primary)/50',
      ],
      // The native inputs that carry each channel for keyboards and assistive technology.
      channel: 'sr-only',
      row: 'flex min-w-0 items-center gap-2',
      sliders: 'grid min-w-0 flex-1 gap-3',
      slider: [
        'group/slider relative w-full cursor-pointer touch-none rounded-full select-none',
        'inset-ring-1 inset-ring-(--ids-color-on-surface)/10 data-disabled:cursor-not-allowed',
      ],
      sliderThumb: [
        thumb,
        'top-1/2 -translate-x-1/2 -translate-y-1/2',
        'group-has-[input:focus-visible]/slider:ring-[3px] group-has-[input:focus-visible]/slider:ring-(--ids-color-primary)/50',
      ],
      input: [
        fieldSurface.base,
        fieldSurface.variant.outline,
        'min-w-0 flex-1 font-mono outline-none placeholder:text-(--ids-color-on-muted)',
      ],
      tool: [
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-standard',
        'bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
        'hover:bg-(--ids-color-muted) dark:bg-(--ids-color-muted)/30',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'focus-ring disabled:pointer-events-none disabled:opacity-50',
      ],
      swatches: 'flex flex-wrap gap-2',
      // The chosen swatch gets a ring behind a surface-colored gap, so it stays visible on a
      // swatch the same color as the ring.
      swatch: [
        'shrink-0 cursor-pointer rounded-standard inset-ring-1 inset-ring-(--ids-color-on-surface)/10',
        'aria-checked:ring-2 aria-checked:ring-(--ids-color-primary) aria-checked:ring-offset-2 aria-checked:ring-offset-(--ids-color-surface)',
        'focus-ring disabled:cursor-not-allowed',
      ],
    },
    variants: {
      size: {
        standard: {
          area: 'h-40',
          areaThumb: 'size-4',
          slider: 'h-3',
          sliderThumb: 'size-4',
          input: fieldSurface.size.standard,
          tool: 'size-(--ids-size-control-standard) [&_svg]:size-(--ids-size-icon-standard)',
          swatch: 'size-7',
        },
        tiny: {
          area: 'h-32',
          areaThumb: 'size-3.5',
          slider: 'h-2.5',
          sliderThumb: 'size-3.5',
          input: fieldSurface.size.tiny,
          tool: 'size-(--ids-size-control-tiny) [&_svg]:size-(--ids-size-icon-tiny)',
          swatch: 'size-6',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { size: 'standard' },
  });
}
