export type CountState = {
  count: number;
  maxLength: number | undefined;
  remaining: number | undefined;
  nearLimit: boolean;
  atLimit: boolean;
};

export function countState(length: number, maxLength: number | undefined, threshold?: number) {
  const remaining = maxLength === undefined ? undefined : maxLength - length;
  const warnAt =
    threshold ?? (maxLength === undefined ? 0 : Math.max(10, Math.ceil(maxLength * 0.1)));
  return {
    count: length,
    maxLength,
    remaining,
    nearLimit: remaining !== undefined && remaining <= warnAt,
    atLimit: remaining !== undefined && remaining <= 0,
  } satisfies CountState;
}
