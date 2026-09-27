import { Children, isValidElement, useEffect, type ReactNode } from 'react';

export type IconLabel = {
  label: string;
  // 'function' names are only safe in development; see FUNCTION_NAME.
  source: 'element' | 'displayName' | 'function';
};

// Production minifiers rename functions: Vite's default build turns heroicons' `PlusIcon` into a
// name like `jt`. A function name is therefore trusted only while it still ends in `Icon`, so a
// minified build yields no name rather than a wrong one. A displayName is a string literal (lucide
// sets 'Plus') and survives minification.
const FUNCTION_NAME = /^[A-Z][A-Za-z0-9]*Icon$/;

type ComponentLike = { displayName?: unknown; name?: unknown; render?: unknown; type?: unknown };

function componentName(
  type: unknown,
  depth = 0,
): (Omit<IconLabel, 'label'> & { name: string }) | undefined {
  if (depth > 2 || type == null || (typeof type !== 'function' && typeof type !== 'object'))
    return undefined;
  const component = type as ComponentLike;
  if (typeof component.displayName === 'string' && component.displayName.trim() !== '')
    return { name: component.displayName.trim(), source: 'displayName' };
  if (typeof component.name === 'string' && FUNCTION_NAME.test(component.name))
    return { name: component.name, source: 'function' };
  // forwardRef keeps the function in `render`, memo keeps the wrapped component in `type`.
  return componentName(component.render, depth + 1) ?? componentName(component.type, depth + 1);
}

// `ChevronDownIcon` -> "Chevron down", `XMarkIcon` -> "X mark", tabler's `IconPlus` -> "Plus".
export function humanizeIconName(name: string) {
  const words = name
    .replace(/Icon$/, '')
    .replace(/^Icon(?=[A-Z0-9])/, '')
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .replace(/([A-Z])([0-9])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean);
  return words
    .map((word, index) =>
      index === 0 || (word.length > 1 && word === word.toUpperCase()) ? word : word.toLowerCase(),
    )
    .join(' ');
}

type LabelProps = { 'aria-label'?: unknown; title?: unknown; children?: ReactNode };

function ownLabel(props: LabelProps) {
  for (const value of [props['aria-label'], props.title])
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
}

// The first icon in `node` names the control: its own aria-label or title first, then its
// component name. Text is skipped, so pass the icon, not the whole label.
export function iconLabel(node: ReactNode): IconLabel | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<LabelProps>(child)) continue;
    const own = ownLabel(child.props);
    if (own) return { label: own, source: 'element' };
    const named = componentName(child.type);
    if (named) {
      const label = humanizeIconName(named.name);
      if (label) return { label, source: named.source };
    }
    const nested = iconLabel(child.props.children);
    if (nested) return nested;
  }
}

let warnedAboutMinification = false;

// A name read from a function works in development and silently disappears in a minified
// production build, so the first such label on a page says so once.
function warnFunctionNameLabel(component: string, label: string) {
  if (warnedAboutMinification) return;
  warnedAboutMinification = true;
  console.warn(
    `[IDS] ${component}: the accessible name "${label}" comes from the icon's function name. ` +
      'Production minifiers rename functions, so the name is gone in a production build. ' +
      'Pass aria-label, or give the icon component a displayName.',
  );
}

type NameProps = { 'aria-label'?: unknown; 'aria-labelledby'?: unknown; title?: unknown };

function hasName(props: NameProps | undefined) {
  if (!props) return false;
  const text = (value: unknown) => typeof value === 'string' && value.trim() !== '';
  return text(props['aria-label']) || props['aria-labelledby'] != null || text(props.title);
}

// The aria-label an icon-only control needs: undefined when the control, or the element it renders
// as, already has a name, otherwise the name found in its icon.
export function useIconLabel(
  component: string,
  icon: ReactNode,
  ...names: Array<NameProps | undefined>
) {
  const named = names.some(hasName);
  const derived = named ? undefined : iconLabel(icon);
  const label = derived?.label;
  const fromFunction = derived?.source === 'function';

  useEffect(() => {
    if (!import.meta.env.DEV || named) return;
    if (label === undefined)
      console.warn(
        `[IDS] ${component}: no accessible name could be found for this icon. Pass aria-label, or give the icon component a displayName.`,
      );
    else if (fromFunction) warnFunctionNameLabel(component, label);
  }, [component, named, label, fromFunction]);

  return label;
}
