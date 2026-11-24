import { isValidElement, type ComponentProps, type ReactNode } from 'react';

import { ImageGroupRoot } from './root';
import { imageGroupStyle } from './style';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { Image } from '../image';
import { ImageViewer } from '../image/parts/viewer';

import type { UseImageGroupOptions } from '../image/hooks/use-image-group';

export type ImageGroupLayout = 'row' | 'column' | 'grid';

export function ImageGroup(props: ImageGroup.Props) {
  const { children, ...rest } = props;
  const nodes = flattenFragments(children);
  const viewer = nodes.find(isTheViewer);

  return (
    <ImageGroupRoot {...rest} viewer={viewer}>
      {nodes.filter((node) => node !== viewer)}
    </ImageGroupRoot>
  );
}

export namespace ImageGroup {
  export type Layout = ImageGroupLayout;

  export type Props = Omit<ComponentProps<'ul'>, 'defaultValue' | 'onChange'> &
    UseImageGroupOptions & {
      layout?: ImageGroupLayout;
      columns?: number;
    };

  export const Style = imageGroupStyle;
}

const viewerAsWrittenOrServerRendered: unknown[] = [Image.Viewer, ImageViewer];

function isTheViewer(node: ReactNode) {
  return isValidElement(node) && viewerAsWrittenOrServerRendered.includes(elementTypeOf(node));
}
