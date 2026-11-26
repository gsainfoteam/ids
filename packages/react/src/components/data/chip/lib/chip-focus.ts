const CHIP = '[data-chip]';
const FOCUSABLE = 'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

function focusTarget(chip: HTMLElement) {
  return chip.matches(FOCUSABLE) ? chip : chip.querySelector<HTMLElement>(FOCUSABLE);
}

export function chipToFocusAfter(group: HTMLElement, chip: HTMLElement) {
  const chips = Array.from(group.querySelectorAll<HTMLElement>(CHIP));
  const index = chips.indexOf(chip);
  const candidates = [...chips.slice(index + 1), ...chips.slice(0, index).reverse()];
  for (const candidate of candidates) {
    const target = focusTarget(candidate);
    if (target) return target;
  }
  return null;
}
