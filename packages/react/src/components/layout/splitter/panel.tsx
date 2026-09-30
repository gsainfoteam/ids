'use client';

import { type ComponentProps } from 'react';

import { PanelIndexContext, useSplitterPart } from './context';
import { mergeProps, part } from '../../../utils';

export type SplitterPanelProps = ComponentProps<'div'> & {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
  asChild?: boolean;
};

export function SplitterPanel({
  defaultSize: _readByTheRoot,
  minSize: _minSizeReadByTheRoot,
  maxSize: _maxSizeReadByTheRoot,
  collapsible: _collapsibleReadByTheRoot,
  collapsedSize: _collapsedSizeReadByTheRoot,
  asChild,
  className,
  style,
  children,
  ...props
}: SplitterPanelProps) {
  const { styles, splitter, index } = useSplitterPart('Splitter.Panel', PanelIndexContext);
  const panel = splitter.panel(index);

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      ...panel.props,
      className: styles.panel({ className }),
      style: { ...style, flexGrow: panel.size },
    }),
  );
}

SplitterPanel.displayName = 'Splitter.Panel';
