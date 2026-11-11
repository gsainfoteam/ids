# ids_flutter 컴포넌트 재구축

임시 문서. 마이그레이션이 끝나면 삭제하고, [RULES.md](RULES.md)의 이 문서 링크도 지운다. 설계 원칙은 [IDS Architecture.md](../../IDS%20Architecture.md).

## 원칙

- 컴포넌트의 존재 여부와 조립 구조는 FE(`packages/react`)를 따른다. FE에 없는 컴포넌트는 먼저 만들지 않는다.
- 컴포넌트 하나마다 커밋 하나, widgetbook usecase 동반. 여러 컴포넌트를 한 브랜치에 모아 PR로 올린다.

| 무엇              | 기준                    | 예                                                       |
| ----------------- | ----------------------- | -------------------------------------------------------- |
| 시각값            | **Figma**, 없으면 React | 높이, padding, radius, 색, 상태별 알파, 모션 duration    |
| 구조 · API · 상태 | **React**               | prop 이름, 서브컴포넌트 조립, 상태 집합, 그룹 전파 규칙  |
| 플랫폼 대응       | **이 문서**             | `focusVisible` 판정, `strokeAlignInside`, Semantics 주입 |

- Figma(Infoteam Design System)에는 Action, Form 페이지만 있다. 그 밖의 컴포넌트는 React 값을 쓴다.
- Notion이나 `IDS Architecture.md`가 코드와 다르면 위 표의 기준을 따른다.

## 기준 커밋

컴포넌트를 지우기 직전 상태. 이전 코드는 여기서 본다.

```bash
git show ed74578:packages/flutter/lib/src/components/
git show ed74578:packages/flutter/example/lib/components/card_usecase.dart
```

## 결정 사항

- **이름.** 컴포넌트에는 `Ids` prefix를 붙이지 않는다. 생성 토큰 타입과 `IdsScope`·`IdsTheme`·`IdsRadius`에만 붙인다. Flutter SDK·Material과 이름이 겹치면 사용하는 쪽이 `as ids`로 import한다.
- **상태.** `Interactive`가 상태를 감지하고, 컴포넌트는 배경색 알파로 표현한다. StateMask는 만들지 않는다. `Interactive`는 상태만 내보내고, 배경 알파·focus ring·disabled는 control surface 값이 정한다. React의 `useInteractive` / `control-surface.ts`와 같은 분리다. Flutter에는 `:focus-visible`이 없으므로 `TextField`도 `Interactive`를 쓴다.
- **토큰.** 색만 코드젠한다. brand·status·neutral 색이 `lib/tokens/ids_color_tokens.dart`로 나오고 `IdsTheme` getter로 읽는다. radius는 `lib/theme/ids_radius.dart`, 컨트롤·아이콘 크기와 컴포넌트 치수는 각 컴포넌트 안의 상수로 둔다. spacing은 생성하지 않는다 (React도 Tailwind 눈금을 쓴다). 상태 알파는 core에 없고 [control-surface.ts](../react/src/internal/control-surface.ts)에만 있으며, Flutter도 한 파일에 둔다.
- **enum.** 여러 컴포넌트가 공유하는 축(`IdsSize` `IdsVariant`, React가 `internal/`이나 `tokens/`에 둔 타입)은 `packages/core/tokens/enums.json`에서 생성한다. 컴포넌트 하나만 쓰는 축(React가 그 컴포넌트 폴더에 둔 타입)은 그 컴포넌트 파일의 enum으로 두고, 값은 React와 같게 한다. Flutter가 새 값을 정하지 않는다.
- **`colorScheme`.** 컴포넌트 색은 `colorScheme` prop이고 값은 `primary` `neutral` `danger` `success` `warning` `info`다. 공유 축이므로 처음 쓰는 컴포넌트에서 `enums.json`에 올린다.
- **아이콘.** 기본 아이콘(Avatar fallback, Empty media 등)은 Material Icons를 쓴다.
- **`Group`** 은 내부 전용이다. React처럼 export하지 않고 `ButtonGroup`·`ToggleGroup`이 공유한다.
- **`Text`** 가 없는 동안 텍스트는 `lib/tokens/ids_typography.dart` 상수를 `DefaultTextStyle`로 쓴다.

## 분류

컴포넌트 이름과 분류는 React 폴더([CLAUDE.md](../../CLAUDE.md))를 따른다.

**FE 구현, Flutter 미구현.** 옮긴다.

| 분류       | 컴포넌트                                                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| action     | `Button` `IconButton` `ButtonGroup` `Toggle` `IconToggle` `ToggleGroup` `FloatingButton`                                                                                                                                                            |
| form       | `Input` `TextField` `TextArea` `NumberField` `PasswordField` `TelField` `OTPField` `ChipField` `FileField` `ColorField` `Select` `Checkbox` `CheckboxGroup` `Radio` `RadioGroup` `Switch` `Slider` `Rating` `DateField` `TimeField` `DateTimeField` |
| data       | `Accordion` `Calendar` `Carousel` `Chip` `ColorPicker` `DataTable` `Image` `Marquee` `QRCode` `Table` `TimePicker`                                                                                                                                  |
| feedback   | `Alert` `Progress` `Toast`                                                                                                                                                                                                                          |
| layout     | `ScrollArea` `Resizable` `Splitter`                                                                                                                                                                                                                 |
| navigation | `Breadcrumb` `Pagination` `Stepper` `Tabs`                                                                                                                                                                                                          |
| overlay    | `Dialog` `Drawer` `Menu` `Popover` `Tooltip`                                                                                                                                                                                                        |
| typography | `Kbd`                                                                                                                                                                                                                                               |

**FE 미구현.** FE가 만든 뒤 옮긴다: `Text` `Heading` `HStack` `VStack`. `HStack`·`VStack`의 enum은 `lib/src/layout/ids_axis.dart`에 있다.

**예외.**

- `Spacer`는 Flutter SDK 위젯을 re-export한다.
- `Slot`은 만들지 않는다. `asChild`는 조합으로 대신한다.
- `BottomNavigation`은 Flutter 단독이다. 이전 코드(`currentIndex` `onTap`, item은 `icon` `label`)가 출발점이다.

**선행 컴포넌트를 기다리는 기능.** 선행 컴포넌트를 만들 때 함께 추가한다.

- `Tooltip`: `AvatarGroup`의 `+N`에 마우스를 올리면 숨은 사람들의 이름을 보여 준다 (React `AvatarGroup.Overflow`의 `title`).

## 옮겨야 할 규약

### `useInteractive` → `Interactive`

```text
{ hovered, active, focused, focusVisible, pressed, disabled }
```

- `active`(누르는 중)와 `pressed`(외부 주입, Toggle의 on)는 별개
- `focused`에는 시각 효과가 없다. 포커스 링은 `focusVisible`에만
- hover는 마우스일 때만
- Enter / Space로도 `active`
- `onPointerCancel`에서 `active`, `hovered` 복구
- `disabled`가 되면 `hovered`, `active`를 버린다. 비활성 요소에는 pointer leave·up이 오지 않는다
- 스타일 적용은 `pressed > active > hovered` 우선순위로 하나만. state 객체는 원시값 그대로
- `onInteractionChange`로 부모에 미러링. controlled 아님
- `Interactive` 안의 `Interactive`를 누르면 바깥은 포커스를 가져가지 않고 `onPressed`도 부르지 않는다. 안쪽이 `disabled`여도 같다 (React `isFromNestedControl`)
- 포인터로는 누름이 확정된 뒤(`onTap`)에 포커스를 가져간다. React는 pointer down에 가져가지만, Flutter의 tap down은 누가 눌릴지 정해지기 전에 온다. 그래서 안쪽 컨트롤(`TextField`, Material 버튼 포함)을 누르거나 스크롤로 바뀐 누름은 바깥의 포커스를 옮기지 않는다
- 키로 생긴 `active`는 primary focus를 잃으면 버린다. 포커스가 자식으로 내려가도 같다
- `T | (state) => T`: `Button` `IconButton` `Toggle` `IconToggle` `FloatingButton`의 prop 대부분(`children` `variant` `size` `colorScheme` …). 이벤트 핸들러, `disabled`, `pressed`, `value`는 제외

| React                             | Flutter                                       |
| --------------------------------- | --------------------------------------------- |
| `onPointerEnter/Leave`            | `MouseRegion`                                 |
| `onPointerDown/Up/Cancel`         | `Listener` 또는 `GestureDetector`             |
| `onFocus/Blur` + `:focus-visible` | `Focus` + 포커스 원인 추적 (아래 참고)        |
| `onKeyDown` Enter/Space           | `Focus.onKeyEvent` 또는 `Shortcuts`/`Actions` |
| `T \| (state) => T`               | `ValueBuilder<InteractiveState>` 계열         |

**`focusVisible`.** `Interactive`가 포커스 원인을 직접 추적한다. 포커스를 얻는 시점에 한 번 계산하고, blur에서 `false`로 되돌린다. `FocusManager.instance.highlightMode`는 전역 입력 모드라서 그것만으로는 마우스 클릭에도 링이 뜬다.

```text
focusVisible = focused
            && 자기 자신의 탭으로 얻은 포커스가 아님
            && highlightMode == FocusHighlightMode.traditional
```

| 포커스 원인                                  | `focusVisible` |
| -------------------------------------------- | -------------- |
| Tab / 방향키 이동                            | `true`         |
| 마우스 클릭                                  | `false`        |
| 터치 탭                                      | `false`        |
| `requestFocus()` — 직전 입력이 키보드·마우스 | `true`         |
| `requestFocus()` — 직전 입력이 터치          | `false`        |

위 표가 `Interactive` 위젯 테스트의 계약이다.

**`Button`을 옮길 때 정한다.** 지금은 다루지 않는다.

- 자리는 지키고 동작만 끄는 모드. 지금 `PressableSurface`(Card, Item)는 `onPressed`가 없으면 `Interactive`를 빼고 그려서, `onPressed`가 null과 함수 사이로 바뀌면 안쪽 State가 초기화된다
- 스크롤 안에서 짧게 탭해도 `active`가 보이는 최소 유지 시간
- 누르는 중에 안쪽 `Interactive`가 사라지면 바깥이 눌린다
- `focusNode`를 바꾸면 이전 노드의 링이 남는다
- `select`·`gameButtonA` 키 (TV, 게임패드)

### control surface — Button / IconButton / Toggle / IconToggle 공통

색과 상태별 값은 [control-surface.ts](../react/src/internal/control-surface.ts), [brand-fill.ts](../react/src/internal/brand-fill.ts), [toggle-surface.ts](../react/src/internal/toggle-surface.ts)에서 읽는다. `Button` 때 Figma와 대조한다. Flutter 대응:

- 테두리는 `DecoratedBox` + `Border.all(width: 1)` (기본 `strokeAlignInside`, 높이 불변) + 안쪽 `Padding`. `Container(decoration:)`는 자식을 1px inset한다
- `focusVisible`: 바깥 3px 링(ring 색 40%)과 안쪽 1px 테두리를 ring 색으로
- 전환은 색·배경·테두리·그림자, 시간은 `IdsMotion.fast`. reduced motion이면 전환 없음
- Semantics는 컴포넌트가 주입한다 (button, label, enabled. Toggle은 `toggled`)
- 크기 (radius는 모두 `IdsRadius.standard`):

|            | 높이 | 좌우 | 아이콘 쪽 | 간격 | 아이콘 | 글자                  |
| ---------- | ---- | ---- | --------- | ---- | ------ | --------------------- |
| `standard` | 36   | 16   | 12        | 8    | 16     | `buttonStandard` (14) |
| `tiny`     | 32   | 12   | 10        | 6    | 14     | `buttonTiny` (12)     |

### 그룹 전파

그룹은 `orientation`, `size`, `variant`를 내려준다. 자식은 자기 값이 있으면 그것을 쓰고, 없으면 그룹 값을 쓴다(`size ?? group.size ?? standard`, `variant ?? group.variant ?? solid`). 어긋나도 throw하지 않는다. 그룹 안의 그룹은 바깥 그룹 값을 물려받는다. [group](../react/src/components/utility/group/root.tsx) 참고.
