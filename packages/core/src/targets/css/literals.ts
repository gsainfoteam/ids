import type { Color, Dimension, LineHeight } from '../../ir/schema.ts';
import { spaced, string, word, type Value } from './values.ts';

export const THEME_INLINE = 'inline';

export const UTILITIES_LAYER = 'utilities';

export const NEUTRAL_FACTOR = 1;

const ZERO = 0;

export const number = (value: number): Value => [word(String(value))];

export const dimension = ({ value, unit }: Dimension): Value => [word(`${value}${unit}`)];

export const lengthOrZero = (length: Dimension): Value =>
  length.value === ZERO ? number(ZERO) : dimension(length);

export const lineHeight = (value: LineHeight): Value =>
  value.kind === 'length' ? dimension(value.length) : number(value.multiplier);

export const percent = (value: number): Value => [word(`${value}%`)];

export const milliseconds = (value: number): Value => [word(`${value}ms`)];

export const color = ({ hex }: Color): Value => [word(hex)];

export const keyword = (value: string): Value => [word(value)];

const FAMILY_NEEDS_QUOTES = /\s/;

export const fontFamily = (family: string): Value =>
  FAMILY_NEEDS_QUOTES.test(family) ? [string(family)] : [word(family)];

const TRANSPARENT = '#0000';

export const NO_SHADOW_THAT_STILL_COMPOSES = spaced(number(ZERO), number(ZERO), [
  word(TRANSPARENT),
]);

export const pseudoClass = (name: string) => `:${name}`;

export const functionalUtility = (name: string) => `${name}-*`;

export const customVariantShorthand = (name: string, selector: string) => `${name} (${selector})`;
