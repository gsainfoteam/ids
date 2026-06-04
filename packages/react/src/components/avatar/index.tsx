import { tv, type VariantProps } from 'tailwind-variants';

const avatar = tv({
  base: 'inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-[var(--ids-color-muted)] text-[var(--ids-color-on-muted)] font-semibold select-none',
  variants: {
    size: {
      sm: 'size-8 text-xs',
      md: 'size-10 text-sm',
      lg: 'size-12 text-base',
      xl: 'size-16 text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type AvatarVariantProps = VariantProps<typeof avatar>;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, name, size = 'md', className }: Avatar.Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={avatar({ size, class: className })}
      />
    );
  }

  return (
    <span className={avatar({ size, class: className })}>
      {name?.trim() ? getInitials(name) : '?'}
    </span>
  );
}

export namespace Avatar {
  export type Props = {
    src?: string;
    name?: string;
    className?: string;
  } & AvatarVariantProps;
}
