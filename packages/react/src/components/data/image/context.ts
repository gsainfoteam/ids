'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Image } from '.';
import type { imageStyle } from './style';
import type { ImageGroupState, ViewerItem } from './use-image-group';

type Context = {
  state: Image.State;
  alt: string;
  styles: ReturnType<typeof imageStyle>;
};

export const ImageContext = createContext<Context | null>(null);

export const ImageGroupContext = createContext<ImageGroupState | null>(null);

export type ImageViewerContextValue = {
  items: readonly ViewerItem[];
  index: number;
  count: number;
  item: ViewerItem | undefined;
  canPrev: boolean;
  canNext: boolean;
  prev: () => void;
  next: () => void;
  goTo: (index: number) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  close: () => void;
  styles: ReturnType<typeof imageStyle>;
};

export const ImageViewerContext = createContext<ImageViewerContextValue | null>(null);

export function useImageContext(part: string) {
  const context = use(ImageContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Image>\`.`);
  return context;
}

export function useImageViewerContext(part: string) {
  const context = use(ImageViewerContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Image.Viewer>\`.`);
  return context;
}
