import { useCallback, useRef, type ComponentProps } from 'react';

import { useSpinner } from './use-spinner';
import { Arc } from '../../../internal/arc';
import { messages } from '../../../internal/messages';
import { mergeRefs, tv } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';

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
        // Without a size of its own the spinner is as tall as the text around it. A control's
        // icon sizing overrides these attributes, since any CSS rule beats an SVG attribute.
        width="1em"
        height="1em"
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

  // The svg must not get a size class unless one is asked for: controls size every icon that
  // has none, and that is how a spinner in a Button or IconButton matches its icons.
  export const Style = tv({
    slots: {
      root: [
        // Sits on the text like an icon glyph: -0.125em centres a 1em box on the x-height.
        'inline-block shrink-0 align-[-0.125em]',
        'animate-spin motion-reduce:animate-pulse',
      ],
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
