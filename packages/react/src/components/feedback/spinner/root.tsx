'use client';

import { useInternalSpinner } from './hooks/use-spinner';
import { hiddenFromScreenReaders } from './lib/aria-hidden';
import { spinnerStyle } from './style';
import { Arc } from '../../../internal/parts/arc';
import { useInternalTranslate } from '../../../internal/translate';
import { useFieldSize } from '../../form/field/context';

import type { Spinner } from '.';

const SIZE_WHEN_UNSTYLED = '1em';

export function SpinnerRoot({
  size,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  className,
  ref,
  ...rest
}: Spinner.Props) {
  const t = useInternalTranslate();

  const resolvedSize = useFieldSize(size);
  const { ref: mergedRef, announcement } = useInternalSpinner(
    ref,
    hiddenFromScreenReaders(ariaHidden),
  );

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
          {announcement === 'announced' ? (ariaLabel ?? t('common.loading')) : null}
        </span>
      )}
    </>
  );
}
