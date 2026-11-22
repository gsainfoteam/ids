# Editor

굵게, 목록, 링크 같은 서식을 넣는 글 편집기입니다. [Tiptap](https://tiptap.dev) 3 (ProseMirror) 위에서 돌고, 테두리와 툴바, 글자 수는 IDS 컴포넌트로 그립니다.

- **따로 가져옴.** `@gsainfoteam/ids-react/editor` 에서 가져옵니다. Editor 를 쓰지 않는 앱의 번들에는 Tiptap 이 들어가지 않습니다.
- **엔진은 나중에 불러옴.** `import { Editor }` 는 테두리, 툴바, 부품만 가져옵니다(약 114 kB). Tiptap 은 Editor 가 마운트될 때 `import()` 로 따로 불러오므로(약 245 kB) 첫 화면의 JavaScript 에 들어가지 않습니다.
- **RichText 와 같은 문서.** 스키마와 글자 스타일을 [RichText](../../typography/rich-text/README.md) 와 함께 씁니다. Editor 로 쓴 글을 RichText 로 서버에서 그리면 같은 모양이 됩니다.
- **필드와 같은 테두리.** TextField, TextArea 와 같은 `field-surface` 라 `outline`, `soft`, 포커스 링, 오류 테두리가 같습니다.
- **폼에 들어감.** `name` 을 주면 숨은 input 으로 FormData 에 들어가고, `required` 면 빈 본문의 제출을 브라우저가 막습니다. Field 안에 두면 라벨, 설명, 오류가 본문에 연결됩니다.
- **세 가지 값.** `format` 이 `html`(기본), `markdown`, `json` 중 무엇이냐에 따라 값의 모양이 바뀝니다.
- **두 가지 편집 방식.** `type="toolbar"`(기본)는 툴바로 서식을 넣고, `type="block"` 은 툴바 없이 `/` 메뉴와 블록 손잡이로 블록을 넣고 옮깁니다.

## 툴바 에디터와 블록 에디터

```tsx
<Editor />                                  // 툴바 에디터. 툴바가 트레이 위에, 본문이 그 안의 카드에
<Editor type="block">                       // 블록 에디터. 툴바 없이 본문만
  <Editor.Content placeholder="/ 로 블록을 넣으세요" />
</Editor>
```

| | `toolbar`(기본) | `block` |
| --- | --- | --- |
| 툴바 | `Editor.Content` 위아래의 부품 | 없음. 도구 부품을 넣으면 개발 중 경고를 띄우고 뺍니다 |
| 불러오는 블록 | 넣은 부품의 블록만 | 표, 콜아웃, 토글, 할 일, 정렬, 형광펜까지 모두 |
| `/` 블록 메뉴 | 불러온 블록만 | 모든 블록 |
| BubbleMenu | 넣을 때만 | 늘 있음. 자식이 없으면 굵게, 기울임, 밑줄, 취소선, 코드, 색, 링크 |
| 블록 손잡이 | 없음 | 편집할 수 있으면 본문 왼쪽 여백에 나옴 |

- 위아래 바가 있으면 Editor 는 회색 트레이가 되고 본문은 그 안의 카드가 됩니다. [DataTable](../../data/data-table/README.md) 과 같은 모양입니다. 바가 없으면 본문 상자 하나입니다.
- 블록 에디터에도 `Editor.Count` 는 아래 바로 넣을 수 있습니다.

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
- 마크다운은 Tiptap 공식 `@tiptap/markdown`(MIT, `marked`) 으로 읽고 씁니다. `format="markdown"` 일 때만 불러옵니다.
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
| `Color`                                                | 글자 색과 형광펜 색을 고르는 Popover. 색은 IDS 색 계열(강조 1~3, 정보, 성공, 경고, 위험)이라 테마와 다크 모드를 따릅니다 |
| `Subscript` `Superscript`                              | 아래 첨자와 위 첨자. 마크다운에는 `<sub>2</sub>`, `<sup>2</sup>` 로 남습니다 |
| `BulletList` `OrderedList` `Blockquote`                | 블록 서식                                                       |
| `CodeBlock`                                            | 코드 블록. 본문의 코드 블록에는 언어 Select 와 복사 버튼이 붙고, 고른 언어로 색을 칠합니다. 긴 줄은 접지 않고 가로로 스크롤합니다 |
| `Callout`                                              | 콜아웃을 넣거나 종류(참고, 팁, 경고, 위험)를 바꾸는 Menu   |
| `Details`                                              | 접는 블록(토글)을 넣는 버튼                                      |
| `TaskList`                                             | 할 일 목록. 체크박스는 IDS Checkbox 와 같은 모양입니다           |
| `HorizontalRule`                                       | 구분선을 넣는 버튼                                              |
| `Table`                                                | 표 밖에서는 크기를 고르는 격자 Popover, 표 안에서는 행, 열, 칸을 고치는 Menu |
| `TextAlign`                                            | 문단과 제목의 정렬 토글 묶음(`alignments`, 기본 왼쪽, 가운데, 오른쪽) |
| `Image`                                                | 그림 주소를 넣거나 파일을 고르는 Popover. 그림을 고른 채 누르면 대체 텍스트 Popover |
| `BlockType`                                            | 문단과 제목(`levels`, 기본 2와 3)을 고르는 Select                |
| `Link`                                                 | 주소를 넣는 Popover. 링크 위에서는 지우기 버튼이 함께 나옵니다   |
| `Separator`                                            | 바 안의 세로 구분선                                             |
| `BubbleMenu`                                           | 글을 고르면 그 위에 뜨는 툴바. 자식이 없으면 굵게, 기울임, 취소선, 코드, 링크 |
| `Count`                                                | `maxLength` 에 대한 글자 수. TextArea.Count 와 같습니다           |

- 도구는 `icon` 과 `aria-label` 로 아이콘과 이름을 바꿀 수 있습니다.
- `Highlight`, `Color`, `Subscript`, `Superscript`, `TaskList`, `TextAlign`, `Table`, `Callout`, `Details` 는 Editor 의 자식(`BubbleMenu` 의 자식 포함)에 있을 때만 그 Tiptap 확장을 엔진과 함께 `import()` 로 불러옵니다. 쓰지 않는 앱은 그 코드를 받지 않고, 스키마와 플러그인도 돌리지 않습니다.
- 그래서 그 부품이 없으면 값에 있던 형광펜, 할 일, 정렬, 표, 콜아웃, 접는 블록도 읽지 않고 버립니다. 저장한 글에 쓰인 서식의 부품은 계속 둡니다.
- 그림 노드는 저장된 그림을 지키려고 늘 엔진에 있습니다. 올리기, 자리표시, 파일 붙여넣기와 끌어 놓기는 `onImageUpload` 가 있을 때만 따로 불러옵니다.
- 부품을 앱의 컴포넌트 안에 감싸 넣으면 Editor 가 찾지 못합니다. 개발 중에는 콘솔 경고가 뜨고 도구가 꺼집니다.
- 위아래 바는 줄을 바꾸지 않습니다. 필드보다 넓으면 [ScrollArea](../../layout/scroll-area/README.md) 로 가로 스크롤합니다. 스크롤바는 그리지 않고(`variant="none"`), 더 남은 쪽 가장자리를 흐립니다. 키보드로 옮긴 도구는 보이는 자리까지 스크롤됩니다.
- 마우스로 도구를 눌러도 포커스는 본문에 남습니다. 키보드로는 Tab 이 툴바의 한 도구에 닿고, 화살표로 도구 사이를 옮깁니다.
- 툴바와 버블 메뉴의 도구에 마우스를 올리거나 키보드로 옮기면 [Tooltip](../../overlay/tooltip/README.md) 이 이름을 보여 줍니다. 단축키가 있는 도구는 이름 옆에 키를 함께 보여 줍니다. 꺼진 도구에는 뜨지 않습니다.

## 키

| 키                    | 동작                       |
| --------------------- | -------------------------- |
| `Mod+B` `Mod+I` `Mod+U` | 굵게, 기울임, 밑줄          |
| `Mod+Shift+S`         | 취소선                     |
| `Mod+E`               | 코드                       |
| `Mod+Shift+H`         | 형광펜(`Highlight` 가 있을 때) |
| `Mod+,`               | 아래 첨자(`Subscript` 가 있을 때) |
| `Mod+.`               | 위 첨자(`Superscript` 가 있을 때) |
| `Mod+Shift+9`         | 할 일 목록(`TaskList` 가 있을 때). `Tab` 으로 들여 씀 |
| `Mod+Shift+L` `E` `R` `J` | 왼쪽, 가운데, 오른쪽, 양쪽 정렬(`TextAlign` 이 있을 때) |
| `Mod+Z` `Mod+Shift+Z` | 실행 취소, 다시 실행        |
| `/`                   | 블록 메뉴를 엶              |
| `@`                   | 멘션 목록을 엶(`mentions` 가 있을 때) |
| `↑` `↓` `Enter` `Tab` | 블록 메뉴와 멘션 목록에서 고르고 넣음 |
| `> [!tip]` 뒤에 공백  | 그 줄을 콜아웃으로 바꿈(`Callout` 이 있을 때) |
| `Escape`              | 블록 메뉴, 멘션 목록, 버블 메뉴, Popover, Dialog 를 닫음 |
| `←` `→` `Home` `End`  | 툴바 안에서 도구 사이를 옮김 |

- `Escape` 는 본문이 먹지 않고 위의 레이어로 넘깁니다. Dialog 안의 Editor 에서 `Escape` 를 누르면 Dialog 가 닫힙니다.
- 블록 메뉴나 멘션 목록이 열려 있으면 `Escape` 는 그 목록만 닫고 Dialog 는 그대로 둡니다.

## 색

- `Editor.Color` 는 글자 색 여덟 칸(기본과 일곱 계열)과 형광펜 색 여덟 칸(없음과 일곱 계열)을 보여 줍니다. 고른 글에 지금 칠해진 색이 눌린 칸으로 보입니다.
- 저장하는 값은 hex 가 아니라 계열 이름입니다(`primary`, `secondary`, `tertiary`, `info`, `success`, `warning`, `danger`). 앱이 테마를 바꾸거나 다크 모드로 바뀌어도 같은 글이 그 테마의 색으로 다시 그려집니다.
- 글자 색은 `text-X`, 형광펜은 `bg-X-soft` 와 `text-on-X-soft` 입니다. 두 역할 모두 바탕에서 읽히는 대비를 IDS 가 보장하므로 임의의 색을 고르는 ColorPicker 는 두지 않습니다.
- HTML 과 JSON 에는 `<span data-color="danger">`, `<mark data-color="success">` 로, 마크다운에도 같은 태그로 남습니다. 색이 없는 형광펜은 그대로 `==글==` 입니다.
- 알 수 없는 계열 이름은 읽을 때 버립니다.

## 링크

- 링크 도구를 누르면 주소 칸과 버튼이 한 줄로 뜹니다. 링크 위에서 열면 `적용` 앞에 `링크 지우기` 버튼이 붙습니다.
- 주소에 스킴이 없으면 `https://` 를 붙입니다. `/path`, `#id`, `?q` 같은 상대 주소는 그대로 둡니다.
- `javascript:` 같은 주소는 링크가 되지 않습니다.
- 글을 고르지 않고 링크를 넣으면 주소가 그대로 링크 글이 됩니다.
- 링크는 본문과 같은 색으로 쓰고 옅은 밑줄을 긋습니다. RichText 의 링크도 같은 모양(`Link colorScheme="neutral"`)입니다.
- 본문의 링크를 눌러도 열리지 않습니다. 편집 중에 페이지를 떠나지 않도록 입니다.
- 브라우저 맞춤법 검사는 기본으로 꺼져 있습니다. 한국어 글에서 영어 낱말과 고유 명사마다 빨간 줄이 그어지기 때문입니다. `spellCheck` 를 주면 켭니다.
- 주소를 쳐 넣으면 저절로 링크가 됩니다(`autolink`).

## 블록 메뉴와 손잡이

```tsx
<Editor type="block" />
```

- 블록 메뉴는 고칠 수 있는 Editor 에 늘 켜져 있습니다. 툴바 에디터에도 있습니다.
- 빈 자리나 공백 뒤에 `/` 를 치면 블록 메뉴가 열립니다. 뒤에 친 글자로 이름과 영어 키워드(`h2`, `todo`, `quote`)를 걸러 냅니다. 띄어쓰기는 무시하므로 "제목 2" 와 "제목2" 가 같습니다.
- 메뉴에는 불러온 블록만 나옵니다. 툴바 에디터에 `Table` 부품이 없으면 표가 빠집니다. 블록 에디터는 모든 블록을 불러옵니다. 코드 블록 안에서는 `/` 가 그냥 글자입니다.
- 맞는 블록이 없는 채로 공백을 치면 메뉴가 닫힙니다.
- 손잡이는 블록 에디터(`type="block"`)에만 나옵니다. 툴바 에디터에는 손잡이도, 손잡이를 위한 여백도 없습니다.
- 블록 에디터는 본문 왼쪽에 손잡이가 들어갈 여백을 둡니다. 손잡이는 그 여백에서 마우스가 올라간 블록의 첫 줄 옆에 나타나고, 나타나고 사라질 때 서서히 흐려집니다. 손잡이를 누르면 메뉴가 손잡이 바로 아래에 열립니다.
- 표의 손잡이 메뉴에는 툴바의 표 메뉴와 같은 행, 열, 머리글, 칸 동작이 더 나옵니다. 커서가 그 표 안에 있으면 그 칸을, 없으면 마지막 칸을 기준으로 합니다.
- 손잡이를 끌면 [Sidebar](../../navigation/sidebar/README.md) 와 같은 모양으로 옮깁니다. 끄는 블록의 반투명한 복사본이 포인터를 따라오고, 원래 블록은 흐려지며, 놓을 자리에 primary 선이 그어집니다. 놓은 블록은 골라진 채로 남습니다.
- 손잡이를 누르면 Menu 가 열립니다.
- 손잡이 Menu 는 아래에 블록 넣기(넣은 자리에서 블록 메뉴가 열림), 바꾸기(글이 있는 블록을 다른 글 블록으로), 복제, 삭제입니다.
- 손잡이는 마우스용입니다. 키보드로는 같은 일을 `/` 블록 메뉴와 단축키로 합니다.
- 손잡이는 맨 바깥 블록에만 붙습니다. 목록 항목이나 인용 안의 문단은 바깥 블록째로 옮깁니다.
- 골라진 블록(옮긴 블록, 누른 멘션)에는 옅은 primary 틴트가 블록의 모서리를 따라 덮입니다. 테두리를 긋지 않아 블록의 모양이 그대로 보입니다. 그림만 틴트 대신 안쪽 테두리를 그어, 그림의 색을 바꾸지 않고 너비 손잡이도 가리지 않습니다.

## 멘션

```tsx
<Editor
  mentions={async (query, signal) => {
    const response = await fetch(`/api/users?q=${query}`, { signal });
    return response.json(); // { id, label, description?, avatar? }[]
  }}
/>
```

- `mentions` 를 주면 `@` 로 사람을 찾는 목록이 열립니다. 주지 않으면 `@` 는 그냥 글자입니다.
- 함수는 친 글자를 받고, 배열이나 배열의 Promise 를 돌려줍니다. 글자가 바뀌면 앞 요청의 `signal` 을 끊습니다.
- 목록은 Avatar, 이름, 설명으로 그립니다. 찾는 동안과 결과가 없을 때 그 상태를 목록 안에 보여 줍니다.
- 멘션은 Avatar 와 이름을 담은 primary soft 알약 모양으로 들어갑니다. `avatar` 가 없으면 Avatar 가 이름의 첫 글자를 그립니다.
- 마크다운에는 `[@ id="u2" label="이인포" avatar="/faces/u2.png"]` 로 남습니다. RichText 도 같은 모양으로 그리고, `mentionHref` 를 주면 링크로 그립니다.
- `avatar` 도 그림 주소와 같은 검사를 거칩니다. `javascript:` 같은 주소는 버립니다.

## 코드 블록, 콜아웃, 접는 블록

- 본문의 블록은 RichText 가 그리는 IDS 컴포넌트와 같은 모양입니다. 그래서 Editor 로 쓴 글을 RichText 로 그려도 모양이 같습니다.
  - 코드 블록은 [CodeBlock](../../data/code-block/README.md) 의 모양, 색, 복사 버튼을 씁니다. 언어 이름 자리에 언어 Select 가 있습니다. 언어를 고르면 마크다운에 ```` ```python ```` 처럼 남습니다.
  - 콜아웃은 [Alert](../../feedback/alert/README.md), 접는 블록은 [Accordion](../../data/accordion/README.md), 표는 [Table](../../data/table/README.md) 의 모양입니다.
- 콜아웃 종류는 IDS 의 상태 네 가지(`info`, `success`, `warning`, `danger`)이고, 마크다운에는 GitHub 의 `> [!NOTE]` `[!TIP]` `[!WARNING]` `[!CAUTION]` 문법으로 저장합니다. GitHub 의 `[!IMPORTANT]` 는 `info` 로 읽습니다. 왼쪽 아이콘을 누르면 종류를 바꾸거나 콜아웃을 풉니다.
- 접는 블록은 요약과 내용을 모두 고칠 수 있고, 오른쪽 버튼으로 펼치고 접습니다. 펼친 상태도 값에 남습니다.

## 표

- 표 밖에서 `Editor.Table` 을 누르면 8행 10열의 격자가 열립니다. 마우스를 올리거나 화살표로 크기를 고르고, 누르거나 `Enter` 로 넣습니다.
- 표 안에서는 행과 열을 더하고 지우는 Menu 가 열립니다.
- `html` 과 `json` 에서는 머리글 행 끄고 켜기, 칸 합치기, 칸 나누기가 더 나옵니다. 합칠 칸이 골라져 있지 않으면 꺼져 있습니다. Shift 를 누른 채 칸을 눌러 여러 칸을 고릅니다.

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
- `Editor.Image` 를 누르면 그림 주소를 넣거나 파일을 고르는 Popover 가 열립니다. 주소에 스킴이 없으면 `https://` 를 붙입니다. `http:` 와 `https:` 주소만 받고, 다른 주소나 상대 주소에는 입력란 아래에 오류를 보입니다.
- `Editor.Image` 로 고른 파일, 붙여 넣은 파일, 끌어 놓은 파일이 모두 이 함수로 갑니다. PNG, JPEG, GIF, WebP, AVIF 만 받습니다. 형식은 FileField 의 `accept` 규칙으로 가리고, 다른 파일은 FileField 와 같은 "허용되지 않는 파일 형식입니다." 를 toast 로 알립니다.
- 올리는 동안 본문의 그 자리에 Skeleton 모양의 자리표시가 서고, `Editor.Image` 는 Spinner 와 `aria-busy` 를 보입니다. 화면 읽기 프로그램에는 "그림을 올리는 중입니다" 를 알립니다.
- 올리기에 실패하면(Promise 가 거부되거나 주소가 아니면) 자리표시를 지우고 toast 로 알립니다. 오류는 앱이 Field 오류로 다시 그릴 값의 문제가 아니라 한 번의 작업 결과라서 toast 입니다. IdsProvider 가 기본 Toaster 를 둡니다.
- 그림을 누르거나 화살표로 고른 채 `Editor.Image` 를 누르면 대체 텍스트를 넣는 Popover 가 열립니다. 새 그림의 대체 텍스트는 `""` 입니다. 파일 이름은 그림을 설명하지 않아서 넣지 않습니다.
- 그림은 `html`, `markdown`(`![대체 텍스트](주소)`), `json` 모두에서 주소와 대체 텍스트가 그대로 오갑니다.
- `html` 과 `json` 에서는 그림이 [Resizable](../../layout/resizable/README.md) 안에 들어가, 끝 가장자리의 손잡이로 너비를 바꿉니다. 손잡이는 그림에 마우스를 올리거나 그림을 골랐을 때 보입니다.
  - 손잡이는 `role="separator"` 라 포커스를 두고 방향키로도 너비를 바꿉니다.
  - 비율은 그대로 두고, 너비는 `width` 로 저장합니다. 본문 너비를 넘지 않습니다.
  - 마크다운은 너비를 담지 못해 손잡이가 없습니다.
- `onImageUpload` 가 없으면 그림을 넣는 길이 모두 닫힙니다. `Editor.Image` 는 그리지 않고, 파일은 붙지 않고, 붙여 넣은 HTML 의 `<img>` 는 버립니다. 값에 이미 있던 그림은 그대로 보입니다.
- 그림이 되는 주소는 `http:`, `https:`, 스킴 없는 상대 주소, 그리고 이 Editor 의 `onImageUpload` 가 돌려준 주소뿐입니다. `javascript:` 나 `data:` 는 값, 마크다운, JSON, 붙여넣기 어디서 와도 그림이 되지 않습니다.
- 그래서 `data:` 나 `blob:` 을 돌려주는 업로드는 그 화면에서만 그림이 남습니다. 저장했다가 다시 열면 사라지므로 서버 주소를 돌려줍니다.
- 그림 파일과 HTML 을 함께 붙여 넣으면(브라우저의 "이미지 복사") 파일만 올립니다. 같은 그림이 두 번 들어가지 않게 하려는 것입니다.
- `onImageUpload` 는 함수라 Server Component 에서 넘길 수 없습니다. Client Component 에서 Editor 를 감싸 넘깁니다.

## 붙여넣기

- Word 와 Google Docs 에서 붙여 넣은 글을 정리합니다. 다른 곳에서 온 HTML 은 Tiptap 이 스키마에 맞춰 읽습니다.
- Word 의 목록 문단(`mso-list`)은 실제 목록이 되고, 들여 쓴 수준만큼 중첩됩니다. 번호와 글머리표 글자는 지웁니다.
- Word 의 빈 문단, `<o:p>`, 조건부 주석과 Google Docs 블록 사이의 `<br>` 은 지웁니다.
- 굵게, 기울임, 밑줄, 취소선은 `<b>` 같은 태그로 와도, `font-weight` 같은 style 로 와도 그대로 남습니다.
- Editor 에서 복사한 내용은 손대지 않고 그대로 붙입니다.

## 마크다운에서 꺼지는 편집

| 편집 | `html`, `json` | `markdown` |
| --- | --- | --- |
| 그림 너비 바꾸기 | 됨 | 없음 |
| 표 머리글 행 끄기 | 됨 | 없음(GFM 표는 머리글 행이 늘 있음) |
| 표 칸 합치기, 나누기 | 됨 | 없음 |
| 정렬(`TextAlign`) | 됨 | 값에 남지 않음 |

## 상태

```tsx
<Editor disabled />   // 흐려지고 고칠 수 없음. 툴바도 꺼짐
<Editor readOnly />   // 읽을 수만 있음. 글을 고르고 복사할 수 있음
<Editor invalid />    // 오류 테두리. Field 의 오류도 같은 테두리를 그림
<Editor variant="soft" size="tiny" />
```

## 서버 렌더링

- 서버와 첫 클라이언트 렌더는 본문 자리에 같은 속성의 빈 상자를 그립니다. 마운트한 뒤 엔진을 불러오면 편집기가 그 자리에서 내용을 그립니다.
- 엔진을 불러오는 동안 툴바는 그려져 있지만 누른 상태를 읽지 않습니다. 본문은 그 사이에 입력을 받지 않습니다.
- 모듈을 가져올 때 `window` 를 읽지 않습니다. Server Component 에서 `<Editor>` 를 그대로 그릴 수 있습니다.

## 하지 않는 것

- Tiptap Pro 확장(협업, 댓글, AI)은 쓰지 않습니다. MIT 인 core, StarterKit, extensions, markdown, suggestion, extension-image, extension-file-handler, extension-highlight, extension-list, extension-text-align, extension-table, extension-mention, extension-details 만 씁니다.
- `@tiptap/extension-drag-handle` 은 쓰지 않습니다. yjs 를 정적으로 가져오기 때문입니다. 손잡이는 IDS 가 직접 그립니다.
- 실행 취소와 다시 실행 버튼 부품은 없습니다. 단축키로 됩니다.
- 수식은 없습니다.
- 표의 열 너비를 끌어 바꾸기, 행과 열 위의 손잡이는 없습니다. 표는 본문 너비에 맞춰 칸을 나눕니다.
- 그림 설명(caption)과 그림 정렬은 없습니다. 그림은 본문 너비를 넘지 않게 줄어듭니다.
- 코드 블록의 Mermaid 미리보기와 자동 정렬은 없습니다.
- 형광펜 색 고르기는 없습니다. 한 가지 색만 씁니다.
