---
'@gsainfoteam/ids-css': minor
'@gsainfoteam/ids-react': minor
'ids_flutter': minor
---

Add scheme classes and component tokens. `scheme-{family}` points `bg-scheme`, `text-on-scheme`,
`text-scheme`, `border-scheme` and the state layer at one family; the IdsProvider root carries
`scheme-primary`, and every component with `colorScheme` writes its own scheme. Component tokens
(`bg-panel`, `shadow-panel`, `bg-band`, `bg-control-outline`, `border-control-outline`,
`bg-field-outline`, `border-field-outline`, `border-field-bar`, `bg-field-code-outline`, `bg-switch-thumb`,
`bg-qr-code`, `text-qr-code`, `bg-qr-code-inverse`, `text-qr-code-inverse`) pick one role per mode, from `component.json` and `shadow.json`;
Flutter reads them as `IdsProvider.of(context).componentColors` and `.componentShadows`.

Component code no longer uses `dark:` colors. Card, Dialog, popups, toasts, the outline Alert and
FileField items sit on `bg-panel`, which is one step lighter than the page in dark mode; the outline
Card adds `shadow-panel`. Outline Chip and Badge borders are `border-neutral`. The invalid empty
Rating star is `text-neutral`. The Editor bar takes `border-field-bar` and the outline Editor's
code `bg-field-code-outline`.

Parts that copy the color underneath them (the Badge cutout, the ColorPicker ring offset, Bubble
reaction rings, the selected enclosed Tab, the ghost Table header, Chart dots, the Sidebar drop
marker) read the new `--ids-bg-current`, which the page, `bg-panel` and `bg-band` set, so they
match a dark Card or popup.

Breaking: the layout variables `--ids-marquee-*` and `--ids-text-area-pad-y` are now
`--marquee-*` and `--text-area-pad-y`.
