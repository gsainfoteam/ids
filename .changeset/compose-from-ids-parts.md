---
"@gsainfoteam/ids-react": minor
---

Components build on the IDS parts and HTML elements they used to redraw by hand.

- An unlabelled Divider is an `<hr>`, CheckboxGroup a `<fieldset>`, Accordion.Content, Carousel and
  the Image viewer stage a `<section>`, AvatarGroup and Marquee a `<ul>` of `<li>`, FileField's
  rejections a `<ul>`, and the field popup's drawer title an `<h2>` that names the popup.
- `Card.Title` renders `h{headingLevel}`, set on the Card (default `3`). `Item` takes
  `headingLevel` too, with no heading unless it is set.
- `Pagination` adds `First` and `Last` parts and `focusableWhenDisabled` on its arrows. DataTable's
  footer is a Pagination and its sort header a Button; Breadcrumb's ellipsis and Splitter's
  collapse button are IconButtons; Stepper's separator is a decorative Divider.
- FloatingButton `solid` and `glossy`, NumberField steppers, Calendar dropdowns and OTPField slots
  take the shared control, field-action and field surfaces. A NumberField stepper keeps its
  pressed color while held, and OTPField `soft` turns muted like the other fields.
- Menu, the field popups, Dialog, Drawer and the Image viewer share one popup surface and backdrop.

Breaking: `Stepper.Separator` no longer takes `children`; Divider, Carousel, Accordion.Content and
CheckboxGroup refs are the new elements; DataTable's navigation is named by `pagination.label`, and
the `dataTable.firstPage`, `lastPage`, `nextPage`, `previousPage` and `pagination` messages are gone.
