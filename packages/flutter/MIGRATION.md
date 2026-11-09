# ids_flutter 컴포넌트 재구축

임시 문서. 마이그레이션이 끝나면 삭제한다. 삭제 전에 아래 미결 건을 이슈로 옮기고, [RULES.md](RULES.md)의 이 문서 링크도 지운다. 설계 원칙은 [IDS Architecture.md](../../IDS%20Architecture.md).

## 원칙

- FE(`packages/react`)에 없는 컴포넌트를 먼저 만들지 않는다. 컴포넌트의 존재 여부와 조립 구조는 FE를 따른다.
- `lib/src/components/`는 전부 지우고 컴포넌트 단위로 다시 만든다.
- `lib/theme/`, `lib/tokens/`, `lib/src/layout/ids_axis.dart`는 지우지 않는다.
- 컴포넌트 하나마다 커밋 하나, widgetbook usecase 동반. 여러 컴포넌트를 한 브랜치에 모아 PR 하나로 올린다. `example/lib/components/`는 비어 있으니 usecase도 새로 쓴다.

### 무엇을 어디서 가져오는가

| 무엇              | 기준        | 예                                                      |
| ----------------- | ----------- | ------------------------------------------------------- |
| 시각값            | **Figma**   | 높이, padding, radius, 색, 상태별 알파, 모션 duration    |
| 구조 · API · 상태 | **React**   | prop 이름, 서브컴포넌트 조립, 상태 집합, 그룹 전파 규칙  |
| 플랫폼 대응       | **이 문서** | `focusVisible` 판정, `strokeAlignInside`, Semantics 주입 |

## 기준 커밋

삭제 직전 상태. 별도 백업 폴더는 두지 않는다.

```bash
git show ed74578:packages/flutter/lib/src/components/tabs/ids_tabs.dart
git show ed74578:packages/flutter/lib/src/components/
git show ed74578:packages/flutter/example/lib/components/card_usecase.dart
```

## 결정 사항

- **StateMask는 만들지 않는다.** 상태는 배경색 알파로 표현한다. 상태 감지는 `useInteractive`의 Flutter 대응물 `Interactive`.
- **`Interactive`는 그리지 않는다.** 상태만 내보내고 배경 알파·scale·focus ring·disabled는 control surface 값 파일이 정한다. React의 `useInteractive` / `control-surface.ts` 분리와 같다. 그래서 Figma를 보지 않는다.
- **`TextField`도 `Interactive`를 쓴다.** React는 `Button`·`Toggle`만 쓰고 `TextField`는 네이티브 `:focus-visible`로 처리한다. Flutter엔 의사클래스가 없다.
- **로컬 enum은 만들지 않는다.** `IdsSize`/`IdsVariant`로 안 되는 축은 `packages/core/tokens/enums.json`에 추가한다. 추가는 FE가 그 컴포넌트를 만들 때 한다.
- **치수·상태 알파는 Figma가 기준.** Figma에 없으면 React 값을 쓴다. core에 `radius.json`·`size.json`은 있으나 dart formatter가 없어 `lib/tokens/`로 나오지 않는다. 상태 알파(`--ids-state-*`)는 core에 아예 없고 [control-surface.ts](../react/src/internal/control-surface.ts)에만 있다. Flutter는 이 값을 파일 한 곳에만 둔다. 값이 굳으면 core로 올리고 `sd.config.js`에 dart formatter를 켠다.
- **컴포넌트 색은 `colorScheme` prop이다.** FE의 Button, IconButton, Toggle, IconToggle, FloatingButton, Badge, Chip, Alert, Progress에 있다. 컨트롤의 값은 `primary` `neutral` `danger` `success` `warning` `info`. `enums.json`에는 아직 없고 React의 TS 타입(`ControlColorScheme`)이다. 옮기는 컴포넌트에서 쓰일 때 `enums.json`에 올린다.
- **설계 문서(Notion, `IDS Architecture.md`)와 다른 곳.** 시각값은 Figma를 보고 닫는다. 나머지는 코드를 따르고 미결로 둔다.

  시각값 — 그 컴포넌트를 만들 때 Figma에서 확인하고 아래 control surface 절에 값을 적는다.

  - soft: 코드는 `primary`/10 + 전경 `primary`. 문서는 `primary-weak` + `on-primary-weak` (core에 없는 토큰)
  - disabled: 코드는 opacity 0.50. 문서는 opacity-50 또는 disabled 토큰 (core에 없음)
  - 치수: 코드는 `standard` h36 / px16 / r10. 문서와 어긋나는지 미확인

  코드 규약 — Figma로 닫히지 않는다. 미결.

  - 그룹 size: 코드는 불일치 시 항상 throw, `variant`는 전파 안 함. 문서는 자식 명시값 우선
  - `Ids` prefix: 컴포넌트에는 붙이지 않는다 (React와 같음). 생성 토큰 타입과 `IdsScope`·`IdsTheme`에만 남긴다. Flutter SDK·Material과 이름이 겹치면 사용하는 쪽이 `as ids`로 import한다
  - size / variant: `enums.json`의 `standard` `tiny` / `solid` `soft` `outline` `ghost`. 문서의 `sm`/`md`/`lg`, `link`는 코드에 없음
  - spacing: core에 `spacing.json`은 있으나 `ids_spacing.dart`가 없다. 위 dart formatter 건과 같다

이전 기록에서 참조하는 것: 컴포넌트 목록, 서브컴포넌트 조립 구조, 다뤘던 기능·상태.
참조하지 않는 것: 로컬 enum, 치수, 상태 처리 방식.

이전 코드의 로컬 enum — `IdsCardVariant`, `IdsCardSize`, `IdsDialogSize`, `IdsEmptyVariant`, `IdsFloatingButtonVariant`.

## 분류

**A — FE 구현됨. 지금 옮긴다.** 구조는 React 구현과 README, 시각값은 Figma. 이전 기록 참조 안 함. C도 같다.

`button` `icon_button` `divider` `spacer` `avatar` `badge` `card` `item` `floating_button` `checkbox`

**B — FE 목록에 있으나 미구현. FE가 만든 뒤 옮긴다.** 그동안 패키지에서 빠져 있다.

`text` `heading` `hstack` `vstack` `empty` `dialog` `tabs`

**C — FE에만 있음. 지금 옮긴다.**

`Toggle` `IconToggle` `ToggleGroup` `TextField` `ButtonGroup` `Spinner` `Label` `Kbd` `AspectRatio`

`TextFieldGroup`은 FE에서 `TextField`로 합쳐졌다(#24).

**D — FE에 새로 생김. 옮길 순서는 미정.**

`Field` `TextArea` `NumberField` `PasswordField` `TelField` `OTPField` `Input` `Select` `ChipField` `FileField` `ColorField` `CheckboxGroup` `Radio` `RadioGroup` `Switch` `Slider` `Rating` `DateField` `TimeField` `DateTimeField` `Calendar` `TimePicker` `ColorPicker` `Accordion` `AvatarGroup` `Chip` `Alert` `Progress` `Group`

`Group`은 컴포넌트가 아니다. React에서도 `index.ts` export가 없는 내부 파일이라 `ButtonGroup`·`ToggleGroup`이 공유한다. 분류에 넣지 않는다.

**예외.** `bottom_navigation`은 FE 목록에 없다. Flutter 단독, 이전 기록이 출발점.
FE의 `Slot` `FocusTrap` `DirectionProvider` `When`은 Flutter에 필요 없을 수 있다. 차례에 판단.

`Text`가 없는 동안 컨트롤 안의 텍스트는 `lib/tokens/ids_typography.dart` 상수를 `DefaultTextStyle`로 직접 쓴다.

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
- `disabled`가 되면 `hovered`, `active`를 버린다. 비활성 요소에는 pointer leave·up이 오지 않아 남기 때문이다
- 스타일 적용은 `pressed > active > hovered` 우선순위로 하나만. state 객체는 원시값 그대로
- `onInteractionChange`로 부모에 미러링. controlled 아님
- `T | (state) => T`: `Button` `IconButton` `Toggle` `IconToggle` `FloatingButton`의 prop 대부분(`children` `variant` `size` `colorScheme` `className` `style` …). 이벤트 핸들러, `ref`, `disabled`, `pressed`, `value`는 제외

| React                             | Flutter                                       |
| --------------------------------- | --------------------------------------------- |
| `onPointerEnter/Leave`            | `MouseRegion`                                 |
| `onPointerDown/Up/Cancel`         | `Listener` 또는 `GestureDetector`             |
| `onFocus/Blur` + `:focus-visible` | `Focus` + 포커스 원인 추적 (아래 참고)        |
| `onKeyDown` Enter/Space           | `Focus.onKeyEvent` 또는 `Shortcuts`/`Actions` |
| `T \| (state) => T`               | `ValueBuilder<InteractiveState>` 계열      |

**`focusVisible`.** `FocusManager.instance.highlightMode`만으로 정하지 않는다. 전역 입력 모드라서 마우스 입력도 `traditional`이고, 그대로 쓰면 마우스 클릭으로 포커스된 컨트롤에도 포커스 링이 뜬다. React는 포커스를 얻는 시점의 `:focus-visible`을 스냅샷하므로 마우스 클릭에는 링이 없다.

`Interactive`가 포커스 원인을 직접 추적한다. 포커스를 얻는 시점에 한 번 계산하고, blur에서 `false`로 되돌린다.

```text
focusVisible = focused
            && 자기 자신의 pointer down으로 얻은 포커스가 아님
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

### control surface — Button / IconButton / Toggle / IconToggle 공통

[control-surface.ts](../react/src/internal/control-surface.ts) 그대로. `colorScheme`이 색 여섯 개를 정하고 variant가 그 색을 쓴다. 아래 값은 임시값이다. `Button` 때 Figma로 덮어쓴다.

| `colorScheme`                       | fill / on-fill          | accent       | quiet        | hover     | ring      |
| ----------------------------------- | ----------------------- | ------------ | ------------ | --------- | --------- |
| `primary`                           | `primary` / `onPrimary` | `primary`    | `onSurface`  | `muted`   | `primary` |
| `neutral`                           | `onSurface` / `surface` | `onSurface`  | `onSurface`  | `muted`   | `primary` |
| `danger` `success` `warning` `info` | 그 색 / `on-` 색        | `-strong` 색 | `-strong` 색 | 그 색 10% | 그 색     |

|           | 배경 default                   | hover     | active / pressed | 전경    | 테두리·그림자                  |
| --------- | ------------------------------ | --------- | ---------------- | ------- | ------------------------------ |
| `solid`   | fill                           | fill 0.90 | fill 0.80        | on-fill | 그림자 `shadow-xs`             |
| `soft`    | fill 0.10                      | fill 0.15 | fill 0.20        | accent  | 없음                           |
| `outline` | `surface` (dark: `muted` 0.30) | hover     | hover            | quiet   | 안쪽 1px `border`, `shadow-xs` |
| `ghost`   | 투명                           | hover     | hover            | quiet   | 없음                           |

- 테마 색은 `solid`·`soft`만 쓴다. `outline`·`ghost`는 중립(`quiet`, `hover`)이다. `primary`와 `neutral`의 hover는 `muted`다
- `outline` 테두리는 중립 `border`(neutral 200 · dark 800)다. `IdsTheme`에는 아직 없다: 중립 색은 `ids_theme.dart`에 손으로 적혀 있고 `border`가 빠져 있다. `DecoratedBox` + `Border.all(width: 1)` (기본 `strokeAlignInside`, 높이 불변) + 안쪽 `Padding`. `Container(decoration:)`는 자식을 1px inset하므로 쓰지 않는다
- Toggle·IconToggle은 크기와 `colorScheme`은 같고 variant만 [toggle-surface.ts](../react/src/internal/toggle-surface.ts)를 따른다. 꺼져 있으면 모두 투명(`outline`만 테두리)이고 hover·active는 hover 색이다. 켜지면(`pressed`) `ghost`·`outline`은 hover 색, `soft`는 fill 0.10 + accent, `solid`는 fill + on-fill
- `active`는 배경만 바뀐다. scale 없음
- `focusVisible`: 바깥 3px 링(ring 색 0.40)과 안쪽 1px 테두리를 ring 색으로. offset outline이 아니다
- `disabled`: opacity 0.50. 로딩(`aria-busy`) 중에는 커서만 바뀐다
- 전환은 색·배경·테두리·그림자, 시간은 `IdsMotion.fast`. reduced motion: 전환 없음
- Semantics는 컴포넌트가 내부에서 주입 (button, label, enabled. Toggle은 `toggled` 추가 — React의 `aria-pressed`)
- 크기(radius는 모두 `standard` 10):

|            | 높이 | 좌우 | 아이콘 쪽 | 간격 | 아이콘 | 글자                  |
| ---------- | ---- | ---- | --------- | ---- | ------ | --------------------- |
| `standard` | 36   | 16   | 12        | 8    | 16     | `buttonStandard` (14) |
| `tiny`     | 32   | 12   | 10        | 6    | 14     | `buttonTiny` (12)     |

### 그룹 전파

그룹은 `orientation`, `size`, `variant`를 내려준다. 자식은 자기 값이 있으면 그것을 쓰고, 없으면 그룹 값을 쓴다(`size ?? group.size ?? standard`, `variant ?? group.variant ?? solid`). 어긋나도 throw하지 않는다. 그룹 안의 그룹은 바깥 그룹 값을 물려받는다. [group](../react/src/components/utility/group/index.tsx) `useGroupContext`.

## 순서

1. `Interactive` — 상태 추가가 breaking이 아니게
2. `Button` — `Toggle`·`ButtonGroup` 확장을 염두
3. `IconButton`
4. 나머지 A, 그다음 C
5. B는 FE 순서대로. `bottom_navigation`은 Flutter 단독

## 이전 구조 (B와 `bottom_navigation`만)

서브컴포넌트 조립 구조와 다뤘던 기능만 적는다. `text` `heading`은 적을 구조가 없어 뺐다. 정확한 시그니처는 기준 커밋에서 본다.

- `hstack` `vstack`: `gap` `mainAxis` `crossAxis` `fit`. enum은 남아 있는 `lib/src/layout/ids_axis.dart`
- `empty`: Media / Title / Description / Actions
- `dialog`: Header / Title / Content / Footer. `open` `onOpenChanged` `dismissible`
- `tabs`: `TabItem(value, label, child, disabled)`. `value`/`defaultValue`로 controlled/uncontrolled
- `bottom_navigation`: `currentIndex` `onTap`, item은 `icon` `label`
