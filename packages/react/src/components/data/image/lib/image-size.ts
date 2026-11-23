import type { NaturalSize } from '../hooks/use-image-group';

export function aspectOf(width: number | string | undefined, height: number | string | undefined) {
  const across = Number(width);
  const down = Number(height);
  return across > 0 && down > 0 ? across / down : undefined;
}

export function loadedSizeOf(image: HTMLImageElement | null): NaturalSize | undefined {
  if (!image?.complete || image.naturalWidth === 0) return undefined;
  return { width: image.naturalWidth, height: image.naturalHeight };
}
