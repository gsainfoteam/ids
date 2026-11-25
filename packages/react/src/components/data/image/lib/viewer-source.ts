import type { ImageGroupState, ViewerItem } from '../hooks/use-image-group';
import type { ImageViewerItem, ImageViewerSource } from '../parts/viewer';

export const nothingFromThePage = () => null;

export function standaloneItem(item: ImageViewerItem, index: number): ViewerItem {
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

export function groupViewerSource(group: ImageGroupState): ImageViewerSource {
  return {
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
}
