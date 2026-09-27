---
'@gsainfoteam/ids-react': minor
---

Alert splits meaning from intensity: `colorScheme` (`neutral` / `info` / `success` / `warning` /
`danger`) picks the meaning and `variant` (`solid` / `soft` / `outline` / `ghost`) the intensity.
Titles and icons use the `-strong` tones so every scheme keeps 4.5:1, and each scheme brings a
default icon (`Alert.Icon hidden` removes it). With `Alert.Close` the alert dismisses itself, or
is controlled through `open` / `defaultOpen` / `onOpenChange`; it fades out unless motion is
reduced, Escape closes it except during IME composition, and focus inside moves on to the next
element instead of the page top. `role` can be overridden, every part takes `asChild`, and
`className` / `style` may read `Alert.State`.

Breaking: `variant="info" | "success" | "warning" | "danger" | "neutral"` is now `colorScheme`,
and `variant` means intensity (default `soft`). `Alert.Close` no longer takes `onClose`; use
`onOpenChange` on the Alert. Alerts without `Alert.Icon` now show the scheme's default icon
(except `neutral`). Part props are typed as `Alert.Title.Props` and so on instead of
`Alert.PartProps` / `Alert.CloseProps`.
