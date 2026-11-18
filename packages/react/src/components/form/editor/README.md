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
- 자식이 없으면 기본 툴바(문단 모양, 굵게, 기울임, 취소선, 코드, 링크, 목록 둘, 인용, 코드 블록)와 본문이 들어갑니다. `onImageUpload` 가 있으면 링크 뒤에 그림이 더 붙습니다.
- `Editor.Content` 가 없으면 자식은 모두 위 툴바가 되고, 본문은 그 아래에 기본으로 들어갑니다.

| 부품                                                   | 하는 일                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `Bold` `Italic` `Underline` `Strike` `Code`            | 글자 서식. 누른 상태가 커서 자리의 서식을 따릅니다               |
| `Highlight`                                            | 형광펜. 색은 `bg-warning-soft` 와 `text-on-warning-soft` 입니다  |
| `BulletList` `OrderedList` `Blockquote` `CodeBlock`    | 블록 서식                                                       |
| `TaskList`                                             | 할 일 목록. 체크박스는 IDS Checkbox 와 같은 모양입니다           |
| `HorizontalRule`                                       | 구분선을 넣는 버튼                                              |
| `TextAlign`                                            | 문단과 제목의 정렬 토글 묶음(`alignments`, 기본 왼쪽, 가운데, 오른쪽) |
| `Image`                                                | 그림 파일을 고르는 버튼. 그림을 고른 채 누르면 대체 텍스트 Popover |
| `BlockType`                                            | 문단과 제목(`levels`, 기본 2와 3)을 고르는 Select                |
| `Link`                                                 | 주소를 넣는 Popover. 링크 위에서는 지우기 버튼이 함께 나옵니다   |
| `Separator`                                            | 바 안의 세로 구분선                                             |
| `BubbleMenu`                                           | 글을 고르면 그 위에 뜨는 툴바. 자식이 없으면 굵게, 기울임, 취소선, 코드, 링크 |
| `Count`                                                | `maxLength` 에 대한 글자 수. TextArea.Count 와 같습니다           |

- 도구는 `icon` 과 `aria-label` 로 아이콘과 이름을 바꿀 수 있습니다.
- `Highlight`, `TaskList`, `TextAlign` 은 Editor 의 자식(`BubbleMenu` 의 자식 포함)에 있을 때만 그 Tiptap 확장을 싣습니다. 쓰지 않는 앱은 스키마와 플러그인을 돌리지 않습니다.
- 그래서 그 부품이 없으면 값에 있던 형광펜, 할 일, 정렬도 읽지 않고 버립니다. 저장한 글에 쓰인 서식의 부품은 계속 둡니다.
- 부품을 앱의 컴포넌트 안에 감싸 넣으면 Editor 가 찾지 못합니다. 개발 중에는 콘솔 경고가 뜨고 도구가 꺼집니다.
- 위아래 바는 줄을 바꾸지 않습니다. 필드보다 넓으면 [ScrollArea](../../layout/scroll-area/README.md) 로 가로 스크롤합니다. 스크롤바는 그리지 않고(`variant="none"`), 더 남은 쪽 가장자리를 흐립니다. 키보드로 옮긴 도구는 보이는 자리까지 스크롤됩니다.
- 마우스로 도구를 눌러도 포커스는 본문에 남습니다. 키보드로는 Tab 이 툴바의 한 도구에 닿고, 화살표로 도구 사이를 옮깁니다.

## 키

| 키                    | 동작                       |
| --------------------- | -------------------------- |
| `Mod+B` `Mod+I` `Mod+U` | 굵게, 기울임, 밑줄          |
| `Mod+Shift+S`         | 취소선                     |
| `Mod+E`               | 코드                       |
| `Mod+Shift+H`         | 형광펜(`Highlight` 가 있을 때) |
| `Mod+Shift+9`         | 할 일 목록(`TaskList` 가 있을 때). `Tab` 으로 들여 씀 |
| `Mod+Shift+L` `E` `R` `J` | 왼쪽, 가운데, 오른쪽, 양쪽 정렬(`TextAlign` 이 있을 때) |
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

## 그림

```tsx
<Editor
  onImageUpload={async (file) => {
    const { url } = await uploadToStorage(file);
    return url;
  }}
/>
```

- `onImageUpload` 는 파일을 받아 올린 그림의 주소를 돌려줍니다. Editor 는 파일을 서버로 보내지 않습니다.
- `Editor.Image` 로 고른 파일, 붙여 넣은 파일, 끌어 놓은 파일이 모두 이 함수로 갑니다. PNG, JPEG, GIF, WebP, AVIF 만 받습니다.
- 올리는 동안 본문의 그 자리에 Skeleton 모양의 자리표시가 서고, `Editor.Image` 는 Spinner 와 `aria-busy` 를 보입니다. 화면 읽기 프로그램에는 "그림을 올리는 중입니다" 를 알립니다.
- 올리기에 실패하면(Promise 가 거부되거나 주소가 아니면) 자리표시를 지우고 toast 로 알립니다. 오류는 앱이 Field 오류로 다시 그릴 값의 문제가 아니라 한 번의 작업 결과라서 toast 입니다. IdsProvider 가 기본 Toaster 를 둡니다.
- 그림을 누르거나 화살표로 고른 채 `Editor.Image` 를 누르면 대체 텍스트를 넣는 Popover 가 열립니다. 새 그림의 대체 텍스트는 `""` 입니다. 파일 이름은 그림을 설명하지 않아서 넣지 않습니다.
- 그림은 `html`, `markdown`(`![대체 텍스트](주소)`), `json` 모두에서 주소와 대체 텍스트가 그대로 오갑니다.
- `onImageUpload` 가 없으면 그림을 넣는 길이 모두 닫힙니다. `Editor.Image` 는 그리지 않고, 파일은 붙지 않고, 붙여 넣은 HTML 의 `<img>` 는 버립니다. 값에 이미 있던 그림은 그대로 보입니다.
- 그림이 되는 주소는 `http:`, `https:`, 스킴 없는 상대 주소, 그리고 이 Editor 의 `onImageUpload` 가 돌려준 주소뿐입니다. `javascript:` 나 `data:` 는 값, 마크다운, JSON, 붙여넣기 어디서 와도 그림이 되지 않습니다.
- 그래서 `data:` 나 `blob:` 을 돌려주는 업로드는 그 화면에서만 그림이 남습니다. 저장했다가 다시 열면 사라지므로 서버 주소를 돌려줍니다.
- 그림 파일과 HTML 을 함께 붙여 넣으면(브라우저의 "이미지 복사") 파일만 올립니다. 같은 그림이 두 번 들어가지 않게 하려는 것입니다.
- `onImageUpload` 는 함수라 Server Component 에서 넘길 수 없습니다. Client Component 에서 Editor 를 감싸 넘깁니다.

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

- Tiptap Pro 확장(협업, 댓글, AI)은 쓰지 않습니다. MIT 인 core, StarterKit, extensions, markdown, extension-image, extension-file-handler, extension-highlight, extension-list, extension-text-align 만 씁니다.
- 실행 취소와 다시 실행 버튼 부품은 없습니다. 단축키로 됩니다.
- 표, 수식, 멘션, 블록을 끌어 옮기는 손잡이(drag handle)는 없습니다.
- 그림 크기 조절, 그림 설명(caption), 그림 정렬은 없습니다. 그림은 본문 너비를 넘지 않게 줄어듭니다.
- 형광펜 색 고르기는 없습니다. 한 가지 색만 씁니다.
- 마크다운에는 정렬 문법이 없어 `TextAlign` 의 정렬은 `markdown` 값에 남지 않습니다.
