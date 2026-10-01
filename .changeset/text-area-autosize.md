---
'@gsainfoteam/ids-react': minor
---

TextArea's `autoResize` now measures with `react-textarea-autosize` instead of its own hook, with
the same `rows`, `minRows` and `maxRows` API. An empty field is sized to its placeholder, and the
height is measured again after a form reset, a window resize and web fonts loading.

Breaking: with `TextArea.Input asChild`, a component child now sizes its own textarea; a plain
`<textarea>` child is still measured. While `autoResize` is on, `height`, `minHeight` and
`maxHeight` in the Input's `style` are ignored; use `minRows` and `maxRows`. A change in the
container's width alone no longer triggers a new measurement, and switching `autoResize` on or
off mounts a new textarea.
