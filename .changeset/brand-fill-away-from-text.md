---
'@gsainfoteam/ids-react': patch
---

Hover and press on a solid brand fill (solid Button, IconButton, FloatingButton, a selected
Calendar day and TimePicker option) now move the fill away from its text color, 10% and 20%
toward black under white text and toward white under dark text, instead of fading it to 90% and
80%. A faded blue fell to 4.46:1 under white text; the new states keep at least the resting
contrast in every palette and mode. Browsers without relative color syntax keep the fade.
