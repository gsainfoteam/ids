# Kbd

```tsx
import { Kbd } from '@gsainfoteam/ids-react';

<span className="inline-flex items-center gap-1">
  <Kbd>Ctrl</Kbd><span>+</span><Kbd>K</Kbd>
</span>
<Kbd size="tiny">Esc</Kbd>
```

네이티브 `<kbd>`로 키 입력을 표시한다. `size`는 `standard`(기본) 또는 `tiny`이며,
기존 caption 타이포그래피, muted 배경, on-surface 글자색, outline 테두리를 사용한다.
키 조합은 Kbd 여러 개와 텍스트로 합성한다. 기호의 설명이 필요하면
`<Kbd><abbr title="Command">⌘</abbr></Kbd>`처럼 의미를 함께 전달한다.

키보드 이벤트나 전역 단축키를 등록하지 않으며 기본적으로 Tab 포커스를 받지 않는다.
실제 키 동작은 앱에서 처리한다. native kbd 속성, children, className/style/ref를 전달한다.
