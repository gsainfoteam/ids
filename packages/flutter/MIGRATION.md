# ids_flutter 컴포넌트 재구축

임시 문서. 마이그레이션이 끝나면 삭제한다. 설계 원칙은 [IDS Architecture.md](../../IDS%20Architecture.md).

## 원칙

- Flutter는 FE(`packages/react`)를 보고 짠다. FE보다 앞서 만들지 않는다.
- `lib/src/components/`는 전부 지우고 컴포넌트 단위로 다시 만든다.
- `lib/theme/`, `lib/tokens/`, `lib/src/layout/ids_axis.dart`는 지우지 않는다.
- 컴포넌트 하나마다 PR 하나, widgetbook usecase 동반.

## 기준 커밋

삭제 직전 상태. 별도 백업 폴더는 두지 않는다.

```bash
git show ed74578:packages/flutter/lib/src/components/tabs/ids_tabs.dart
git show ed74578:packages/flutter/lib/src/components/
git show ed74578:packages/flutter/example/lib/components/card_usecase.dart
```

## 결정 사항

- **StateMask는 만들지 않는다.** 상태는 배경색 알파로 표현한다. 상태 감지는 `useInteractive`의 Flutter 대응물 `IdsInteractive`.
- **로컬 enum은 만들지 않는다.** `IdsSize`/`IdsVariant`로 안 되는 축은 `packages/core/tokens/enums.json`에 추가한다. 추가는 FE가 그 컴포넌트를 만들 때 한다.
- **치수는 React가 기준.** 예: Button tiny radius 8, standard 좌우 패딩 18.
- **`dragged`는 지금 넣지 않는다.** FE `useInteractive`에 들어올 때 따라간다.

이전 기록에서 참조하는 것: 컴포넌트 목록, 서브컴포넌트 조립 구조, 다뤘던 기능·상태.
참조하지 않는 것: 로컬 enum, 치수, 상태 처리 방식.

이전 코드의 로컬 enum — `IdsCardVariant`, `IdsCardSize`, `IdsDialogSize`, `IdsEmptyVariant`, `IdsFloatingButtonVariant`.

## 분류

**A — FE 구현됨. 지금 옮긴다.** React 구현과 README가 스펙. 이전 기록 참조 안 함.

`button` `icon_button` `divider` `spacer`

**B — FE 목록에 있으나 미구현. FE가 만든 뒤 옮긴다.** 그동안 패키지에서 빠져 있다.

`text` `heading` `hstack` `vstack` `avatar` `badge` `card` `item` `empty` `dialog` `tabs` `floating_button` `checkbox`

**C — FE에만 있음. 지금 옮긴다.**

`Toggle` `IconToggle` `ToggleGroup` `TextField` `TextFieldGroup` `ButtonGroup` `Spinner` `Label` `Kbd` `AspectRatio`

**예외.** `bottom_navigation`은 FE 목록에 없다. Flutter 단독, 이전 기록이 출발점.
FE의 `Slot` `FocusTrap` `DirectionProvider` `When`은 Flutter에 필요 없을 수 있다. 차례에 판단.

`Text`가 없는 동안 컨트롤 안의 텍스트는 `lib/tokens/ids_typography.dart` 상수를 `DefaultTextStyle`로 직접 쓴다.

## 옮겨야 할 규약

### `useInteractive` → `IdsInteractive`

```text
{ hovered, active, focused, focusVisible, pressed, disabled }
```

- `active`(누르는 중)와 `pressed`(외부 주입, Toggle의 on)는 별개
- 시각 효과는 `focusVisible`에만
- hover는 마우스일 때만
- Enter / Space로도 `active`
- `onPointerCancel`에서 `active`, `hovered` 복구
- 스타일 적용은 `pressed > active > hovered` 우선순위로 하나만. state 객체는 원시값 그대로
- `onInteractionChange`로 부모에 미러링. controlled 아님
- 대부분의 prop을 `T | (state) => T`로 받음

| React                             | Flutter                                         |
| --------------------------------- | ----------------------------------------------- |
| `onPointerEnter/Leave`            | `MouseRegion`                                   |
| `onPointerDown/Up/Cancel`         | `Listener` 또는 `GestureDetector`               |
| `onFocus/Blur` + `:focus-visible` | `Focus` + `FocusManager.instance.highlightMode` |
| `onKeyDown` Enter/Space           | `Focus.onKeyEvent` 또는 `Shortcuts`/`Actions`   |
| `T \| (state) => T`               | `ValueBuilder<IdsInteractiveState>` 계열        |

### control surface — Button / IconButton / Toggle 공통

[control-surface.ts](../react/src/components/control-surface.ts) 그대로. 배경 알파(`primary` 기준):

|           | default | hover | active / pressed |
| --------- | ------- | ----- | ---------------- |
| `solid`   | 1.0     | 0.90  | 0.80             |
| `soft`    | 0.15    | 0.20  | 0.25             |
| `outline` | 투명    | 0.10  | 0.15             |
| `ghost`   | 투명    | 0.10  | 0.15             |

- 전경: `solid`만 `onPrimary`, 나머지 `primary`
- `outline`: 안쪽 1px 테두리. `Border.all`은 바깥으로 나가므로 주의
- `active`: scale 0.98
- `focusVisible`: 2px outline, offset 2, primary
- `disabled`: opacity 0.40
- reduced motion: 전환 없음, scale 1.0
- `standard` h44 / px18 / r12, `tiny` h32 / px10 / r8

### 그룹 size

자식은 `size`를 생략하거나 그룹과 같아야 한다. 어긋나면 개발 중 에러. [group.tsx](../react/src/components/group.tsx) `useGroupedSize`.

## 순서

1. `IdsInteractive` — 상태 추가가 breaking이 아니게
2. `IdsButton` — `Toggle`·`ButtonGroup` 확장을 염두
3. `IdsIconButton`
4. 나머지 A, 그다음 C
5. B는 FE 순서대로. `bottom_navigation`은 Flutter 단독

## 삭제 시 같이 손보는 것

- `lib/ids.dart` — `src/components/**` export 제거
- `example/lib/components/*_usecase.dart` — 삭제. 새 컴포넌트마다 다시 작성
- `example/lib/main.dart` — usecase import 정리
- `test/widget_test.dart` — enum만 확인하므로 그대로

## 삭제되는 API (기준 커밋 기준)

```dart
// ── A ──
IdsButton({ required VoidCallback? onPressed, required List<Widget> children,
            IdsVariant variant = solid, IdsSize size = standard, bool disabled = false })
IdsIconButton({ required Widget Function(Color, double) icon, IdsVariant variant, IdsSize size,
                bool disabled, VoidCallback? onPressed, required String label })
IdsDivider({ IdsDividerOrientation orientation, double thickness })
  enum IdsDividerOrientation { horizontal, vertical }
IdsSpacer({ int flex })

// ── B ──
IdsText(String data, { TextStyle style = IdsTypography.bodyB2Regular, Color? color,
        TextAlign? align, int? maxLines, TextOverflow? overflow })
IdsHeading(String data, { TextStyle style = IdsTypography.headlineH5Semibold, Color? color, TextAlign? align })

IdsHStack({ required List<Widget> children, double gap = 0, MainAxis mainAxis = start,
            CrossAxis crossAxis = stretch, IdsStackFit fit = fill, TextBaseline textBaseline = alphabetic })
IdsVStack({ required List<Widget> children, double gap = 0, MainAxis mainAxis = start,
            CrossAxis crossAxis = stretch, IdsStackFit fit = fill })
  // lib/src/layout/ids_axis.dart
  enum MainAxis { start, center, end, between, around, evenly }
  enum CrossAxis { start, center, end, stretch, baseline }
  enum IdsStackFit { fill, content }

IdsAvatar({ String? src, String? name, IdsSize size = standard })
IdsBadge(String data, { IdsVariant variant = soft, IdsSize size = tiny })

IdsCard({ required Widget child, IdsCardVariant variant = outline, IdsCardSize size = md,
          VoidCallback? onPressed, bool interactive = false })
  enum IdsCardVariant { outline, elevated, filled, ghost }
  enum IdsCardSize { sm 10, md 16, lg 24 }  // 안쪽 패딩
  IdsCardHeader({ children }), IdsCardTitle(data), IdsCardDescription(data),
  IdsCardContent({ child }), IdsCardFooter({ child })

IdsItem({ required List<Widget> children, VoidCallback? onPressed })
  IdsItemLeading({ child }), IdsItemContent({ children }), IdsItemTitle(data),
  IdsItemDescription(data), IdsItemTrailing({ child })

IdsEmpty({ required List<Widget> children, IdsEmptyVariant variant = default_ })
  enum IdsEmptyVariant { default_ 48, compact 24 }  // 패딩
  IdsEmptyMedia({ child }), IdsEmptyTitle(data), IdsEmptyDescription(data), IdsEmptyActions({ children })

IdsDialog({ required bool open, required List<Widget> children, ValueChanged<bool>? onOpenChanged,
            IdsDialogSize size = md, bool dismissible = true })
  enum IdsDialogSize { sm 320, md 420, lg 560, xl 720, full }  // 최대 너비
  IdsDialogHeader({ children }), IdsDialogTitle(data), IdsDialogContent({ child }), IdsDialogFooter({ children })

IdsTabs<T>({ required List<IdsTabItem<T>> items, T? value, T? defaultValue, ValueChanged<T>? onChanged })
  IdsTabItem<T>({ required T value, required String label, required Widget child, bool disabled = false })
  // StatefulWidget. value/defaultValue로 controlled/uncontrolled 전환

IdsBottomNavigation({ required int currentIndex, required ValueChanged<int> onTap,
                      required List<IdsBottomNavigationItem> items })
  IdsBottomNavigationItem({ required Widget Function(Color, double) icon, required String label })

IdsFloatingButton({ required List<Widget> children, IdsFloatingButtonVariant variant = solid,
                    IdsSize size = standard, IdsFloatingPlacement placement = bottomRight,
                    bool disabled = false, VoidCallback? onPressed, required String semanticLabel })
  enum IdsFloatingButtonVariant { solid, surface }
  enum IdsFloatingPlacement { topLeft, topRight, bottomLeft, bottomRight }

IdsCheckbox({ required bool checked, required ValueChanged<bool>? onChanged, bool indeterminate = false,
              bool disabled = false, bool invalid = false, IdsSize size = standard, String? semanticLabel })
```
