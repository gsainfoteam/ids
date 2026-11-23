---
'@gsainfoteam/ids-react': major
---

PasswordField drops `hideVisibilityToggle` and `hideCapsLock`. The Caps Lock indicator and the visibility toggle are drawn when the children name none of PasswordField's parts (`Input`, `VisibilityToggle`, `CapsLock`, `Clear`); once a part is written, only the written parts are drawn. A field that wrote `<PasswordField.Clear />` alone now draws no toggle: write `<PasswordField.VisibilityToggle />` beside it.

```tsx
<PasswordField name="password">
  <PasswordField.Input />
  <PasswordField.VisibilityToggle />
</PasswordField>
```
