---
"@gsainfoteam/ids-react": major
---

Kbd drops `separator` for a `Kbd.Separator` part. Put one inside a Kbd whose `keys` hold several keys and it is drawn between every key, on Mac too; with no children it draws `+`. `<Kbd.Separator hidden />` hides the joiner.

```tsx
<Kbd keys="Mod+K">
  <Kbd.Separator>then</Kbd.Separator>
</Kbd>
```
