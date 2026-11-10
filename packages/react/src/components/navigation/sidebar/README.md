# Sidebar

앱 화면 왼쪽에 붙는 주 메뉴입니다. 묶음, 지금 페이지, 여러 단계의 트리, 끌어서 옮기기, 접기, 단축키, 좁은 화면의 Drawer 를 한 컴포넌트로 다룹니다.

- **구조가 곧 접근성.** `<aside>` 안의 `<nav aria-label>`, 묶음은 `<section aria-labelledby>` 와 `<ul>`, 항목은 `<li>` 안의 링크입니다. 지금 페이지 링크에 `aria-current="page"` 가 붙습니다.
- **자식 순서로 칸을 나눕니다.** `Sidebar.Item` 의 첫 아이콘은 아이콘 칸, 글자는 라벨, 그 뒤(Badge, Kbd)는 끝 칸입니다.
- **아이콘 띠로 접힙니다.** 접으면 라벨은 Tooltip 으로, 하위 메뉴는 Menu 로 뜹니다. `Mod+B` 로 접고 펼칩니다.
- **데이터로 그리고 끌어서 옮깁니다.** `Sidebar.Group` 에 `items` 와 한 줄을 그리는 함수를 주면 트리를 그리고, `onItemsChange` 를 주면 항목을 끌어 순서를 바꾸고 다른 항목 안으로 넣습니다. 키보드는 Space 로 집고 방향키로 고릅니다.
- **좁은 화면에서는 Drawer.** 640px 아래에서는 사이드바 대신 왼쪽 Drawer 가 열리고, 항목을 누르면 닫힙니다.
- **IDS 로 짓습니다.** 끌기는 `@dnd-kit/core`, 항목은 Item, 하위 메뉴는 Accordion 과 Menu, 라벨은 Tooltip, 접기 버튼은 IconButton, 스크롤은 ScrollArea, 선은 Divider, floating 사이드바와 inset 본문의 표면은 Card 입니다.

```tsx
import { Badge, Sidebar } from '@gsainfoteam/ids-react';

<Sidebar value={pathname} collapsible>
  <Sidebar.Header>
    <Logo />
  </Sidebar.Header>
  <Sidebar.Group label="워크스페이스">
    <Sidebar.Item value="/inbox" asChild>
      <RouterLink to="/inbox">
        <InboxIcon />
        받은편지함
        <Badge content={3} variant="soft" />
      </RouterLink>
    </Sidebar.Item>
  </Sidebar.Group>
  <Sidebar.Group label="설정">
    <Sidebar.Item>
      <Cog6ToothIcon />
      설정
      <Sidebar.Item value="/settings/account" href="/settings/account">
        계정
      </Sidebar.Item>
    </Sidebar.Item>
  </Sidebar.Group>
  <Sidebar.Footer>…</Sidebar.Footer>
</Sidebar>;
```

## 구조

| 파트               | 역할                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `Sidebar.Header`   | 위 끝 줄. `collapsible` 이면 접기 버튼, Drawer 에서는 닫기 버튼이 끝에 저절로 붙는다      |
| `Sidebar.Group`    | 라벨과 항목 목록. `label` 이 `<section>` 의 이름이 된다                                   |
| `Sidebar.Item`     | 항목. `href` 면 `<a>`, `asChild` 면 자식 링크, 둘 다 없으면 `<button>`                    |
| `Sidebar.Footer`   | 아래 끝 줄. 스크롤하지 않는다                                                             |
| `Sidebar.Trigger`  | 접기 버튼. 640px 아래에서는 Drawer 를 여는 메뉴 버튼                                      |
| `Sidebar.Provider` | 선택. 사이드바와 본문을 감싸고, 밖의 `Trigger` 와 `Inset` 이 사이드바의 상태를 함께 쓴다 |
| `Sidebar.Inset`    | 선택. 본문 `<main>`. `variant="inset"` 이면 카드 표면으로 뜬다                            |

- Header, Footer 밖의 자식은 가운데 스크롤 영역(ScrollArea)의 `<nav>` 에 들어갑니다. 위아래에 더 내용이 있으면 그 끝이 흐려집니다(`fade`). Group 밖의 Item 은 이어진 것끼리 `<ul>` 하나로 묶입니다.
- Header 를 생략해도 `collapsible` 이면 접기 버튼만 있는 줄이 생깁니다. `Sidebar.Trigger` 를 직접 두면 저절로 붙지 않습니다.
- 사이드바의 이름은 `aria-label` 로 줍니다. 기본은 "사이드바" 이고 `<aside>`, `<nav>`, Drawer 가 같은 이름을 씁니다.

## 항목

```tsx
<Sidebar.Item value="/inbox" href="/inbox">       {/* <a href> */}
  <InboxIcon />                                    {/* 첫 아이콘 = 아이콘 칸 */}
  받은편지함                                        {/* 글자 = 라벨 */}
  <Badge content={3} variant="soft" />             {/* 뒤 = 끝 칸 */}
</Sidebar.Item>

<Sidebar.Item value="/inbox" asChild>              {/* 라우터 링크 */}
  <Link to="/inbox"><InboxIcon />받은편지함</Link>
</Sidebar.Item>

<Sidebar.Item onClick={openSearch}>               {/* <button> */}
  <MagnifyingGlassIcon />찾기
</Sidebar.Item>

<Sidebar.Item href="/beta" disabled>베타</Sidebar.Item>
```

- `Sidebar` 의 `value` 와 같은 `value` 의 항목이 지금 페이지입니다. `aria-current="page"` 와 `data-selected` 가 붙고 배경이 칠해집니다.
- 칸은 자식 순서로 정합니다. 글자보다 앞의 첫 요소가 아이콘, 글자가 라벨, 라벨 뒤의 요소가 끝 칸입니다. 글자가 없으면 아이콘 다음 요소가 라벨입니다.
- 링크의 이름은 라벨입니다. 끝 칸의 Badge 는 이름에 들어가지 않습니다.
- `asChild` 의 자식은 ref 와 `onClick` 을 받는 링크 하나여야 합니다.

### 아이콘 색

```tsx
import { CodeBracketIcon } from '@heroicons/react/16/solid';

<Sidebar.Item value="frontend" colorScheme="info">
  <CodeBracketIcon />
  프론트엔드
</Sidebar.Item>
```

- `colorScheme` 은 아이콘 칸만 칠합니다. `neutral`(기본) / `primary` / `info` / `success` / `warning` / `danger` 중에서 고릅니다.
- 라벨과 배경은 그대로입니다. 아이콘 띠의 하위 Menu 와 끌기 복사본에서도 같은 색을 씁니다.
- 팀이나 프로젝트처럼 서로 구별해야 하는 항목에는 채워진 아이콘(`@heroicons/react/16/solid`)에 색을 주고, 메뉴 항목은 선 아이콘(`24/outline`)으로 둡니다.
- 아이콘 칸의 선 아이콘은 선 굵기 2로 그립니다. 16px 에서 1.5 는 너무 가늘어 보입니다.

## 하위 메뉴

```tsx
<Sidebar.Item>
  <Cog6ToothIcon />
  설정
  <Sidebar.Item value="/settings/account" href="/settings/account">계정</Sidebar.Item>
  <Sidebar.Item value="/settings/alerts" href="/settings/alerts">알림</Sidebar.Item>
</Sidebar.Item>
```

- Item 안의 Item 은 하위 메뉴입니다. 바깥 Item 은 펼치는 버튼(Accordion)이 되고, 안쪽 항목은 들여 쓴 `<ul>` 에 놓입니다.
- 몇 단계든 겹칠 수 있습니다. 단계마다 한 칸 들여 쓰고 왼쪽에 세로선(Divider)을 긋습니다.
- 지금 페이지가 안에 있으면 그 위의 모든 단계가 처음부터 펼쳐져 있습니다.
- 아이콘 띠로 접혔을 때는 버튼을 누르면 오른쪽에 Menu 가 열립니다. 지금 페이지가 안에 있으면 버튼이 칠해집니다. 더 깊은 단계는 하위 Menu 로 이어서 열립니다.

## 묶음

```tsx
<Sidebar.Group label="즐겨찾기">…</Sidebar.Group>
<Sidebar.Group label="보관함" collapsible>…</Sidebar.Group>                      {/* 라벨을 눌러 접는다 */}
<Sidebar.Group label="보관함" collapsible defaultOpen={false}>…</Sidebar.Group>  {/* 접힌 채로 시작 */}
```

- `collapsible` 묶음은 Accordion 입니다. 라벨이 `aria-expanded` 버튼이 되고, 목록은 그 버튼을 이름으로 가진 영역입니다.
- 사이드바가 아이콘 띠로 접히면 묶음 라벨은 화면에서 숨고(스크린 리더는 읽음) 목록은 늘 보입니다.

## 데이터로 그리기

```tsx
const [docs, setDocs] = useState(DOCS); // { id, label, children? }[]

<Sidebar.Group label="즐겨찾기" items={docs} onItemsChange={setDocs}>
  {(doc) => (
    <Sidebar.Item value={doc.id} href={`/docs/${doc.id}`}>
      <DocumentTextIcon />
      {doc.label}
    </Sidebar.Item>
  )}
</Sidebar.Group>
```

- Group 은 항목을 JSX children 으로 받거나, `items` 와 한 줄을 그리는 함수로 받습니다. 한 Group 안에서 둘을 섞으면 타입 오류입니다.
- 함수는 항목 하나의 `Sidebar.Item` 을 돌려줍니다. `children` 이 있는 항목은 IDS 가 하위 항목을 같은 함수로 그려 그 Item 의 하위 메뉴로 붙입니다. 하위 메뉴, 아이콘 띠의 Menu 는 JSX 로 겹쳐 쓸 때와 같습니다.
- 함수는 `Sidebar.Item` 을 직접 돌려줘야 합니다. 그것을 감싼 컴포넌트를 돌려주면 하위 항목을 붙이지 못하고 끌 수 없으며, 개발 모드에서 경고합니다.
- 함수의 두 번째 인자는 `{ depth }` 입니다. 맨 위 단계가 `0` 입니다.
- 데이터는 `{ id, children? }` 모양입니다. `id` 는 `string` 이나 `number` 이고 같은 부모 아래에서만 겹치지 않으면 됩니다(React 의 `key` 와 같은 규칙). 겹치면 개발 모드에서 경고하고 뒤의 것을 뺍니다.
- `id` 는 항목을 가리키는 값이고, 지금 페이지를 고르는 `value` 와는 따로입니다. 이름을 바꿔도 `id` 는 그대로 둡니다.
- 타입은 `items` 에서 추론합니다. 함수, `onItemsChange`, `canMove` 의 항목은 모두 그 타입이고, 폴더와 파일처럼 모양이 다른 노드의 유니온도 좁혀집니다.
- 렌더 함수는 서버에서 클라이언트로 넘길 수 없으므로, `items` 를 쓰는 Group 은 클라이언트 컴포넌트 안에 둡니다.

## 끌어서 옮기기

```tsx
<Sidebar.Group
  label="파일"
  items={files}
  onItemsChange={setFiles}
  canMove={({ to }) => to.parent === null || to.parent.kind === 'folder'}
>
  {(file) => <Sidebar.Item value={file.id}>{file.name}</Sidebar.Item>}
</Sidebar.Group>
```

- `onItemsChange` 를 주면 항목을 끌 수 있습니다. 제어 방식만 있습니다. IDS 는 옮긴 뒤의 새 배열을 넘기기만 하고, 앱이 `items` 를 바꿔야 화면이 바뀝니다.
- 마우스는 4px 넘게 움직여야 끌기가 시작됩니다. 그 전에 떼면 그냥 누른 것입니다. 손가락은 0.25초 누르고 있어야 시작합니다.
- 놓을 자리는 포인터와 같은 높이의 줄로 정합니다. 포인터가 들여쓰기 여백에 있어도 그 높이의 줄을 고릅니다. 위 1/4 은 그 줄 앞, 아래 1/4 은 그 줄 뒤, 가운데는 그 줄 안의 맨 앞입니다. 하위 항목이 펼쳐진 줄은 아래 3/4 이 모두 안입니다.
- 그 줄 안으로 넣는 것을 `canMove` 가 막으면 줄을 반으로 나눠 위는 앞, 아래는 뒤입니다. 펼쳐진 줄의 아래 절반은 뒤가 아니라 막힌 자리로 봅니다.
- 펼쳐진 하위 목록의 끝은 여러 깊이가 같은 높이에서 만납니다(마지막 하위 항목 뒤, 그 상위 항목 뒤, 다음 줄 앞). 이때는 끌리는 복사본의 왼쪽 끝과 가장 가까운 들여쓰기의 자리를 고릅니다. 곧장 끌면 원래 깊이에 남고, 오른쪽으로 끌면 안으로, 왼쪽으로 끌면 밖으로 놓입니다.
- 줄 사이 틈이나 목록 위아래의 빈 곳(한 줄 높이까지)에서는 가장 가까운 허용된 자리에 놓습니다. 줄들의 가로 범위를 벗어나면 아무것도 그리지 않고, 놓아도 옮기지 않습니다.
- 앞과 뒤는 선으로 보여 줍니다. 선은 놓일 깊이의 들여쓰기에서 점으로 시작하고, 펼쳐진 항목 뒤의 선은 그 하위 항목들 아래에 그려집니다. 안은 그 줄을 옅은 브랜드 색으로 칠합니다.
- 선은 두 줄 사이 틈의 한가운데에 그립니다. 그래서 어떤 줄의 뒤와 다음 줄의 앞은 같은 높이의 선입니다. 하위 항목이 펼쳐진 줄의 안은 칠하지 않고 첫 하위 항목 앞의 선으로 그립니다. 끌리는 항목은 흐려지고, 포인터에는 그 항목의 복사본이 붙습니다.
- 자기 자신이나 자기 하위 항목 안으로는 놓을 수 없습니다. 접힌 하위 메뉴 안의 항목은 끌거나 놓을 자리가 되지 않습니다.
- 키보드: 항목에 포커스를 두고 Space 로 집습니다. ↑ ↓ 는 놓을 수 있는 자리를 화면 순서대로 오가고, Enter 나 Space 로 놓고, Escape 나 Tab 으로 취소합니다. 포커스는 옮긴 항목에 남습니다. 이 안내는 `aria-describedby` 로, 지금 고른 자리는 스크린 리더 알림으로 읽힙니다.
- 옮긴 항목이 접힌 하위 메뉴 안으로 들어가면 그 하위 메뉴를 펼칩니다.
- 아이콘 띠와 640px 아래의 Drawer 에서는 끌지 않습니다.

### `move`

```ts
type Place<T> = {
  parent: T | null;          // 맨 위 단계면 null
  ancestors: readonly T[];   // 맨 위부터 부모까지
  index: number;             // 부모 안의 자리
  previousSibling: T | null;
  nextSibling: T | null;
};
type Move<T> = { item: T; from: Place<T>; to: Place<T> };
```

- `onItemsChange(items, move)` 는 옮긴 뒤의 새 배열과 이동 정보를 줍니다.
- `from` 의 항목은 옮기기 전 `items` 의 객체이고, `item` 과 `to` 의 항목은 새 배열의 객체입니다. 옮길 때 지나간 부모는 새로 복사되므로 둘은 같은 객체가 아닐 수 있습니다.
- 앞뒤 항목 사이의 값으로 순서를 매기는 서버(`sortOrder`, LexoRank, "이 항목 뒤에")는 `to.previousSibling`, `to.nextSibling` 을 씁니다. 되돌리기는 `from` 을 씁니다.

```tsx
onItemsChange={(next, { item, to }) => {
  setDocs(next);
  api.move(item.id, { parent: to.parent?.id ?? null, after: to.previousSibling?.id ?? null });
}}
```

### 놓을 수 있는 자리 정하기

- `canMove(move)` 가 `false` 를 돌려주면 그 자리에 놓지 못합니다. 끄는 동안 자리마다 불리므로 동기 함수여야 합니다.
- 안으로 넣는 것도 `to.parent` 가 그 항목인 이동이라 같은 함수로 막습니다. 따로 폴더를 표시하는 값은 없습니다.
- 막힌 줄 위를 끌면 표시선이 그 줄이 아니라 가장 가까운 허용된 자리에 그려지고, 놓으면 그 자리로 옮겨집니다.

```tsx
canMove={({ to }) => to.parent === null}                                       // 즐겨찾기: 순서만
canMove={({ item, to }) =>
  item.kind === 'category' ? to.parent === null : to.parent?.kind === 'category'
}                                                                              // 채널 묶음
canMove={({ to }) => to.parent === null || to.parent.kind === 'folder'}        // 파일 트리
```

### 옮기기 전 확인

- `onItemsChange` 에서 `overlay.open` 을 기다린 뒤 `items` 를 바꿉니다. 취소하면 아무것도 바뀌지 않습니다.

```tsx
onItemsChange={async (next, { item, to }) => {
  const confirmed = await overlay.open<boolean>(({ close }) => (
    <Dialog>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>&quot;{item.label}&quot; 을(를) 옮길까요?</Dialog.Title>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>취소</Dialog.Close>
          <Button onClick={() => close(true)}>옮기기</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ));
  if (confirmed) setDocs(next);
}}
```

## 접기

```tsx
<Sidebar collapsible />                                         // 'icon' 과 같다. 아이콘 띠로 접힌다
<Sidebar collapsible="offcanvas" />                             // 통째로 밀려 나간다. Provider 가 필요하다
<Sidebar collapsible defaultCollapsed />                        // 비제어
<Sidebar collapsible collapsed={collapsed} onCollapsedChange={setCollapsed} /> // 제어
<Sidebar collapsible shortcut="Mod+\" />                        // 단축키를 바꾼다
<Sidebar collapsible shortcut={false} />                        // 단축키를 끈다
```

- 아이콘 띠는 48px 입니다. 라벨과 묶음 라벨은 화면에서만 숨고, 끝 칸은 사라집니다. 항목에 마우스를 올리거나 키보드로 오면 라벨이 오른쪽 Tooltip 으로 뜹니다.
- `offcanvas` 로 접힌 사이드바는 폭이 0 이 되고 `inert` 라 Tab 이 들어가지 않습니다. 다시 열 `Sidebar.Trigger` 가 밖에 있어야 하므로 `Sidebar.Provider` 없이 쓰면 개발 모드에서 경고합니다.
- 단축키는 입력칸에 포커스가 있을 때는 동작하지 않습니다(편집기의 굵게 `Mod+B` 를 막지 않습니다). 640px 아래에서는 Drawer 를 열고 닫습니다.
- 접기 버튼의 Tooltip 에 단축키가 `Kbd` 로 함께 뜹니다.
- 아이콘 띠에서 Header 는 첫 자식(로고)과 접기 버튼만 보이고, 나머지는 `sr-only` 로 숨깁니다.
- 접힌 동안 `<aside>` 에 `data-collapsed` 가 붙습니다. Header 나 Footer 의 내용을 접혔을 때 숨기려면 `in-data-collapsed:hidden`, 화면에서만 숨기려면 `in-data-collapsed:sr-only` 를 줍니다.

### 상태를 쿠키에 남기기

```tsx
// app/layout.tsx (Next.js App Router)
import { cookies } from 'next/headers';

export default async function Layout({ children }) {
  const collapsed = (await cookies()).get('sidebar')?.value === 'true';

  return (
    <Sidebar.Provider>
      <Sidebar collapsible persist="sidebar" defaultCollapsed={collapsed}>…</Sidebar>
      <Sidebar.Inset>{children}</Sidebar.Inset>
    </Sidebar.Provider>
  );
}
```

- `persist` 에 이름을 주면 접고 펼칠 때마다 그 이름의 쿠키에 `true`, `false` 를 씁니다(`path=/`, 1년, `SameSite=Lax`).
- 쿠키를 읽는 것은 앱입니다. 서버가 읽어 `defaultCollapsed` 로 넘기면 첫 HTML 부터 접힌 모양이라 깜빡이지 않습니다. 서버 렌더링이 없는 앱은 `document.cookie` 를 읽어 넘깁니다.

## 모양

```tsx
<Sidebar variant="sidebar" />    // 기본. 가장자리에 붙고 오른쪽에 Divider 선 하나
<Sidebar variant="floating" />   // 사이드바가 Card 표면(테두리, 그림자, 둥근 모서리)으로 뜬다
<Sidebar variant="inset" />      // 사이드바는 바탕에 깔리고 Sidebar.Inset 본문이 카드로 뜬다
```

- `inset` 은 본문을 `Sidebar.Inset` 이 그리므로 `Sidebar.Provider` 가 필요합니다. 없으면 개발 모드에서 경고합니다.
- Provider 는 자식 JSX 에서 `Sidebar` 를 찾아 `variant` 를 읽으므로, 서버 HTML 부터 본문이 Card 입니다. `Sidebar` 를 앱의 컴포넌트로 감싸 Provider 가 찾지 못하면, 마운트 뒤 Sidebar 가 알려 준 `variant` 로 본문을 Card 로 바꿉니다.
- 사이드바는 `sticky top-0 h-dvh` 로 화면 높이를 채우고 본문과 함께 스크롤되지 않습니다. 다른 높이는 `className` 으로 줍니다.
- 폭은 `--sidebar-width`(기본 15rem)입니다: `className="[--sidebar-width:18rem]"`.

## Provider 와 Inset

```tsx
<Sidebar.Provider>
  <Sidebar value={pathname} variant="inset" collapsible="offcanvas" persist="sidebar">
    …
  </Sidebar>
  <Sidebar.Inset>
    <header>
      <Sidebar.Trigger />
    </header>
    {page}
  </Sidebar.Inset>
</Sidebar.Provider>
```

- Provider 는 선택입니다. 없으면 Sidebar 가 자기 상태를 갖고, 있으면 그 안 어디의 `Sidebar.Trigger` 든 같은 사이드바를 접고 엽니다.
- 상태 prop(`collapsed`, `defaultCollapsed`, `persist`, `shortcut`)은 Provider 가 있어도 `Sidebar` 에 줍니다.
- Provider 는 `flex min-h-dvh w-full` 인 `<div>` 입니다. 사이드바와 본문을 나란히 놓습니다.
- 640px 아래에서 Provider 가 있으면 사이드바는 숨고, 본문의 `Sidebar.Trigger` 가 Drawer 를 엽니다. Provider 가 없으면 사이드바 자리에 Drawer 를 여는 메뉴 버튼만 남습니다.

## 좁은 화면

- 640px 아래에서는 사이드바 대신 왼쪽 Drawer 에 같은 Header, 메뉴, Footer 를 그립니다. 접힘 상태와 상관없이 늘 펼친 모양입니다.
- Drawer 는 손가락으로 누르기 좋게 그립니다. 폭은 256px, 항목은 40px 높이에 16px 글자와 20px 아이콘입니다.
- Drawer 의 항목을 누르면 Drawer 가 닫힙니다. 하위 메뉴 버튼과 묶음 라벨은 닫지 않습니다.
- 화면이 640px 이상으로 넓어지면 열린 Drawer 를 닫습니다.
- 경계는 Select 의 시트와 같은 640px(`sm`)입니다.

## 속성

| 속성                                         | 기본 / 동작                                                         |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `value`                                      | 지금 페이지. 같은 `value` 의 항목에 `aria-current="page"`           |
| `variant`                                    | `sidebar`(기본) / `floating` / `inset`                              |
| `collapsible`                                | `false`(기본) / `true`(= `'icon'`) / `'icon'` / `'offcanvas'`       |
| `collapsed` / `defaultCollapsed`             | 접힘 상태. 기본 `false`                                             |
| `onCollapsedChange`                          | 접거나 펼칠 때 새 상태로                                            |
| `shortcut`                                   | `'Mod+B'`. `false` 면 끈다                                          |
| `persist`                                    | 접힘 상태를 쓸 쿠키 이름                                            |
| `aria-label`                                 | 사이드바의 이름. 기본 "사이드바"                                    |
| `Sidebar.Group`                              | `label`, `collapsible`, `defaultOpen`(`true`)                       |
| `Sidebar.Group` 데이터 방식                  | `items`, `children(item, { depth })`, `onItemsChange`, `canMove`    |
| `Sidebar.Item`                               | `value`, `href`, `asChild`, `disabled`, `onClick`, `colorScheme`    |
| `Sidebar.Trigger`                            | IconButton 의 속성. `icon` 으로 아이콘을 바꾼다                     |
| `Sidebar.Provider`, `Sidebar.Inset`          | `asChild` 로 다른 요소에 붙인다                                     |

## 알아둘 것

- 한 페이지에 Sidebar 를 여러 개 두면 단축키가 모두를 접습니다. 하나만 남기고 `shortcut={false}` 를 줍니다.
- 사이드바는 왼쪽에만 붙습니다.
- Item 의 칸 나누기는 자식을 직접 읽습니다. 아이콘과 라벨을 다른 컴포넌트로 감싸면 그 컴포넌트 하나가 아이콘 칸이 됩니다.
