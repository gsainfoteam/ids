# TextArea

- 여러 줄 입력과 그 위아래 바(메뉴바, 액션바, 글자 수)를 담는 컨테이너
- sentinel `TextArea.Input` 합성: Input 위 자식은 top 바, 아래 자식은 bottom 바
- 기본으로 내용에 맞춰 높이가 늘고 준다 (`autoResize`)
- `Field`, react-hook-form과 연결된다

```tsx
import { Field, TextArea } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>내용</Field.Label>
  <TextArea placeholder="내용을 입력하세요" value={body} onChange={(e) => setBody(e.target.value)} />
</Field>;
```

## 합성


```tsx
import { Button, IconButton, TextArea } from '@gsainfoteam/ids-react';
import { BoldIcon, ItalicIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

<TextArea rows={10}>
  <div className="flex gap-1">        {/* Input 위 = top 바 */}
    <IconButton variant="ghost" aria-label="굵게" icon={<BoldIcon />} />
    <IconButton variant="ghost" aria-label="기울임" icon={<ItalicIcon />} />
  </div>
  <TextArea.Input className="font-mono" />
  <div className="flex w-full justify-end">
    <Button size="tiny">저장</Button>  {/* Input 아래 = bottom 바 */}
  </div>
</TextArea>

<TextArea value={message} onChange={(e) => setMessage(e.target.value)} rows={1} maxRows={6}>
  <div className="flex w-full justify-end">
    {/* Input을 생략하면 맨 위에 자동으로 들어가고 자식은 모두 bottom 바로 간다 */}
    <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} onClick={send} />
  </div>
</TextArea>
```

- 바는 얇은 구분선으로 입력과 나뉘고, 비어 있으면 구분선까지 접힌다
- 여러 개를 한 줄에 놓으려면 `<div className="flex ...">`로 직접 묶는다
- `IconButton`은 고정 크기만 풀려 바 높이에 맞는다

## 높이

```tsx
<TextArea />                              // autoResize(기본): 내용에 맞춰 늘고 준다. 최소 높이는 rows(기본 3)
<TextArea minRows={2} maxRows={8} />      // 2줄에서 시작해 8줄을 넘으면 스크롤
<TextArea autoResize={false} rows={5} />  // native rows가 높이를 정하고 사용자가 세로로 늘릴 수 있다
<TextArea autoResize={false} resize="none" maxRows={10} /> // resize: none / vertical(기본) / horizontal / both
```

## 속성 우선순위

```tsx
<TextArea name="a" onChange={root}>
  <TextArea.Input name="b" onChange={input} />
</TextArea>
// name="b": 값은 Input > root > asChild 자식
// onChange: child, root, input 순서로 모두 실행 (Field, RHF가 root에 건 핸들러 유지)
```

## asChild

```tsx
<TextArea>
  <TextArea.Input asChild>
    <MyTextarea />                        {/* props와 ref를 native textarea에 전달해야 한다 */}
  </TextArea.Input>
</TextArea>
```

## 속성

| 속성                  | 기본 / 동작                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `variant`             | `outline`(기본) / `filled` / `underline`                              |
| `size`                | 생략하면 `Field` 크기, 없으면 `standard`. 글자, 패딩, radius만 정하고 높이는 정하지 않는다 |
| `invalid`             | danger 테두리와 `aria-invalid`. 명시한 `aria-invalid`(Field 포함)가 우선 |
| `autoResize`          | `true`. 내용에 맞춰 높이 조절                                         |
| `rows`                | `3`. `minRows`를 생략하면 최소 높이                                   |
| `minRows` / `maxRows` | 양의 정수. `maxRows`를 넘으면 스크롤                                  |
| `resize`              | `autoResize={false}`일 때만. `vertical`(기본)                         |
| `className` / `style` | 컨테이너로 간다. Input에 주면 textarea로 간다                         |
| 그 외 native 속성     | 실제 textarea로 간다                                                  |

## 알아둘 것

- 자동 높이는 JS로 잰다. 입력, 폼 reset, 폭 변화, 웹폰트 로드 때마다 다시 잰다.
- `autoResize`와 `resize`를 함께 주면 에러가 난다. `resize="none"`은 허용한다.
- `minRows`가 `maxRows`보다 크거나 양의 정수가 아니면 에러가 난다.
- `autoResize={false}`에서 세로 패딩을 바꾸려면 `--ids-text-area-pad-y`를 쓴다. `maxRows` 높이 계산에 이 값이 들어간다.
- `value`를 주고 `onChange`나 `readOnly`가 없으면 에러가 난다.
- `TextArea.Input`을 둘 이상 두거나, Input에 children을 주거나, `asChild` 자식이 textarea가 아니면 에러가 난다.
