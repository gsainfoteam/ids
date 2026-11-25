export type ImageStatus = 'loading' | 'loaded' | 'error';

export function initialImageStatus(src: string | undefined): ImageStatus {
  return src ? 'loading' : 'error';
}

export function settleSizelessImage(
  image: HTMLImageElement,
  settle: (status: ImageStatus) => void,
) {
  if (typeof image.decode !== 'function') {
    settle('error');
    return;
  }
  image.decode().then(
    () => settle('loaded'),
    () => settle('error'),
  );
}
