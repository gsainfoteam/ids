---
'@gsainfoteam/ids-react': patch
---

An uncontrolled Radio that was checked before a form reset can be chosen again right after it.
Before, React's change tracking still held the old value, so the first click on it went unreported.
