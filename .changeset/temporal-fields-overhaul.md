---
"@gsainfoteam/ids-react": minor
---

Rebuild DateField, TimeField and DateTimeField on one shared trigger and popup base with its
logic in `useTemporalField`, styled after shadcn/ui: the popup is the picker alone, with a title
and close button only in the mobile drawer. New: `open` / `defaultOpen` / `onOpenChange`,
`required` enforced by the browser through a hidden form value that hands focus back to the
trigger, `X.State`, function `className` / `style` on the field surface, `data-open`,
`data-empty`, `data-invalid`, `data-disabled`, `data-readonly` and `data-required` on it,
`data-placeholder` on the value, a Clear button that takes the chevron's place once there is a
value, `referenceDate` on TimeField, `captionLayout` passed through to
the calendar, one `onOpenChange(false)` per outside click, and a DateTimeField clock that stays
empty until a time is picked and sits beside the calendar at its height. Clear is a ghost
IconButton in the field's size that keeps its tab stop.

Breaking: `onChange` is now `onValueChange` on all three fields. The default `locale` is `ko-KR`.
An empty value, or a range without its end, is left out of FormData instead of submitted as `""`
or `"start/"`. `required` now blocks the native submit instead of only setting `aria-required`.
TimeField no longer takes `selectionMode`; use `readOnly`. Once any part is given, the field
draws only the parts given (a missing Trigger is still filled in), so `Clear` is no longer added
on its own. The popup close button is named `닫기`.
