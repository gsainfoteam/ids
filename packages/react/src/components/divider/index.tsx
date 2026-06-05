import { cn } from '../../utils';

export function Divider({
  orientation = 'horizontal',
  className,
}: Divider.Props) {
  return (
    <hr
      className={cn(
        'border-none m-0 shrink-0 bg-(--ids-color-outline)',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className,
      )}
    />
  );
}

export namespace Divider {
  export type Orientation = 'horizontal' | 'vertical';

  export type Props = {
    orientation?: Orientation;
    className?: string;
  };
}
