const UNPREDICTABLE = null;

export function predictTextAfterInput(
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
      return UNPREDICTABLE;
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
      return data == null ? UNPREDICTABLE : value.slice(0, start) + data + value.slice(end);
  }
}
