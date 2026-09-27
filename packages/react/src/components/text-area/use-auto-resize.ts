import { useLayoutEffect, type RefObject } from 'react';

export type AutoResizeOptions = {
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
};

/** Native input events include typing, paste, undo and IME; never replace the value. */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement | null>,
  { autoResize, minRows, maxRows }: AutoResizeOptions,
) {
  // Run after every commit, including controlled updates and FormProvider resets.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!autoResize || !node) return;
    const view = node.ownerDocument.defaultView;
    if (!view) return;
    const previous = {
      height: node.style.height,
      minHeight: node.style.minHeight,
      maxHeight: node.style.maxHeight,
      overflowY: node.style.overflowY,
    };
    const measure = () => {
      if (!node.isConnected || node.getClientRects().length === 0) return;
      const css = view.getComputedStyle(node);
      const number = (value: string) => Number.parseFloat(value) || 0;
      const line = number(css.lineHeight) || number(css.fontSize) * 1.2;
      const padding = number(css.paddingTop) + number(css.paddingBottom);
      const border = number(css.borderTopWidth) + number(css.borderBottomWidth);
      const minimum = minRows ?? node.rows;
      const maximum = maxRows ?? Infinity;
      const minHeight = Math.min(minimum, maximum) * line + padding + border;
      const maxHeight = maximum * line + padding + border;
      // Remove previous bounds so deleting text can shrink the control as well.
      node.style.minHeight = '0px';
      node.style.maxHeight = 'none';
      node.style.height = '0px';
      const content = node.scrollHeight + border;
      const height = Math.max(minHeight, Math.min(content, maxHeight));
      const offset = css.boxSizing === 'border-box' ? 0 : padding + border;
      node.style.height = `${height - offset}px`;
      node.style.minHeight = `${minHeight - offset}px`;
      node.style.maxHeight = Number.isFinite(maxHeight) ? `${maxHeight - offset}px` : 'none';
      node.style.overflowY = content > maxHeight ? 'auto' : 'hidden';
    };
    measure();
    let frame = 0;
    const schedule = () => {
      view.cancelAnimationFrame(frame);
      frame = view.requestAnimationFrame(measure);
    };
    node.addEventListener('input', measure);
    // The reset event fires before the browser restores defaultValue.
    const form = node.form;
    form?.addEventListener('reset', schedule);
    view.addEventListener('resize', schedule);
    let width = node.getBoundingClientRect().width;
    const observer = view.ResizeObserver
      ? new view.ResizeObserver(() => {
          const next = node.getBoundingClientRect().width;
          if (next !== width) {
            width = next;
            schedule();
          }
        })
      : undefined;
    observer?.observe(node);
    const fonts = node.ownerDocument.fonts;
    fonts?.addEventListener('loadingdone', schedule);
    let active = true;
    void fonts?.ready.then(() => {
      if (active) schedule();
    });
    return () => {
      active = false;
      view.cancelAnimationFrame(frame);
      node.removeEventListener('input', measure);
      form?.removeEventListener('reset', schedule);
      view.removeEventListener('resize', schedule);
      observer?.disconnect();
      fonts?.removeEventListener('loadingdone', schedule);
      Object.assign(node.style, previous);
    };
  });
}
