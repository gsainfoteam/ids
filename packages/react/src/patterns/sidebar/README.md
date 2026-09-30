# 사이드바 앱 셸

Storybook `Patterns/Sidebar`. 워크스페이스 전환, 명령 팔레트, 접히는 사이드바, 모바일 서랍을 갖춘 앱 셸입니다.

- **쓰인 컴포넌트.** Menu (RadioGroup, command), Item, Tooltip, ScrollArea, Drawer, Breadcrumb, Card, AvatarGroup, Empty, Kbd
- **폭에 따라.** `md` 부터 사이드바가 보이고 접을 수 있습니다. 그보다 좁으면 메뉴 버튼이 왼쪽 서랍(`Drawer side="left"`)을 엽니다.
- **알아둘 것.**
  - 사이드바 내용은 함수 하나로 두고 데스크톱과 서랍에서 함께 씁니다. 접힌 상태에서는 글자를 `sr-only` 로 숨기고 `Tooltip` 이 이름을 보여 줍니다.
  - 명령 팔레트는 `Menu triggerType="command" hotkey="Mod+K"` 하나만 두고, 사이드바의 검색 버튼이 `open` 으로 엽니다. 단축키가 두 번 등록되지 않습니다.
  - 현재 페이지는 `Item selected` 와 `aria-current="page"` 로 표시합니다.
