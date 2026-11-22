---
"@gsainfoteam/ids-react": minor
---

**Breaking:** `Field.Group` is now its own component, `FieldGroup`. A group stacks several Fields
rather than being a part of one, so it no longer sits in the `Field` namespace. Replace
`<Field.Group>` with `<FieldGroup>` (imported from `@gsainfoteam/ids-react`) and `Field.GroupProps`
with `FieldGroup.Props`; the props and markup are unchanged. Its style is `FieldGroup.Style`, and
`Field.Style` loses its `group` slot.
