# Editor

굵게, 목록, 링크 같은 서식을 넣는 글 편집기입니다. [Tiptap](https://tiptap.dev) 3 (ProseMirror) 위에서 돌고, 테두리와 툴바, 글자 수는 IDS 컴포넌트로 그립니다.

- **따로 가져옴.** `@gsainfoteam/ids-react/editor` 에서 가져옵니다. Editor 를 쓰지 않는 앱의 번들에는 Tiptap 이 들어가지 않습니다.
- **필드와 같은 테두리.** TextField, TextArea 와 같은 `field-surface` 라 `outline`, `soft`, 포커스 링, 오류 테두리가 같습니다.
- **폼에 들어감.** `name` 을 주면 숨은 input 으로 FormData 에 들어가고, `required` 면 빈 본문의 제출을 브라우저가 막습니다. Field 안에 두면 라벨, 설명, 오류가 본문에 연결됩니다.
- **세 가지 값.** `format` 이 `html`(기본), `markdown`, `json` 중 무엇이냐에 따라 값의 모양이 바뀝니다.

```tsx
import { Field } from '@gsainfoteam/ids-react';
import { Editor } from '@gsainfoteam/ids-react/editor';

<Field>
  <Field.Label>본문</Field.Label>
  <Editor name="body" required />
</Field>;
```

## 값

```tsx
<Editor defaultValue="<p>안녕하세요</p>" />                       // 비제어. HTML
<Editor value={html} onValueChange={setHtml} />                    // 제어
<Editor format="markdown" value={md} onValueChange={setMd} />      // 마크다운 문자열
<Editor format="json" value={doc} onValueChange={setDoc} />        // ProseMirror JSON (Editor.Json)
```

- 빈 문서는 `html`, `markdown` 에서 `''` 입니다. `<p></p>` 가 아닙니다.
- `onValueChange` 는 사용자가 글을 바꿀 때만 불립니다. `value` 를 바꾸거나 폼 reset 으로 돌아갈 때는 부르지 않습니다.
- 마크다운은 Tiptap 공식 `@tiptap/markdown`(MIT, `marked`) 으로 읽고 씁니다.
- `format` 이나 `maxLength` 를 바꾸면 편집기를 새로 만듭니다. 그 사이의 실행 취소 기록은 사라집니다.

## 바와 부품

```tsx
<Editor>
  <Editor.BlockType levels={[2, 3]} />
  <Editor.Separator />
  <Editor.Bold />
  <Editor.Italic />
  <Editor.Link />
  <Editor.Content placeholder="내용을 입력하세요" />
  <Editor.BubbleMenu />
  <Editor.Count />
</Editor>
```

- `Editor.Content` 위의 자식은 위 툴바, 아래의 자식은 아래 바가 됩니다. TextArea 의 바와 같습니다.
- 자식이 없으면 기본 툴바(문단 모양, 굵게, 기울임, 취소선, 코드, 링크, 목록 둘, 인용, 코드 블록)와 본문이 들어갑니다.
- `Editor.Content` 가 없으면 자식은 모두 위 툴바가 되고, 본문은 그 아래에 기본으로 들어갑니다.

| 부품                                                   | 하는 일                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `Bold` `Italic` `Underline` `Strike` `Code`            | 글자 서식. 누른 상태가 커서 자리의 서식을 따릅니다               |
| `BulletList` `OrderedList` `Blockquote` `CodeBlock`    | 블록 서식                                                       |
| `BlockType`                                            | 문단과 제목(`levels`, 기본 2와 3)을 고르는 Select                |
| `Link`                                                 | 주소를 넣는 Popover. 링크 위에서는 지우기 버튼이 함께 나옵니다   |
| `Separator`                                            | 바 안의 세로 구분선                                             |
| `BubbleMenu`                                           | 글을 고르면 그 위에 뜨는 툴바. 자식이 없으면 굵게, 기울임, 취소선, 코드, 링크 |
| `Count`                                                | `maxLength` 에 대한 글자 수. TextArea.Count 와 같습니다           |

- 도구는 `icon` 과 `aria-label` 로 아이콘과 이름을 바꿀 수 있습니다.
- 마우스로 도구를 눌러도 포커스는 본문에 남습니다. 키보드로는 Tab 이 툴바의 한 도구에 닿고, 화살표로 도구 사이를 옮깁니다.

## 키

| 키                    | 동작                       |
| --------------------- | -------------------------- |
| `Mod+B` `Mod+I` `Mod+U` | 굵게, 기울임, 밑줄          |
| `Mod+Shift+S`         | 취소선                     |
| `Mod+E`               | 코드                       |
| `Mod+Z` `Mod+Shift+Z` | 실행 취소, 다시 실행        |
| `Escape`              | 버블 메뉴, Popover, Dialog 를 닫음 |
| `←` `→` `Home` `End`  | 툴바 안에서 도구 사이를 옮김 |

- `Escape` 는 본문이 먹지 않고 위의 레이어로 넘깁니다. Dialog 안의 Editor 에서 `Escape` 를 누르면 Dialog 가 닫힙니다.

## 링크

- 주소에 스킴이 없으면 `https://` 를 붙입니다. `/path`, `#id`, `?q` 같은 상대 주소는 그대로 둡니다.
- `javascript:` 같은 주소는 링크가 되지 않습니다.
- 글을 고르지 않고 링크를 넣으면 주소가 그대로 링크 글이 됩니다.
- 본문의 링크를 눌러도 열리지 않습니다. 편집 중에 페이지를 떠나지 않도록 입니다.
- 주소를 쳐 넣으면 저절로 링크가 됩니다(`autolink`).

## 상태

```tsx
<Editor disabled />   // 흐려지고 고칠 수 없음. 툴바도 꺼짐
<Editor readOnly />   // 읽을 수만 있음. 글을 고르고 복사할 수 있음
<Editor invalid />    // 오류 테두리. Field 의 오류도 같은 테두리를 그림
<Editor variant="soft" size="tiny" />
```

## 서버 렌더링

- 서버와 첫 클라이언트 렌더는 본문 자리에 같은 속성의 빈 상자를 그립니다. 마운트한 뒤 편집기가 그 자리에서 내용을 그립니다.
- 모듈을 가져올 때 `window` 를 읽지 않습니다. Server Component 에서 `<Editor>` 를 그대로 그릴 수 있습니다.

## 하지 않는 것

- Tiptap Pro 확장(협업, 댓글, AI)은 쓰지 않습니다. MIT 인 core, StarterKit, extensions, markdown 만 씁니다.
- 실행 취소와 다시 실행 버튼 부품은 없습니다. 단축키로 됩니다.
- 그림, 표, 멘션은 아직 없습니다.
