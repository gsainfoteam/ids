---
'@gsainfoteam/ids-react': minor
'@gsainfoteam/ids-css': patch
---

The React package now ships one ES module per source file, and every module that runs on the
client starts with `'use client'`. Next.js App Router Server Components can import IDS directly,
and bundlers drop the components an app does not use (`sideEffects: false`). The CSS package
declares `sideEffects: ["*.css"]` so its stylesheet import is never tree-shaken away.
