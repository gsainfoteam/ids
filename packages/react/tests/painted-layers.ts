const TRANSPARENT = /(?:\/ 0|, 0)\)$/;

export const paintedLayersOf = (element: Element) =>
  [...getComputedStyle(element).backgroundImage.matchAll(/(?:color|rgba?|oklab|oklch|hsla?|lab|lch)\([^)]*\)/g)]
    .map(([color]) => color)
    .filter((color) => !TRANSPARENT.test(color));
