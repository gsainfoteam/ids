'use client';

import { invariant } from '../../../../utils';

import type { ChipValidateResult } from '../lib/chip-values';

export type ChipFieldCreateOptions = {
  onCreate?: (value: string) => void;
  validate?: (value: string) => ChipValidateResult;
};

export type UseChipFieldOptions = {
  create?: ChipFieldCreateOptions;
  maxCount?: number;
};

export type ChipFieldInstance = {
  create: ChipFieldCreateOptions | null;
  maxCount: number | undefined;
};

export function useChipField({ create, maxCount }: UseChipFieldOptions = {}): ChipFieldInstance {
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    '`useChipField` `maxCount` must be a non-negative integer.',
  );

  return { create: create ?? null, maxCount };
}
