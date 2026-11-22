# RichText

저장해 둔 글(마크다운이나 Editor 의 JSON)을 IDS 컴포넌트로 그리는 렌더러입니다. 블로그 글, 공지 본문, 게시판 글처럼 읽기만 하는 화면에 씁니다.

- **서버에서 그립니다.** `RichText` 는 hook 이 없는 함수라 Server Component 에서 그대로 부를 수 있습니다. 이때 마크다운 해석과 Tiptap 은 서버에서만 돌고, 브라우저로는 IDS 컴포넌트만 갑니다.
- **Editor 와 같은 문서입니다.** Editor 와 같은 Tiptap 스키마와 글자 스타일을 씁니다. Editor 로 쓴 글을 RichText 로 그리면 제목, 목록, 간격이 같습니다.
- **블록은 IDS 컴포넌트입니다.** 코드 블록은 `CodeBlock`, 콜아웃은 `Alert`, 접는 블록은 `Accordion`, 표는 `Table`, 그림은 `Image`, 할 일은 `Checkbox`, 멘션은 `Avatar` 와 이름을 담은 알약 모양, 구분선은 `Divider`, 링크는 `Link` 로 그립니다.

```tsx
import { RichText } from '@gsainfoteam/ids-react/rich-text';

export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  return <RichText value={post.body} />;
}

<RichText format="json" value={editorJson} />
<RichText value={post.body} mentionHref={(id) => `/users/${id}`} />
```

## 값

| `format` | `value` | 비고 |
|---|---|---|
| `markdown` (기본) | 마크다운 문자열 | Editor 의 `format="markdown"` 값 |
| `json` | Tiptap JSON 객체나 그 문자열 | Editor 의 `format="json"` 값 |

- HTML 은 받지 않습니다. 서버에서 HTML 을 해석하려면 DOM 구현(happy-dom)이 필요하기 때문입니다. Editor 의 값을 그릴 화면이 있다면 Editor 를 `format="json"` 이나 `"markdown"` 으로 둡니다.
- 마크다운 안의 HTML 태그는 태그로 해석하지 않고 글자로 보여 줍니다.

## 마크다운 문법

GitHub 마크다운에 아래를 더합니다. 모두 Editor 가 마크다운으로 저장하는 문법과 같습니다.

```md
> [!NOTE]
> 콜아웃. NOTE, TIP, WARNING, CAUTION

:::details {open}

:::detailsSummary

펼쳐 보기

:::

:::detailsContent

접히는 내용

:::

:::

[@ id="registrar" label="학사팀"]

==형광펜==
```

| 콜아웃 | `kind`, Alert `colorScheme` | 제목 |
|---|---|---|
| `NOTE` | `info` | 참고 |
| `TIP` | `success` | 팁 |
| `WARNING` | `warning` | 경고 |
| `CAUTION` | `danger` | 위험 |

- 콜아웃 종류는 IDS 의 상태 네 가지와 같습니다. GitHub 의 `IMPORTANT` 는 `info` 로 읽고 `NOTE` 로 저장합니다.

- 콜아웃은 `role="note"` 이고, 종류 이름("참고", "경고" 등)을 제목으로 보여 줍니다. 제목은 `IdsProvider` 의 `translate` 를 따릅니다.
- 접는 블록은 `Accordion` 한 항목입니다. 요약은 제목 태그로 감싸지 않으므로 글의 제목 구조를 흐트러뜨리지 않습니다.
- 표의 첫 행이 머리글 칸이면 `<thead>` 로 그립니다.
- 그림에 `width` 가 있으면(Editor 의 `json` 에서 끌어 바꾼 너비) 그 너비로 그립니다. 본문보다 넓으면 본문 너비로 줄어듭니다.
- 칸을 합친 표(`json`)는 `colspan` 과 `rowspan` 을 그대로 그립니다.

## 안전

- 링크는 `http:`, `https:`, `mailto:`, `tel:` 과 상대 주소만 `Link` 가 됩니다. `javascript:` 같은 주소의 링크는 글자만 남습니다.
- 그림은 `http:`, `https:` 와 상대 주소만 그립니다. `data:` 와 `javascript:` 주소의 그림은 빠집니다. Editor 와 같은 규칙입니다.
- 링크는 같은 탭에서 엽니다.

## Props

| Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `string \| JSONContent` | | 그릴 글 |
| `format` | `'markdown' \| 'json'` | `'markdown'` | `value` 의 형식 |
| `size` | `'standard' \| 'tiny'` | `'standard'` | 본문 글자 크기 |
| `mentionHref` | `(id: string) => string` | | 주면 멘션이 그 주소로 가는 `Link` 가 됩니다 |

나머지 `div` 속성은 루트 `<div data-rich-text>` 로 갑니다. `RichText.Style` 은 루트 slot 과 같은 클래스를 돌려줍니다.
