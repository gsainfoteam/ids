import { tv as joinVariants, type TVLite } from 'tailwind-variants/lite';

import { cn } from './cn';

type Slot = (props?: object) => string | undefined;

// The lite build of tailwind-variants only joins classes. Every result goes through cn, so one
// engine and one config resolve every conflict in the package, a consumer's className included.
// An empty result stays undefined, as in the full build, so no empty class attribute is rendered.
export const tv = ((options: Parameters<TVLite>[0]) => {
  const component = joinVariants(options);
  const merged = (props?: object) => {
    const result: unknown = component(props as never);
    if (typeof result !== 'object' || result === null) return cn(result as string) || undefined;
    const slots: Record<string, Slot> = {};
    for (const [name, slot] of Object.entries(result as Record<string, Slot>))
      slots[name] = (slotProps) => cn(slot(slotProps)) || undefined;
    return slots;
  };
  // `extend` reads base, slots and variants off the component, so they are carried over.
  return Object.assign(merged, component);
}) as TVLite;

export type { VariantProps } from 'tailwind-variants/lite';
