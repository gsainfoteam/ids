---
'@gsainfoteam/ids-css': patch
---

`focus-ring` no longer rings a field while focus is in a popup that the field holds in the DOM,
such as the search box of TelField's country list. The popup is drawn apart from the field, so
the ring now stays with the popup's own controls. A field inside a popup still rings for itself.
