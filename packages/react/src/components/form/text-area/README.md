# TextArea

여러 줄 입력과 그 위아래의 바(메뉴바, 액션바, 글자 수)를 한 테두리 안에 담는 필드입니다.

- **높이가 내용을 따라감.** 기본으로 내용에 맞춰 늘고 줄어듭니다. `maxRows` 를 넘으면 스크롤이 생기고, 폼 reset, 창 크기 변화, 웹폰트 로딩 뒤에도 다시 잽니다.
- **글자 수.** `TextArea.Count` 는 `maxLength` 에 대한 글자 수를 보여 주고 입력의 설명에 들어갑니다. 한도에 가까워지면 입력이 멈춘 뒤 남은 글자 수를 스크린 리더에 알립니다.
- **바.** Input 위의 자식은 위 바, 아래의 자식은 아래 바가 됩니다. 바 안의 버튼은 필드 안쪽 크기로 줄고, 아이콘이 입력한 글자와 줄을 맞춥니다.
- **상태는 테두리에.** 오류면 바깥 테두리만 danger 색이 되고, 바 구분선과 글자 수는 중립색을 유지합니다.
- **native 그대로.** 실제 `<textarea>` 하나라 IME, 실행 취소, 폼 제출, `register()` 가 그대로 됩니다.

```tsx
import { Field, TextArea } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>자기소개</Field.Label>
  <TextArea name="bio" maxLength={200}>
    <TextArea.Input />
    <TextArea.Count />
  </TextArea>
</Field>;
```

## 값

```tsx
<TextArea defaultValue="안녕하세요" />                              // 비제어
<TextArea value={body} onValueChange={setBody} />                  // 제어. 문자열을 바로 받는다
<TextArea value={body} onChange={(e) => setBody(e.target.value)} /> // native 이벤트도 그대로 온다
```

- `onValueChange(value)` 는 `onChange` 와 같은 때에 불립니다. 코드가 값을 바꿀 때는 부르지 않습니다.

## 높이

```tsx
<TextArea />                              // autoResize(기본): 내용에 맞춰 늘고 준다. 최소 높이는 rows(기본 3)
<TextArea rows={1} maxRows={6} />         // 한 줄에서 시작해 6줄을 넘으면 스크롤
<TextArea minRows={2} maxRows={8} />      // 최소 2줄
<TextArea autoResize={false} rows={5} />  // rows가 높이를 정하고 사용자가 세로로 늘릴 수 있다
<TextArea autoResize={false} resize="none" maxRows={10} /> // resize: none / vertical(기본) / horizontal / both
```

- 자동 높이는 `react-textarea-autosize` 가 JS로 잽니다. Safari와 Firefox가 `field-sizing: content` 를 지원하지 않기 때문입니다.
- 비어 있으면 placeholder 길이에 맞춥니다. 자동 높이에서는 `style` 의 `height`, `minHeight`, `maxHeight` 를 쓰지 않습니다. `minRows`, `maxRows` 로 정합니다.

## 바

```tsx
<TextArea rows={10}>
  <div className="flex gap-1">           {/* Input 위 = 위 바 */}
    <IconButton aria-label="굵게" icon={<BoldIcon />} />
    <IconButton aria-label="기울임" icon={<ItalicIcon />} />
  </div>
  <TextArea.Input className="font-mono" />
  <TextArea.Count />                     {/* Input 아래 = 아래 바. 오른쪽으로 붙는다 */}
  <Button size="tiny">저장</Button>
</TextArea>

<TextArea value={message} onValueChange={setMessage} rows={1} maxRows={6}>
  <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} onClick={send} />
  {/* Input을 생략하면 맨 위에 들어가고 자식은 모두 아래 바로 간다 */}
</TextArea>
```

- 바는 구분선으로 입력과 나뉘고, 비어 있으면 구분선까지 접힙니다.
- 바 안의 버튼은 높이 28px(tiny 24px)로 줄어듭니다. 아이콘 버튼은 정사각형입니다.
- 양 끝의 버튼 묶음은 버튼 여백만큼 바깥으로 당겨져서, 아이콘이 입력한 글자와 같은 선에 섭니다.

## 글자 수

```tsx
<TextArea maxLength={200}>
  <TextArea.Input />
  <TextArea.Count />                              {/* "12 / 200" */}
</TextArea>

<TextArea.Count threshold={20} />                 {/* 20자 남았을 때부터 알린다 */}
<TextArea.Count>{(state) => `${state.count}자`}</TextArea.Count>      {/* 표시 바꾸기 */}
<TextArea.Count announce={(state) => `${state.remaining} left`} />  {/* 알림 문구 바꾸기 */}
```

| 상태        | 뜻                                           |
| ----------- | -------------------------------------------- |
| `count`     | 지금 글자 수                                 |
| `maxLength` | 입력의 `maxLength`. 없으면 `undefined`       |
| `remaining` | 남은 글자 수                                 |
| `nearLimit` | `remaining` 이 `threshold` 이하              |
| `atLimit`   | 한도에 닿았다                                |

- `maxLength` 가 없으면 글자 수만 보입니다.
- 글자 수는 입력의 `aria-describedby` 에 들어가서 포커스할 때 함께 읽힙니다. Field의 설명과 합쳐집니다.
- `threshold` 기본값은 한도의 10%와 10자 중 큰 쪽입니다. 그 아래로 내려가면 입력이 0.6초 멈춘 뒤 `role="status"` 로 "6자 남았습니다." 처럼 알립니다. 한도에 닿으면 "글자 수 제한에 도달했습니다." 입니다.
- 글자 수 요소에 `data-near-limit`, `data-at-limit` 이 붙습니다.
- 브라우저의 `maxLength` 와 같은 단위(UTF-16 코드 단위)로 셉니다. 이모지 하나가 2로 셀 수 있습니다.
- react-hook-form `setValue` 처럼 이벤트 없이 바뀐 값도 따라갑니다.

## 상태

```tsx
<TextArea className={(state) => (state.focused ? 'shadow-md' : undefined)} />
```

| 속성                        | 뜻                                           |
| --------------------------- | -------------------------------------------- |
| `data-focused`              | 포커스가 필드 안에 있다                      |
| `data-filled`               | 값이 있다                                    |
| `data-invalid`              | `invalid`, `aria-invalid`, 또는 Field의 오류 |
| `data-disabled`             | 비활성                                       |
| `data-readonly`             | 읽기 전용                                    |
| `data-size`, `data-variant` | 크기와 variant                               |

- 테두리 컨테이너(`data-text-area`)에 붙습니다. 실제 textarea에는 `data-field-input` 이 붙어 포커스 링이 컨테이너에 그려집니다.

## 속성 우선순위

```tsx
<TextArea name="a" onChange={root}>
  <TextArea.Input name="b" onChange={input} />
</TextArea>
// name="b": 값은 Input > root > asChild 자식
// onChange: 자식, root, Input 순서로 모두 실행 (Field, RHF가 root에 건 핸들러 유지)
```

## asChild

```tsx
<TextArea>
  <TextArea.Input asChild>
    <MyTextarea />                       {/* props와 ref를 native textarea에 넘겨야 한다 */}
  </TextArea.Input>
</TextArea>
```

- 자식이 `<textarea>` 면 자동 높이가 그대로 됩니다. 컴포넌트면 높이는 그 컴포넌트가 정합니다.

## 속성

| 속성                     | 기본 / 동작                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `value` / `defaultValue` | native 그대로                                                         |
| `onValueChange`          | `(value: string) => void`                                             |
| `variant`                | `outline`(기본) / `soft` / `ghost`                                    |
| `size`                   | 생략하면 `Field` 크기, 없으면 `standard`. 글자, 패딩만 정하고 높이는 정하지 않는다 |
| `invalid`                | danger 테두리와 `aria-invalid`. 명시한 `aria-invalid`(Field 포함)가 우선 |
| `autoResize`             | `true`. 내용에 맞춰 높이 조절                                         |
| `rows`                   | `3`. `minRows` 를 생략하면 최소 높이                                  |
| `minRows` / `maxRows`    | 양의 정수. `maxRows` 를 넘으면 스크롤                                 |
| `resize`                 | `autoResize={false}` 일 때만. `vertical`(기본)                        |
| `className` / `style`    | 컨테이너로 간다. 상태를 받는 함수도 된다. Input에 주면 textarea로 간다 |
| 그 외 native 속성, ref    | 실제 textarea로 간다                                                  |
| `TextArea.Count`         | `threshold`, `announce`, 상태를 받는 `children` · `className`          |

## 알아둘 것

- `autoResize` 와 `resize` 를 함께 주면 에러가 납니다. `resize="none"` 은 허용합니다.
- `minRows` 가 `maxRows` 보다 크거나 양의 정수가 아니면 에러가 납니다.
- `autoResize={false}` 에서 세로 패딩을 바꾸려면 `--ids-text-area-pad-y` 를 씁니다. `maxRows` 높이 계산에 이 값이 들어갑니다.
- `value` 를 주고 `onChange`, `onValueChange`, `readOnly` 가 모두 없으면 에러가 납니다.
- `TextArea.Input` 을 둘 이상 두거나, Input에 children을 주거나, `asChild` 자식이 textarea가 아니면 에러가 납니다.
- `id` 가 없으면 만들어 붙입니다.
