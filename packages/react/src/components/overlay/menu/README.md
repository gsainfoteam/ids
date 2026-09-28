# Menu

버튼을 누르거나 영역을 우클릭하면 뜨는 명령 목록입니다. `triggerType="command"` 면 검색으로 명령을 고르는 명령 팔레트가 됩니다. 값을 고르는 입력은 `Select`, 버튼 옆에 자유로운 내용을 띄우려면 `Popover` 를 씁니다.

- **여는 법.** trigger 를 누르거나, trigger 에 포커스를 두고 Enter, Space, ↓ 를 누르면 첫 항목으로, ↑ 를 누르면 마지막 항목으로 포커스가 갑니다. 마우스로 열면 메뉴 자체에 포커스가 갑니다.
- **움직이는 법.** ↑ ↓ 는 끝에서 반대편 끝으로 돌아갑니다. Home, End 는 처음과 끝으로 갑니다. disabled 항목은 건너뜁니다. 글자를 치면 그 글자로 시작하는 항목으로 갑니다.
- **고르는 법.** 클릭, Enter, Space. 고르면 하위 메뉴까지 모두 닫히고 포커스는 trigger 로 돌아갑니다. `onSelect` 에서 `event.preventDefault()` 하면 열린 채로 둡니다.
- **닫는 법.** Escape 는 맨 위 메뉴 하나만 닫습니다(하위 메뉴가 열려 있으면 하위 메뉴만). 바깥을 누르면 전부 닫히고 포커스는 누른 곳에 남습니다. Tab 은 전부 닫고 trigger 로 돌아갑니다.
- **하위 메뉴.** 올려 두거나 → 키, Enter, Space 로 열고, ← 키나 Escape 로 닫습니다. 하위 메뉴로 가는 대각선 길에서는 다른 항목이 반응하지 않습니다. 몇 단계든 겹칠 수 있습니다.
- **우클릭 메뉴.** `triggerType="contextmenu"` 면 trigger 영역을 우클릭한 자리에 뜹니다.

```tsx
import { Menu } from '@gsainfoteam/ids-react';

<Menu>
  <Menu.Trigger asChild>
    <Button variant="outline">편집</Button>
  </Menu.Trigger>
  <Menu.Content>
    <Menu.Item onSelect={copy}>
      <DocumentDuplicateIcon />
      복사
      <Menu.Shortcut keys="mod+c" />
    </Menu.Item>
    <Menu.Item disabled>붙여넣기</Menu.Item>
    <Menu.Separator />
    <Menu.Sub>
      <Menu.SubTrigger>공유</Menu.SubTrigger>
      <Menu.SubContent>
        <Menu.Item>메일로 보내기</Menu.Item>
        <Menu.Item>링크 복사</Menu.Item>
      </Menu.SubContent>
    </Menu.Sub>
  </Menu.Content>
</Menu>;
```

## 구조

| 파트                 | 역할                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| `Menu.Trigger`       | 여는 버튼. `asChild` 로 다른 버튼에 붙인다. `contextmenu` 면 우클릭을 받는 영역   |
| `Menu.Content`       | 메뉴 본체(`role="menu"`). 닫혀 있으면 렌더하지 않는다                             |
| `Menu.Item`          | 명령 하나(`menuitem`). `asChild` 로 링크(`<a>`)에 붙일 수 있다                    |
| `Menu.CheckboxItem`  | 켜고 끄는 항목(`menuitemcheckbox`)                                                |
| `Menu.RadioGroup`    | 하나만 고르는 묶음. 안에 `Menu.RadioItem`(`menuitemradio`)을 둔다                 |
| `Menu.ItemIndicator` | 고른 항목 끝의 표시. 체크(체크박스), 점(라디오) 대신 다른 모양을 넣을 때만 적는다 |
| `Menu.Group`         | 항목 묶음(`role="group"`). 안의 `Menu.Label` 이 이름이 된다                       |
| `Menu.Label`         | 묶음의 제목. 고를 수 없다                                                         |
| `Menu.Separator`     | 구분선                                                                            |
| `Menu.Shortcut`      | 항목 끝의 단축키 표시. `Kbd` 라서 `keys="mod+c"` 가 운영체제에 맞게 그려진다      |
| `Menu.Sub`           | 하위 메뉴. 안에 `Menu.SubTrigger` 와 `Menu.SubContent` 를 둔다                    |
| `Menu.Search`        | 명령 팔레트의 검색 상자(`combobox`). 적지 않으면 기본 검색 상자가 들어간다        |
| `Menu.Empty`         | 명령 팔레트에서 맞는 항목이 없을 때의 문구. 기본 "결과가 없습니다."               |

- `Menu.Content` 는 trigger 의 글자를 이름으로 씁니다(`aria-labelledby`). 우클릭 메뉴는 이름을 붙일 trigger 가 없으므로 `aria-label` 을 줍니다.
- 하위 메뉴의 이름은 "〇〇 하위 메뉴" 입니다.

## 항목

```tsx
<Menu.Item onSelect={(event) => event.preventDefault()}>열린 채로</Menu.Item>
<Menu.Item disabled>못 고름</Menu.Item>
<Menu.Item textValue="Settings">⚙️ 설정</Menu.Item>        // 글자 검색에 쓸 글자
<Menu.Item asChild><a href="/help">도움말</a></Menu.Item>  // Enter 도 링크를 연다
```

- `onSelect(event)` 의 `event` 는 취소할 수 있는 `Event` 입니다. `preventDefault()` 하면 메뉴가 닫히지 않습니다.
- 항목 앞의 아이콘은 그냥 자식으로 넣습니다. 크기는 메뉴가 맞춥니다.

## 체크박스와 라디오

```tsx
const [grid, setGrid] = useState(true);
const [zoom, setZoom] = useState('100');

<Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>격자 표시</Menu.CheckboxItem>
<Menu.RadioGroup value={zoom} onValueChange={setZoom}>
  <Menu.Label>확대</Menu.Label>
  <Menu.RadioItem value="75">75%</Menu.RadioItem>
  <Menu.RadioItem value="100">100%</Menu.RadioItem>
</Menu.RadioGroup>
```

- 상태는 늘 제어해서 넘깁니다. 메뉴는 닫히면 사라지므로 안에 둔 상태가 남지 않습니다. 그래서 `defaultChecked`, `defaultValue` 는 없습니다.
- 고르면 메뉴가 닫힙니다. 여러 개를 이어서 바꾸게 하려면 `onSelect={(event) => event.preventDefault()}` 를 줍니다.

## 위치

```tsx
<Menu.Content side="bottom" align="start" sideOffset={4} />   // 기본
<Menu.Content align="end" />                                   // trigger 의 끝에 맞춘다
<Menu.SubContent side="right" sideOffset={2} alignOffset={-5} /> // 하위 메뉴 기본
```

- 자리가 모자라면 반대쪽으로 뒤집히고, 화면 가장자리에서 8px 안쪽에 머뭅니다.
- 하위 메뉴는 부모 하위 메뉴가 놓인 쪽으로 이어서 엽니다. 부모가 왼쪽으로 뒤집혔으면 자식도 왼쪽으로 열려서, 한 단계 위의 메뉴를 덮지 않습니다. 그쪽에 자리가 없을 때만 다시 뒤집힙니다.
- 폭은 trigger 폭과 8rem 중 큰 값 이상입니다. 높이는 화면에 남은 만큼이고, 넘치면 메뉴 안에서 스크롤합니다.

## 우클릭 메뉴

```tsx
<Menu triggerType="contextmenu">
  <Menu.Trigger className="h-40 border border-dashed">여기를 우클릭하세요</Menu.Trigger>
  <Menu.Content aria-label="편집">...</Menu.Content>
</Menu>
```

- trigger 는 `div` 입니다. 우클릭한 점의 오른쪽 아래에 뜨고, 열린 채로 다시 우클릭하면 그 자리로 옮깁니다.
- 영역 안을 왼쪽 버튼으로 누르면 닫힙니다.
- 터치의 길게 누르기는 브라우저가 `contextmenu` 를 보낼 때만 엽니다(iOS Safari 는 보내지 않습니다).

## 여러 단계의 하위 메뉴

```tsx
<Menu.Sub>
  <Menu.SubTrigger>내보내기</Menu.SubTrigger>
  <Menu.SubContent>
    <Menu.Sub>
      <Menu.SubTrigger>이미지</Menu.SubTrigger>
      <Menu.SubContent>
        <Menu.Sub>
          <Menu.SubTrigger>JPEG</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item>고화질</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.SubContent>
    </Menu.Sub>
  </Menu.SubContent>
</Menu.Sub>
```

- 깊이에 제한은 없습니다. 단계마다 레이어가 하나씩 쌓여서 Escape 와 ← 는 가장 깊은 하위 메뉴 하나만 닫고, 포커스는 그 메뉴를 연 `Menu.SubTrigger` 로 돌아갑니다.
- 바깥을 누르면 모든 단계가 한 번에 닫히고 `onOpenChange(false)` 는 단계마다 한 번씩만 불립니다.
- 좁은 화면에서는 세 단계부터 서로 겹칩니다. 네 단계 넘게 겹치는 메뉴는 `Menu.Group` 이나 Dialog 로 나누는 편이 읽기 쉽습니다.

## 명령 팔레트

```tsx
<Menu triggerType="command" hotkey="mod+k">
  <Menu.Trigger asChild>
    <Button variant="outline">
      명령 찾기 <Kbd keys="mod+k" size="tiny" />
    </Button>
  </Menu.Trigger>
  <Menu.Content>
    <Menu.Search />
    <Menu.Group>
      <Menu.Label>문서</Menu.Label>
      <Menu.Item onSelect={createDocument}>
        새 문서 <Menu.Shortcut keys="mod+n" />
      </Menu.Item>
    </Menu.Group>
    <Menu.Separator />
    <Menu.Group>
      <Menu.Label>보기</Menu.Label>
      <Menu.CheckboxItem checked={dark} onCheckedChange={setDark}>어두운 화면</Menu.CheckboxItem>
    </Menu.Group>
    <Menu.Empty>일치하는 명령이 없습니다.</Menu.Empty>
  </Menu.Content>
</Menu>
```

- **모양.** trigger 에 붙지 않고 화면 위쪽(15vh) 가운데에 뜨는 modal 입니다. 배경을 누르면 닫히고, 포커스는 팔레트 안에 갇히고, 페이지는 스크롤되지 않고 스크린 리더에게 숨겨집니다.
- **여는 법.** `hotkey`(예: `"mod+k"`, `mod` 는 macOS 에서 ⌘, 그 밖에서 Ctrl)를 문서 어디서든 누르면 열고 닫습니다. IME 로 글자를 조합하는 중에는 반응하지 않습니다. `Menu.Trigger` 는 없어도 되고, `open` / `defaultOpen` / `onOpenChange` 도 그대로 씁니다.
- **거르기.** 검색어가 항목의 `textValue`, 없으면 글자에 들어 있으면 보입니다. 대소문자, 전각/반각, 악센트(`é` = `e`)는 가리지 않고 한글도 그대로 찾습니다. 보이는 항목이 없는 `Menu.Group` 은 `Menu.Label` 과 함께 숨고, 숨은 그룹 옆의 `Menu.Separator` 도 숨습니다.
- **움직이는 법.** 포커스는 늘 검색 상자에 있습니다. ↑ ↓ 는 끝에서 반대편 끝으로 돌아가고, Home, End 는 처음과 끝으로 갑니다. 검색어가 바뀌면 첫 항목이 강조됩니다. 마우스를 올려도 강조됩니다.
- **고르는 법.** Enter 나 클릭. 고르면 닫히고 포커스는 연 곳으로 돌아갑니다. `onSelect` 에서 `preventDefault()` 하면 열린 채로 둡니다. 조합 중의 Enter 는 고르지 않습니다.
- **닫는 법.** Escape, 배경 클릭, `hotkey`. 포커스는 열기 전에 있던 곳으로 돌아갑니다.
- **접근성.** 팔레트는 `role="dialog"`(이름 기본 "명령", `aria-label` 로 바꿈), 검색 상자는 `combobox`(`aria-activedescendant` 로 강조된 항목을 가리킴), 목록은 `listbox`, 항목은 `option` 입니다. 체크박스, 라디오 항목은 `aria-checked` 도 가집니다.
- `Menu.Sub` 는 명령 팔레트에서 쓸 수 없습니다. 개발 중에는 경고하고 아무것도 그리지 않습니다. 대신 `Menu.Group` 으로 나눕니다.

```tsx
const route = await overlay.open<string>(({ close }) => (
  <Menu triggerType="command">
    <Menu.Content aria-label="이동">
      <Menu.Item onSelect={() => close('/settings')}>설정</Menu.Item>
    </Menu.Content>
  </Menu>
));
```

- `open` 없이 `overlay.open` 안에서 그리면 Dialog 처럼 그 항목에 붙습니다. 닫히면 항목도 닫힙니다.

## 대화상자 열기

```tsx
<Menu.Item
  onSelect={async () => {
    const name = await overlay.open<string>(({ close }) => <RenameDialog onDone={close} />);
  }}
>
  이름 바꾸기…
</Menu.Item>
```

- 메뉴는 먼저 닫히고 포커스는 trigger 로 갑니다. 대화상자가 닫히면 포커스는 다시 trigger 로 돌아옵니다.

## 상태

| 속성                      | 붙는 곳                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `data-popup-open`         | 열려 있는 동안의 `Menu.Trigger`, `Menu.SubTrigger`         |
| `data-open`               | 열린 `Menu.Content`, `Menu.SubContent`                     |
| `data-ending-style`       | 닫히는 애니메이션 동안의 `Menu.Content`, `Menu.SubContent` |
| `data-side`, `data-align` | 실제로 놓인 쪽과 정렬                                      |
| `data-highlighted`        | 포커스된 항목, 명령 팔레트에서 강조된 항목                 |
| `data-disabled`           | disabled 항목                                              |
| `data-checked`            | 켜진 `Menu.CheckboxItem`, 고른 `Menu.RadioItem`            |

## 속성

| 속성                   | 기본 / 동작                                 |
| ---------------------- | ------------------------------------------- |
| `open` / `defaultOpen` | 열림 상태. 기본 `false`                     |
| `onOpenChange`         | 열거나 닫으려 할 때                         |
| `triggerType`          | `click`(기본) / `contextmenu` / `command`   |
| `hotkey`               | `command` 에서 여닫는 단축키. 예: `"mod+k"` |

`Menu.Sub` 도 `open`, `defaultOpen`, `onOpenChange` 를 받습니다. 부모 메뉴와 함께 닫힐 때는 하위 메뉴의 `onOpenChange` 를 부르지 않습니다.

## 알아둘 것

- 메뉴는 제자리에 렌더하고 브라우저의 top layer 에 올립니다. 부모의 `overflow`, `transform` 에 잘리지 않고, 가까운 `IdsProvider` 의 theme 을 그대로 씁니다. 하위 메뉴도 부모 메뉴 안에 렌더됩니다.
- 메뉴는 modal 이 아닙니다. 열려 있어도 페이지는 스크롤되고 스크린 리더에게 숨겨지지 않습니다. 명령 팔레트만 modal 입니다.
- 명령 팔레트의 거르기는 React 자식의 글자를 읽습니다. 글자를 그리는 컴포넌트로 감싼 항목은 `textValue` 를 줍니다.
- 항목의 이름에는 `Menu.Shortcut` 의 글자도 들어갑니다(예: "복사 커맨드 C").
