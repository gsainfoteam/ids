# Accordion

```tsx
import { Accordion } from '@gsainfoteam/ids-react';

<Accordion type="single" collapsible defaultValue="shipping">
  {faqs.map((faq) => (
    <Accordion.Item key={faq.id} value={faq.id}>
      <Accordion.Trigger>
        {faq.question}
        <Accordion.Indicator>
          <ChevronDownIcon />
        </Accordion.Indicator>
      </Accordion.Trigger>
      <Accordion.Content>{faq.answer}</Accordion.Content>
    </Accordion.Item>
  ))}
</Accordion>;
```

접고 펼치는 섹션들이다. `variant`는 `bordered`(기본) `separated` `ghost`,
`size`는 `standard`(기본) `tiny`.

## type

`type="single"`은 한 번에 하나만 연다. `collapsible`(기본 `true`)이면 열린 것을 다시 눌러
닫을 수 있고, `false`면 항상 하나는 열려 있다. 값은 `T | null`이다.

`type="multiple"`은 여러 개를 동시에 연다. 값은 `T[]`다.

둘 다 `value`(controlled) / `defaultValue`(uncontrolled) / `onValueChange`를 받는다.

```tsx
type FaqId = 'shipping' | 'returns' | 'payment';

<Accordion<FaqId> type="single" onValueChange={(next) => ...}>
```

제네릭은 `value` `defaultValue` `onValueChange`에만 걸린다. `Accordion.Item`의 `value`는
`string`이다 — 합성 경계를 넘어 타입을 전달할 방법이 없다.

## 표시자

Chevron 같은 표시자는 `Accordion.Indicator`에 직접 넣는다. IDS는 아이콘 세트를 들고 다니지
않는다. 열리면 180도 회전하고, `prefers-reduced-motion`이면 회전이 즉시 끝난다.
`Accordion.Indicator`는 `ml-auto`라 Trigger 오른쪽 끝으로 밀린다.

## 키보드와 접근성

`Tab`으로 trigger 사이를 오가고 `Enter`/`Space`로 토글한다. trigger에 포커스가 있으면
`↑`/`↓`로 이전·다음, `Home`/`End`로 처음·끝 trigger로 이동한다.

`Accordion.Trigger`는 `aria-expanded`와 `aria-controls`를, `Accordion.Content`는
`role="region"`과 `aria-labelledby`를 갖는다. 접힌 Content는 DOM에 남지만 `inert`라
포커스도 스크린 리더도 닿지 않는다 — `aria-controls`가 가리킬 대상은 있어야 하기 때문이다.

펼침은 `grid-template-rows`를 `0fr`에서 `1fr`로 바꿔 높이를 재지 않고 애니메이션한다.

## 진단

`Accordion.Item`을 `Accordion` 밖에, 또는 `Accordion.Trigger`/`Content`/`Indicator`를
`Accordion.Item` 밖에 두면 `IdsError`를 던진다.
