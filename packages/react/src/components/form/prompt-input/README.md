# PromptInput

챗봇과 에이전트에 메시지를 보내는 입력창입니다. 글, 첨부 파일, 도구, 보내기와 멈추기 버튼을 구분선 없는 한 테두리 안에 담습니다.

- **TextArea 와 FileField 로 짓습니다.** 입력은 [TextArea](../text-area/README.md) 라 내용에 맞춰 늘고 `maxRows`(기본 6줄)를 넘으면 IDS 스크롤 막대가 생깁니다. 첨부는 [FileField](../file-field/README.md) 의 고르기, 끌어다 놓기, 붙여넣기, 제한, 목록을 그대로 씁니다.
- **Enter 로 보냅니다.** Enter 는 보내고 Shift+Enter 는 줄을 바꿉니다. 한글처럼 조합 중인 글자를 확정하는 Enter 는 보내지 않습니다. 모바일 키보드의 Enter 키에는 `보내기` 가 보입니다(`enterkeyhint="send"`).
- **보내는 중.** `status` 가 `idle` 이 아니면 보내지 않고, 보내기 버튼이 멈추기 버튼으로 바뀝니다. 그동안에도 다음 메시지를 적어 둘 수 있습니다.
- **`<form>` 입니다.** 보내기는 `submit` 이라 `onSubmit` 이 먼저 불리고, `onSend` 가 없으면 브라우저나 React 의 form `action` 이 그대로 제출합니다.

```tsx
import { PromptInput } from '@gsainfoteam/ids-react';

<PromptInput status={status} onSend={({ text, files }) => send(text, files)} onStop={stop} />;
```

## 보내기

```tsx
<PromptInput onSend={({ text, files, tools }) => {}} /> // 보내면 입력과 첨부를 비운다. 도구는 그대로
<PromptInput onSubmit={(event) => {}} />                // native submit 이벤트. preventDefault() 하면 보내지 않는다
<PromptInput action={ask}>                              // onSend 가 없으면 form 이 제출한다
  <PromptInput.Input name="prompt" />
</PromptInput>
```

- 글이 비었거나 공백뿐이고 첨부도 없으면 보내지 않고, 보내기 버튼이 `aria-disabled` 가 됩니다. 글 없이 파일만 보내도 됩니다.
- `text` 는 적은 그대로(앞뒤 공백, 줄바꿈 포함) 옵니다.
- 보내기 버튼은 비활성이어도 포커스를 잃지 않아, 눌러서 보낸 뒤에도 포커스가 그 자리에 남습니다.
- 보내기 버튼에 키보드로 포커스하면 `보내기 ↩` 툴팁이 뜹니다.

## 상태

```tsx
<PromptInput status="idle" />                         // 기본. 보낼 수 있다
<PromptInput status="submitting" onStop={stop} />     // 보냈고 답을 기다린다
<PromptInput status="streaming" onStop={stop} />      // 답이 오는 중
```

| `status`                    | `onStop` 있음                        | `onStop` 없음                                  |
| --------------------------- | ------------------------------------ | ---------------------------------------------- |
| `idle`                      | 보내기 (`type="submit"`)             | 보내기                                         |
| `submitting`, `streaming`   | 멈추기 (`type="button"`, `onStop`)   | 스피너, `aria-busy`, `aria-disabled` (보내는 중) |

- 보내는 중에 입력창에서 Escape 를 누르면 `onStop` 이 불립니다. `onStop` 이 없거나 `idle` 이면 Escape 는 감싼 Dialog 같은 바깥으로 갑니다.
- `status` 는 앱이 정합니다. `onSend` 에서 `streaming` 으로 바꾸고, 답이 끝나거나 `onStop` 에서 `idle` 로 되돌립니다.
- 보내기와 멈추기는 같은 `<button>` 이라 바뀌어도 포커스가 그대로입니다.
- 루트 `<form>` 과 보내기 버튼에 `data-status` 가 붙습니다.

## 값

```tsx
<PromptInput defaultValue="안녕" />                           // 비제어
<PromptInput value={draft} onValueChange={setDraft} />        // 제어. 보내면 onValueChange('') 로 비운다

<PromptInput defaultFiles={[draft]} />                        // 첨부도 비제어
<PromptInput files={files} onFilesChange={setFiles} />        // 제어. 보내면 onFilesChange([])
```

- `<button type="reset">` 이나 `form.reset()` 은 `defaultValue` 와 `defaultFiles` 로 되돌리고 콜백을 부르지 않습니다.

## 첨부

```tsx
<PromptInput accept="image/*,.pdf" maxSize={10 * 1024 * 1024} maxCount={5} onReject={(rejections) => {}}>
  <PromptInput.Input />
  <PromptInput.Attach />
</PromptInput>
```

- `PromptInput.Attach` 는 파일을 고르는 outline `IconButton` 입니다. 넣지 않아도 입력창에 파일을 끌어다 놓거나 붙여넣으면 첨부됩니다.
- 파일을 끌어 올리는 동안 테두리가 primary 색이 되고, 루트에 `data-dragging` 이 붙습니다. 글을 붙여넣는 것은 그대로 입력됩니다.
- 첨부한 파일은 위 바에 `FileField.List` 로 보입니다. 파일마다 미리보기, 이름, 크기, 삭제 버튼이 있습니다.
- `accept`, `maxSize`, `maxCount` 에 걸린 파일은 빼고 받고, 입력창 아래 `role="alert"` 로 이유를 알립니다. 규칙은 FileField 와 같습니다.
- 첨부 파일은 `onSend` 의 `files` 로 옵니다. native 제출의 FormData 에는 들어가지 않습니다.

## 도구

```tsx
<PromptInput onSend={({ text, tools }) => ask(text, { sources: tools.includes('sources') })}>
  <PromptInput.Input />
  <PromptInput.ActionMenu>                          {/* + 버튼과 메뉴. 생략하면 AddAttachments 하나 */}
    <PromptInput.AddAttachments />                  {/* 파일 고르기를 연다 */}
    <Menu.Item onSelect={capture}>사진 찍기</Menu.Item>
  </PromptInput.ActionMenu>
  <PromptInput.Tool value="sources" icon={<DocumentTextIcon />}>출처 공지 함께 보기</PromptInput.Tool>
</PromptInput>

<PromptInput defaultTools={['sources']} />                   // 처음부터 켠 도구
<PromptInput tools={tools} onToolsChange={setTools} />       // 제어
```

- `PromptInput.Tool` 은 soft `Toggle` 입니다. 켜면 브랜드 옅은 채움에 체크 아이콘이 붙고 `aria-pressed="true"` 가 됩니다.
- 켠 도구의 `value` 는 `onSend` 의 `tools` 로 옵니다. 보낸 뒤에도 켜진 채로 남고, form reset 은 `defaultTools` 로 되돌립니다.
- `PromptInput.ActionMenu` 는 outline `IconButton` 과 `Menu` 입니다. 메뉴는 위로 열리고(`side="top"`), 자리가 없으면 아래로 뒤집힙니다.
- `PromptInput.AddAttachments` 는 `Menu.Item` 이라 `onSelect` 에서 `preventDefault()` 하면 파일 고르기를 열지 않습니다.

## 구성

```tsx
<PromptInput accept="image/*" onSend={send}>
  <PromptInput.Attachments />          {/* Input 앞 = 위 바. 생략하면 위 바 맨 앞 */}
  <PromptInput.Input placeholder="무엇이든 물어보세요" maxRows={8} />
  <PromptInput.Attach />               {/* Input 뒤 = 아래 바. 앞에서부터 */}
  <Select size="tiny" variant="soft" aria-label="모델" className="w-auto">…</Select>
  <PromptInput.Submit />               {/* 생략하면 아래 바 끝 */}
</PromptInput>
```

| 파트                      | 역할                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `PromptInput.Input`       | 입력 자리. textarea 의 props 와 `minRows`, `maxRows` 를 받는다. 생략하면 맨 앞에 하나 놓인다 |
| `PromptInput.Attachments` | 첨부 목록 (`FileField.List`). 파일이 없으면 그리지 않는다. children 도 FileField.List 와 같다 |
| `PromptInput.Attach`      | 파일 고르기 (`FileField.Trigger` + outline `IconButton`). `icon` 으로 아이콘을 바꾼다     |
| `PromptInput.Submit`      | 보내기와 멈추기 (solid `IconButton`)                                                     |
| `PromptInput.Tool`        | 켜고 끄는 도구 (soft `Toggle`). `value` 가 `tools` 에 들어간다                            |
| `PromptInput.ActionMenu`  | + 버튼과 메뉴 (`IconButton` + `Menu`). 자식은 `Menu.Item` 들                              |
| `PromptInput.AddAttachments` | 파일 고르기를 여는 메뉴 항목 (`Menu.Item`)                                            |

- 입력과 바 사이에는 구분선이 없습니다 (`TextArea divided={false}`).
- 모든 파트는 `PromptInput` 의 바로 아래 자식으로 둡니다. 다른 요소로 감싸면 찾지 못해 기본 파트가 하나 더 생깁니다.
- 모델 고르기처럼 켜고 끄는 것이 아닌 도구는 앱이 `Select` 같은 IDS 컴포넌트로 넣습니다. 아래 바의 버튼은 TextArea 바 안쪽 크기로 줄어듭니다.
- 입력의 이름은 기본 `aria-label="메시지"` 이고, placeholder 는 기본 `메시지를 입력하세요` 입니다. `aria-label` 이나 `aria-labelledby` 를 주면 그 값을 씁니다.
- 다른 `<form>` 안에 두지 않습니다. form 은 중첩할 수 없습니다.

## Props

| Property                                   | Type                                     | Default     |
| ------------------------------------------ | ---------------------------------------- | ----------- |
| `value` / `defaultValue` / `onValueChange` | `string`                                 | `''`        |
| `files` / `defaultFiles` / `onFilesChange` | `File[]`                                 | `[]`        |
| `tools` / `defaultTools` / `onToolsChange` | `string[]`                               | `[]`        |
| `onSend`                                   | `({ text, files, tools }) => void`       | -           |
| `onStop`                                   | `() => void`                             | -           |
| `status`                                   | `'idle' \| 'submitting' \| 'streaming'`  | `'idle'`    |
| `accept` / `maxSize` / `maxCount` / `onReject` | FileField 와 같음                    | -           |
| `disabled`                                 | `boolean`                                | `false`     |
| `variant`                                  | `'outline' \| 'soft'`                    | `'outline'` |
| `size`                                     | `'standard' \| 'tiny'`                   | Field 크기, 없으면 `'standard'` |

- 나머지 props 는 `<form>` 에 갑니다.
