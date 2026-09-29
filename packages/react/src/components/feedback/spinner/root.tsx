'use client';

import { useCallback, useRef } from 'react';

import { spinnerStyle } from './style';
import { useSpinner } from './use-spinner';
import { Arc } from '../../../internal/arc';
import { messages } from '../../../internal/messages';
import { mergeRefs } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { Spinner } from '.';

const SIZE_WHEN_UNSTYLED = '1em';

export function SpinnerRoot({
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
  const { root, track } = spinnerStyle({ size: resolvedSize });

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
