const NESTED_CONTROL = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'label',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="slider"]',
  '[data-resize-handle]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function isFromNestedControl(event: { target: EventTarget; currentTarget: EventTarget }) {
  const surface = event.currentTarget as Element;
  const target = event.target as Node;
  const start = target instanceof Element ? target : target.parentElement;
  const control = start?.closest(NESTED_CONTROL);
  const isTheSurfaceTitle = control?.hasAttribute('data-surface-trigger') === true;
  return control != null && control !== surface && !isTheSurfaceTitle && surface.contains(control);
}
