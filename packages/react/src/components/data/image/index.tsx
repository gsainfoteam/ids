import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ImageCaption, type ImageCaptionProps } from './caption';
import { ImageClose, type ImageCloseProps } from './close';
import { ImageCounter, type ImageCounterProps } from './counter';
import { ImageDownload, type ImageDownloadProps } from './download';
import { ImageFallback, type ImageFallbackProps } from './fallback';
import { ImageGroup, type ImageGroupLayout, type ImageGroupProps } from './group';
import { ImageNext, type ImageNextProps } from './next';
import { ImagePlaceholder, type ImagePlaceholderProps } from './placeholder';
import { ImagePrev, type ImagePrevProps } from './prev';
import { ImageRoot } from './root';
import { ImageShare, type ImageShareProps } from './share';
import { imageStyle } from './style';
import { ImageThumbnails, type ImageThumbnailsProps } from './thumbnails';
import { ImageToolbar, type ImageToolbarProps } from './toolbar';
import { ImageViewer, type ImageViewerItem, type ImageViewerProps } from './viewer';
import { ImageZoomIn, type ImageZoomInProps } from './zoom-in';
import { ImageZoomOut, type ImageZoomOutProps } from './zoom-out';
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

  export type ViewerItem = ImageViewerItem;

  export type PlaceholderProps = ImagePlaceholderProps;
  export type FallbackProps = ImageFallbackProps;
  export type GroupProps = ImageGroupProps;
  export type ViewerProps = ImageViewerProps;
  export type ToolbarProps = ImageToolbarProps;
  export type CounterProps = ImageCounterProps;
  export type ZoomInProps = ImageZoomInProps;
  export type ZoomOutProps = ImageZoomOutProps;
  export type DownloadProps = ImageDownloadProps;
  export type ShareProps = ImageShareProps;
  export type CloseProps = ImageCloseProps;
  export type PrevProps = ImagePrevProps;
  export type NextProps = ImageNextProps;
  export type CaptionProps = ImageCaptionProps;
  export type ThumbnailsProps = ImageThumbnailsProps;

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

  export const Viewer = ImageViewer;
  export namespace Viewer {
    export type Item = ImageViewerItem;
    export type Props = ImageViewerProps;
  }

  export const Toolbar = ImageToolbar;
  export namespace Toolbar {
    export type Props = ImageToolbarProps;
  }

  export const Counter = ImageCounter;
  export namespace Counter {
    export type Props = ImageCounterProps;
  }

  export const ZoomIn = ImageZoomIn;
  export namespace ZoomIn {
    export type Props = ImageZoomInProps;
  }

  export const ZoomOut = ImageZoomOut;
  export namespace ZoomOut {
    export type Props = ImageZoomOutProps;
  }

  export const Download = ImageDownload;
  export namespace Download {
    export type Props = ImageDownloadProps;
  }

  export const Share = ImageShare;
  export namespace Share {
    export type Props = ImageShareProps;
  }

  export const Close = ImageClose;
  export namespace Close {
    export type Props = ImageCloseProps;
  }

  export const Prev = ImagePrev;
  export namespace Prev {
    export type Props = ImagePrevProps;
  }

  export const Next = ImageNext;
  export namespace Next {
    export type Props = ImageNextProps;
  }

  export const Caption = ImageCaption;
  export namespace Caption {
    export type Props = ImageCaptionProps;
  }

  export const Thumbnails = ImageThumbnails;
  export namespace Thumbnails {
    export type Props = ImageThumbnailsProps;
  }

  export const Style = imageStyle;
}

export type { ImageGroupLayout } from './group';
export type { ImageViewerItem } from './viewer';
