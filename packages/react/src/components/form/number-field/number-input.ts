// The text an input would hold after a beforeinput event, so the edit can be checked before the
// browser applies it and the caret stays put when it is refused. Undo, redo and word deletions,
// whose extent only the browser knows, are left alone.
export function textAfterInput(
  value: string,
  start: number,
  end: number,
  inputType: string,
  data: string | null,
): string | null {
  const collapsed = start === end;
  switch (inputType) {
    case 'historyUndo':
    case 'historyRedo':
      return null;
    case 'deleteContent':
    case 'deleteByCut':
    case 'deleteByDrag':
      return value.slice(0, start) + value.slice(end);
    case 'deleteContentForward':
      return collapsed
        ? value.slice(0, start) + value.slice(end + 1)
        : value.slice(0, start) + value.slice(end);
    case 'deleteContentBackward':
      return collapsed
        ? value.slice(0, Math.max(0, start - 1)) + value.slice(start)
        : value.slice(0, start) + value.slice(end);
    case 'deleteSoftLineBackward':
    case 'deleteHardLineBackward':
      return value.slice(end);
    default:
      return data == null ? null : value.slice(0, start) + data + value.slice(end);
  }
}
