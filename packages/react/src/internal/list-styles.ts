import { cn } from '../utils/cn';

const offsetParentOfOptions = cn('relative');
const ringOffSinceCaretShowsFocus = cn('ring-0! inset-ring-transparent!');

export const listStyles = {
  option: cn(
    'relative flex cursor-default items-center gap-2 rounded-standard py-1.5 ps-2.5 pe-8 outline-none select-none wrap-anywhere',
    'data-highlighted:bg-(--ids-color-muted)',
    'aria-disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ),
  indicator: cn(
    'pointer-events-none absolute end-2.5 flex items-center justify-center',
    '[&_svg]:size-(--ids-size-icon-standard)',
  ),
  listArea: cn('-mx-1 rounded-[inherit]'),
  list: cn(
    offsetParentOfOptions,
    'flex flex-col overscroll-contain px-1 outline-none [overflow-anchor:none]',
  ),
  heading: cn('px-2.5 pt-2 pb-1 text-caption-c1-medium text-(--ids-color-on-muted)'),
  separator: cn('-mx-1 my-1 w-auto'),
  empty: cn('px-2.5 py-6 text-center text-body-b3-regular text-(--ids-color-on-muted)'),
  searchRoot: cn(
    '-mx-1 -mt-1 mb-1 h-auto w-auto rounded-none border-b border-(--ids-color-border)',
    ringOffSinceCaretShowsFocus,
  ),
  search: cn('h-10'),
} as const;
