---
'@gsainfoteam/ids-react': minor
---

TextArea's `resize` now draws an IDS grip in the bottom-end corner of the input area instead of the
browser's CSS `resize` grip. The grip is keyboard operable (a separator named "높이" or "너비", or
for `both` one tab stop holding both; arrows step 16px, Shift 64px, Home and End go to the bounds,
Enter returns to the first size), drags by touch on iOS, looks the same in every browser, and the
input area's scrollbar stops above it. Height resizes the textarea and width resizes the whole
field; the height stays between one line and `maxRows` and the width at 96px or more. A double
click returns to the first size and Escape cancels a drag. The `resize` API is unchanged and still
requires `autoResize={false}`.

The field keeps `overflow: visible` while it can be resized, so the grip's 24px target is not
clipped by the rounded corner.
