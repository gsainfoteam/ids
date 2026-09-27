import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { invariant, tv } from '../../../utils';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function AspectRatio({ ratio = 1, className, style, children, ...rest }: AspectRatio.Props) {
  invariant(
    Number.isFinite(ratio) && ratio > 0,
    'AspectRatio: ratio must be a finite positive number.',
  );
  const state: AspectRatio.State = { ratio };
  const { root, content } = AspectRatio.Style();

  // The content sits in an absolute layer, so a tall image or a long text cannot stretch the box
  // away from its ratio.
  return (
    <div
      {...rest}
      data-aspect-ratio=""
      className={root({ className: resolve(className, state) })}
      style={{ aspectRatio: ratio, ...resolve(style, state) }}
    >
      <div className={content()}>{children}</div>
    </div>
  );
}

export namespace AspectRatio {
  export type State = { ratio: number };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    ratio?: number;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  // Children fill the box and media is cropped to it, both at zero specificity so any size or
  // object-fit class on the child still wins.
  export const Style = tv({
    slots: {
      root: 'relative w-full',
      content: [
        'absolute inset-0 min-h-0 min-w-0',
        '[:where(&>*)]:size-full [:where(&>img,&>video)]:object-cover',
      ],
    },
  });
}
