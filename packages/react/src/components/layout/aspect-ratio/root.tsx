'use client';

import { aspectRatioStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { invariant } from '../../../utils';

import type { AspectRatio } from '.';

export function AspectRatioRoot({
  ratio = 1,
  className,
  style,
  children,
  ...rest
}: AspectRatio.Props) {
  invariant(
    Number.isFinite(ratio) && ratio > 0,
    'AspectRatio: ratio must be a finite positive number.',
  );
  const state: AspectRatio.State = { ratio };
  const { root, content } = aspectRatioStyle();

  return (
    <div
      {...rest}
      data-aspect-ratio=""
      className={root({ className: resolveState(className, state) })}
      style={{ aspectRatio: ratio, ...resolveState(style, state) }}
    >
      <div className={content()}>{children}</div>
    </div>
  );
}
