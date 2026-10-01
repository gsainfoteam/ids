import { isValidElement, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ImageViewerCaption, type ImageViewerCaptionProps } from './caption';
import { ImageViewerClose, type ImageViewerCloseProps } from './close';
import { ImageViewerCounter, type ImageViewerCounterProps } from './counter';
import { ImageViewerDownload, type ImageViewerDownloadProps } from './download';
import { ImageFallback, type ImageFallbackProps } from './fallback';
import { ImageGroup, type ImageGroupLayout, type ImageGroupProps } from './group';
import { ImageViewerNext, type ImageViewerNextProps } from './next';
import { ImagePlaceholder, type ImagePlaceholderProps } from './placeholder';
import { ImageViewerPrev, type ImageViewerPrevProps } from './prev';
import { ImageRoot } from './root';
import { ImageViewerShare, type ImageViewerShareProps } from './share';
import { imageStyle } from './style';
import { ImageViewerThumbnails, type ImageViewerThumbnailsProps } from './thumbnails';
import { ImageViewerToolbar, type ImageViewerToolbarProps } from './toolbar';
import { ImageViewer, type ImageViewerItem, type ImageViewerProps } from './viewer';
import { ImageViewerZoomIn, type ImageViewerZoomInProps } from './zoom-in';
import { ImageViewerZoomOut, type ImageViewerZoomOutProps } from './zoom-out';
import { type ImageStatus } from '../../../internal/image-status';
import { type StateValue } from '../../../internal/state-props';
import { elementTypeOf, flattenFragments } from '../../../utils';

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

  export const Placeholder = ImagePlaceholder;
  export namespace Placeholder {
    export type Props = ImagePlaceholderProps;
  }

  export const Fallback = ImageFallback;
  export namespace Fallback {
    export type Props = ImageFallbackProps;
  }

  export function Group({ children, ...props }: Group.Props) {
    const nodes = flattenFragments(children);
    const viewer = nodes.find(isTheViewer);

    return (
      <ImageGroup {...props} viewer={viewer}>
        {nodes.filter((node) => node !== viewer)}
      </ImageGroup>
    );
  }

  Group.displayName = 'Image.Group';

  export namespace Group {
    export type Layout = ImageGroupLayout;
    export type Props = ImageGroupProps;
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
    export type DownloadProps = ImageViewerDownloadProps;
    export type ShareProps = ImageViewerShareProps;
    export type CloseProps = ImageViewerCloseProps;
    export type PrevProps = ImageViewerPrevProps;
    export type NextProps = ImageViewerNextProps;
    export type CaptionProps = ImageViewerCaptionProps;
    export type ThumbnailsProps = ImageViewerThumbnailsProps;

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

const viewerAsWrittenOrServerRendered: unknown[] = [Image.Viewer, ImageViewer];

function isTheViewer(node: ReactNode) {
  return isValidElement(node) && viewerAsWrittenOrServerRendered.includes(elementTypeOf(node));
}

export type { ImageGroupLayout } from './group';
export type { ImageViewerItem } from './viewer';
