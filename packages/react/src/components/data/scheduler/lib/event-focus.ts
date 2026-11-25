export function focusTheEvent(body: HTMLElement | null, id: string) {
  const slot = body?.querySelector(`[data-scheduler-slot="${CSS.escape(id)}"]`);
  slot
    ?.querySelector<HTMLElement>('[data-surface-trigger], [data-scheduler-event][tabindex]')
    ?.focus();
}
