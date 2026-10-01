import DecimalJs from 'decimal.js';

const DIGITS_THAT_KEEP_A_SUM_OF_ANY_TWO_NUMBERS_EXACT = 700;

export const Decimal = DecimalJs.clone({
  precision: DIGITS_THAT_KEEP_A_SUM_OF_ANY_TWO_NUMBERS_EXACT,
  rounding: DecimalJs.ROUND_HALF_UP,
});

export type Decimal = DecimalJs;
