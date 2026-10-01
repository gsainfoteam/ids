---
'@gsainfoteam/ids-react': minor
---

TextArea's `resize` now draws Resizable's handles instead of the browser's CSS `resize` grip, in
the place on the field's border where Resizable draws them for the same direction: `vertical` a
pill centered on the bottom border, `horizontal` a pill centered on the end border, and `both` an
arc hugging the bottom-end corner, concentric with the field's corner (the bottom-left corner in
right-to-left text). The handles take Resizable's keys and roles (a separator named "높이" or
"너비", or for `both` one tab stop holding both; arrows step 16px, Shift 64px, Home and End go to
the bounds, Enter returns to the first size), are the field's last tab stop, drag by touch on iOS
and look the same in every browser. Their 24px target runs outward from the inner edge of the
drawn line, so the bottom bar's buttons and the scrollbar next to the handle stay pressable, and
the scrollbar runs to the rounded corner. Height resizes the textarea and width resizes the whole
field; the height stays between one line and `maxRows` and the width at 96px or more. A double
click returns to the first size and Escape cancels a drag. The `resize` API is unchanged and still
requires `autoResize={false}`.
