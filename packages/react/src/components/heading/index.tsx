import { type ReactNode } from 'react';

import { Text } from '../text';

import type { TextVariant } from '../text';

export function Heading({
  children,
  as,
  variant = 'heading',
  color,
  align,
  className,
}: Heading.Props) {
  return (
    <Text as={as} variant={variant} color={color} align={align} className={className}>
      {children}
    </Text>
  );
}

export namespace Heading {
  export type Props = {
    children: ReactNode;
    as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    variant?: TextVariant;
    color?: Text.Props['color'];
    align?: Text.Props['align'];
    className?: string;
  };
}
