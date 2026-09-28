import { tv as joinVariants, type TVLite } from 'tailwind-variants/lite';

import { cn } from './cn';

type Slot = (props?: object) => string | undefined;

const mergeWithoutEmptyAttribute = (classes: string | undefined) => cn(classes) || undefined;

const keepConfigForExtend = <F extends object, C extends object>(styles: F, component: C) =>
  Object.assign(styles, component);

export const tv = ((options: Parameters<TVLite>[0]) => {
  const component = joinVariants(options);
  const merged = (props?: object) => {
    const result: unknown = component(props as never);
    if (typeof result !== 'object' || result === null)
      return mergeWithoutEmptyAttribute(result as string);
    const slots: Record<string, Slot> = {};
    for (const [name, slot] of Object.entries(result as Record<string, Slot>))
      slots[name] = (slotProps) => mergeWithoutEmptyAttribute(slot(slotProps));
    return slots;
  };
  return keepConfigForExtend(merged, component);
}) as TVLite;

export type { VariantProps } from 'tailwind-variants/lite';
