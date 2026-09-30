import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ImageFallback, type ImageFallbackProps } from './fallback';
import { ImageGroup, type ImageGroupLayout, type ImageGroupProps } from './group';
import { ImagePlaceholder, type ImagePlaceholderProps } from './placeholder';
import { ImageRoot } from './root';
import { imageStyle } from './style';
import { type ImageStatus } from '../../../internal/image-status';
import { type StateValue } from '../../../internal/state-props';

export function Image(props: Image.Props) {
  return <ImageRoot {...props} />;
}

export namespace Image {
  export type Status = ImageStatus;

  export type State = { status: ImageStatus; preview: boolean };

  export type Props = Omit<ComponentProps<'img'>, 'alt' | 'className' | 'style' | 'children'> & {
    alt: string;
    ratio?: number;
    preview?: boolean;
    previewSrc?: string;
    caption?: ReactNode;
    onStatusChange?: (status: ImageStatus) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export type PlaceholderProps = ImagePlaceholderProps;
  export type FallbackProps = ImageFallbackProps;
  export type GroupProps = ImageGroupProps;

  export const Placeholder = ImagePlaceholder;
  export namespace Placeholder {
    export type Props = ImagePlaceholderProps;
  }

  export const Fallback = ImageFallback;
  export namespace Fallback {
    export type Props = ImageFallbackProps;
  }

  export const Group = ImageGroup;
  export namespace Group {
    export type Layout = ImageGroupLayout;
    export type Props = ImageGroupProps;
  }

  export const Style = imageStyle;
}

export type { ImageGroupLayout } from './group';
