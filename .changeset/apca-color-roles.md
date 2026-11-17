---
'@gsainfoteam/ids-react': major
'@gsainfoteam/ids-css': major
---

Color roles are picked by APCA lightness contrast (colorjs.io) instead of the WCAG 2 ratio: every
text pair reaches Lc 75 and every `border-X` Lc 45, with no WCAG floor.

- A fill starts at 600 and moves to 500 or 700, then 400 or 800, until its text reads; orange,
  amber, yellow, lime, emerald, teal, cyan, sky, pink and rose leave 600.
- Soft text sits darker in light mode (about 950) and lighter in dark mode (about 200).
- Dark `text-neutral` is neutral 300 instead of 400.
- The seed palette no longer nudges its 600 step to fit white text.
- axe's `color-contrast` rule, which computes WCAG 2, is off; the token test checks APCA.
