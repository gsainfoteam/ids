export class IdsError extends Error {
  override name = 'IdsError';

  constructor(message: string) {
    super(`[IDS] ${message}`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new IdsError(message);
}
