'use client';

import { checkedLimits, NO_LIMITS, type FileFieldLimitsOptions } from '../lib/file-limits';

export type FileFieldOptions = {
  limits?: FileFieldLimitsOptions;
};

export type FileFieldInstance = {
  limits: FileFieldLimitsOptions;
};

export function useFileField({ limits = NO_LIMITS }: FileFieldOptions = {}): FileFieldInstance {
  return { limits: checkedLimits('useFileField', limits) };
}
