'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Image } from '.';
import type { imageStyle } from './style';
import type { ImageGroupState } from './use-image-group';

type Context = {
  state: Image.State;
  alt: string;
  styles: ReturnType<typeof imageStyle>;
};

export const ImageContext = createContext<Context | null>(null);

export const ImageGroupContext = createContext<ImageGroupState | null>(null);

export function useImageContext(part: string) {
  const context = use(ImageContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Image>\`.`);
  return context;
}
