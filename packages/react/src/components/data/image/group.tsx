'use client';

import {
  isValidElement,
  useCallback,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { ImageGroupContext } from './context';
import { imageStyle } from './style';
import { useImageGroup, type UseImageGroupOptions } from './use-image-group';
import { ImageViewer } from './viewer';
import { flattenFragments, invariant, mergeRefs } from '../../../utils';

export type ImageGroupLayout = 'row' | 'column' | 'grid';

const keepListRoleInSafari = { role: 'list' } as const;

export type ImageGroupProps = Omit<ComponentProps<'ul'>, 'defaultValue' | 'onChange'> &
  UseImageGroupOptions & {
    layout?: ImageGroupLayout;
    columns?: number;
  };

type ImageGroupRootProps = ImageGroupProps & { viewer?: ReactNode };

export function ImageGroup({
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
    'Image.Group: columns must be a positive whole number.',
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

  const styles = imageStyle({ layout });
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
        className={styles.group({ className })}
        style={{ ...columnCount, ...style }}
      >
        {images.map((child, index) => {
          if (isValidElement(child) && child.type === 'li') return child;

          const key = isValidElement(child) ? (child.key ?? index) : index;
          return (
            <li key={key} className={styles.groupItem()}>
              {child}
            </li>
          );
        })}
      </ul>
      {viewer ?? <ImageViewer />}
    </ImageGroupContext>
  );
}
