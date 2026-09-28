const openPopups: HTMLElement[] = [];

export function registerPopup(node: HTMLElement) {
  openPopups.push(node);
  return () => {
    const index = openPopups.lastIndexOf(node);
    if (index >= 0) openPopups.splice(index, 1);
  };
}

export function isTopPopup(node: HTMLElement) {
  return openPopups[openPopups.length - 1] === node;
}
