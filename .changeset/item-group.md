---
"@gsainfoteam/ids-react": minor
---

**Breaking:** `Item.Group` is now its own component, `ItemGroup`. A group holds several Items
rather than being a part of one, so it no longer sits in the `Item` namespace. Replace
`<Item.Group>` with `<ItemGroup>` (imported from `@gsainfoteam/ids-react`), `Item.Group.Props` with
`ItemGroup.Props` and `Item.Group.Variant` with `ItemGroup.Variant`; the props and markup are
unchanged. Its style is `ItemGroup.Style` (slots `root` and `item`), and `Item.Style` loses its
`group` and `groupItem` slots and its `groupVariant` variant. `Item.Separator` stays a part of Item.
