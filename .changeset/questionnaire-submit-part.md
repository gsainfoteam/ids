---
'@gsainfoteam/ids-react': major
---

Questionnaire loses `submitLabel`. The forward button is the `Questionnaire.Submit` part: placed among the questions, its children become the last step's label, and the Questionnaire draws it in its navigation. Without it the default button reads "다음" and then "보내기".

```tsx
<Questionnaire onComplete={save}>
  <Questionnaire.Question name="goal">…</Questionnaire.Question>
  <Questionnaire.Submit>계획 세우기</Questionnaire.Submit>
</Questionnaire>
```
