# Kbd

키보드 키와 단축키를 키 모양으로 보여 줍니다. 단축키 안내, 메뉴, 명령 팔레트에 씁니다. 키를 등록하지는 않습니다.

- **플랫폼에 맞춰 그립니다.** `keys="mod+k"` 처럼 핫키 라이브러리와 같은 문자열로 적으면 Mac과 iPhone, iPad에서는 `⌘K`, 그 밖에서는 `Ctrl+K` 로 그립니다.
- **수식 키 순서를 맞춥니다.** 어떤 순서로 적어도 Apple은 `⌃⌥⇧⌘`, 그 밖은 `Win Ctrl Alt Shift` 메뉴 순서로 정렬합니다. `+` 표시도 Apple에서는 빼고 그 밖에서는 넣습니다.
- **글자와 같은 높이.** 문장 속 키는 주변 글자의 대문자 높이 가운데에 섭니다. 한글 글자 몸의 가운데와 같은 높이라, `vertical-align: middle`(x-height 기준)처럼 1px 가라앉지 않습니다. flex 행 안에서는 행의 가운데 정렬을 따릅니다.
- **아이콘 크기는 키가 정합니다.** 메뉴 행처럼 안의 아이콘을 모두 키우는 곳에서도 키 기호는 키 크기를 지킵니다.
- **기호는 아이콘으로 그립니다.** Apple 의 `⌘` `⌥` `⇧` `↩` `⌫` 와 방향키는 글자가 아니라 아이콘(lucide)이라, 글꼴과 상관없이 키 한가운데에 놓입니다.
- **기호에 이름을 붙입니다.** `⌘` `⇧` `←` 같은 기호는 스크린 리더가 제대로 읽지 못해서, 기호는 숨기고 "커맨드" "시프트" "왼쪽 화살표" 를 대신 읽게 합니다. children으로 적은 기호에도 적용됩니다.
- **어느 배경에서나.** 키 모양은 주변 글자색에서 옅게 칠해져 본문, solid 버튼, 어두운 툴팁 위에서 따로 꾸미지 않아도 어울립니다.
- **서버 렌더링.** 서버는 방문자의 플랫폼을 모르므로 `Ctrl` 로 그리고, 하이드레이션 직후 Apple 기기에서 `⌘` 로 바꿉니다. 경고는 나지 않습니다.

```tsx
import { Kbd } from '@gsainfoteam/ids-react';

<Kbd keys="mod+k" />      {/* Mac: ⌘ K, Windows: Ctrl + K */}
<Kbd>Esc</Kbd>
```

## 키 적기

```tsx
<Kbd keys="mod+shift+p" />        // 문자열
<Kbd keys={['mod', 'shift', 'P']} /> // 배열
<Kbd keys="$mod+KeyK" />          // tinykeys 문법도 된다
<Kbd keys="mod++" />              // 끝의 +는 + 키
<Kbd>K</Kbd>                       // 글자 그대로
<Kbd>⌘K</Kbd>                      // 한 칸에 적은 기호도 이름을 읽는다
```

| 이름                                     | Apple   | 그 밖              |
| ---------------------------------------- | ------- | ------------------ |
| `mod`                                    | ⌘       | Ctrl               |
| `meta` (`cmd`, `command`, `win`)         | ⌘       | Win                |
| `ctrl` (`control`)                       | ⌃       | Ctrl               |
| `alt` (`option`, `opt`)                  | ⌥       | Alt                |
| `shift`                                  | ⇧       | Shift              |
| `enter` (`return`)                       | ↩       | Enter              |
| `backspace`                              | ⌫       | Backspace          |
| `delete` (`del`)                         | ⌦       | Del                |
| `escape` (`esc`)                         | Esc     | Esc                |
| `tab`                                    | ⇥       | Tab                |
| `space`                                  | Space   | Space              |
| `up` `down` `left` `right` (`arrowup` …) | ↑ ↓ ← → | ↑ ↓ ← →            |
| `pageup` `pagedown` `home` `end`         | ⇞ ⇟ ↖ ↘ | PgUp PgDn Home End |
| `capslock` `fn`                          | ⇪ fn    | Caps Lock Fn       |

- 대소문자를 가리지 않습니다. 한 글자 키는 대문자로 그립니다. 표에 없는 이름(`F5`, `/`)은 적은 그대로 그립니다.

## 플랫폼

```tsx
<Kbd keys="mod+k" />                    // 방문자의 기기를 따른다
<Kbd keys="mod+k" platform="apple" />   // 고정
<Kbd keys="mod+k" separator=" " />      // 키 사이 표시 바꾸기. null이면 없음
```

## 묶기

```tsx
<Kbd.Group size="tiny">
  <Kbd keys="mod" />
  <span>다음</span>
  <Kbd>G</Kbd>
</Kbd.Group>
```

- `Kbd.Group` 은 `<kbd>` 안에 `<kbd>` 를 넣어 여러 키가 하나의 입력임을 나타냅니다. `size`, `platform`, `labels` 는 안쪽 Kbd로 이어집니다.
- `keys` 에 키를 여럿 적으면 Kbd가 알아서 같은 묶음을 만듭니다.

## 크기

```tsx
<Kbd size="standard" />   // 20px 높이 (기본)
<Kbd size="tiny" />       // 16px 높이
```

- 크기를 주지 않으면 `Kbd.Group`, 그다음 `Field` 의 크기를 따릅니다.

## 읽는 이름 바꾸기

```tsx
<Kbd keys="mod+k" labels={{ command: 'Command', control: 'Control' }} />
```

- 기본 이름은 한국어입니다(`커맨드`, `컨트롤`, `시프트` …).

## 상태

| 상태          | 뜻                             |
| ------------- | ------------------------------ |
| `size`        | 적용된 크기                    |
| `platform`    | 그린 플랫폼. `apple` / `other` |
| `combination` | 키 여러 개를 묶어 그렸다       |

- 키 칸에는 `data-kbd`, 묶음에는 `data-kbd-group`, 둘 다 `data-size` 와 `data-platform` 이 붙습니다. `+` 표시에는 `data-kbd-separator` 가 붙습니다.

## 속성

| 속성        | 기본 / 동작                                                    |
| ----------- | -------------------------------------------------------------- |
| `keys`      | 단축키 문자열이나 배열. 없으면 `children` 을 그린다            |
| `size`      | `standard` / `tiny`. 생략하면 Group → Field → `standard`       |
| `platform`  | `apple` / `other`. 생략하면 기기를 따른다                      |
| `separator` | 키 사이 표시. Apple은 없음, 그 밖은 `+`                        |
| `labels`    | 스크린 리더가 읽을 키 이름                                     |
| `className` | 키 칸(묶음이면 바깥 `<kbd>`)으로 간다. 상태를 받는 함수도 된다 |
| 그 외 속성  | `<kbd>` 로 간다                                                |

## 알아둘 것

- 키를 누르는 동작은 등록하지 않습니다. 단축키는 앱이 `useHotkeys('mod+k', …)` 같은 라이브러리로 등록하고, 같은 문자열을 `keys` 에 넘기면 됩니다.
- 글자를 선택할 수 없습니다(`select-none`). 복사할 필요가 있는 코드라면 `<code>` 를 쓰세요.
