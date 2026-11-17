import { IdsProvider } from '@gsainfoteam/ids-react';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { theme } from './ids-theme';

import './globals.css';

export const metadata: Metadata = { title: 'IDS on Next.js App Router' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <IdsProvider theme={theme} mode="light">
          {children}
        </IdsProvider>
      </body>
    </html>
  );
}
