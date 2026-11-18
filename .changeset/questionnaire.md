---
"@gsainfoteam/ids-react": minor
---

Add `Questionnaire`, a form that asks one question at a time and hands the answers to
`onComplete`. Each `Questionnaire.Question` is a `RadioGroup` or `CheckboxGroup`
(`selectionMode`) with its text as the `<legend>`, `Questionnaire.Option` is a card with a `Radio`
or `Checkbox`, and `Questionnaire.Other` is a `TextField` for an answer that is not listed. Several
questions show a `Progress`; previous, skip (`optional`), next and submit buttons sit in a
`ButtonGroup`. `advanceOnSelect` moves on as soon as a single-choice option is picked, so a
one-question Questionnaire works as the suggested prompts of a chat start screen.
