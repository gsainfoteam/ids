'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { navbarStyle } from './style';

export type NavbarPresentation = 'bar' | 'drawer';

export type NavbarContextValue = {
  value: string | undefined;
  presentation: NavbarPresentation;
  styles: ReturnType<typeof navbarStyle>;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

export const NavbarContext = createContext<NavbarContextValue | null>(null);

export function useNavbarContext(part: string) {
  const context = use(NavbarContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Navbar>\`.`);
  return context;
}
