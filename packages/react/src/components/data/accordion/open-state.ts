export function flag(on: boolean) {
  return on ? '' : undefined;
}

export function openState(open: boolean) {
  return { 'data-state': open ? 'open' : 'closed', 'data-open': flag(open) } as const;
}
