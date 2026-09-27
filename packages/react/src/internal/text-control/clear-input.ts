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

// Clearing goes through a real edit so React's onChange, react-hook-form's register() and any
// native listener all see it. execCommand keeps the edit on the browser's undo stack, so Cmd+Z
// brings the text back; where it is missing (jsdom, some embedded engines) the value is written
// through the prototype setter, which React's value tracker does not intercept, and an input
// event is dispatched by hand.
// Dispatched by hand where execCommand is missing; the inputType tells listeners what kind of
// edit it was, as the browser's own event would.
function dispatchInput(element: TextElement, inputType: string) {
  const view = element.ownerDocument.defaultView;
  if (!view) return;
  const event =
    typeof view.InputEvent === 'function'
      ? new view.InputEvent('input', { bubbles: true, inputType })
      : new view.Event('input', { bubbles: true });
  element.dispatchEvent(event);
}

export function clearInput(element: TextElement) {
  element.focus({ preventScroll: true });
  if (element.value === '') return;
  element.select();
  const doc = element.ownerDocument;
  // execCommand edits whatever has focus, so it is only used when the focus call took.
  if (
    doc.activeElement === element &&
    typeof doc.execCommand === 'function' &&
    doc.execCommand('delete')
  )
    return;
  nativeValueSetter(element)?.call(element, '');
  dispatchInput(element, 'deleteContentBackward');
}

// Replaces the whole value through a real edit, for the same reasons clearInput does.
export function replaceInput(element: TextElement, text: string) {
  element.focus({ preventScroll: true });
  element.select();
  const doc = element.ownerDocument;
  if (
    doc.activeElement === element &&
    typeof doc.execCommand === 'function' &&
    doc.execCommand('insertText', false, text)
  )
    return;
  nativeValueSetter(element)?.call(element, text);
  dispatchInput(element, 'insertReplacementText');
}
