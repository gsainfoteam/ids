---
'@gsainfoteam/ids-react': minor
---

Add `Image.Viewer`, the full-screen viewer an `Image.Group` or a `preview` image opens at the
pressed image. It is a modal layer rendered in place and lifted into the top layer: focus stays
inside, the page behind is hidden with `aria-hidden` and its scroll locked, Escape closes it
through the layer stack, and focus goes back to the pressed image. The images sit on a slide track
(drag or swipe, arrow keys flipped right to left, `Home`, `End`, a polite "2 of 6" announcement),
and the image shown zooms and pans: wheel around the cursor, pinch, double tap, drag with
momentum, `+` `-` `0`, arrow keys while zoomed, and a swipe down closes it at fitted size. It grows
out of the thumbnail and shrinks back into it, and only fades under reduced motion. Its parts live
under it: the default ones are `Image.Viewer.Toolbar` (`Image.Viewer.Counter`,
`Image.Viewer.ZoomIn`, `Image.Viewer.ZoomOut`, `Image.Viewer.Download`, `Image.Viewer.Close`),
`Image.Viewer.Prev`, `Image.Viewer.Next`, `Image.Viewer.Caption` and `Image.Viewer.Thumbnails`;
`Image.Viewer.Share` joins where the browser can share, and parts placed inside `Image.Viewer` draw
only those. Without a group, `<Image.Viewer items>` holds `open`, `value`, `loop` and `zoom` itself
and binds to an `overlay.open` item. The viewer's code loads on first open, and starts loading when
an image is hovered or focused, so `import { Image }` does not bring the slide or zoom engines.
