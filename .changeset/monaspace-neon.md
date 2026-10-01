---
'@gsainfoteam/ids-css': minor
---

The mono font is now Monaspace Neon. `--ids-font-family-mono` (and `font-mono`) starts with
`'Monaspace Neon Var', 'Monaspace Neon'` and falls back to the system monospace fonts. On the web,
load Monaspace Neon from Fontsource, for example `@fontsource/monaspace-neon@5.3.0/400.css`; an app
that installs or hosts the variable font gets it first. `font-mono` also sets `font-size-adjust` to
the new `--ids-font-size-adjust-mono` (0.487), which draws Monaspace Neon at 95% so code sits level
with Pretendard GOV body text and brings any fallback font to the same x-height.
