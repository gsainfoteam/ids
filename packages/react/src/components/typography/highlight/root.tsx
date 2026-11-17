'use client';

import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';

import { HighlightMark, type HighlightMarkProps } from './mark';
import { highlightStyle } from './style';
import { searchChunks, textOf } from '../../../internal/search-text';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Highlight } from '.';

const isMark = (node: ReactNode): node is ReactElement<HighlightMarkProps> =>
  isValidElement(node) && elementTypeOf(node) === HighlightMark;

export function HighlightRoot({
  query,
  variant = 'soft',
  className,
  children,
  ...rest
}: Highlight.Props) {
  const nodes = flattenFragments(children);
  const template = nodes.find(isMark);
  const text = textOf(nodes.filter((node) => !isMark(node)));
  const { root } = highlightStyle({ variant });

  return (
    <span {...rest} className={root({ className })}>
      {searchChunks(text, query).map((chunk, index) =>
        chunk.match ? (
          <HighlightMark key={index} variant={variant} {...template?.props}>
            {chunk.text}
          </HighlightMark>
        ) : (
          <Fragment key={index}>{chunk.text}</Fragment>
        ),
      )}
    </span>
  );
}
