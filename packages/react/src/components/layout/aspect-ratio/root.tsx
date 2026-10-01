'use client';

import { aspectRatioStyle } from './style';
import { invariant } from '../../../utils';

import type { AspectRatio } from '.';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

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
      className={root({ className: resolve(className, state) })}
      style={{ aspectRatio: ratio, ...resolve(style, state) }}
    >
      <div className={content()}>{children}</div>
    </div>
  );
}
