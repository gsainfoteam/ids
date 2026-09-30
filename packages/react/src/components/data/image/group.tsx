'use client';

import { isValidElement, type ComponentProps, type CSSProperties } from 'react';

import { ImageGroupContext } from './context';
import { imageStyle } from './style';
import { useImageGroup, type UseImageGroupOptions } from './use-image-group';
import { flattenFragments, invariant } from '../../../utils';

export type ImageGroupLayout = 'row' | 'column' | 'grid';

const keepListRoleInSafari = { role: 'list' } as const;

export type ImageGroupProps = Omit<ComponentProps<'ul'>, 'defaultValue' | 'onChange'> &
  UseImageGroupOptions & {
    layout?: ImageGroupLayout;
    columns?: number;
  };

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
  ...rest
}: ImageGroupProps) {
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
  const styles = imageStyle({ layout });
  const columnCount = layout === 'grid' ? ({ '--image-columns': columns } as CSSProperties) : null;

  return (
    <ImageGroupContext value={group}>
      <ul
        {...keepListRoleInSafari}
        {...rest}
        data-image-group=""
        data-layout={layout}
        className={styles.group({ className })}
        style={{ ...columnCount, ...style }}
      >
        {flattenFragments(children).map((child, index) => {
          if (isValidElement(child) && child.type === 'li') return child;

          const key = isValidElement(child) ? (child.key ?? index) : index;
          return (
            <li key={key} className={styles.groupItem()}>
              {child}
            </li>
          );
        })}
      </ul>
    </ImageGroupContext>
  );
}

ImageGroup.displayName = 'Image.Group';
