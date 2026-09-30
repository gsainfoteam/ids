export const isNodeFromAnyWindow = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && 'nodeType' in value;

export const keepFocusWhereItIs = (event: { preventDefault(): void }) => event.preventDefault();

export function tryCapturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}
