---
"@gsainfoteam/ids-react": minor
---

**Breaking:** `Kbd.Group` is now its own component, `KbdGroup`. A group holds several Kbd rather
than being a part of one, so it no longer sits in the `Kbd` namespace. Replace `<Kbd.Group>` with
`<KbdGroup>` (imported from `@gsainfoteam/ids-react`) and `Kbd.Group.Props` with `KbdGroup.Props`;
the props and markup are unchanged. Its style is `KbdGroup.Style`, and `Kbd.Style` loses its
`group` slot.
