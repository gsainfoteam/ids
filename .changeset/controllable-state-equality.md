---
'@gsainfoteam/ids-react': minor
---

`useControllableState` no longer reports a change when the next value equals the current one
(arrays and Sets compare by content), and its callback option is renamed `onChange` to
`onValueChange`. Slider stops firing on pointer moves that land on the same value.
