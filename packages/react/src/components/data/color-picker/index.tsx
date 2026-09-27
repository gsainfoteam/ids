import {
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { CheckIcon, ClipboardDocumentIcon, EyeDropperIcon } from '@heroicons/react/16/solid';

import { cssColor, formatPlaceholder, parseColor, type ColorFormat } from './color';
import { useClipboardSupport, useColorPicker, useEyeDropperSupport } from './use-color-picker';
import { flattenParts, resolveState } from '../../../internal/field-popup';
import { messages } from '../../../internal/messages';
import { cn, invariant, mergeEventHandlers, mergeProps, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { useFieldSize } from '../../form/field/context';
import { Radio } from '../../form/radio';
import { RadioGroup } from '../../form/radio-group';
import { useRadioGroupContext } from '../../form/radio-group/context';
import { Slider } from '../../form/slider';
import { TextField } from '../../form/text-field';

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
  size: IdsSize;
  styles: ReturnType<typeof ColorPicker.Style>;
};

const PickerContext = createContext<Context | null>(null);

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
  const styles = ColorPicker.Style({ size: resolvedSize, disabled });
  return (
    <PickerContext value={{ picker, state, format, alpha, swatches, size: resolvedSize, styles }}>
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

// Drawn here rather than with Slider, which moves one value along one axis; IDS has no 2D control.
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

// The gradients run left to right in any page direction, so `dir="ltr"` keeps Slider's arrow keys
// and pointer mapping from flipping in a right-to-left page.
function ColorPickerHueSlider({ className, ...props }: ColorPicker.SliderProps) {
  const c = usePicker('ColorPicker.HueSlider');
  const { color } = c.picker.state;
  return (
    <Slider
      {...props}
      dir="ltr"
      data-color-picker-hue=""
      min={0}
      max={360}
      largeStep={10}
      value={Math.round(color.h)}
      onValueChange={(hue) => c.picker.actions.setChannel('hue', hue)}
      formatLabel={messages.colorPicker.hueValue}
      valueLabel="never"
      aria-label={props['aria-label'] ?? messages.colorPicker.hue}
      size={c.size}
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      className={c.styles.slider({ className })}
    >
      <Slider.Track className={c.styles.track()} style={{ backgroundImage: HUES }}>
        <Slider.Thumb
          className={c.styles.sliderThumb()}
          style={{ backgroundColor: `hsl(${color.h} 100% 50%)` }}
        />
      </Slider.Track>
    </Slider>
  );
}

function ColorPickerAlphaSlider({ className, ...props }: ColorPicker.SliderProps) {
  const c = usePicker('ColorPicker.AlphaSlider');
  if (!c.alpha) return null;
  const { color, rgba } = c.picker.state;
  return (
    <Slider
      {...props}
      dir="ltr"
      data-color-picker-alpha=""
      min={0}
      max={100}
      largeStep={10}
      value={Math.round(color.a * 100)}
      onValueChange={(percent) => c.picker.actions.setChannel('alpha', percent)}
      formatLabel={messages.colorPicker.percent}
      valueLabel="never"
      aria-label={props['aria-label'] ?? messages.colorPicker.alpha}
      size={c.size}
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      className={c.styles.slider({ className })}
    >
      <Slider.Track
        className={c.styles.track()}
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${cssColor({ ...rgba, alpha: 1 })}), ${CHECKER}`,
          backgroundSize: '100% 100%, 8px 8px',
        }}
      >
        <Slider.Thumb className={c.styles.sliderThumb()} style={overChecker(cssColor(rgba))} />
      </Slider.Track>
    </Slider>
  );
}

function ColorPickerInput({ className, style, ...props }: ColorPicker.InputProps) {
  const c = usePicker('ColorPicker.Input');
  const { input } = c.picker;
  return (
    <TextField
      {...mergeProps(props as Record<string, unknown>, {
        type: 'text',
        'aria-label': props['aria-label'] ?? messages.colorPicker.input,
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

function ColorPickerEyeDropper({
  className,
  children,
  onClick,
  ...props
}: ColorPicker.ButtonProps) {
  const c = usePicker('ColorPicker.EyeDropper');
  const supported = useEyeDropperSupport();
  if (!supported) return null;
  return (
    <IconButton
      {...props}
      aria-label={props['aria-label'] ?? messages.colorPicker.eyeDropper}
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

function ColorPickerCopy({ className, children, onClick, ...props }: ColorPicker.ButtonProps) {
  const c = usePicker('ColorPicker.Copy');
  const supported = useClipboardSupport();
  if (!supported) return null;
  const { copied, parsed } = c.picker.state;
  return (
    <>
      <IconButton
        {...props}
        aria-label={
          props['aria-label'] ?? (copied ? messages.colorPicker.copied : messages.colorPicker.copy)
        }
        disabled={c.state.disabled || !parsed}
        data-color-picker-copy=""
        data-copied={copied ? '' : undefined}
        variant="outline"
        size={c.size}
        icon={
          children ??
          (copied ? <CheckIcon aria-hidden="true" /> : <ClipboardDocumentIcon aria-hidden="true" />)
        }
        className={c.styles.tool({ className })}
        onClick={mergeEventHandlers(onClick, c.picker.actions.copy)}
      />
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
  return (
    <RadioGroup
      {...props}
      aria-label={props['aria-label'] ?? messages.colorPicker.swatches}
      value={values.find((item) => c.picker.actions.isCurrent(item)) ?? null}
      orientation="horizontal"
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      // The swatches choose the picker's color and are no value of their own, so an empty form
      // attribute leaves them without a form owner: a form around the picker neither submits
      // nor validates them, and they still make one native radio group.
      form=""
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

function ColorPickerSwatch({ value, label, className, style, ...props }: ColorPicker.SwatchProps) {
  const c = usePicker('ColorPicker.Swatch');
  // Inside Swatches the group checks the swatch; a swatch placed on its own checks itself.
  const grouped = useRadioGroupContext() !== null;
  const parsed = parseColor(value);
  // An unreadable color is skipped rather than drawn as an empty square.
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
      {/* The chosen swatch is ringed rather than dotted. */}
      {false}
    </Radio>
  );
}

export namespace ColorPicker {
  export type Props = ColorPickerProps;
  export type State = ColorPickerState;
  export type SwatchOption = ColorPickerSwatchOption;

  export type AreaProps = Omit<ComponentProps<'div'>, 'children'>;
  export type SliderProps = Omit<
    ComponentProps<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'role'
  >;
  // No native `size`: on the TextField it would be the IDS size, which the picker sets.
  export type InputProps = Omit<
    ComponentProps<'input'>,
    'value' | 'defaultValue' | 'type' | 'size'
  >;
  // One element, since the child becomes the IconButton's icon.
  export type ButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
    children?: ReactElement;
  };
  export type SwatchesProps = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'role'>;
  export type SwatchProps = Omit<
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

  export const Area = ColorPickerArea;
  export const HueSlider = ColorPickerHueSlider;
  export const AlphaSlider = ColorPickerAlphaSlider;
  export const Input = ColorPickerInput;
  export const EyeDropper = ColorPickerEyeDropper;
  export const Copy = ColorPickerCopy;
  export const Swatches = ColorPickerSwatches;
  export const Swatch = ColorPickerSwatch;

  // A white ring with a dark hairline reads on every color a thumb can sit on.
  const thumb = cn(
    'rounded-full border-2 border-white',
    'shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.3)]',
  );

  export const Style = tv({
    slots: {
      root: 'grid w-full min-w-0 gap-3 text-(--ids-color-on-surface) data-disabled:opacity-50',
      area: [
        'group/area relative w-full cursor-crosshair touch-none rounded-standard select-none',
        'inset-ring-1 inset-ring-(--ids-color-on-surface)/10 data-disabled:cursor-not-allowed',
      ],
      areaThumb: [
        thumb,
        'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2',
        'transition-shadow duration-(--ids-motion-fast) motion-reduce:transition-none',
        'group-has-[input:focus-visible]/area:ring-[3px] group-has-[input:focus-visible]/area:ring-(--ids-color-primary)/50',
      ],
      // The native inputs that carry each channel for keyboards and assistive technology.
      channel: 'sr-only',
      row: 'flex min-w-0 items-center gap-2',
      sliders: 'grid min-w-0 flex-1 gap-2',
      slider: 'cursor-pointer',
      track: 'inset-ring-1 inset-ring-(--ids-color-on-surface)/10',
      // The thumb is filled with its color, so Slider's primary edge and hover ring give way to
      // the white ring.
      sliderThumb: [thumb, 'inset-ring-0 hover:ring-0'],
      input: 'flex-1',
      inputText: 'font-mono',
      tool: '',
      swatches: 'gap-2',
      // The chosen swatch gets a ring behind a surface-colored gap, so it stays visible on a
      // swatch the same color as the ring.
      swatch: [
        'rounded-standard shadow-none inset-ring-(--ids-color-on-surface)/10',
        'data-[state=checked]:ring-2 data-[state=checked]:ring-(--radio-accent)',
        'data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-(--ids-color-surface)',
      ],
    },
    variants: {
      size: {
        standard: {
          area: 'h-40',
          areaThumb: 'size-4',
          slider: '[--slider-track:0.75rem]',
          swatch: 'size-7',
        },
        tiny: {
          area: 'h-32',
          areaThumb: 'size-3.5',
          slider: '[--slider-track:0.625rem]',
          swatch: 'size-6',
        },
      } satisfies Record<IdsSize, object>,
      // A disabled picker is dimmed once, at its root. The parts that dim themselves when disabled
      // would otherwise dim a second time over it.
      disabled: {
        true: {
          slider: 'data-disabled:opacity-100',
          input: 'data-disabled:opacity-100',
          tool: 'data-disabled:opacity-100',
          swatch: 'data-disabled:opacity-100',
        },
      },
    },
    defaultVariants: { size: 'standard' },
  });
}
