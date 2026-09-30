---
'@gsainfoteam/ids-react': minor
---

Add `Image`, a native `<img>` with a loading placeholder (`Image.Placeholder`, a Skeleton filling
the image box by default), a fallback for a broken or missing source (`Image.Fallback`, a picture icon by
default, which keeps `alt` as the picture's name), `data-status` and `onStatusChange`, and `ratio`
through AspectRatio. The server renders a plain `<img>`, and an image that loaded before hydration
is read on mount. `alt` is required and a missing one warns in development. `Image.Group` lists
images in a `row`, a `column` or a `grid` of `columns`; pressing an image, or `Enter` and `Space` on
it, makes it the group's `value` and sets `open`, and `preview` makes a single image pressable the
same way. `value` counts the images in document order and follows them when they move. The group
also holds `loop` and `zoom` (`onZoomChange`) for the viewer.
