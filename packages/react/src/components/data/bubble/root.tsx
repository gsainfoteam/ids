'use client';

import { cloneElement, isValidElement, type ReactNode } from 'react';

import { BubbleContext } from './context';
import { fitToLongestLine } from './fit-to-longest-line';
import { BubbleReactions } from './reactions';
import { bubbleStyle } from './style';
import { elementTypeOf, flattenFragments, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Bubble } from '.';

export type BubbleAlign = 'start' | 'end';
export type BubbleVariant = 'soft' | 'solid' | 'outline';

function splitTrailingReactions(children: ReactNode) {
  const flat = flattenFragments(children);
  const last = flat.at(-1);
  const trailing = isValidElement(last) && elementTypeOf(last) === BubbleReactions;
  return trailing ? { body: flat.slice(0, -1), reactions: last } : { body: flat, reactions: null };
}

export function BubbleRoot({
  align = 'start',
  variant = 'soft',
  asChild = false,
  className,
  children,
  ref,
  ...rest
}: Bubble.Props) {
  const target = asChild && isValidElement<{ children?: ReactNode }>(children) ? children : null;
  const { body, reactions } = splitTrailingReactions(target ? target.props.children : children);
  const overlap = reactions !== null;
  const inFlow = bubbleStyle({ variant, align, overlap: false });
  const overlapping = bubbleStyle({ variant, align, overlap: true });

  const content = (
    <BubbleContext value={{ styles: inFlow, overlap: false }}>
      {body}
      {overlap && (
        <BubbleContext value={{ styles: overlapping, overlap: true }}>{reactions}</BubbleContext>
      )}
    </BubbleContext>
  );
  const Root = target ? Slot : 'div';

  return (
    <Root
      {...rest}
      ref={mergeRefs(ref, fitToLongestLine)}
      data-bubble=""
      data-align={align}
      data-variant={variant}
      data-reactions={overlap ? '' : undefined}
      className={(overlap ? overlapping : inFlow).root({ className })}
    >
      {target ? cloneElement(target, undefined, content) : content}
    </Root>
  );
}
