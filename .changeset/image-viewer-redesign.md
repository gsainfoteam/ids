---
'@gsainfoteam/ids-react': minor
---

Redesign `Image.Viewer` after Modrinth's gallery viewer. The viewer is always dark (`data-mode="dark"`
on the dialog and the backdrop, a 95% `bg-surface` backdrop), the caption sits at the top left as
plain text and hides while the image is zoomed, and one toolbar at the bottom center holds
Prev, Counter, Next | ZoomOut, ZoomReset, ZoomIn | Download | Close. A fitted image sits between
the caption and the toolbar, and a zoomed one runs under them. A press on the empty space beside
the caption or the toolbar closes the viewer as well.

- New parts: `Image.Viewer.ZoomReset` shows the zoom level ("150%") and fits the image when
  pressed (the default toolbar drops it below 640px so the bar fits a phone), and
  `Image.Viewer.Separator` divides the toolbar.
- Breaking: Prev and Next no longer float at the sides; they are plain buttons meant for the
  toolbar. The default viewer no longer draws `Image.Viewer.Thumbnails`; put it in a composed
  viewer to get the strip, which now sits below the toolbar. Every viewer button defaults to
  `ghost`.
