'use client';

import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { cn } from '../../../../utils';
import { tableStyle } from '../../../data/table/style';
import { ScrollArea } from '../../../layout/scroll-area';

import type { IdsSize } from '../../../../tokens/types';

export function EditorTableView({ extension }: ReactNodeViewProps) {
  const size = (extension.options as { size: IdsSize }).size;
  const styles = tableStyle({ variant: 'outline', size, layout: 'fixed' });

  return (
    <NodeViewWrapper data-table="">
      <ScrollArea orientation="horizontal" fade="x" size={size} className={styles.root()}>
        <ScrollArea.Viewport className={styles.viewport()}>
          <NodeViewContent<'table'>
            as="table"
            className={styles.table({ className: cn('w-full!') })}
          />
        </ScrollArea.Viewport>
      </ScrollArea>
    </NodeViewWrapper>
  );
}
