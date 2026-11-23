import { Suspense, lazy } from 'react';

const DocsPageWithTheEditor = lazy(() => import('./live-code-docs'));

export function LiveCodeDocsPage() {
  return (
    <Suspense fallback={null}>
      <DocsPageWithTheEditor />
    </Suspense>
  );
}
