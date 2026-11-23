const previews = new Map<File, { url: string; users: number }>();

export function watchPreview(file: File) {
  let entry = previews.get(file);
  if (!entry) {
    entry = { url: URL.createObjectURL(file), users: 0 };
    previews.set(file, entry);
  }
  const current = entry;
  current.users += 1;
  const revokeUnlessResubscribed = () => {
    if (current.users > 0 || previews.get(file) !== current) return;
    previews.delete(file);
    URL.revokeObjectURL(current.url);
  };
  return () => {
    current.users -= 1;
    queueMicrotask(revokeUnlessResubscribed);
  };
}

export const previewUrlOf = (file: File) => previews.get(file)?.url;
