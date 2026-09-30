# 접근성 준수 안내

`@gsainfoteam/ids-react` 가 어떤 접근성 기준을 목표로 하는지, 컴포넌트마다 어떤 키와 역할을 쓰는지, 알려진 한계가 무엇인지 적습니다. 마지막 절은 사람이 스크린 리더로 직접 점검하는 체크리스트입니다.

## 범위

- **목표 기준은 [WCAG 2.2](https://www.w3.org/TR/WCAG22/) AA 입니다.** A 와 AA 성공 기준을 모두 대상으로 합니다.
- **키보드와 역할은 [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) 패턴을 따릅니다.** APG 와 다르게 동작하는 곳은 아래 표의 "알려진 한계" 에 적습니다.
- **React 패키지만 다룹니다.** `ids_flutter` 는 이 문서의 범위가 아닙니다.
- **IDS 가 맡는 것과 앱이 맡는 것이 따로 있습니다.**
  - IDS 는 역할, 상태, 키보드, 포커스 이동, 라벨 연결, 알림(live region), 기본 문구를 맡습니다.
  - 앱은 다음을 맡습니다:
    - 아이콘만 있는 버튼의 이름(`aria-label`)
    - 페이지 제목과 `lang`
    - 제목(heading) 구조와 랜드마크
    - 오류 문구의 내용
    - 번역(`IdsProvider translate`)
    - 직접 고른 색의 대비

## 검증 방법

- **자동 검사.** `pnpm test` 가 매 커밋마다 돌립니다.
  - `packages/react/tests/*.test.tsx` 는 Chromium, Firefox, WebKit 에서 실제 클릭과 키 입력으로 역할, 접근 가능한 이름, `aria-*` 상태, 포커스 이동을 확인합니다.
  - `tests/stories-<분류>.test.tsx` 는 모든 스토리를 렌더하고 `play` 에 적은 키보드와 스크린 리더 관련 단언을 실행합니다.
  - 같은 테스트가 모든 스토리를 라이트와 다크 모드에서 한 번씩 그리고, `play` 뒤에 [axe-core](https://github.com/dequelabs/axe-core) 로 WCAG 2.0, 2.1, 2.2 의 A, AA 규칙을 검사합니다. 위반이 하나라도 있으면 실패합니다. 같은 설정을 Storybook 의 Accessibility 패널(`@storybook/addon-a11y`)도 씁니다.
  - axe 는 사람이 판단해야 하는 항목(경계선 대비, 누를 대상 크기, 툴팁 위로 마우스 옮기기, 읽는 순서)을 잡지 못합니다. 아래 공통 한계와 수동 점검이 그 몫입니다.
  - `tests/hydration.test.tsx` 와 `tests/stories.ssr.test.tsx` 는 서버 HTML 에 라벨 연결(`id`, `aria-labelledby`, `aria-describedby`)이 처음부터 들어 있는지 확인합니다.
- **수동 점검.** 자동 검사로 알 수 없는 것(실제 스크린 리더가 읽는 순서와 문장, 모바일 제스처)은 [수동 점검 체크리스트](#수동-점검-체크리스트) 로 사람이 확인합니다.

## 모든 컴포넌트에 공통인 동작

- **포커스 표시(2.4.7).** 키보드로 포커스한 요소에는 `focus-ring` 이 그리는 3px 링이 보입니다. 마우스로 누른 포커스에는 보이지 않습니다.
- **오버레이의 포커스.**
  - 모달(Dialog, Drawer, modal Popover, 필드의 하단 시트)은 포커스를 안에 가두고 뒤 페이지를 `aria-hidden` 으로 숨깁니다.
  - 닫히면 포커스가 연 요소로 돌아갑니다. 그 요소가 사라졌으면 그 레이어의 trigger 로 갑니다.
  - Escape 는 맨 위 레이어 하나만 닫습니다.
- **가려지지 않는 포커스(2.4.11).** 레이어는 top layer 에 올라가므로 부모의 `overflow` 에 잘리지 않습니다.
- **한글 입력.** IME 조합 중에 누른 Escape 와 Enter 는 조합만 끝내고, 레이어를 닫거나 값을 확정하지 않습니다.
- **오른쪽에서 왼쪽 문서.** `dir="rtl"` 에서는 가로 방향키가 뒤집힙니다(Slider, Rating, Calendar, TimePicker, ChipField, Splitter, 하위 메뉴).
- **모션 감소.** `prefers-reduced-motion: reduce` 면 전환 애니메이션을 끄고, Spinner 는 회전 대신 천천히 깜빡이고, Skeleton 은 움직이지 않는 muted 바탕으로 남습니다. Marquee 는 흐르지 않고 항목을 모두 보여 줍니다.
- **비활성이지만 포커스 가능.** 버튼류의 `focusableWhenDisabled` 는 `disabled` 대신 `aria-disabled` 를 붙여 탭 순서와 툴팁을 지킵니다.
- **문구.** 닫기, 지우기, 불러오는 중 같은 기본 문구는 한국어이고, `IdsProvider translate` 로 앱의 i18n 을 거칩니다. 개발 경고만 영어입니다.

## 공통 한계

- **경계선 대비(1.4.11).** 구조선은 `--ids-color-border` 를 씁니다. 이 선은 배경과 대비가 약 1.3:1 입니다.
  - 값: 라이트 `#e5e5e5` on `#ffffff` 1.26:1, 다크 `#262626` on `#0a0a0a` 1.31:1
  - 적용되는 곳: outline 필드의 테두리, 꺼진 Checkbox 와 Radio 의 테두리, 꺼진 Switch 트랙
  - 기준이 요구하는 3:1 에 못 미칩니다. 그래서 컨트롤은 라벨, placeholder, 값으로 알아볼 수 있게 써야 합니다.
  - 켜진 상태, 포커스, 오류는 테마 색과 danger 색으로 그려져 3:1 을 넘습니다.
- **작은 누를 대상(2.5.8).** 다음은 24x24px 보다 작습니다. 주변 24px 안에 다른 누를 대상이 없을 때만 간격 예외로 기준을 만족합니다.
  - Checkbox 상자 16px(tiny 14px)
  - Radio 16px
  - Switch 36x20px(tiny 28x16px)
  - Chip.Close 16px(tiny 14px)
  - Checkbox, Radio, Switch 는 `Field.Label` 이나 `Label` 과 함께 쓰면 라벨도 누를 영역이 됩니다.
- **툴팁 위로 마우스 옮기기(1.4.13).** Tooltip 말풍선은 `pointer-events: none` 이라, 마우스를 말풍선으로 옮기면 닫힙니다.
  - 기준의 "hoverable" 조건을 채우지 못합니다.
  - 긴 설명이나 확대해서 읽어야 하는 내용은 Popover 로 둡니다.
- **시간 제한(2.2.1).** Toast 는 정해진 시간 뒤에 사라집니다.
  - 마우스를 올린 동안, 포커스가 안에 있는 동안, 탭이 가려진 동안은 멈춥니다.
  - 동작 버튼이 있는 알림이나 놓치면 안 되는 알림은 `duration: Infinity` 로 둡니다.
- **Safari 의 포커스 가드.** 모달(Dialog, Drawer, 하단 시트)은 floating-ui 의 포커스 가드로 Tab 을 가둡니다.
  - Safari 에서는 VoiceOver 의 가상 커서가 가드에 닿아야 포커스 이벤트가 나므로, floating-ui 가 가드를 이름 없는 `role="button"` 으로 둡니다.
  - VoiceOver 가 모달 가장자리에서 이름 없는 버튼을 읽을 수 있습니다. axe 검사는 이 가드를 빼고 봅니다.
- **끌어서 크기 바꾸기(2.5.7).** Resizable 과 TextArea(`autoResize={false}`)의 손잡이, DataTable 의 열 너비 핸들은 끌어서 크기를 바꿉니다.
  - 방향키로도 바꿀 수 있습니다. 하지만 2.5.7 은 끌기를 포인터의 한 번 누르기로 대신할 수 있어야 한다는 기준이라, 키보드 경로로는 채우지 못합니다.
  - 모바일 스크린 리더(VoiceOver, TalkBack)는 `slider` 는 쓸어서 조절하지만 `separator` 는 조절하지 못합니다. 두 번 탭한 채 끄는 통과 제스처로만 바꿀 수 있습니다.
  - 크기가 중요한 화면이면 앱이 크기를 고르는 버튼이나 NumberField 를 함께 둡니다.
- **Firefox 의 스크롤 영역.** Firefox 는 스크롤되는 영역을 모두 Tab 에 넣습니다. 안에 버튼이 있는 ScrollArea 도 버튼 앞에서 한 번 멈춥니다.
- **자동 이름(4.1.2).** IconButton, IconToggle, FloatingButton 은 `aria-label` 이 없으면 아이콘에서 이름을 찾습니다.
  - 찾은 이름은 영어입니다.
  - 함수 이름에서 찾은 이름은 production 빌드의 이름 축약으로 사라질 수 있습니다.
  - 배포하는 화면에는 `aria-label` 을 줍니다.

## 컴포넌트별 정리

- 키는 포커스가 그 컴포넌트에 있을 때입니다. `Tab` 과 `Shift+Tab` 은 따로 적지 않았으면 브라우저 기본 순서입니다.
- 자세한 키 표와 파트별 속성은 각 컴포넌트의 README 에 있습니다.

### action

| 컴포넌트 | APG 패턴 | 키보드 | 역할과 ARIA | 알려진 한계 |
| --- | --- | --- | --- | --- |
| Button | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | `Enter` `Space` | native `button`. `focusableWhenDisabled` 면 `aria-disabled`. 로딩은 `aria-busy` 를 앱이 준다 | `loading` prop 이 없다. `disabled` 와 `Spinner`, `aria-busy` 를 합성한다 |
| IconButton | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | `Enter` `Space` | `button`. 이름은 `aria-label`, 아이콘의 `title`, 아이콘 이름 순 | 자동 이름은 영어이고 production 에서 사라질 수 있다 |
| FloatingButton | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | `Enter` `Space` | `button`. 이름 규칙은 IconButton 과 같다 | 화면에 고정되어 스크롤한 내용을 가릴 수 있다. 앱이 아래 여백을 둔다 |
| ButtonGroup | 없음 | 안의 버튼마다 Tab 이 멈춘다 | `role="group"`, 이름은 `aria-label`. 구분선은 `separator` | 이름을 주지 않으면 그룹이 무엇인지 읽지 않는다 |
| Toggle, IconToggle | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) (toggle) | `Enter` `Space` | `button` + `aria-pressed`. 이름은 상태에 따라 바꾸지 않는다 | 없음 |
| ToggleGroup | 하나만 고르면 [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), 여럿이면 [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) | 그룹 전체가 Tab 한 칸. `←` `→`(세로면 `↑` `↓`), `Home` `End`. 끝에서 처음으로 돈다 | `radiogroup` + 항목 `radio` `aria-checked`, 또는 `toolbar` + 항목 `aria-pressed`. `aria-orientation` | 하나만 고를 때 방향키가 선택도 옮긴다(APG radio 그대로) |

### data

| 컴포넌트 | APG 패턴 | 키보드 | 역할과 ARIA | 알려진 한계 |
| --- | --- | --- | --- | --- |
| Accordion | [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) | `Enter` `Space` 열고 닫기, `↑` `↓` 헤더 이동(돈다), `Home` `End` | heading 안 `button` + `aria-expanded` `aria-controls`, 내용은 `region` + `aria-labelledby` | `collapsible={false}` 면 열린 헤더가 `aria-disabled` 로 남는다 |
| Avatar | 없음 | 없음 | 사진이나 이니셜이 `role="img"`, 이름은 `aria-label`, `alt`, `name` 순. `alt=""` 면 숨긴다 | 없음 |
| AvatarGroup | 없음 | 없음 | `role="group"`, 넘친 사람은 "외 N명" | 이름(`aria-label`)은 앱이 준다 |
| Badge | 없음 | 없음 | `aria-label` 이 있으면 숨긴 `role="status"` 가 문장을 읽고, 없으면 감싼 요소의 `aria-describedby` | 점(`dot`)만 있고 이름이 없으면 읽히지 않는다 |
| Calendar | [Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), [Date Picker Dialog 예제](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) | 방향키 하루와 한 주, `Home` `End` 주의 처음과 끝, `PageUp` `PageDown` 한 달, `Shift+PageUp` `Shift+PageDown` 한 해, `Enter` `Space` 선택 | `grid`(이름은 달 제목), 여러 날이면 `aria-multiselectable`. 달 제목은 `role="status"` | 날짜 격자는 `react-day-picker` 가 그린다 |
| Card, Item | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) (`onClick` 이 있을 때) | 제목 버튼에서 `Enter` 누를 때 실행, `Space` 뗄 때 실행. 포인터는 표면 어디를 눌러도 된다 | 제목이 `button`, 설명은 Description(`aria-describedby`), Item 의 선택은 `aria-pressed`. 루트는 평범한 `div` 라 안의 버튼과 겹치지 않는다. `Item.Group` 은 `role="list"`, `ordered` 면 `<ol>` | 제목이 없거나 직접 만든 컴포넌트 안에 있으면 루트가 `role="button"` 이 되고, 이때는 안에 다른 버튼을 둘 수 없다 |
| Carousel | [Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) (기본 캐러셀: 이전, 다음 버튼과 점) | 이전, 다음 버튼, 보이는 슬라이드 안의 요소, 점, 멈춤 버튼 순서로 Tab. 안에서 `←` `→`(세로 `↑` `↓`, 오른쪽에서 왼쪽이면 `←` `→` 반대) 이전과 다음 자리, `Home` `End` 처음과 끝. 점에서 누르면 포커스가 새 현재 점으로, 슬라이드 안에서 누르면 새 슬라이드로 옮겨 간다 | 루트 `region` + `aria-roledescription="캐러셀"` + 이름(`aria-label` 필수, 없으면 개발 경고). 슬라이드 `group` + `aria-roledescription="슬라이드"` + "N장 중 M번째", 화면 밖 슬라이드는 `inert`. 이전과 다음은 끝에서 `aria-disabled`(포커스 유지). 점은 "N번째 슬라이드로", 현재 점은 `aria-current="true"`. 멈춤은 `aria-pressed` 토글 "자동 넘김 멈춤". 넘길 때 live region 이 "N장 중 M번째" 를 알린다(자동 넘김 중 `off`, 아니면 `polite`) | 점은 `tablist` 가 아니라 버튼이다(APG 의 탭 캐러셀 대신 기본 캐러셀). 쉬는 점의 색(`handle`)은 바탕과 3:1 에 못 미쳐, 현재 점은 primary 색과 긴 모양으로 구별한다. 방향키는 APG 에 없는 IDS 의 편의다 |
| Chip | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) (누르거나 켜는 칩) | `Enter` `Space`, `Backspace` `Delete` 지우기 | 라벨이면 `span`, 누르는 칩은 `button` + `aria-pressed`. 지우기는 `Chip.Close` 버튼 | Chip.Close 가 24px 보다 작다 |
| ColorPicker | [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) (팔레트) | 영역: `←` `→` 채도, `↑` `↓` `PageUp` `PageDown` 밝기, `Shift`+방향키 10%, `Home` `End`. 값 입력은 `Enter` 로 반영 | 영역은 채도와 밝기 두 `slider`(`aria-valuetext` 에 두 값), 색조와 투명도는 `slider`, 팔레트는 `radiogroup` | 2차원 영역은 APG 패턴이 없어 슬라이더 둘로 읽힌다 |
| Empty | 없음 | 없음. `Empty.Actions` 의 버튼마다 Tab 이 멈춘다 | 역할이 없는 `div`, live region 없음. 기본 아이콘은 `aria-hidden`. 제목은 `Empty.Title asChild` 로 heading 이 된다 | 제목의 heading 수준과 결과 수 알림은 앱이 맡는다 |
| Marquee | 없음 | 멈춤 버튼 `Enter` `Space`. 항목 안의 링크나 버튼마다 Tab 이 한 번 멈추고, 포커스를 받은 항목은 띠 가운데로 옮겨진다 | `role="group"` 과 이름(`aria-label`), live region 없음. 복제본은 `aria-hidden` 과 `inert`. 멈춤 버튼은 `aria-pressed` 토글("일시 정지"). 포인터나 키보드 포커스가 안에 있으면 잠시 멈춘다(2.2.2) | 이름은 앱이 준다. `pauseControl={false}` 면 내용이 5초 안에 멈추거나 장식이어야 한다. 항목의 `id` 는 복제본에도 생긴다 |
| QRCode | 없음 | 없음 | `role="img"`, 이름은 `aria-label` 이나 `aria-labelledby`, 없으면 "QR 코드". 값은 이름에 넣지 않는다. SVG 와 로고는 이름 안에 숨는다 | 스캔할 수 없는 사람을 위한 주소 글자나 링크는 앱이 함께 보여 준다. 다크 모드의 기본 색은 반전되어 오래된 스캐너가 못 읽을 수 있다(`inverted={false}`) |
| DataTable | [Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/) ([Sortable Table 예제](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)) | 정렬 머리글 버튼 `Enter` `Space`(`Shift`+누르기는 여러 열), 체크박스 `Space`(`Shift`+누르기는 범위), 너비 핸들 `←` `→`(`Shift` 64px) `Home` `End` `Enter`(되돌리기), 페이지 버튼 `Enter` `Space` | native `table`, 정렬된 열의 `th` 에 `aria-sort`, 체크박스 이름 "{행} 선택"과 "모든 행 선택"(일부면 mixed), 핸들 `separator` + `aria-valuenow` `aria-valuemin` `aria-valuemax`, 페이지는 `nav`(이름 "페이지 이동") + `aria-live` 글자, 로딩은 `aria-busy` | `grid` 가 아니라 셀 사이 방향키 이동이 없다. 끝 페이지 버튼은 `aria-disabled` 로 탭 순서에 남는다 |
| Table | [Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/) | 없음. 넘치는데 안에 포커스 받을 요소가 없으면 스크롤 영역이 Tab 에 멈춘다 | native `table`, `th` 는 머리글 행에서 `scope="col"`, 몸통과 바닥글에서 `scope="row"`, `caption` | 선택된 행(`selected`)은 모양만 바뀐다. `aria-selected` 는 grid 전용이라 행 안의 체크박스나 버튼이 알린다. `onClick` 행은 `role="button"` 이 아니어서 키보드 경로는 행 안의 버튼이다 |
| TimePicker | [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) | 컬럼마다 Tab 한 번. `↑` `↓` 한 칸, `PageUp` `PageDown` 다섯 칸, `Home` `End`, `Enter` `Space` 선택, `←` `→` 옆 컬럼, 숫자 입력, `Delete` 비우기 | `role="group"`(이름 "시간") 안에 컬럼마다 `listbox` + `option` `aria-selected`, `aria-activedescendant` | `wheel` 은 스크롤이 멈춘 자리를 고른다. 키보드로는 `Enter` 로 고른다 |

### feedback

| 컴포넌트 | APG 패턴 | 키보드 | 역할과 ARIA | 알려진 한계 |
| --- | --- | --- | --- | --- |
| Alert | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) | 안에 포커스가 있을 때 `Escape` 로 닫기 | warning, danger 는 `role="alert"`, 나머지는 `role="status"`. `Alert.Close` 는 이름 "닫기" | 늘 있는 안내에는 `role` 을 직접 바꾼다(`note` 등) |
| Progress | [ARIA progressbar](https://www.w3.org/TR/wai-aria-1.2/#progressbar) (APG 패턴 없음) | 없음 | `progressbar` + `aria-valuenow` `aria-valuemax` `aria-valuetext`, 이름은 `Progress.Label` | 이름이 없으면 개발 모드 경고만 한다 |
| Skeleton | 없음 | 없음. 불러오는 동안 감싼 내용에 Tab 이 들어가지 않는다 | 모양은 `aria-hidden`. 감싸기는 감싼 `div` 에 `aria-busy="true"`, 자식은 보이지 않고 `inert`. `asChild` 면 자식 요소가 `aria-busy` 와 `inert` 를 함께 받는다 | live region 이 없다. "불러오는 중" 알림은 Spinner 나 앱이 맡고, 모양만 쓰는 영역의 `aria-busy` 는 앱이 준다 |
| Spinner | 없음 | 없음 | 그림은 `aria-hidden`, 나타나고 100ms 뒤 `role="status"` 에 문장을 적는다 | 100ms 안에 끝나는 로딩은 알리지 않는다. 버튼 안에서는 알리지 않는다 |
| Toast | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) | `F6` 이나 `Alt+T` 로 영역 들어가기와 나오기, `Tab` 영역 안 버튼, `Escape` 원래 자리로 | 영역은 이름 "알림" + `aria-keyshortcuts`, warning, error 는 `role="alert"`, 나머지는 `role="status"` | 시간이 지나면 사라진다(2.2.1). 스와이프로 닫기는 닫기 버튼이 대신한다 |

### form

| 컴포넌트 | APG 패턴 | 키보드 | 역할과 ARIA | 알려진 한계 |
| --- | --- | --- | --- | --- |
| Field | 없음 ([Forms 튜토리얼](https://www.w3.org/WAI/tutorials/forms/)) | 없음 | `Field.Label` 을 `htmlFor` 와 `aria-labelledby` 로, 설명, 힌트, 오류를 `aria-describedby` 로 잇고 `aria-invalid` `aria-required` 를 붙인다 | 오류 문구의 내용은 앱이 쓴다 |
| TextField, Input, PasswordField, TelField | 없음 (native `input`) | 브라우저 기본. Clear 가 있으면 `Escape` 로 지운다 | native `input`. PasswordField 보기 버튼은 이름 고정 + `aria-pressed`, CapsLock 은 `role="status"`. TelField 국가 선택은 Select | Clear 는 탭 순서에 없다(`Escape` 가 대신한다) |
| TextArea | 없음 (native `textarea`), 크기 조절 손잡이는 [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) | 브라우저 기본. `autoResize={false}` 면 textarea 다음의 손잡이에서 `↑` `↓` 높이, `←` `→` 너비 16px, `Shift` 64px, `Home` `End`, `Enter` 처음 크기 | 글자 수는 `aria-describedby`, 한도에 가까우면 0.6초 멈춘 뒤 `role="status"` 로 알린다. 손잡이는 `separator`("높이", "너비") + `aria-valuenow` `aria-valuetext` `aria-controls`, `both` 면 `group`("크기 조절") 안의 separator 둘 | 손잡이 끌기(2.5.7)를 한 번 누르기로 대신할 방법이 없다(키보드는 있다) |
| NumberField | [Spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) | `↑` `↓` 한 단계, `Shift` 큰 단계, `Alt` 작은 단계, `PageUp` `PageDown`, `Home` `End` 최솟값과 최댓값, `Enter` 정리 | `spinbutton` + `aria-valuenow` `aria-valuemin` `aria-valuemax` `aria-valuetext`. 증감 버튼은 `aria-controls` | 증감 버튼은 탭 순서에 없다(방향키가 대신한다) |
| OTPField | 없음 (native `input` 하나) | `←` `→` 칸 이동, `Shift+←` `Shift+→` 선택 | 칸은 `aria-hidden`, input 하나가 이름과 값을 가진다. 이름이 없으면 "인증 코드" | 없음 |
| Checkbox, CheckboxGroup | [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) | `Space`. 항목마다 Tab 이 멈춘다 | native `checkbox`, 일부 선택은 `indeterminate`(mixed). 그룹은 `role="group"`, 전체 선택은 `aria-controls` | 꺼진 상자 테두리 대비와 16px 크기(공통 한계) |
| Radio, RadioGroup | [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) | 선택된 항목에 Tab 한 번, 방향키 옮기며 고르기, `Home` `End`, `Space` | native `radio`, 그룹은 `radiogroup` + `aria-required` `aria-readonly` `aria-invalid` | 꺼진 원 테두리 대비와 16px 크기(공통 한계) |
| Switch | [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) | `Space`. `Enter` 는 폼 제출에 남긴다 | native `checkbox` + `role="switch"`, `aria-readonly` | 꺼진 트랙 대비와 크기(공통 한계) |
| Slider | [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), [Multi-Thumb Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) | 방향키 한 단계, `Shift`+방향키와 `PageUp` `PageDown` 큰 단계, `Home` `End` | thumb 마다 `slider` + `aria-valuenow` `aria-valuemin` `aria-valuemax` `aria-valuetext` `aria-orientation`. 범위는 `group` | 없음 |
| Rating | [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) | 고른 점수에 Tab 한 번, 방향키 한 단계(끝에서 멈춤), 숫자 키, `Home` `0` 0점, `End` 만점, `Space` `Enter` | `radiogroup` + 점수마다 `radio`. 표시 전용은 `role="img"`("5점 만점에 4.5점") | 방향키가 끝에서 돌지 않는다(APG radio 는 돈다) |
| Select | [Combobox (select-only)](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) | `↓` `↑` `Enter` `Space` `Home` `End` 열기, 열린 뒤 방향키 `PageUp` `PageDown` `Home` `End`, 글자 검색, `Enter` `Space` 고르기, `Alt+↑` 고르고 닫기, `Escape` 닫기, `Tab` 닫고 이동 | trigger `combobox` + `aria-expanded` `aria-controls` `aria-activedescendant`, 목록 `listbox` + `option` `aria-selected`, 여럿이면 `aria-multiselectable`. 빈 결과는 live region | 가리키기만 해서는 값이 바뀌지 않는다(`Enter` 로 고른다) |
| ChipField | [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) | 입력 맨 앞 `←` 로 칩, 칩 사이 방향키, `Backspace` `Delete` 지우기, `↓` `↑` 목록, `Enter` 넣기, 쉼표로 새 값, `Tab` 필드 떠나기 | 입력 `combobox` + `aria-autocomplete="list"`, 목록 `listbox` `aria-multiselectable`, 옵션 묶음은 `group`. 안내 문구는 live region | 칩은 탭 순서에 없다(방향키로 간다) |
| DateField, TimeField, DateTimeField | [Date Picker Combobox 예제](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/) | trigger 에서 `Enter` `Space` 열고 닫기, `↓` 열기. 팝업 안은 Calendar, TimePicker 키 | trigger(또는 `Input`)가 `combobox` + `aria-haspopup="dialog"`, 팝업은 `role="dialog"` | 좁은 화면의 하단 시트는 modal 이다 |
| ColorField | [Date Picker Combobox 예제](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/) | `↓` 열고 첫 컨트롤로, `Enter` `Space` 열고 닫기, `Escape` 닫고 trigger 로 | trigger `combobox` + `aria-haspopup="dialog"` `aria-expanded` `aria-required` `aria-readonly`, 이름과 값을 함께 읽는다 | 팝업 안은 ColorPicker 의 한계를 따른다 |
| FileField | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | `Enter` `Space` 파일 고르기, 포커스한 채 붙여넣기 | trigger `button`, 규칙과 필수("필수 항목")는 `aria-describedby`, 거부 사유는 `role="alert"`, 목록은 `role="list"` | 끌어다 놓기는 버튼 고르기와 붙여넣기가 대신한다 |

### layout, typography, utility

| 컴포넌트 | APG 패턴 | 키보드 | 역할과 ARIA | 알려진 한계 |
| --- | --- | --- | --- | --- |
| Divider | [ARIA separator](https://www.w3.org/TR/wai-aria-1.2/#separator) | 없음 | `separator` + `aria-orientation`, 가운데 글자는 `aria-labelledby` | 크기 조절 핸들이 아니다(포커스를 받지 않는다) |
| ScrollArea | 없음 (native 스크롤) | 브라우저의 스크롤 키. 넘치는데 포커스 받을 요소가 없으면 viewport 가 Tab 에 멈춘다 | 막대는 `aria-hidden` | 막대는 포인터 전용이다. 키보드와 보조 기술은 native 스크롤을 쓴다 |
| Resizable | [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) (값은 px) | 가장자리 손잡이: `←` `→`(세로면 `↑` `↓`) 16px, `Shift` 64px, `Home` `End` 최솟값과 최댓값, `Enter` 처음 크기. 모서리 손잡이는 Tab 한 칸이고 `←` `→` 너비, `↑` `↓` 높이, 포커스는 값이 바뀐 축으로 옮겨 간다. RTL 에서 `←` `→` 가 바뀐다 | 손잡이는 `separator` + `aria-orientation` `aria-valuenow` `aria-valuemin` `aria-valuemax` `aria-valuetext`("400px") `aria-controls`, 이름 "너비" "높이". 모서리 손잡이는 `group`("크기 조절") 안의 숨은 separator 둘(roving tabindex). 누를 영역 24px(모서리 손잡이는 호를 따라 폭 24px 의 띠). 모서리 손잡이의 포커스는 사각형 링 대신 호를 따라 `primary` 선과 3px 띠로 그린다 | 끌기(2.5.7)를 한 번 누르기로 대신할 방법이 없다. 키보드가 있지만 포인터 사용자를 위한 대안은 아니다. 모바일 스크린 리더는 separator 를 쓸어서 조절하지 못한다 |
| Splitter | [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) | 핸들마다 Tab 이 멈춘다. `←` `→`(세로 분할은 `↑` `↓`) 16px, `Shift`+방향키 64px, `Home` `End` 앞 패널의 가장 작은 크기와 가장 큰 크기, `Enter` 접기와 펼치기 | 핸들은 `separator` + `aria-orientation`(선의 방향) `aria-valuenow` `aria-valuemin` `aria-valuemax` `aria-valuetext`("30%", "접힘"), `aria-controls` 는 앞 패널 하나, 이름 "패널 크기 조절". 접기 버튼은 `aria-expanded` `aria-controls`. 크기가 0 인 패널은 `inert` | 끌기(2.5.7)는 방향키와 접기 버튼이 대신한다. 접기 버튼은 탭 순서에 없다(`Enter` 가 대신한다). APG 의 선택 키인 `F6` 패널 이동은 없다 |
| AspectRatio, Spacer | 없음 | 없음 | Spacer 는 `aria-hidden` | AspectRatio 에 `overflow-hidden` 을 주면 안의 포커스 링이 잘릴 수 있다 |
| Kbd | 없음 | 없음 | 기호는 숨기고 "커맨드", "왼쪽 화살표" 처럼 이름을 읽는다 | 없음 |
| Label | 없음 | 없음 | native 연결이 안 되는 위젯(`slider` 등)에는 `aria-labelledby` 를 붙이고 누르면 포커스를 옮긴다. `*` 는 `aria-hidden` | 필수라는 사실은 컨트롤의 `required` 가 전한다 |
| Group | 없음 | 안의 컨트롤마다 Tab 이 멈춘다 | `role="group"`. 이름은 `aria-label` | 이름을 주지 않으면 무엇을 묶었는지 읽지 않는다 |
| IdsProvider, Slot | 없음 | 없음 | 없음 | 없음 |

### navigation

| 컴포넌트 | APG 패턴 | 키보드 | 역할과 ARIA | 알려진 한계 |
| --- | --- | --- | --- | --- |
| Breadcrumb | [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) | 링크마다 Tab 이 멈춘다. 접힌 항목은 Menu 와 같다(`Enter` `Space` `↓` 열기, `↑` `↓`, `Escape`) | `nav` 랜드마크("이동 경로") 안의 `ol` `li`. 현재 페이지는 `aria-current="page"`, 구분자는 `aria-hidden`. 접기 버튼은 "숨은 경로 보기" + `aria-haspopup="menu"`, 접힌 링크는 `menuitem` | 한 페이지에 둘 이상 두면 `aria-label` 로 이름을 나눠야 한다. 구분자 자동 삽입은 `Breadcrumb` 이나 `Breadcrumb.List` 의 바로 아래 Item 만 센다 |
| Tabs | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | 탭 목록 전체가 Tab 한 칸이고 고른 탭에 멈춘다. `←` `→`(세로면 `↑` `↓`), `Home` `End`, 끝에서 처음으로 돈다. `automatic`(기본)은 옮기면 고르고, `manual` 은 `Enter` `Space` 로 고른다. 다음 Tab 은 내용(`tabpanel`)으로 | `tablist` + `aria-orientation`, 탭은 `tab` + `aria-selected` `aria-controls`, 내용은 `tabpanel` + `aria-labelledby` + `tabIndex=0`. 비활성 탭은 native `disabled` | 비활성 탭은 포커스를 받지 않고 건너뛴다(APG 는 포커스를 허용). 탭이 넘쳐도 목록이 스크롤하지 않는다. 목록 이름(`aria-label`)은 앱이 준다 |
| Stepper | 없음 (`ol` 목록 + [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), roving tabindex) | 목록 전체가 Tab 한 칸이고 현재 단계에서 멈춘다. 방향키 다음과 이전 단계(끝에서 멈춤), `Home` `End`, `Enter` `Space` 로 옮기기. `Stepper.Body` 안의 링크와 버튼은 단계와 따로 Tab 이 멈춘다 | 단계는 `ol` 의 `li`(이름 "진행 단계"), 누를 수 있으면 `button` + `aria-current="step"`, 이름은 제목과 "완료", "오류", 설명은 `aria-describedby`. 번호와 아이콘, 표시 자리의 Avatar 는 `aria-hidden`. 표시 전용이면 현재 `li` 에 `aria-current`. 기록(`progress={false}`)은 버튼과 `aria-current` 가 없고, 표시하지 않은 항목(neutral)은 상태 문구 없이 제목과 설명만 읽는다. `Body` 는 버튼 밖이라 이름과 설명에 들어가지 않는다 | linear 에서 먼 단계는 `disabled` 라 키보드로 들르지 않는다. 가로 방향에서도 `↑` `↓` 가 단계를 옮긴다. 기록의 목록 이름은 기본값이 없어 앱이 준다(없으면 개발 모드 경고만 한다). 기록에서 진행 중인 일은 상태 문구가 없어 제목의 글로 알린다 |
| Pagination | 없음 ([Landmark: navigation](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)) | 버튼과 링크마다 Tab 이 멈춘다. `Enter` `Space`(링크는 `Enter`), 안에서 `←` `→` 이전과 다음 페이지, `Home` `End` 첫 페이지와 마지막 페이지. 오른쪽에서 왼쪽으로 쓰는 화면에서는 `←` `→` 가 바뀐다 | `nav`(이름 "페이지 탐색") 안에 `ul` `li`. 현재 페이지는 `aria-current="page"`, 번호는 "N페이지", 화살표는 "이전 페이지" "다음 페이지". 생략은 `aria-hidden`. 끝에 닿은 링크는 `href` 를 떼고 `aria-disabled` | 한 화면에 둘이면 `aria-label` 로 구분해야 한다. 방향키로 페이지를 옮기는 것은 APG 에 없는 IDS 의 편의다 |

### overlay

| 컴포넌트 | APG 패턴 | 키보드 | 역할과 ARIA | 알려진 한계 |
| --- | --- | --- | --- | --- |
| Dialog | [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) | `Tab` 안에서 돈다, `Escape` 닫기 | `dialog` 또는 `alertdialog` + `aria-modal`, `aria-labelledby`(Title), `aria-describedby`(Description). trigger 는 `aria-haspopup="dialog"` `aria-expanded` | 이름이 없으면 개발 모드 경고만 한다 |
| Drawer | [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Dialog 와 같다. 손잡이는 `Enter` `Space` 로 다음 높이 | Dialog 와 같다. 높이가 둘 이상이면 손잡이가 `button`("끌어서 크기 조절") | 끌어서 닫기(2.5.7)는 Escape, 배경, 닫기 버튼이 대신한다 |
| Popover | [Dialog (non-modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | `Enter` `Space` 열기, `Escape` 닫기. 포커스는 trigger 에 남는다 | `dialog` + `aria-labelledby` `aria-describedby`, `modal` 이면 `aria-modal`. trigger 는 `aria-haspopup` `aria-expanded` `aria-controls` | 열어도 포커스를 옮기지 않는다. 옮기려면 `initialFocus` 를 준다 |
| Menu | [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) | `Enter` `Space` `↓` 첫 항목, `↑` 마지막 항목, `↑` `↓` 돈다, `Home` `End`, 글자 검색, `→` 하위 메뉴 열기, `←` `Escape` 닫기, `Tab` 전부 닫기 | `menu` + `menuitem` `menuitemcheckbox` `menuitemradio`, `group`. trigger 는 `aria-haspopup="menu"` `aria-expanded`. 명령 팔레트는 `combobox` + `listbox` | 우클릭 메뉴는 이름을 붙일 trigger 가 없어 `aria-label` 을 앱이 준다. 좁은 화면에서 세 단계부터 하위 메뉴가 겹친다 |
| Tooltip | [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) | 키보드 포커스로 열기, `Escape` 닫기 | `tooltip`, trigger 의 `aria-describedby` 에 이어진다 | 말풍선 위로 마우스를 옮기면 닫힌다(1.4.13). 터치로는 열리지 않는다. `disabled` 요소에는 열리지 않는다 |

## 수동 점검 체크리스트

사람이 직접 스크린 리더로 확인하고 결과 칸을 채웁니다.

- **조합.**
  - VoiceOver + Safari (macOS)
  - VoiceOver + Safari (iOS)
  - NVDA + Firefox (Windows)
  - TalkBack + Chrome (Android)
- **대상.** Storybook 의 각 컴포넌트 `Gallery` 와 기능별 스토리입니다. 모바일은 `pnpm build:storybook` 결과를 같은 네트워크에서 엽니다.
- **결과 표기.**
  - `통과`
  - `실패: <들린 문장 또는 동작>`
  - `해당 없음`
  - 실패하면 이슈 링크를 함께 적습니다.
- **점검 기록.** 점검한 날짜, 점검자, 운영체제와 스크린 리더 버전을 표 아래 "기록" 에 적습니다.

### 공통

| 점검 항목 | 기대 결과 | VO + Safari (macOS) | VO + Safari (iOS) | NVDA + Firefox | TalkBack + Chrome |
| --- | --- | --- | --- | --- | --- |
| 포커스 링 | 키보드로 옮긴 포커스마다 링이 보인다 |  |  |  |  |
| 200% 확대 | 확대해도 내용이 잘리거나 겹치지 않는다 |  |  |  |  |
| 모션 감소 | 설정을 켜면 전환 애니메이션이 사라진다 |  |  |  |  |
| 고대비와 강제 색 | Windows 고대비에서 컨트롤 경계와 포커스가 보인다 | 해당 없음 | 해당 없음 |  | 해당 없음 |

### 버튼과 토글

| 점검 항목 | 기대 결과 | VO + Safari (macOS) | VO + Safari (iOS) | NVDA + Firefox | TalkBack + Chrome |
| --- | --- | --- | --- | --- | --- |
| Button | 이름과 "버튼" 을 읽는다. 로딩 중이면 흐리게(dimmed) 읽는다 |  |  |  |  |
| IconButton | `aria-label` 을 이름으로 읽는다 |  |  |  |  |
| Toggle | "눌림" / "눌리지 않음" 을 읽고, 누르면 상태가 바뀌어 읽힌다 |  |  |  |  |
| ToggleGroup (하나) | "라디오 버튼, N 중 M" 을 읽고 방향키로 고른다 |  |  |  |  |
| ToggleGroup (여럿) | "도구 막대" 를 읽고 방향키로 항목을 옮긴다 |  |  |  |  |

### 폼

| 점검 항목 | 기대 결과 | VO + Safari (macOS) | VO + Safari (iOS) | NVDA + Firefox | TalkBack + Chrome |
| --- | --- | --- | --- | --- | --- |
| Field 라벨, 설명 | 입력에 들어가면 라벨, 역할, 설명을 차례로 읽는다 |  |  |  |  |
| Field 오류 | 제출 뒤 "잘못됨" 과 오류 문구를 읽는다 |  |  |  |  |
| 필수 | "필수" 를 읽는다. `*` 는 따로 읽지 않는다 |  |  |  |  |
| Checkbox 일부 선택 | "일부 선택" (mixed) 을 읽는다 |  |  |  |  |
| RadioGroup | 그룹 이름, "N 중 M" 을 읽고 방향키로 고른다 |  |  |  |  |
| Switch | "스위치, 켬 / 끔" 을 읽는다 |  |  |  |  |
| Slider | 값 문장(`aria-valuetext`)을 읽고 방향키로 바뀐 값을 읽는다 |  |  |  |  |
| 범위 Slider | 두 thumb 이 각자 이름과 값을 읽는다 |  |  |  |  |
| NumberField | "스핀 버튼" 과 값을 읽고 `↑` `↓` 로 바뀐 값을 읽는다 |  |  |  |  |
| OTPField | 입력 하나로 읽고 칸을 따로 읽지 않는다 |  |  |  |  |
| PasswordField | 보기 버튼이 "비밀번호 표시, 눌림" 을 읽는다. CapsLock 이 켜지면 알린다 |  |  |  |  |
| TextArea 글자 수 | 한도에 가까워지면 남은 글자 수를 한 번 알린다 |  |  |  |  |
| TextArea 크기 조절 | textarea 다음 Tab 에서 손잡이가 "높이", "분리자", 값("120px")을 읽고, 방향키로 바뀐 값을 읽는다 |  |  |  |  |
| Select | 열고 옵션을 오가면 옵션 이름과 "선택됨" 을 읽고, 고르면 새 값을 읽는다 |  |  |  |  |
| Select 검색 | 결과가 비면 "결과가 없습니다" 를 읽는다 |  |  |  |  |
| ChipField | 옵션을 가리키면 이름과 선택 상태를 읽고, 칩 사이를 방향키로 오간다. 한도 안내를 읽는다 |  |  |  |  |
| DateField | trigger 가 이름과 값을 읽고, 달력에서 날짜와 "선택됨" 을 읽는다 |  |  |  |  |
| TimeField | 컬럼 이름("시", "분")과 옵션을 읽는다 |  |  |  |  |
| ColorField, ColorPicker | trigger 가 이름과 색 값을, 영역이 "채도 N%, 밝기 N%" 를 읽는다 |  |  |  |  |
| FileField | 규칙 문구를 읽고, 거부된 파일의 사유를 알린다 |  |  |  |  |
| Rating | "5점 중 N점" 을 읽고 방향키로 바꾼다. 표시 전용은 그림으로 읽는다 |  |  |  |  |
| TelField | 국가 선택과 번호 입력을 각각 읽는다 |  |  |  |  |

### 데이터와 알림

| 점검 항목 | 기대 결과 | VO + Safari (macOS) | VO + Safari (iOS) | NVDA + Firefox | TalkBack + Chrome |
| --- | --- | --- | --- | --- | --- |
| Accordion | 헤더가 "펼침 / 접힘" 을 읽고 내용이 영역으로 읽힌다 |  |  |  |  |
| Tabs | "탭, N 중 M, 선택됨" 을 읽고, 방향키로 옮기면 새 탭 이름을 읽는다. 내용은 탭 이름을 가진 탭 패널로 읽힌다 |  |  |  |  |
| Calendar | 달을 바꾸면 새 달 이름을 읽는다 |  |  |  |  |
| TimePicker | 컬럼마다 이름과 선택된 값을 읽는다 |  |  |  |  |
| Table | 표 이름, 행과 열 수를 읽고, 표 탐색 키로 셀을 오가면 열 머리글과 행 머리글을 함께 읽는다 |  |  |  |  |
| DataTable | 정렬 버튼을 누르면 "오름차순 / 내림차순" 을 읽고, 체크박스가 행 이름과 "일부 선택" 을, 페이지를 넘기면 새 페이지 번호를 읽는다 |  |  |  |  |
| Card, Item (누르는 행) | 제목이 버튼으로 읽히고 설명이 뒤따른다. 카드 안의 다른 버튼에도 따로 갈 수 있다 |  |  |  |  |
| Carousel | 이름과 "캐러셀" 을 읽고, 슬라이드마다 "슬라이드, 5장 중 2번째" 를 읽는다. 다음 버튼을 누르면 새 자리를 한 번 알리고, 자동으로 넘기는 동안은 알리지 않는다. 화면 밖 슬라이드는 읽지 않고, 멈춤 버튼이 "눌림" 을 읽는다 |  |  |  |  |
| Chip | 켜는 칩이 "눌림" 을 읽고, 지우기 버튼이 이름을 읽는다 |  |  |  |  |
| Avatar, AvatarGroup | 사람 이름과 "외 N명" 을 읽는다 |  |  |  |  |
| QRCode | 그림으로 한 번, 준 이름만 읽고 URL 을 읽지 않는다 |  |  |  |  |
| Marquee | 그룹 이름을 읽고 항목을 한 번씩만 읽는다. 멈춤 버튼이 "일시 정지, 전환 버튼" 을 읽고, 누르면 "눌림" 을 읽는다. 동작 줄이기를 켜면 항목이 흐르지 않고 모두 보인다 |  |  |  |  |
| Badge | `aria-label` 문장을 읽고 값이 바뀌면 다시 알린다 |  |  |  |  |
| Empty | 제목(heading 이면 heading 으로)과 설명을 차례로 읽고, 나타날 때 끼어들어 알리지 않는다 |  |  |  |  |
| Alert | danger 는 즉시, info 는 기다렸다 알린다 |  |  |  |  |
| Toast | 나타나면 한 번 알리고, `F6` 으로 들어가 버튼을 쓰고 나온다 |  |  |  |  |
| Progress | 이름과 값 문장을 읽는다 |  |  |  |  |
| Skeleton | 불러오는 동안 모양과 감싼 내용을 읽지 않고 Tab 이 들어가지 않는다. 끝나면 같은 자리의 내용을 읽는다 |  |  |  |  |
| Spinner | "불러오는 중" 을 한 번만 읽는다 |  |  |  |  |

### 레이아웃

| 점검 항목 | 기대 결과 | VO + Safari (macOS) | VO + Safari (iOS) | NVDA + Firefox | TalkBack + Chrome |
| --- | --- | --- | --- | --- | --- |
| Splitter | 핸들이 이름, "구분선", 값("30%")을 읽고, 방향키로 바뀐 값과 접었을 때 "접힘" 을 읽는다. 접기 버튼이 "펼침 / 접힘" 을 읽는다 |  |  |  |  |
| Resizable 가장자리 | 이름("너비"), "분리자", 값("400px")을 읽고, 방향키로 바뀐 값을 읽는다 |  |  |  |  |
| Resizable 모서리 | "크기 조절" 묶음으로 들어가 "너비" 를 읽고, `↑` `↓` 를 누르면 "높이" 와 바뀐 값을 읽는다. Tab 은 한 번만 멈춘다 |  |  |  |  |

### 탐색

| 점검 항목 | 기대 결과 | VO + Safari (macOS) | VO + Safari (iOS) | NVDA + Firefox | TalkBack + Chrome |
| --- | --- | --- | --- | --- | --- |
| Pagination | 랜드마크 "페이지 탐색" 으로 읽고, 현재 페이지에서 "현재 페이지" 를 읽는다. 생략 표시는 읽지 않는다 |  |  |  |  |
| Stepper | 목록 이름("진행 단계")과 항목 수를 읽고, 현재 단계에서 "현재 단계" 를, 지난 단계에서 제목 뒤 "완료" 를 읽는다. 방향키로 옮기면 새 단계의 이름을 읽는다 |  |  |  |  |
| Stepper 기록 | `aria-label` 로 준 목록 이름과 항목 수를 읽는다. 표시하지 않은 항목은 제목과 시각만 읽고 "현재" 나 "완료" 를 읽지 않는다. 표시한 항목은 "완료", "오류" 를 읽는다 |  |  |  |  |
| Stepper.Body | 항목의 제목 뒤에 Body 의 글과 링크를 읽고, Tab 이 Body 의 링크와 버튼에 따로 멈춘다 |  |  |  |  |

### 오버레이

| 점검 항목 | 기대 결과 | VO + Safari (macOS) | VO + Safari (iOS) | NVDA + Firefox | TalkBack + Chrome |
| --- | --- | --- | --- | --- | --- |
| Dialog 열기 | 제목과 설명을 읽고 포커스가 안의 첫 요소로 간다 |  |  |  |  |
| Dialog 가두기 | 가상 커서(훑기)로도 뒤 페이지에 가지 않는다 |  |  |  |  |
| Dialog 닫기 | 닫으면 연 버튼으로 돌아와 그 이름을 읽는다 |  |  |  |  |
| Drawer | Dialog 와 같고, 손잡이 버튼이 이름을 읽는다 |  |  |  |  |
| Popover | trigger 가 "펼침" 을 읽고, 안으로 옮겨 가 내용을 읽는다 |  |  |  |  |
| Menu | 메뉴 이름과 "N 중 M" 을 읽고, 하위 메뉴가 "하위 메뉴" 로 읽힌다 |  |  |  |  |
| Menu 체크 항목 | "선택됨" 을 읽고 고르면 바뀐다 |  |  |  |  |
| 명령 팔레트 | 검색하면 가리킨 명령을 읽는다 |  |  |  |  |
| Tooltip | 포커스하면 설명을 이름 뒤에 읽는다 |  |  |  |  |

### 기록

| 날짜 | 점검자 | 조합 | 운영체제 버전 | 스크린 리더 버전 | 브라우저 버전 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
