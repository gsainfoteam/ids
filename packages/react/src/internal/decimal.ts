import BigNumber from 'bignumber.js';

export const Decimal = BigNumber.clone({
  DECIMAL_PLACES: 20,
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
  MODULO_MODE: BigNumber.ROUND_DOWN,
});

export type Decimal = BigNumber;
