const CHIP = '[data-chip]';
const FOCUSABLE = 'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

// Chips are usually siblings, but a list wraps each one in an <li>, so the group is the closest
// ancestor that holds another chip.
function chipGroup(chip: HTMLElement) {
  let node = chip.parentElement;
  for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement)
    if (node.querySelectorAll(CHIP).length > 1) return node;
  return null;
}

function focusTarget(chip: HTMLElement) {
  return chip.matches(FOCUSABLE) ? chip : chip.querySelector<HTMLElement>(FOCUSABLE);
}

// Where focus goes when a chip is removed: the next chip, or the previous one when the last chip
// went. Without this, removing a chip from the keyboard drops focus to the top of the page.
export function chipToFocusAfter(chip: HTMLElement) {
  const group = chipGroup(chip);
  if (!group) return null;
  const chips = Array.from(group.querySelectorAll<HTMLElement>(CHIP));
  const index = chips.indexOf(chip);
  const candidates = [...chips.slice(index + 1), ...chips.slice(0, index).reverse()];
  for (const candidate of candidates) {
    const target = focusTarget(candidate);
    if (target) return target;
  }
  return null;
}
