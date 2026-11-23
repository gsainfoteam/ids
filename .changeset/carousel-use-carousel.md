---
'@gsainfoteam/ids-react': major
---

Carousel's options moved into a new `useCarousel` hook. The root loses `slidesPerView`, `slidesToScroll`, `align`, `loop`, `dragFree`, `autoplay`, `autoScroll`, `playing`, `defaultPlaying` and `onPlayingChange`, and takes the hook's result as `carousel`. `useCarousel({ slides, autoplay, autoScroll })` takes one object per feature: `slides` holds `perView`, `toScroll`, `align`, `loop` and `dragFree`; `autoplay` (`delay`) and `autoScroll` (`speed`, `direction`) turn on when their object is given (`autoplay: {}` for the defaults, no more `true`), and each holds the paused state as `value` / `defaultValue` / `onValueChange` in place of `playing` / `defaultPlaying` / `onPlayingChange`. A `<Carousel>` without `carousel` still shows one slide at a time with no motion, so a Server Component can render it, and an app that never calls `useCarousel` no longer bundles the Embla autoplay and auto-scroll plugins. `value`, `defaultValue`, `onValueChange`, `orientation` and `size` stay on the root, and the data attributes are unchanged.

```tsx
const carousel = useCarousel({
  slides: { perView: 3, toScroll: 'auto', loop: true },
  autoplay: { delay: 5000, value: playing, onValueChange: setPlaying },
});

<Carousel aria-label="Featured" carousel={carousel}>
  {items.map((item) => (
    <Carousel.Slide key={item.id}>{item.name}</Carousel.Slide>
  ))}
</Carousel>;
```
