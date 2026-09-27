import { useLabelling, useSurface, type UseSurfaceOptions } from '../../../internal/surface';

export function useItem<E extends HTMLElement>({
  selected,
  current,
  ...options
}: UseSurfaceOptions<E> & { selected: boolean | undefined; current: boolean }) {
  const surface = useSurface<E>(options);
  const { labelling, register } = useLabelling(options.interactive);
  // A row that acts as a button tells its selection through aria-pressed. When the consumer marks
  // it with aria-current (a navigation list) that already says it, so pressed is left out.
  const pressed =
    options.interactive && !options.asChild && selected !== undefined && !current
      ? { 'aria-pressed': selected }
      : {};
  return { ...surface, labelling: { ...labelling, ...pressed }, register };
}
