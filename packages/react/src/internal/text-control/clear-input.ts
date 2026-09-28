type TextElement = HTMLInputElement | HTMLTextAreaElement;

function nativeValueSetter(element: TextElement) {
  let proto: object | null = Object.getPrototypeOf(element);
  while (proto) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor?.set) return descriptor.set;
    proto = Object.getPrototypeOf(proto);
  }
  return undefined;
}

function dispatchInput(element: TextElement, inputType: string) {
  const view = element.ownerDocument.defaultView;
  if (!view) return;
  const event =
    typeof view.InputEvent === 'function'
      ? new view.InputEvent('input', { bubbles: true, inputType })
      : new view.Event('input', { bubbles: true });
  element.dispatchEvent(event);
}

function editOnUndoStack(element: TextElement, ...command: Parameters<Document['execCommand']>) {
  const doc = element.ownerDocument;
  const focusTook = doc.activeElement === element;
  return focusTook && typeof doc.execCommand === 'function' && doc.execCommand(...command);
}

function editWithInputEvent(element: TextElement, text: string, inputType: string) {
  nativeValueSetter(element)?.call(element, text);
  dispatchInput(element, inputType);
}

export function clearInput(element: TextElement) {
  element.focus({ preventScroll: true });
  if (element.value === '') return;
  element.select();
  if (editOnUndoStack(element, 'delete')) return;
  editWithInputEvent(element, '', 'deleteContentBackward');
}

export function replaceInput(element: TextElement, text: string) {
  element.focus({ preventScroll: true });
  element.select();
  if (editOnUndoStack(element, 'insertText', false, text)) return;
  editWithInputEvent(element, text, 'insertReplacementText');
}
