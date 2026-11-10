# Sidebar

앱 화면 왼쪽에 붙는 주 메뉴입니다. 묶음, 지금 페이지, 여러 단계의 트리, 끌어서 옮기기, 접기, 단축키, 좁은 화면의 Drawer 를 한 컴포넌트로 다룹니다.

- **구조가 곧 접근성.** `<aside>` 안의 `<nav aria-label>`, 묶음은 `<section aria-labelledby>` 와 `<ul>`, 항목은 `<li>` 안의 링크입니다. 지금 페이지 링크에 `aria-current="page"` 가 붙습니다.
- **자식 순서로 칸을 나눕니다.** `Sidebar.Item` 의 첫 아이콘은 아이콘 칸, 글자는 라벨, 그 뒤(Badge, Kbd)는 끝 칸입니다.
- **아이콘 띠로 접힙니다.** 접으면 라벨은 Tooltip 으로, 하위 메뉴는 Menu 로 뜹니다. `Mod+B` 로 접고 펼칩니다.
- **끌어서 옮깁니다.** `Sidebar.Group` 에 `onItemMove` 를 주면 항목을 끌어 순서를 바꾸고 다른 항목 안으로 넣습니다. 키보드는 Alt 와 방향키입니다.
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

- Header, Footer 밖의 자식은 가운데 스크롤 영역(ScrollArea)의 `<nav>` 에 들어갑니다. Group 밖의 Item 은 이어진 것끼리 `<ul>` 하나로 묶입니다.
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

## 끌어서 옮기기

```tsx
const [docs, setDocs] = useState(DOCS); // { value, label, children? }[]

const item = (doc: Doc) => (
  <Sidebar.Item key={doc.value} value={doc.value} href={`/docs/${doc.value}`}>
    <DocumentTextIcon />
    {doc.label}
    {doc.children?.map(item)}
  </Sidebar.Item>
);

<Sidebar.Group
  label="즐겨찾기"
  onItemMove={(move) => setDocs((current) => Sidebar.moveItem(current, move))}
>
  {docs.map(item)}
</Sidebar.Group>
```

- `onItemMove` 를 준 묶음의 항목은 끌 수 있습니다. 끌리는 항목에는 `value` 가 있어야 합니다.
- 마우스는 4px 넘게 움직여야 끌기가 시작됩니다. 그 전에 떼면 그냥 누른 것입니다. 손가락은 0.25초 누르고 있어야 시작합니다.
- 놓을 자리는 포인터가 올라간 줄의 높이로 정합니다. 위 1/4 은 그 줄 앞, 아래 1/4 은 그 줄 뒤, 가운데는 그 줄 안의 맨 앞입니다. 하위 항목이 있는 줄은 아래 3/4 이 모두 안입니다.
- 앞과 뒤는 줄 사이의 선으로, 안은 그 줄을 옅은 브랜드 색으로 칠해 보여 줍니다. 끌리는 항목은 흐려지고, 포인터에는 그 항목의 복사본이 붙습니다.
- 자기 자신이나 자기 하위 항목 안으로는 놓을 수 없습니다. 접힌 하위 메뉴 안의 항목은 끌거나 놓을 자리가 되지 않습니다.
- 키보드: 항목에 포커스를 두고 Alt+↑/↓ 는 형제 사이에서 한 칸, Alt+→ 는 바로 위 형제의 맨 끝 하위 항목으로, Alt+← 는 부모 바로 뒤로 옮깁니다. 포커스는 옮긴 항목에 남습니다. 이 안내는 `aria-describedby` 로 읽힙니다.
- 옮긴 항목이 접힌 하위 메뉴 안으로 들어가면 그 하위 메뉴를 펼칩니다.
- `onItemMove` 는 `{ value, parent, index }` 를 줍니다. `parent` 는 새 부모의 `value` 이고 묶음의 맨 위 단계면 `null` 입니다. `index` 는 옮긴 뒤 새 부모 안에서의 자리입니다.
- `Sidebar.moveItem(items, move)` 는 `{ value, children? }` 모양의 트리에 이 이동을 적용한 새 배열을 돌려줍니다. 다른 모양의 데이터는 `move` 를 직접 읽어 옮깁니다.
- 아이콘 띠와 640px 아래의 Drawer 에서는 끌지 않습니다.

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
| `Sidebar.Group`                              | `label`, `collapsible`, `defaultOpen`(`true`), `onItemMove`         |
| `Sidebar.Item`                               | `value`, `href`, `asChild`, `disabled`, `onClick`                   |
| `Sidebar.Trigger`                            | IconButton 의 속성. `icon` 으로 아이콘을 바꾼다                     |
| `Sidebar.Provider`, `Sidebar.Inset`          | `asChild` 로 다른 요소에 붙인다                                     |
| `Sidebar.moveItem(items, move)`              | `onItemMove` 의 이동을 `{ value, children? }` 트리에 적용한 새 배열 |

## 알아둘 것

- 한 페이지에 Sidebar 를 여러 개 두면 단축키가 모두를 접습니다. 하나만 남기고 `shortcut={false}` 를 줍니다.
- 사이드바는 왼쪽에만 붙습니다.
- Item 의 칸 나누기는 자식을 직접 읽습니다. 아이콘과 라벨을 다른 컴포넌트로 감싸면 그 컴포넌트 하나가 아이콘 칸이 됩니다.
