# TextArea

```tsx
import { TextArea, Button, IconButton } from '@gsainfoteam/ids-react';
import { Bold, Italic, Send } from 'lucide-react';

<TextArea placeholder="내용을 입력하세요" />

// 채팅 입력창 — Input 아래가 bottom
<TextArea value={message} onChange={(e) => setMessage(e.target.value)} rows={1} maxRows={6}>
  <TextArea.Input />
  <div className="flex w-full justify-end">
    <IconButton aria-label="보내기" icon={<Send />} onClick={send} />
  </div>
</TextArea>

// 마크다운 에디터 — Input 위가 top
<TextArea rows={10}>
  <div className="flex gap-1">
    <IconButton variant="ghost" aria-label="굵게" icon={<Bold />} />
    <IconButton variant="ghost" aria-label="기울임" icon={<Italic />} />
  </div>
  <TextArea.Input className="font-mono" />
  <div className="flex w-full justify-end">
    <Button size="tiny">저장</Button>
  </div>
</TextArea>
```

여러 줄 입력을 감싸는 컨테이너다. `TextField`와 같은 sentinel 합성 패턴이지만 **방향이
수직**이다 — `TextArea.Input` 위에 놓은 자식은 top 바, 아래에 놓은 자식은 bottom 바가 된다.
바는 얇은 구분선으로 입력과 나뉘고, 비어 있으면 구분선까지 통째로 접힌다. 이 구조 하나로
메뉴바, 액션바, 글자 수 카운터를 별도 컴포넌트 없이 붙인다.

`TextArea.Input`을 생략하면 하나 만들어 넣으므로 `<TextArea placeholder="..." />`만 써도 된다.
둘 이상 넣으면 개발 중에 에러가 난다. native textarea 속성은 `TextArea`에 줘도
`TextArea.Input`에 줘도 같은 textarea에 도달하고, `Input`에 직접 준 값이 이긴다. `id`도
마찬가지라 Label과는 `htmlFor`/`id`로 연결하거나 감싸기만 하면 된다.

`variant`는 `outline`(기본), `filled`, `underline`이고 `size`는 `standard` 또는 `tiny`다.
size는 폰트, 패딩, radius를 정할 뿐 높이는 정하지 않는다. `className`과 `style`은 컨테이너로
간다.

## 높이

`autoResize`가 기본값 `true`라 내용에 맞춰 높이가 자동으로 늘어난다. CSS
`field-sizing: content`로 동작하므로 높이를 재는 JS가 없다.

`rows`가 최소 높이, `maxRows`가 최대 높이다. `maxRows`를 넘으면 textarea가 스크롤된다.
`field-sizing: content`는 `rows` 속성을 무시하므로 둘 다 `lh` 단위 `min-height` /
`max-height`로 계산해 건다. 이 계산이 패딩까지 더해야 해서, 세로 패딩은
`--ids-text-area-pad-y`로 한 번만 정의하고 클래스와 계산식이 함께 읽는다.

`autoResize={false}`면 native `rows`가 높이를 정하고 `resize`로 사용자 리사이즈 핸들을
켠다 (`none`, `vertical`(기본), `horizontal`, `both`). `autoResize`와 `resize`를 함께 주면
개발 중에 에러가 난다 — 자동 높이 조절과 수동 리사이즈는 양립하지 않는다.

## 바에 들어가는 것

바의 자식은 자유다 — Button, IconButton, Kbd, 텍스트 무엇이든. IconButton은 고정 정사각
크기만 풀어 바 높이에 맞추고, 패딩과 색은 컴포넌트 것을 그대로 쓴다. 여러 개를 한 줄에
배치하려면 `<div className="flex ...">`로 직접 묶는다.
