---
'@gsainfoteam/ids-react': patch
---

Development warnings now reach apps. They were guarded by `import.meta.env.DEV`, which the library
build replaced with `false`; they now follow the app's `process.env.NODE_ENV`.
