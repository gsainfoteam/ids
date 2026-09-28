---
'@gsainfoteam/ids-react': minor
---

Breaking: the React package ships ES modules only. `dist/index.cjs`, `dist/react-hook-form.cjs`
and `dist/tanstack-form.cjs` are gone, and `main` points at `dist/index.js`. Bundlers (Vite,
webpack, Next.js, Rspack) need no change. In Node, `import` the package; `require()` works only
where Node loads ES modules synchronously (20.19+, 22.12+). Jest runs it in its ESM mode or with the
package transformed.
