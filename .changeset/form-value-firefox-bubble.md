---
'@gsainfoteam/ids-react': patch
---

A blocked submit no longer leaves Firefox's "fill out this field" message stuck over the page.
The required check of Select, ChipField, ColorField, FileField, Rating, ToggleGroup, CheckboxGroup
and the date and time fields now hands focus to the control one frame after the browser reports,
so Firefox closes its message instead of keeping it on screen, where it swallowed the next click.
