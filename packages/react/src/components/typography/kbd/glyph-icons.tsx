import {
  ArrowBigUp,
  ArrowBigUpDash,
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowRightToLine,
  ArrowUp,
  ArrowUpLeft,
  ChevronUp,
  Command,
  CornerDownLeft,
  Delete,
  Option,
  Space,
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
  '⇥': ArrowRightToLine,
  '⇪': ArrowBigUpDash,
  '␣': Space,
  '↑': ArrowUp,
  '↓': ArrowDown,
  '←': ArrowLeft,
  '→': ArrowRight,
  '↖': ArrowUpLeft,
  '↘': ArrowDownRight,
};
