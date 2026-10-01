import { IdsProvider } from '@gsainfoteam/ids-react';
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

import styles from '../styles.css?url';

import type { ReactNode } from 'react';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'IDS on TanStack Start' },
    ],
    links: [{ rel: 'stylesheet', href: styles }],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        <IdsProvider color="blue" mode="light">
          {children}
        </IdsProvider>
        <Scripts />
      </body>
    </html>
  );
}
