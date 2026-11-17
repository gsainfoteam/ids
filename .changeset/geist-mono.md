---
'@gsainfoteam/ids-css': minor
---

The mono font is now Geist Mono. `--ids-font-family-mono` (and `font-mono`) starts with
`'Geist Mono Variable', 'Geist Mono'`, falls back to the system monospace fonts and then to
Pretendard, which draws Hangul in code. On the web, load the variable font from Fontsource: install
`@fontsource-variable/geist-mono` (5.3.0) and import `@fontsource-variable/geist-mono/index.css`, or
link `https://cdn.jsdelivr.net/npm/@fontsource-variable/geist-mono@5.3.0/index.css`. An app that
installs or hosts the static font gets `'Geist Mono'`. `font-mono` also sets `font-size-adjust` to the new
`--ids-font-size-adjust-mono` (0.53), Pretendard GOV's x-height, so code sits level with the body
text and any fallback font comes to the same x-height.
