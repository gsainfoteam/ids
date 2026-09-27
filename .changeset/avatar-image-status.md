---
'@gsainfoteam/ids-react': minor
---

Rebuild Avatar around the image's loading status: `data-status` (`loading` / `loaded` / `error`)
and `onStatusChange`, an `Avatar.Image` part for native img attributes, and an `Avatar.Fallback`
`delay` (600ms by default) so a fast image never flashes initials. A broken image leaves the DOM,
an image that loaded before hydration is detected on mount, and a new `src` mounts a new element.
Without a name the fallback is a user icon. Initials split by grapheme and skip punctuation, and
scale with the avatar's size. `alt=""` marks an avatar as decorative. Avatars take their size and
shape from an enclosing AvatarGroup.

Breaking: `variant` is renamed `shape` (`circle` / `square`). Avatar no longer throws without
`src`, `name` or a fallback (it draws an icon), or without an accessible name (it warns in
development). A tiny square avatar uses the 4px indicator radius. `Avatar.FallbackProps` is now
`Avatar.Fallback.Props`.
