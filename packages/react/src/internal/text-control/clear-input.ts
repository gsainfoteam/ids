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

export function clearInput(element: TextElement) {
  element.focus({ preventScroll: true });
  if (element.value === '') return;
  element.select();
  const doc = element.ownerDocument;
  if (
    doc.activeElement === element &&
    typeof doc.execCommand === 'function' &&
    doc.execCommand('delete')
  )
    return;
  nativeValueSetter(element)?.call(element, '');
  dispatchInput(element, 'deleteContentBackward');
}

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
