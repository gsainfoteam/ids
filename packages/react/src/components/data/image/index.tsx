import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ImageViewerCaption, type ImageViewerCaptionProps } from './parts/caption';
import { ImageViewerClose, type ImageViewerCloseProps } from './parts/close';
import { ImageViewerCounter, type ImageViewerCounterProps } from './parts/counter';
import { ImageViewerDownload, type ImageViewerDownloadProps } from './parts/download';
import { ImageFallback, type ImageFallbackProps } from './parts/fallback';
import { ImageViewerNext, type ImageViewerNextProps } from './parts/next';
import { ImagePlaceholder, type ImagePlaceholderProps } from './parts/placeholder';
import { ImageViewerPrev, type ImageViewerPrevProps } from './parts/prev';
import { ImageViewerSeparator, type ImageViewerSeparatorProps } from './parts/separator';
import { ImageViewerShare, type ImageViewerShareProps } from './parts/share';
import { ImageViewerThumbnails, type ImageViewerThumbnailsProps } from './parts/thumbnails';
import { ImageViewerToolbar, type ImageViewerToolbarProps } from './parts/toolbar';
import { ImageViewer, type ImageViewerItem, type ImageViewerProps } from './parts/viewer';
import { ImageViewerZoomIn, type ImageViewerZoomInProps } from './parts/zoom-in';
import { ImageViewerZoomOut, type ImageViewerZoomOutProps } from './parts/zoom-out';
import { ImageViewerZoomReset, type ImageViewerZoomResetProps } from './parts/zoom-reset';
import { ImageRoot } from './root';
import { imageStyle } from './style';
import { type ImageStatus } from '../../../internal/lib/image-status';
import { type StateValue } from '../../../internal/lib/state-props';

export function Image(props: Image.Props) {
  return <ImageRoot {...props} />;
}

export namespace Image {
  export type Status = ImageStatus;

  export type State = { status: ImageStatus; preview: boolean };

  export type Props = Omit<
    ComponentProps<'img'>,
    'alt' | 'src' | 'className' | 'style' | 'children'
  > & {
    alt: string;
    src?: string;
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
  export type ViewerProps = ImageViewerProps;

  export const Placeholder = ImagePlaceholder;
  export namespace Placeholder {
    export type Props = ImagePlaceholderProps;
  }

  export const Fallback = ImageFallback;
  export namespace Fallback {
    export type Props = ImageFallbackProps;
  }

  export function Viewer(props: Viewer.Props) {
    return <ImageViewer {...props} />;
  }

  Viewer.displayName = 'Image.Viewer';

  export namespace Viewer {
    export type Item = ImageViewerItem;
    export type Props = ImageViewerProps;

    export type ToolbarProps = ImageViewerToolbarProps;
    export type CounterProps = ImageViewerCounterProps;
    export type ZoomInProps = ImageViewerZoomInProps;
    export type ZoomOutProps = ImageViewerZoomOutProps;
    export type ZoomResetProps = ImageViewerZoomResetProps;
    export type DownloadProps = ImageViewerDownloadProps;
    export type ShareProps = ImageViewerShareProps;
    export type CloseProps = ImageViewerCloseProps;
    export type PrevProps = ImageViewerPrevProps;
    export type NextProps = ImageViewerNextProps;
    export type CaptionProps = ImageViewerCaptionProps;
    export type ThumbnailsProps = ImageViewerThumbnailsProps;
    export type SeparatorProps = ImageViewerSeparatorProps;

    export const Toolbar = ImageViewerToolbar;
    export namespace Toolbar {
      export type Props = ImageViewerToolbarProps;
    }

    export const Counter = ImageViewerCounter;
    export namespace Counter {
      export type Props = ImageViewerCounterProps;
    }

    export const ZoomIn = ImageViewerZoomIn;
    export namespace ZoomIn {
      export type Props = ImageViewerZoomInProps;
    }

    export const ZoomOut = ImageViewerZoomOut;
    export namespace ZoomOut {
      export type Props = ImageViewerZoomOutProps;
    }

    export const ZoomReset = ImageViewerZoomReset;
    export namespace ZoomReset {
      export type Props = ImageViewerZoomResetProps;
    }

    export const Download = ImageViewerDownload;
    export namespace Download {
      export type Props = ImageViewerDownloadProps;
    }

    export const Share = ImageViewerShare;
    export namespace Share {
      export type Props = ImageViewerShareProps;
    }

    export const Close = ImageViewerClose;
    export namespace Close {
      export type Props = ImageViewerCloseProps;
    }

    export const Separator = ImageViewerSeparator;
    export namespace Separator {
      export type Props = ImageViewerSeparatorProps;
    }

    export const Prev = ImageViewerPrev;
    export namespace Prev {
      export type Props = ImageViewerPrevProps;
    }

    export const Next = ImageViewerNext;
    export namespace Next {
      export type Props = ImageViewerNextProps;
    }

    export const Caption = ImageViewerCaption;
    export namespace Caption {
      export type Props = ImageViewerCaptionProps;
    }

    export const Thumbnails = ImageViewerThumbnails;
    export namespace Thumbnails {
      export type Props = ImageViewerThumbnailsProps;
    }
  }

  export const Style = imageStyle;
}

export type { ImageViewerItem } from './parts/viewer';
