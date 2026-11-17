---
'@gsainfoteam/ids-react': patch
'@gsainfoteam/ids-css': patch
---

Everything that draws a corner follows `cornerShape: 'squircle'`:

- `::before` and `::after` take their element's corner shape, so Card and Item hover fills, Sidebar
  rows and Avatar's edge ring cover the squircle corner instead of leaving slivers.
- `rounded-full` stays round under a variant too (`after:rounded-full`).
- Square AvatarGroup cutouts follow the squircle, keeping the 2px gap at the diagonal.
- The Image viewer clips to the thumbnail's squircle while it opens and closes, and the page behind a
  modal Drawer rounds to a squircle at the scaled radius.
- Carousel indicators are pills (`rounded-full`) like their dots.
