# 자료실

Storybook `Patterns/FileManager`. 경로, 격자와 목록 보기, 우클릭 메뉴, 업로드 대화상자, 저장 공간을 갖춘 자료실입니다.

- **쓰인 컴포넌트.** Breadcrumb, ToggleGroup, IconToggle, Card, Table, Menu (contextmenu), Dialog, FileField, Progress
- **폭에 따라.** 격자는 모바일 2열, `sm` 3열, `xl` 4열입니다.
- **알아둘 것.**
  - 파일 카드는 `Menu triggerType="contextmenu"` 로 우클릭 메뉴를 받습니다. 키보드와 터치를 위해 "더 보기" 버튼 메뉴를 카드 옆에 형제로 둡니다. 우클릭 영역 안에 다른 `Menu` 를 넣지 않습니다.
