'use client';

import {
  lazy,
  Suspense,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { ImageGroupContext } from '../context';
import { useInternalImageViewerGate } from '../hooks/use-image-viewer-gate';
import { useInternalImageViewerOwnStateWarning } from '../hooks/use-image-viewer-own-state-warning';
import { useInternalImageViewerStandaloneSource } from '../hooks/use-image-viewer-standalone-source';
import { groupViewerSource } from '../lib/viewer-source';

import type { ImageGroupState, ViewerItem } from '../hooks/use-image-group';

export type ImageViewerItem = {
  src: string;
  alt: string;
  caption?: ReactNode;
  thumbnail?: string;
  srcSet?: string;
  sizes?: string;
  crossOrigin?: ComponentProps<'img'>['crossOrigin'];
  referrerPolicy?: ComponentProps<'img'>['referrerPolicy'];
};

export type ImageViewerProps = {
  items?: readonly ImageViewerItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  loop?: boolean;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ImageViewerSource = {
  items: readonly ViewerItem[];
  thumbnailOf: (index: number) => HTMLElement | null;
  opener: HTMLElement | null;
  value: number;
  setValue: (index: number) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  loop: boolean;
  onExitComplete?: () => void;
};

export type ImageViewerLook = Pick<
  ImageViewerProps,
  'aria-label' | 'className' | 'style' | 'children'
>;

const loadLayer = () => import('./viewer-layer');

let layerOnItsWay: ReturnType<typeof loadLayer> | null = null;

export function preloadImageViewer() {
  layerOnItsWay ??= loadLayer();
  return layerOnItsWay;
}

const ImageViewerLayer = lazy(async () => ({
  default: (await preloadImageViewer()).ImageViewerLayer,
}));

function ViewerGate({ source, look }: { source: ImageViewerSource; look: ImageViewerLook }) {
  const shown = useInternalImageViewerGate(source.open);

  if (!shown) return null;

  return (
    <Suspense fallback={null}>
      <ImageViewerLayer source={source} look={look} />
    </Suspense>
  );
}

function GroupViewer({ group, props }: { group: ImageGroupState; props: ImageViewerProps }) {
  useInternalImageViewerOwnStateWarning(props);

  return <ViewerGate source={groupViewerSource(group)} look={props} />;
}

function StandaloneViewer({ props }: { props: ImageViewerProps }) {
  const source = useInternalImageViewerStandaloneSource(props);

  return <ViewerGate source={source} look={props} />;
}

export function ImageViewer(props: ImageViewerProps) {
  const group = use(ImageGroupContext);

  if (group) return <GroupViewer group={group} props={props} />;
  return <StandaloneViewer props={props} />;
}
