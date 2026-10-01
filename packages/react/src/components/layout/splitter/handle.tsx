'use client';

import { type ComponentProps } from 'react';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid';

import { HandleIndexContext, useSplitterPart } from './context';
import { splitterStyle, type SplitterToggleSide } from './style';
import { useResizeDrag } from '../../../internal/resize-handle';
import { mergeProps, part } from '../../../utils';

export type SplitterHandleProps = ComponentProps<'div'> & { asChild?: boolean };

const CHEVRONS = {
  horizontal: { towardStart: ChevronLeftIcon, towardEnd: ChevronRightIcon },
  vertical: { towardStart: ChevronUpIcon, towardEnd: ChevronDownIcon },
};

function sideLeftOpen(toggle: { collapsed: boolean; before: boolean }): SplitterToggleSide {
  if (!toggle.collapsed) return 'center';
  return toggle.before ? 'after' : 'before';
}

export function SplitterHandle({ asChild, className, children, ...props }: SplitterHandleProps) {
  const { orientation, styles, splitter, index } = useSplitterPart(
    'Splitter.Handle',
    HandleIndexContext,
  );
  const handle = splitter.handle(index);
  const { dragProps } = useResizeDrag(handle.drag);
  const defaultLabel = props['aria-labelledby'] ? undefined : handle.props['aria-label'];

  const separator = part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      ...handle.props,
      ...dragProps,
      'aria-label': props['aria-label'] ?? defaultLabel,
      className: styles.handle({ className }),
    }),
  );

  const { toggle } = handle;
  if (!toggle) return separator;

  const movesTowardStart = toggle.before !== toggle.collapsed;
  const Chevron = CHEVRONS[orientation][movesTowardStart ? 'towardStart' : 'towardEnd'];
  const placed = splitterStyle({ orientation, side: sideLeftOpen(toggle) });

  return (
    <div data-splitter-handle-group="" className={styles.group()}>
      {separator}
      <button
        type="button"
        tabIndex={-1}
        aria-label={toggle.label}
        aria-expanded={!toggle.collapsed}
        aria-controls={toggle.controls}
        data-splitter-toggle=""
        className={placed.toggle()}
        onClick={toggle.onClick}
      >
        <Chevron className={placed.toggleIcon()} />
      </button>
    </div>
  );
}

SplitterHandle.displayName = 'Splitter.Handle';
