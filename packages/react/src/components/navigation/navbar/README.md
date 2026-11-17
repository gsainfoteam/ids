# Navbar

앱 화면 위에 붙는 막대입니다. 로고, 주 메뉴, 버튼을 한 줄에 놓고, 좁은 화면에서는 메뉴를 Drawer 로 엽니다.

- **구조가 곧 접근성.** `<header>` 안의 `<nav aria-label>`, 그 안의 `<ul>`, 항목은 `<li>` 안의 링크입니다. 지금 페이지 링크에 `aria-current="page"` 가 붙습니다.
- **자식 순서로 칸을 나눕니다.** `Navbar.Nav` 앞의 자식은 시작 칸, 뒤의 자식은 끝 칸입니다. 끝 칸은 오른쪽 끝에 붙습니다.
- **좁은 화면에서는 Drawer.** 640px 아래에서는 메뉴가 숨고 메뉴 버튼이 생깁니다. 버튼을 누르면 왼쪽 Drawer 에 같은 메뉴가 열리고, 항목을 누르면 닫힙니다.
- **IDS 로 짓습니다.** 항목은 밑줄 없는 Link, Drawer 안의 항목은 Item, 메뉴 버튼은 IconButton, 아래 선은 Divider 입니다.

```tsx
import { Avatar, Button, Navbar } from '@gsainfoteam/ids-react';

<Navbar value={pathname} sticky>
  <Logo />                                            {/* Nav 앞 = 시작 칸 */}
  <Navbar.Nav>
    <Navbar.Item value="/notices" href="/notices">공지</Navbar.Item>
    <Navbar.Item value="/groups" asChild>
      <RouterLink to="/groups">그룹</RouterLink>
    </Navbar.Item>
  </Navbar.Nav>
  <Button>로그인</Button>                              {/* Nav 뒤 = 끝 칸 */}
</Navbar>;
```

## 구조

| 파트                 | 역할                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| `Navbar`             | `<header>`. 자식을 시작 칸, 메뉴, 끝 칸으로 나눈다                                     |
| `Navbar.Nav`         | 메뉴. `<nav aria-label>` 와 `<ul>`. 넓은 화면에서는 막대에, 좁은 화면에서는 Drawer 에 |
| `Navbar.Item`        | 항목. `href` 면 `<a>`, `asChild` 면 자식 링크, 둘 다 없으면 `<button>`                |
| `Navbar.MenuTrigger` | 선택. 좁은 화면의 메뉴 버튼을 둘 자리. 생략하면 막대 맨 앞에 저절로 붙는다            |

- 시작 칸과 끝 칸은 각각 `flex` 한 줄이고 사이가 `gap-2` 입니다. 로고, Button, IconButton, Avatar, Menu 를 그대로 둡니다.
- `Navbar.Nav` 가 없으면 모든 자식이 시작 칸에 놓이고, 메뉴 버튼과 Drawer 는 생기지 않습니다.
- 메뉴의 이름은 `Navbar.Nav` 의 `aria-label` 로 줍니다. 기본은 "주 메뉴" 이고 Drawer 도 같은 이름을 씁니다.
- `<header>` 가 `<main>`, `<article>`, `<section>` 밖에 있으면 스크린 리더는 banner 랜드마크로 읽습니다.

## 항목

```tsx
<Navbar.Item value="/notices" href="/notices">공지</Navbar.Item>  {/* <a href> */}

<Navbar.Item value="/groups" asChild>                             {/* 라우터 링크 */}
  <Link to="/groups">그룹</Link>
</Navbar.Item>
```

- `Navbar` 의 `value` 와 같은 `value` 의 항목이 지금 페이지입니다. `aria-current="page"` 가 붙고, 흐린 글자(`text-neutral`)가 진한 글자(`text-on-surface`)로 바뀌며 옅은 배경(`bg-neutral-soft`)이 깔립니다.
- 막대의 항목은 `Link colorScheme="neutral" underline="none"` 입니다. 가리키면 `bg-neutral-soft`, 누르면 한 단계 진한 배경이 깔립니다. 지금 페이지는 한 단계씩 더 올라갑니다. 포커스 링은 항목 칸을 둘러쌉니다.
- 글자색만으로 지금 페이지를 가르면 어두운 화면에서 차이가 작아 배경을 함께 씁니다.
- Drawer 의 항목은 Sidebar 의 Drawer 와 같은 크기의 Item 이고, 지금 페이지는 배경이 칠해집니다.
- `asChild` 의 자식은 ref 와 `onClick` 을 받는 링크 하나여야 합니다. 그 자식의 글자가 항목 이름입니다.
- `onClick` 과 나머지 속성은 링크에 그대로 넘어갑니다.

## 좁은 화면

```tsx
<Navbar value={pathname}>
  <Logo />
  <Navbar.Nav>…</Navbar.Nav>
  <Avatar name="김지수" />
  <Navbar.MenuTrigger />                 {/* 끝 칸 맨 뒤에 둔다 */}
</Navbar>
```

- 640px 아래에서는 `Navbar.Nav` 가 숨고 메뉴 버튼(`Bars3Icon`, "메뉴 열기")이 보입니다. 기준은 Sidebar, Select 의 Drawer 와 같은 640px 입니다.
- 메뉴 버튼을 누르면 왼쪽 Drawer 가 열립니다. 위에 닫기 버튼이 있고, Escape, 바깥 누르기, 닫기 버튼, 항목 누르기로 닫힙니다. 닫히면 포커스가 메뉴 버튼으로 돌아갑니다.
- 화면이 640px 보다 넓어지면 열려 있던 Drawer 는 닫힙니다.
- 메뉴 버튼은 `aria-expanded` 로 Drawer 가 열렸는지 알립니다. `Navbar.MenuTrigger` 는 IconButton 의 속성(`variant`, `icon`, `aria-label`)을 받고, 기본은 `outline`, `tiny` 입니다.
- 시작 칸과 끝 칸은 좁은 화면에서도 보입니다. 끝 칸이 넘치면 앱이 `max-sm:hidden` 으로 덜 중요한 것을 숨깁니다.

## 모양

```tsx
<Navbar sticky>…</Navbar>             {/* 스크롤해도 위에 붙어 있다 */}
<Navbar bordered={false}>…</Navbar>   {/* 아래 선을 뺀다 */}
```

| Property   | Type      | Default | 설명                                                           |
| ---------- | --------- | ------- | -------------------------------------------------------------- |
| `value`    | `string`  | -       | 지금 페이지. 같은 `value` 의 Item 에 `aria-current="page"`     |
| `sticky`   | `boolean` | `false` | `position: sticky; top: 0` 와 `z-30`. 스크롤하는 조상에 붙는다 |
| `bordered` | `boolean` | `true`  | 막대 아래의 Divider                                            |

- 막대는 높이 56px(`min-h-14`), 좌우 여백 16px, 640px 부터 24px 입니다. 바탕은 `bg-surface` 라 `sticky` 일 때 본문이 비치지 않습니다.

## 참고

- [HeroUI Navbar (v2)](https://v2.heroui.com/docs/components/navbar), [MUI App Bar](https://mui.com/material-ui/react-app-bar/), [Carbon UI Shell 헤더](https://www.carbondesignsystem.com/building-blocks/core/components/ui-shell-header/guidelines)
