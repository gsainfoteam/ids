export type StepDirection = 'first' | 'previous' | 'next' | 'last';

export function stepTarget(direction: StepDirection, page: number, pageCount: number) {
  switch (direction) {
    case 'first':
      return 1;
    case 'previous':
      return Math.max(1, page - 1);
    case 'next':
      return Math.min(pageCount, page + 1);
    case 'last':
      return pageCount;
  }
}
