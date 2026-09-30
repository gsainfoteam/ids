---
'@gsainfoteam/ids-react': minor
---

TextArea's `resize` now draws an IDS grip in the bottom-end corner of the input area instead of the
browser's CSS `resize` grip: in every mode, the arc of Resizable's corner grip, drawn 5px inside
and concentric with the input area's corner (an L when a bottom bar squares that corner), with a
24px target that stays inside the field. The grip is keyboard operable (a separator named "높이"
or "너비", or for `both` one tab stop holding both; arrows step 16px, Shift 64px, Home and End go
to the bounds, Enter returns to the first size), drags by touch on iOS, looks the same in every
browser, and the input area's scrollbar stops above it. Height resizes the textarea and width
resizes the whole field; the height stays between one line and `maxRows` and the width at 96px or
more. A double click returns to the first size and Escape cancels a drag. The `resize` API is
unchanged and still requires `autoResize={false}`.
