'use client';

import {
  isValidElement,
  useCallback,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { imageGroupStyle } from './style';
import { flattenFragments, invariant, mergeRefs } from '../../../utils';
import { ImageGroupContext } from '../image/context';
import { useImageGroup } from '../image/use-image-group';
import { ImageViewer } from '../image/viewer';

import type { ImageGroup } from '.';

const keepListRoleInSafari = { role: 'list' } as const;

type ImageGroupRootProps = ImageGroup.Props & { viewer?: ReactNode };

export function ImageGroupRoot({
  layout = 'row',
  columns = 3,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  zoom,
  onZoomChange,
  loop,
  className,
  style,
  children,
  ref,
  viewer,
  ...rest
}: ImageGroupRootProps) {
  invariant(
    Number.isInteger(columns) && columns > 0,
    'ImageGroup: columns must be a positive whole number.',
  );

  const group = useImageGroup({
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    zoom,
    onZoomChange,
    loop,
  });
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const attachList = useCallback(
    (node: HTMLUListElement | null) => mergeRefs(setList, ref)(node),
    [ref],
  );
  const { followTheDocumentOrder } = group;

  useLayoutEffect(() => {
    if (!list) return;

    const observer = new MutationObserver(followTheDocumentOrder);
    observer.observe(list, { childList: true });

    return () => observer.disconnect();
  }, [list, followTheDocumentOrder]);

  const styles = imageGroupStyle({ layout });
  const columnCount = layout === 'grid' ? ({ '--image-columns': columns } as CSSProperties) : null;

  const images = flattenFragments(children);

  return (
    <ImageGroupContext value={group}>
      <ul
        {...keepListRoleInSafari}
        {...rest}
        ref={attachList}
        data-image-group=""
        data-layout={layout}
        className={styles.root({ className })}
        style={{ ...columnCount, ...style }}
      >
        {images.map((child, index) => {
          if (isValidElement(child) && child.type === 'li') return child;

          const key = isValidElement(child) ? (child.key ?? index) : index;
          return (
            <li key={key} className={styles.item()}>
              {child}
            </li>
          );
        })}
      </ul>
      {viewer ?? <ImageViewer />}
    </ImageGroupContext>
  );
}
