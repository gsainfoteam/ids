'use client';

import {
  ArrowBigUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronUp,
  Command,
  CornerDownLeft,
  Delete,
  Option,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

import { cn } from '../../../utils';

function ForwardDelete({ className, ...props }: LucideProps) {
  return <Delete {...props} className={cn('-scale-x-100', className)} />;
}

export const GLYPH_ICONS: Readonly<Record<string, LucideIcon | typeof ForwardDelete>> = {
  '⌘': Command,
  '⌃': ChevronUp,
  '⌥': Option,
  '⇧': ArrowBigUp,
  '↩': CornerDownLeft,
  '⏎': CornerDownLeft,
  '↵': CornerDownLeft,
  '⌫': Delete,
  '⌦': ForwardDelete,
  '↑': ArrowUp,
  '↓': ArrowDown,
  '←': ArrowLeft,
  '→': ArrowRight,
};
