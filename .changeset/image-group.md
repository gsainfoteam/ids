---
"@gsainfoteam/ids-react": minor
---

**Breaking:** `Image.Group` is now its own component, `ImageGroup`. A group lays out several
Images rather than being a part of one, so it no longer sits in the `Image` namespace. Replace
`<Image.Group>` with `<ImageGroup>` (imported from `@gsainfoteam/ids-react`), `Image.GroupProps`
and `Image.Group.Props` with `ImageGroup.Props`, and `Image.Group.Layout` with `ImageGroup.Layout`;
the props, markup and the `Image.Viewer` it picks out of its children are unchanged. Its style is
`ImageGroup.Style` (slots `root` and `item`), and `Image.Style` loses its `group` and `groupItem`
slots and its `layout` variant. `ImageGroupLayout` is now exported next to `ImageGroup`.
