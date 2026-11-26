# PromptInput

챗봇과 에이전트에 메시지를 보내는 입력창입니다. 글, 첨부 파일, 도구, 보내기와 멈추기 버튼을 구분선 없는 한 테두리 안에 담습니다.

- **TextArea 와 FileField 로 짓습니다.** 입력은 [TextArea](../text-area/README.md) 라 처음에는 두 줄 높이(`rows`, 기본 2)이고, 내용에 맞춰 늘다가 `maxRows`(기본 6줄)를 넘으면 IDS 스크롤 막대가 생깁니다. 첨부는 [FileField](../file-field/README.md) 의 고르기, 끌어다 놓기, 붙여넣기, 제한, 목록을 그대로 씁니다.
- **Enter 로 보냅니다.** Enter 는 보내고 Shift+Enter 는 줄을 바꿉니다. 한글처럼 조합 중인 글자를 확정하는 Enter 는 보내지 않습니다. 모바일 키보드의 Enter 키에는 `보내기` 가 보입니다(`enterkeyhint="send"`).
- **보내는 중.** `status` 가 `idle` 이 아니면 보내지 않고, 보내기 버튼이 멈추기 버튼으로 바뀝니다. 그동안에도 다음 메시지를 적어 둘 수 있습니다.
- **`<form>` 입니다.** 보내기는 `submit` 이라 `onSubmit` 이 먼저 불리고, `onSend` 가 없으면 브라우저나 React 의 form `action` 이 그대로 제출합니다.
- **너비.** 부모 너비를 다 채웁니다(`w-full min-w-0`). 너비와 위치는 감싸는 요소가 정합니다: `<div className="w-96"><PromptInput aria-label="메시지" /></div>`.

```tsx
import { PromptInput } from '@gsainfoteam/ids-react';

<PromptInput aria-label="메시지" status={status} onSend={({ text, files }) => send(text, files)} onStop={stop} />;
```

## 보내기

```tsx
<PromptInput aria-label="메시지" onSend={({ text, files, tools }) => {}} /> // 보내면 입력과 첨부를 비운다. 도구는 그대로
<PromptInput aria-label="메시지" onSubmit={(event) => {}} />  // native submit 이벤트. preventDefault() 하면 보내지 않는다
<PromptInput aria-label="메시지" action={ask}>                // onSend 가 없으면 form 이 제출한다
  <PromptInput.Input name="prompt" />
</PromptInput>
```

- 글이 비었거나 공백뿐이고 첨부도 없으면 보내지 않고, 보내기 버튼이 `aria-disabled` 가 됩니다. 글 없이 파일만 보내도 됩니다.
- `text` 는 적은 그대로(앞뒤 공백, 줄바꿈 포함) 옵니다.
- 보내기 버튼은 비활성이어도 포커스를 잃지 않아, 눌러서 보낸 뒤에도 포커스가 그 자리에 남습니다.
- 보내기 버튼에 키보드로 포커스하면 `보내기 ↩` 툴팁이 뜹니다.

## 상태

```tsx
<PromptInput aria-label="메시지" status="idle" />                      // 기본. 보낼 수 있다
<PromptInput aria-label="메시지" status="submitting" onStop={stop} />  // 보냈고 답을 기다린다
<PromptInput aria-label="메시지" status="streaming" onStop={stop} />   // 답이 오는 중
```

| `status`                    | `onStop` 있음                        | `onStop` 없음                                  |
| --------------------------- | ------------------------------------ | ---------------------------------------------- |
| `idle`                      | 보내기 (`type="submit"`)             | 보내기                                         |
| `submitting`, `streaming`   | 멈추기 (`type="button"`, `onStop`)   | 스피너, `aria-busy`, `aria-disabled` (보내는 중) |

- 보내는 중에 입력창에서 Escape 를 누르면 `onStop` 이 불립니다. `onStop` 이 없거나 `idle` 이면 Escape 는 감싼 Dialog 같은 바깥으로 갑니다.
- `status` 는 앱이 정합니다. `onSend` 에서 `streaming` 으로 바꾸고, 답이 끝나거나 `onStop` 에서 `idle` 로 되돌립니다.
- 보내기와 멈추기는 같은 `<button>` 이라 바뀌어도 포커스가 그대로입니다.

## 값

```tsx
<PromptInput aria-label="메시지" defaultValue="안녕" />                     // 비제어
<PromptInput aria-label="메시지" value={draft} onValueChange={setDraft} />  // 제어. 보내면 onValueChange('') 로 비운다
```

- 글의 값은 form 이 보내는 값이라 루트에 둡니다. 첨부와 도구의 값은 `usePromptInput` 에 둡니다(아래).
- `<button type="reset">` 이나 `form.reset()` 은 글, 첨부, 도구를 각자의 `defaultValue` 로 되돌리고 콜백을 부르지 않습니다.

## usePromptInput

```tsx
import { PromptInput, usePromptInput } from '@gsainfoteam/ids-react';

const promptInput = usePromptInput({
  attachments: {
    value: files, // 또는 defaultValue
    onValueChange: setFiles, // 보내면 onValueChange([])
    accept: 'image/*,.pdf',
    maxSize: 10 * 1024 * 1024,
    maxCount: 5,
    onReject: (rejections) => {},
  },
  tools: { defaultValue: ['search'] }, // 또는 value / onValueChange
});

<PromptInput aria-label="메시지" promptInput={promptInput} onSend={send} />;
```

- 첨부와 도구는 기능마다 객체 하나입니다. 값은 객체 안의 `value` / `defaultValue` / `onValueChange` 입니다.
- 객체를 생략한 기능은 비제어로, 제한 없이 동작합니다. `promptInput` 을 생략해도 같습니다.
- 보내기(`onSend`, `onStop`, `status`)는 루트에 둡니다. 모든 입력창이 쓰는 이 컨트롤의 동작이고, `onSend` 는 form 이 보내는 메시지를 받습니다.

## 첨부

```tsx
const promptInput = usePromptInput({
  attachments: { accept: 'image/*,.pdf', maxSize: 10 * 1024 * 1024, maxCount: 5 },
});

<PromptInput aria-label="메시지" promptInput={promptInput}>
  <PromptInput.Input />
  <PromptInput.Attach />
</PromptInput>;
```

- `PromptInput.Attach` 는 파일을 고르는 outline `IconButton` 입니다. 넣지 않아도 입력창에 파일을 끌어다 놓거나 붙여넣으면 첨부됩니다.
- 파일을 끌어 올리는 동안 테두리가 primary 색이 됩니다. 글을 붙여넣는 것은 그대로 입력됩니다.
- 첨부한 파일은 위 바에 `FileField.List` 로 보입니다. 파일마다 미리보기, 이름, 크기, 삭제 버튼이 있습니다.
- `attachments` 의 `accept`, `maxSize`, `maxCount` 에 걸린 파일은 빼고 받고, 입력창 아래 `role="alert"` 로 이유를 알립니다. 규칙은 FileField 와 같습니다.
- 첨부 파일은 `onSend` 의 `files` 로 옵니다. native 제출의 FormData 에는 들어가지 않습니다.

## 도구

```tsx
<PromptInput aria-label="메시지" onSend={({ text, tools }) => ask(text, { search: tools.includes('search') })}>
  <PromptInput.Input />
  <PromptInput.ActionMenu>                          {/* + 버튼과 메뉴. 생략하면 AddAttachments 하나 */}
    <PromptInput.AddAttachments />                  {/* 파일 고르기를 연다 */}
    <Menu.Item onSelect={capture}><CameraIcon />사진 찍기</Menu.Item>
  </PromptInput.ActionMenu>
  <PromptInput.Tool value="search" icon={<GlobeAltIcon />}>웹 검색</PromptInput.Tool>
</PromptInput>

usePromptInput({ tools: { defaultValue: ['search'] } });               // 처음부터 켠 도구
usePromptInput({ tools: { value: tools, onValueChange: setTools } });  // 제어
```

- `PromptInput.Tool` 은 outline `Toggle` 입니다. 켜면 테두리 대신 브랜드 옅은 채움(`secondary`)이 깔리고 `aria-pressed="true"` 가 됩니다. `icon` 이 없으면 켰을 때 체크 아이콘을 붙입니다.
- 켠 도구의 `value` 는 `onSend` 의 `tools` 로 옵니다. 보낸 뒤에도 켜진 채로 남고, form reset 은 `tools.defaultValue` 로 되돌립니다.
- `PromptInput.ActionMenu` 는 outline `IconButton` 과 `Menu` 입니다. 메뉴는 위로 열리고(`side="top"`), 자리가 없으면 아래로 뒤집힙니다.
- `PromptInput.AddAttachments` 는 `Menu.Item` 이라 `onSelect` 에서 `preventDefault()` 하면 파일 고르기를 열지 않습니다.

## 구성

```tsx
<PromptInput aria-label="메시지" onSend={send}>
  <PromptInput.Attachments />          {/* Input 앞 = 위 바. 생략하면 위 바 맨 앞 */}
  <PromptInput.Input placeholder="무엇이든 물어보세요" maxRows={8} />
  <PromptInput.Attach />               {/* Input 뒤 = 아래 바. 앞에서부터 */}
  <div>
    <Select size="tiny" variant="soft" aria-label="모델">…</Select>
  </div>
  <PromptInput.Submit />               {/* 생략하면 아래 바 끝 */}
</PromptInput>
```

| 파트                      | 역할                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `PromptInput.Input`       | 입력 자리. textarea 의 props 와 `minRows`, `maxRows` 를 받는다. 생략하면 맨 앞에 하나 놓인다 |
| `PromptInput.Attachments` | 첨부 목록 (`FileField.List`). 파일이 없으면 그리지 않는다. children 도 FileField.List 와 같다 |
| `PromptInput.Attach`      | 파일 고르기 (`FileField.Trigger` + outline `IconButton`). `icon` 으로 아이콘을 바꾼다     |
| `PromptInput.Submit`      | 보내기와 멈추기 (solid `IconButton`)                                                     |
| `PromptInput.Tool`        | 켜고 끄는 도구 (outline `Toggle`). `value` 가 `tools` 에 들어간다                            |
| `PromptInput.ActionMenu`  | + 버튼과 메뉴 (`IconButton` + `Menu`). 자식은 `Menu.Item` 들                              |
| `PromptInput.AddAttachments` | 파일 고르기를 여는 메뉴 항목 (`Menu.Item`)                                            |

- 입력과 바 사이에는 구분선이 없습니다.
- 넉넉한 입력창입니다. 여백은 `concentric-p-1.5`(tiny `concentric-p-1`)라 모서리가 컨테이너 최대인 16px 이고, 글자는 `body-b2`, 아래 바의 버튼은 36px, 버튼 사이는 8px 입니다(tiny 는 TextArea 바와 같은 버튼에 6px).
- 모든 파트는 `PromptInput` 의 바로 아래 자식으로 둡니다. 다른 요소로 감싸면 찾지 못해 기본 파트가 하나 더 생깁니다.
- 모델 고르기처럼 켜고 끄는 것이 아닌 도구는 앱이 `Select` 같은 IDS 컴포넌트로 넣습니다. 아래 바의 버튼은 TextArea 바 안쪽 크기로 줄어듭니다.
- `Select` 는 부모 너비를 채우므로 `<div>` 로 감싸면 내용 너비가 됩니다.
- 입력의 이름은 필수입니다. 루트의 `aria-label` 이나 `aria-labelledby` 가 입력 칸(textarea)의 이름이 되고, `PromptInput.Input` 에 준 이름이 그보다 앞섭니다. 이름이 없으면 개발 모드에서 경고합니다.
- placeholder 는 기본값이 없습니다. 필요하면 `PromptInput.Input` 에 `placeholder` 를 줍니다.
- 다른 `<form>` 안에 두지 않습니다. form 은 중첩할 수 없습니다.

## Props

| Property                                   | Type                                     | Default     |
| ------------------------------------------ | ---------------------------------------- | ----------- |
| `value` / `defaultValue` / `onValueChange` | `string`                                 | `''`        |
| `onSend`                                   | `({ text, files, tools }) => void`       | -           |
| `onStop`                                   | `() => void`                             | -           |
| `status`                                   | `'idle' \| 'submitting' \| 'streaming'`  | `'idle'`    |
| `promptInput`                              | `usePromptInput()` 의 결과               | 비제어, 제한 없음 |
| `disabled`                                 | `boolean`                                | `false`     |
| `variant`                                  | `'outline' \| 'soft'`                    | `'outline'` |
| `size`                                     | `'standard' \| 'tiny'`                   | Field 크기, 없으면 `'standard'` |

- 나머지 props 는 `<form>` 에 갑니다.

| `usePromptInput` | Type | Default |
| --- | --- | --- |
| `attachments` | `{ value, defaultValue, onValueChange }` (`File[]`) 과 `accept`, `maxSize`, `maxCount`, `onReject` (FileField 와 같음) | 비제어 `[]`, 제한 없음 |
| `tools` | `{ value, defaultValue, onValueChange }` (`string[]`) | 비제어 `[]` |
