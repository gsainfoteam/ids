---
"@gsainfoteam/ids-react": minor
---

RadioGroup, the five prose descriptions and Rating use the HTML elements that carry their meaning.

- RadioGroup is a `<fieldset role="radiogroup">`. Its `disabled` is the fieldset's own, which turns
  every radio inside off and leaves them out of the form. ColorPicker.Swatches follows.
- `Card.Description`, `Item.Description`, `Empty.Description`, `Alert.Description` and
  `Field.Description` render a `<p>`. Block content goes in with `asChild`
  (`<Card.Description asChild><div>…</div></Card.Description>`), and development builds warn when
  a block element lands inside the `<p>`. An `Alert.Description asChild` `<ul>` keeps its bullets.
- Rating's scores are native `<input type="radio">` sharing one name. The browser moves between
  them with the arrow keys, submits the chosen score, checks `required` and resets the form; a
  score of 0 checks no radio.

Breaking: RadioGroup and ColorPicker.Swatches refs are `HTMLFieldSetElement`, and RadioGroup's root
no longer sets `aria-disabled`. Those five descriptions are `<p>` elements, so a `<div>`, list or
heading inside one needs `asChild`. Rating drops `Home`, `End` and the digit keys, its arrow keys
behave at the ends as the browser's radio groups do (Chrome and Firefox wrap, so right on the last
score goes to 0), and a Rating without a `name` keeps its radios out of the form.
