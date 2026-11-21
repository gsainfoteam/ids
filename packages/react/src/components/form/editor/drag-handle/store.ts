export type HoveredBlock = { pos: number; dom: HTMLElement };

export type BlockHoverStore = ReturnType<typeof createBlockHoverStore>;

export function createBlockHoverStore() {
  let hovered: HoveredBlock | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => hovered,
    set: (next: HoveredBlock | null) => {
      if (next?.pos === hovered?.pos && next?.dom === hovered?.dom) return;
      hovered = next;
      for (const listener of listeners) listener();
    },
  };
}
