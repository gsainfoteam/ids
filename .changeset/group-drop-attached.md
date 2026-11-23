---
"@gsainfoteam/ids-react": major
---

Group, ButtonGroup and ToggleGroup lose `attached`. A group always joins its direct children and never reads `className` or `style`. It is now `inline-flex`: it hugs its content and stretches inside a `grid` or `flex-col` parent, where joined toggles share the width. To space items apart, wrap them in a layout `div` of the app's own inside the group: items there keep their corners and shadows, and size, variant, roving focus, selection and form values still reach them. A Separator among spaced items is as tall as the buttons. Message.Actions, Questionnaire and the booking block wrap their items this way.

```tsx
// before
<ToggleGroup attached={false} className="flex-wrap" aria-label="시간">
  <Toggle value="09:00">09:00</Toggle>
</ToggleGroup>

// after
<ToggleGroup aria-label="시간">
  <div className="flex flex-wrap gap-2">
    <Toggle value="09:00">09:00</Toggle>
  </div>
</ToggleGroup>
```
