import { invariant } from '../../../../utils';

import type { FileFieldRejection } from './file-rules';

export type FileFieldLimitsOptions = {
  maxSize?: number;
  maxCount?: number;
  onReject?: (rejections: FileFieldRejection[]) => void;
};

export const NO_LIMITS: FileFieldLimitsOptions = {};

export function checkedLimits<Limits extends FileFieldLimitsOptions>(
  owner: string,
  limits: Limits,
): Limits {
  const { maxSize, maxCount } = limits;
  invariant(
    maxSize === undefined || (Number.isFinite(maxSize) && maxSize >= 0),
    `${owner}: maxSize must be non-negative bytes.`,
  );
  invariant(
    maxCount === undefined || (Number.isInteger(maxCount) && maxCount >= 0),
    `${owner}: maxCount must be a non-negative integer.`,
  );

  return limits;
}
