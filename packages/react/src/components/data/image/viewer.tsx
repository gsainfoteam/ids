'use client';

import {
  lazy,
  Suspense,
  use,
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { noop } from 'es-toolkit';

import { ImageGroupContext } from './context';
import { useImageGroup, type ImageGroupState, type ViewerItem } from './use-image-group';
import { useOverlayItem } from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';

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

const subscribeToNothing = () => noop;
const onTheClient = () => true;
const notOnTheServer = () => false;

const nothingFromThePage = () => null;

function standaloneItem(item: ImageViewerItem, index: number): ViewerItem {
  return {
    key: String(index),
    src: item.src,
    srcSet: item.srcSet,
    sizes: item.sizes,
    thumbnail: item.thumbnail,
    thumbnailSize: undefined,
    alt: item.alt,
    caption: item.caption,
    crossOrigin: item.crossOrigin,
    referrerPolicy: item.referrerPolicy,
  };
}

function ViewerGate({ source, look }: { source: ImageViewerSource; look: ImageViewerLook }) {
  const mounted = useSyncExternalStore(subscribeToNothing, onTheClient, notOnTheServer);
  const [opened, setOpened] = useState(source.open);

  if (source.open && !opened) setOpened(true);
  if (!mounted || !opened) return null;

  return (
    <Suspense fallback={null}>
      <ImageViewerLayer source={source} look={look} />
    </Suspense>
  );
}

function useStateOwnedByTheGroupWarning(props: ImageViewerProps) {
  const ownState = [
    props.items,
    props.open,
    props.defaultOpen,
    props.onOpenChange,
    props.value,
    props.defaultValue,
    props.onValueChange,
    props.loop,
    props.zoom,
    props.onZoomChange,
  ].some((prop) => prop !== undefined);

  useEffect(() => {
    if (isDevelopment && ownState)
      console.warn(
        '[IDS] Image.Viewer: inside Image.Group the group owns the images, open, value, loop and zoom. Pass them to Image.Group instead.',
      );
  }, [ownState]);
}

function GroupViewer({ group, props }: { group: ImageGroupState; props: ImageViewerProps }) {
  useStateOwnedByTheGroupWarning(props);

  const source: ImageViewerSource = {
    items: group.entries.map((entry) => ({ ...entry.item(), key: entry.key })),
    thumbnailOf: (index) => group.entries[index]?.element ?? null,
    opener: group.opener,
    value: group.value,
    setValue: group.setValue,
    open: group.open,
    setOpen: group.setOpen,
    zoom: group.zoom,
    setZoom: group.setZoom,
    loop: group.loop,
  };

  return <ViewerGate source={source} look={props} />;
}

function StandaloneViewer({ props }: { props: ImageViewerProps }) {
  const { items = [], open, onOpenChange } = props;
  const item = useOverlayItem(open);
  const state = useImageGroup(props);

  const setOpen = (next: boolean) => {
    if (!item) {
      state.setOpen(next);
      return;
    }

    if (next === item.open) return;
    onOpenChange?.(next);
    if (!next) item.close(undefined);
  };

  const source: ImageViewerSource = {
    items: items.map(standaloneItem),
    thumbnailOf: nothingFromThePage,
    opener: null,
    value: state.value,
    setValue: state.setValue,
    open: item ? item.open : state.open,
    setOpen,
    zoom: state.zoom,
    setZoom: state.setZoom,
    loop: state.loop,
    onExitComplete: item?.exited,
  };

  return <ViewerGate source={source} look={props} />;
}

export function ImageViewer(props: ImageViewerProps) {
  const group = use(ImageGroupContext);

  if (group) return <GroupViewer group={group} props={props} />;
  return <StandaloneViewer props={props} />;
}
