'use client';

import { useEffect, useState } from 'react';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { Resizable, useResizable } from '../../../layout/resizable';
import { editorStyle } from '../style';

const MIN_IMAGE_WIDTH = 48;
const styles = editorStyle();

const widthOf = (width: unknown) => (typeof width === 'number' ? width : undefined);

function useInternalWidthOf(element: HTMLElement | null) {
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return width;
}

export function EditorImageView({ node, editor, selected, updateAttributes }: ReactNodeViewProps) {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);
  const room = useInternalWidthOf(wrapper);
  const { src, alt, title } = node.attrs as { src: string; alt?: string; title?: string };
  const resizable = useResizable({
    width: {
      value: widthOf(node.attrs.width),
      onValueChange: (width) => updateAttributes({ width: Math.round(width) }),
      min: MIN_IMAGE_WIDTH,
      max: room,
    },
  });
  const image = <img src={src} alt={alt ?? ''} title={title} className={styles.resizedImage()} />;

  return (
    <NodeViewWrapper
      ref={setWrapper}
      data-image=""
      data-selected={selected ? '' : undefined}
      className={styles.imageFrame()}
    >
      {editor.isEditable ? (
        <Resizable
          resizable={resizable}
          direction="horizontal"
          contentEditable={false}
          className={styles.imageResizable()}
        >
          {image}
        </Resizable>
      ) : (
        image
      )}
    </NodeViewWrapper>
  );
}
