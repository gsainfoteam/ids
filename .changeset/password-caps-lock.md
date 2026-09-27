---
'@gsainfoteam/ids-react': minor
---

PasswordField moves onto the shared text-control shell and adds `PasswordField.CapsLock`: while
the input has focus and Caps Lock is on, a ⇪ glyph appears and a mounted `role="status"` region
announces it. It is added automatically unless placed or hidden with `hideCapsLock`. Visibility
is now controllable with `visible` / `defaultVisible` / `onVisibleChange`, and a form submit
masks the password again so password managers offer to save it. `onValueChange(value)` reports
the string next to the native `onChange`, `PasswordField.Clear` is available, the input
defaults to `autoCorrect="off"`, and the shell carries `data-visible`, `data-focused`,
`data-filled` and the other text-field states, with function-valued `className` / `style`. The
visibility toggle is a ghost `IconToggle` with `data-pressed`, whose pressed state changes only
its glyph, not its fill.

Breaking: the visibility toggle keeps one name ("비밀번호 표시") and reports the state only
through `aria-pressed`, instead of switching between two names. A toggle drawn with `asChild`
gets no default `aria-label`, so its own text names it. The input no longer carries
`data-size`; read it from the shell.
