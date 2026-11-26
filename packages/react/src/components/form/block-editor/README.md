# BlockEditor

툴바 없이 본문만 보여 주는 글 편집기입니다. 블록은 `/` 메뉴로 넣고, 블록 손잡이로 옮기고, 글을 고르면 뜨는 버블 메뉴로 꾸밉니다.

- **Editor 와 같은 엔진.** 값, `format`, 폼, Field, 키, 색, 링크, 표, 그림, 멘션, 붙여넣기는 [Editor](../editor/README.md) 와 같습니다. 이 문서는 다른 점만 적습니다.
- **따로 가져옴.** `@gsainfoteam/ids-react/editor` 에서 가져옵니다. Tiptap 은 마운트될 때 `import()` 로 불러옵니다.
- **모든 블록.** 표, 콜아웃, 접는 블록, 할 일, 정렬, 형광펜, 글자 색까지 모두 불러옵니다. 값에 있던 블록을 버리지 않습니다.

```tsx
import { Field } from '@gsainfoteam/ids-react';
import { BlockEditor } from '@gsainfoteam/ids-react/editor';

<Field>
  <Field.Label>본문</Field.Label>
  <BlockEditor name="body" format="markdown" required />
</Field>;
```

## Editor 와 다른 점

| | `Editor` | `BlockEditor` |
| --- | --- | --- |
| 툴바 | `Content` 위아래의 부품 | 없음. 도구를 `Content` 옆에 두면 개발 중 경고를 띄우고 뺍니다 |
| 불러오는 블록 | 넣은 부품의 블록만 | 모든 블록 |
| `/` 블록 메뉴 | 불러온 블록만 | 모든 블록 |
| 버블 메뉴 | `BubbleMenu` 를 넣을 때만 | 늘 있음 |
| 블록 손잡이 | 없음 | 편집할 수 있으면 본문 왼쪽 여백에 나옴 |

## 크기

- **fill.** 부모의 너비를 다 씁니다. 너비는 감싸는 요소가 정합니다.
- 본문 왼쪽에 손잡이가 들어갈 여백을 둡니다. 상자 바깥으로 나가지 않습니다.

## 부품

```tsx
<BlockEditor maxLength={2000}>
  <BlockEditor.Content placeholder="/ 로 블록을 넣으세요" />
  <BlockEditor.BubbleMenu>
    <BlockEditor.Bold />
    <BlockEditor.Italic />
    <BlockEditor.Separator />
    <BlockEditor.Link />
  </BlockEditor.BubbleMenu>
  <BlockEditor.Count />
</BlockEditor>
```

- 자식이 없으면 본문과 기본 버블 메뉴가 들어갑니다.
- `Content` 뒤의 `Count` 는 아래 바가 됩니다.
- `BubbleMenu` 가 없거나 자식이 없으면 굵게, 기울임, 밑줄, 취소선, 코드, 색, 링크가 나옵니다.

| 부품 | 하는 일 |
| --- | --- |
| `Content` | 본문. `placeholder` 를 받습니다 |
| `BubbleMenu` | 글을 고르면 그 위에 뜨는 도구 막대 |
| `Count` | `maxLength` 에 대한 글자 수 |
| `Bold` `Italic` `Underline` `Strike` `Code` | 글자 서식 |
| `Highlight` `Subscript` `Superscript` | 형광펜, 아래 첨자, 위 첨자 |
| `Color` | 글자 색과 형광펜 색을 고르는 Popover |
| `Link` | 주소를 넣는 Popover |
| `TextAlign` | 문단과 제목의 정렬 토글 묶음 |
| `Separator` | 버블 메뉴 안의 세로 구분선 |

- 도구의 동작과 이름, 단축키는 Editor 의 같은 부품과 같습니다.
- 블록을 넣는 도구(목록, 표, 콜아웃, 그림 등)는 부품이 아닙니다. `/` 메뉴와 손잡이 메뉴가 같은 일을 합니다.

## 블록 손잡이

- 손잡이는 마우스가 올라간 블록의 첫 줄 옆에 나타나고, 나타나고 사라질 때 서서히 흐려집니다.
- 손잡이를 누르면 Menu 가 손잡이 바로 아래에 열립니다. 아래에 블록 넣기(넣은 자리에서 블록 메뉴가 열림), 바꾸기(글이 있는 블록을 다른 글 블록으로), 복제, 삭제가 있습니다.
- 표의 손잡이 메뉴에는 툴바의 표 메뉴와 같은 행, 열, 머리글, 칸 동작이 더 나옵니다. 커서가 그 표 안에 있으면 그 칸을, 없으면 마지막 칸을 기준으로 합니다.
- 손잡이를 끌면 [Sidebar](../../navigation/sidebar/README.md) 와 같은 모양으로 옮깁니다. 끄는 블록의 반투명한 복사본이 포인터를 따라오고, 원래 블록은 흐려지며, 놓을 자리에 primary 선이 그어집니다. 놓은 블록은 골라진 채로 남습니다.
- 손잡이는 맨 바깥 블록에만 붙습니다. 목록 항목이나 인용 안의 문단은 바깥 블록째로 옮깁니다.
- 손잡이는 마우스용이라 Tab 순서에 들지 않습니다. 키보드로는 같은 일을 `/` 블록 메뉴, 잘라 내기와 붙여 넣기, 실행 취소로 합니다.
- `readOnly` 나 `disabled` 면 손잡이가 없습니다.

## 확장

```tsx
'use client';

import { BlockEditor, useEditor } from '@gsainfoteam/ids-react/editor';

function Notes() {
  const editor = useEditor({
    imageUpload: { onUpload: uploadToStorage },
    mentions: { find: findMembers },
  });

  return <BlockEditor editor={editor} format="markdown" />;
}
```

- Editor 와 같은 `useEditor()` 결과를 `editor` 로 받습니다. 옵션은 [Editor 의 확장](../editor/README.md#확장useeditor)과 같습니다.
- `imageUpload` 가 있으면 붙여 넣거나 끌어 놓은 그림을 올립니다.

## 상태

```tsx
<BlockEditor disabled />    // 흐려지고 고칠 수 없음. 손잡이와 버블 메뉴도 없음
<BlockEditor readOnly />    // 읽을 수만 있음
<BlockEditor aria-invalid /> // 오류 테두리. Field 안에서는 Field 의 오류 상태를 따름
<BlockEditor variant="soft" size="tiny" />
```

- 앱은 상태를 `onValueChange` 와 `className`, `style` 의 함수(`(state) => …`)로 읽습니다. `state` 는 `disabled`, `readOnly`, `invalid`, `focused`, `filled` 입니다.
