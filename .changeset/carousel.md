---
'@gsainfoteam/ids-react': minor
---

Add `Carousel`, slides in one row that a user drags, steps or jumps through, on Embla Carousel 8.6.
The selected snap is `value` (`defaultValue`, `onValueChange`); `orientation`, `slidesPerView`,
`slidesToScroll` (a number or `'auto'`), `align`, `loop`, `dragFree` and `size` (`standard` /
`tiny` controls) shape it. `Carousel.Slide` alone draws a default `Carousel.Content`, Previous and
Next buttons over its edges (aria-disabled and still focusable at the ends) and indicator dots (8px
dots in 24px targets, the current one `aria-current`); placing `Carousel.Prev`, `Carousel.Next` or
`Carousel.Indicators` yourself draws only what you place. `autoplay` (`{ delay }`) steps through
the slides and `autoScroll` (`{ speed, direction }`) flows continuously; either brings a
`Carousel.Pause` toggle (WCAG 2.2.2), pauses while hovered, focused by keyboard or dragged, stays
paused until pressed again, and starts paused under `prefers-reduced-motion`
(`playing`, `defaultPlaying`, `onPlayingChange`). The root is a named `region` with the carousel
role description, each slide a `group` read as "2 of 5", slides out of view are `inert`, and a
live region announces the new position unless the carousel is rotating. Arrow keys (flipped right
to left), `Home` and `End` move it. Server HTML lays the slides out with CSS alone, already at
`defaultValue`.
