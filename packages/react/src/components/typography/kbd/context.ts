'use client';

import { createContext } from 'react';

import type { kbdStyle } from './style';

export const KbdStyleContext = createContext<ReturnType<typeof kbdStyle> | null>(null);
