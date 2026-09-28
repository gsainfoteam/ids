const PAGE_INSET = 26;
const PAGE_DROP = 'calc(env(safe-area-inset-top) + 14px)';
const PAGE_RADIUS = 8;
const BEHIND_THE_PAGE = 'black';

export type Timing = { duration: string; easing: string };

export type BackgroundScale = {
  set: (progress: number, animate: boolean) => void;
  release: () => void;
  dispose: () => void;
};

type Claim = BackgroundScale & { releasing: boolean };

const claims = new WeakMap<HTMLElement, Claim>();

export function outermostProviderRoot(from: Element) {
  const doc = from.ownerDocument;
  let root: HTMLElement | null = null;

  for (let node = from.parentElement; node; node = node.parentElement) {
    const paintsABox = getComputedStyle(node).display !== 'contents';
    if (node.hasAttribute('data-color') && paintsABox) root = node;
  }

  return root === doc.body || root === doc.documentElement ? null : root;
}

const firstTimingFunction = (list: string) =>
  /^\s*([\w-]+\([^)]*\)|[\w-]+)/.exec(list)?.[1] ?? 'ease';

export function transitionTimingOf(element: Element): Timing {
  const style = getComputedStyle(element);
  const transitionsOff = style.transitionProperty === 'none';

  return {
    duration: transitionsOff ? '0s' : (style.transitionDuration.split(',')[0]?.trim() ?? '0s'),
    easing: firstTimingFunction(style.transitionTimingFunction),
  };
}

const isTransparent = (color: string) =>
  color === 'transparent' || /^rgba\(.*,\s*0\)$/.test(color.replace(/\s+/g, ' '));

function pageBackground(root: HTMLElement) {
  for (let node = root.parentElement; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (!isTransparent(color)) return color;
  }

  return 'Canvas';
}

function splitTopLevel(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of value) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ' ' && depth === 0) {
      if (current) parts.push(current);
      current = '';
    } else current += char;
  }

  if (current) parts.push(current);
  return parts;
}

function shiftTranslate(current: string, dx: number, dy: number) {
  if (current === 'none' || current === '') return `${dx}px ${dy}px`;

  const [x = '0px', y = '0px', z] = splitTopLevel(current);
  return `calc(${x} + ${dx}px) calc(${y} + ${dy}px)${z ? ` ${z}` : ''}`;
}

function fixedOutsideLayers(root: HTMLElement) {
  const fixed: HTMLElement[] = [];
  const view = root.ownerDocument.defaultView!;
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const element = node as HTMLElement;
      if (element.hasAttribute('popover')) return NodeFilter.FILTER_REJECT;
      if (view.getComputedStyle(element).position !== 'fixed') return NodeFilter.FILTER_SKIP;

      fixed.push(element);
      return NodeFilter.FILTER_REJECT;
    },
  });

  while (walker.nextNode());

  return fixed;
}

function styleKeeper() {
  const saved: Array<{ element: HTMLElement; property: string; value: string; priority: string }> =
    [];

  return {
    write(element: HTMLElement, property: string, value: string) {
      if (!saved.some((entry) => entry.element === element && entry.property === property))
        saved.push({
          element,
          property,
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
        });

      element.style.setProperty(property, value);
    },
    restore() {
      for (const { element, property, value, priority } of saved.reverse())
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);

      saved.length = 0;
    },
  };
}

function keepFixedDescendantsOnScreen(
  root: HTMLElement,
  styles: ReturnType<typeof styleKeeper>,
  becomeContainingBlock: () => void,
) {
  const fixed = fixedOutsideLayers(root);
  const before = fixed.map((element) => element.getBoundingClientRect());
  becomeContainingBlock();
  const after = fixed.map((element) => element.getBoundingClientRect());

  fixed.forEach((element, index) => {
    const dx = before[index]!.left - after[index]!.left;
    const dy = before[index]!.top - after[index]!.top;
    if (dx === 0 && dy === 0) return;

    const current = getComputedStyle(element).translate;
    styles.write(element, 'translate', shiftTranslate(current, dx, dy));
  });
}

export function scaleBackground(from: Element, timing: Timing): BackgroundScale | null {
  const root = outermostProviderRoot(from);
  if (!root) return null;

  const existing = claims.get(root);
  if (existing) {
    if (!existing.releasing) return null;
    existing.releasing = false;
    return existing;
  }

  const doc = root.ownerDocument;
  const view = doc.defaultView!;
  const styles = styleKeeper();
  const rect = root.getBoundingClientRect();
  const scrolledPast = Math.max(0, -rect.top);
  const belowViewport = Math.max(0, rect.bottom - view.innerHeight);
  const scale = (view.innerWidth - PAGE_INSET) / view.innerWidth;
  const originX = view.innerWidth / 2 - rect.left;

  const paint = (progress: number) => {
    const radius = `${PAGE_RADIUS * progress}px`;
    styles.write(
      root,
      'transform',
      `translateY(calc(${PAGE_DROP} * ${progress})) scale(${1 - (1 - scale) * progress})`,
    );
    styles.write(root, 'border-radius', radius);
    styles.write(
      root,
      'clip-path',
      `inset(${scrolledPast}px 0px ${belowViewport}px 0px round ${radius})`,
    );
  };

  if (isTransparent(getComputedStyle(root).backgroundColor))
    styles.write(root, 'background-color', pageBackground(root));
  styles.write(root, 'transform-origin', `${originX}px ${scrolledPast}px`);
  styles.write(root, 'overflow', 'clip');
  styles.write(root, 'transition', 'none');

  keepFixedDescendantsOnScreen(root, styles, () => paint(0));
  styles.write(doc.body, 'background', BEHIND_THE_PAGE);

  const transition = ['transform', 'border-radius', 'clip-path']
    .map((property) => `${property} ${timing.duration} ${timing.easing}`)
    .join(', ');

  let releases = 0;

  const restore = () => {
    styles.restore();
    if (claims.get(root) === claim) claims.delete(root);
  };

  const claim: Claim = {
    releasing: false,
    set(progress, animate) {
      styles.write(root, 'transition', animate ? transition : 'none');
      paint(progress);
    },
    release() {
      claim.releasing = true;
      const thisRelease = ++releases;
      claim.set(0, true);

      const moving = root.getAnimations().filter((animation) => 'transitionProperty' in animation);
      if (moving.length === 0) {
        restore();
        return;
      }

      void Promise.allSettled(moving.map((animation) => animation.finished)).then(() => {
        if (claim.releasing && thisRelease === releases) restore();
      });
    },
    dispose: restore,
  };

  claims.set(root, claim);

  return claim;
}
