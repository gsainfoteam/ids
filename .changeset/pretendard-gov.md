---
'@gsainfoteam/ids-css': minor
'ids_flutter': minor
---

The sans font is now Pretendard GOV Variable. `--ids-font-family-sans` (and `font-sans`) starts
with `'Pretendard GOV Variable', 'Pretendard GOV'` and keeps standard Pretendard and `sans-serif`
after it, so an app that has loaded only Pretendard still shows Pretendard. On the web, load the
font from the Pretendard CDN, for example `pretendardvariable-gov-dynamic-subset.min.css`.
ids_flutter bundles `PretendardGOVVariable.ttf` as the `Pretendard GOV Variable` family in place of
Pretendard Variable; the file is 13 MB, twice the size of the previous one.
