---
"@gsainfoteam/ids-react": minor
---

Add `Stepper.Body` for links, buttons, `Item` or `Card` under a step's title and description, in a
progress Stepper or a record. It renders outside the step button, so its controls are Tab stops of
their own and pressing them keeps the step. A vertical Stepper indents it to the title column with
the connector line running beside it to the next step; a horizontal Stepper hides it, and a Body
there or inside `Stepper.Trigger` warns in development. `asChild` merges it into its child.
