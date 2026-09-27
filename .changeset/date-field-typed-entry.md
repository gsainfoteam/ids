---
"@gsainfoteam/ids-react": minor
---

Add `DateField.Input` for typed dates. The text box takes the field's label and combobox role and
reads a date with date-fns on Enter or blur (at once for paste, drop and autofill, never on the
Enter that ends an IME composition): the display pattern, the locale's written dates
(`2026.09.15`, `2026년 9월 15일`, `Sep 15, 2026`), year-first dates in any locale, bare digits
from a phone keypad and the locale's numeric order. It rewrites the text in the display format
and keeps text it cannot read or that min, max or `disabled` rule out, marked `aria-invalid` until
it is fixed or reverted with Escape. Down Arrow opens the calendar on the typed date, and the
calendar button leaves the tab order.
