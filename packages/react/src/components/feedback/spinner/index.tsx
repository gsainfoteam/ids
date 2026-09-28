import { useCallback, useRef, type ComponentProps } from 'react';

import { useSpinner } from './use-spinner';
import { Arc } from '../../../internal/arc';
import { messages } from '../../../internal/messages';
import { mergeRefs, tv } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';

const SIZE_WHEN_UNSTYLED = '1em';

export function Spinner({
  size,
  decorative,
  'aria-label': ariaLabel,
  className,
  ref,
  ...rest
}: Spinner.Props) {
  const resolvedSize = useFieldSize(size);
  const svgRef = useRef<SVGSVGElement>(null);
  const mergedRef = useCallback(
    (node: SVGSVGElement | null) => mergeRefs(svgRef, ref)(node),
    [ref],
  );
  const { announcement } = useSpinner(svgRef, decorative);

  const state: Spinner.State = { size: resolvedSize, announced: announcement === 'announced' };
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const { root, track } = Spinner.Style({ size: resolvedSize });

  return (
    <>
      <Arc
        {...rest}
        ref={mergedRef}
        ratio={0.25}
        width={SIZE_WHEN_UNSTYLED}
        height={SIZE_WHEN_UNSTYLED}
        data-spinner=""
        data-size={resolvedSize}
        className={root({ className: resolvedClassName })}
        trackClassName={track()}
      />
      {announcement !== 'silent' && (
        <span role="status" className="sr-only">
          {announcement === 'announced' ? (ariaLabel ?? messages.spinner.label) : null}
        </span>
      )}
    </>
  );
}

export namespace Spinner {
  export type State = {
    size: IdsSize | undefined;
    announced: boolean;
  };

  export type Props = Omit<ComponentProps<'svg'>, 'children' | 'className' | 'width' | 'height'> & {
    size?: IdsSize;
    decorative?: boolean;
    className?: string | ((state: State) => string | undefined);
  };

  export const Style = tv({
    slots: {
      root: ['inline-block shrink-0 align-[-0.125em]', 'animate-spin motion-reduce:animate-pulse'],
      track: 'opacity-20',
    },
    variants: {
      size: {
        standard: { root: 'size-(--ids-size-icon-standard)' },
        tiny: { root: 'size-(--ids-size-icon-tiny)' },
      } satisfies Record<IdsSize, object>,
    },
  });
}
