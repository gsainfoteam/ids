# field-popup

필드가 여는 팝업과 그 안의 목록을 그리는 공용 코드입니다. 보통은 trigger 에 붙는 popover 이고, `mobileVariant="drawer"` 인 필드는 640px 보다 좁은 화면에서 아래에서 올라오는 modal drawer 가 됩니다.

| 파일                       | 내용                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| [`index.tsx`](#indextsx)   | `FieldPopup`, `revealPopupOption`, 다른 파일의 다시 내보내기      |
| [`layer.ts`](#layerts)     | drawer 판정(`useDrawerPresentation`), top layer, 열린 팝업의 스택 |
| [`styles.ts`](#stylests)   | `popupStyle`, `fieldTrigger`, `fieldListbox`                      |
| [`header.tsx`](#headertsx) | drawer 머리의 제목과 닫기 버튼(`FieldPopupHeader`)                |
| [`search.tsx`](#searchtsx) | 목록 위의 검색 상자(`FieldPopupSearch`)                           |
| [`parts.ts`](#partsts)     | 파트 헬퍼 `part`, `resolveState`                                  |

## 쓰는 곳

| 컴포넌트                                      | 가져가는 것                                                                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Select                                        | `FieldPopup`, `useDrawerPresentation`, `revealPopupOption`, `FieldPopupSearch`, `fieldTrigger`, `fieldListbox`, `part`, `resolveState` |
| ChipField                                     | `FieldPopup`, `useDrawerPresentation`, `revealPopupOption`, `FieldPopupSearch`, `fieldTrigger`, `fieldListbox`, `part`, `resolveState` |
| ColorField                                    | `FieldPopup`, `FieldPopupHeader`, `useDrawerPresentation`, `fieldTrigger`, `part`, `resolveState`                                      |
| [temporal-field](../temporal-field/README.md) | `FieldPopup`, `FieldPopupHeader`, `part`                                                                                               |
| FileField                                     | `fieldTrigger`, `part`, `resolveState`                                                                                                 |
| TimePicker                                    | `part`                                                                                                                                 |
| ColorPicker                                   | `resolveState`                                                                                                                         |

- `search.tsx` 는 `index.tsx` 가 다시 내보내지 않습니다. `internal/field-popup/search` 에서 직접 가져옵니다.

## index.tsx

### 쓰는 법

```tsx
// components/form/chip-field/index.tsx
{s.open && (
  <FieldPopup
    anchor={rootRef}
    onClose={field.actions.close}               // (restoreFocus: boolean) => void
    mobileVariant={mobileVariant}
    matchWidth
    label={merged['aria-label'] ?? messages.chipField.listbox}
    aria-labelledby={drawer ? labelledBy : undefined}
  >
    {popup}
  </FieldPopup>
)}

// components/form/select/use-select.ts: 활성 옵션을 목록 안에서 보이게
revealPopupOption(node, { center: !revealed.current });   // 처음 열 때만 가운데로
revealed.current = true;
```

| prop                            | 뜻                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `anchor`                        | 위치의 기준. 이 요소 안의 누르기와 포커스는 바깥으로 치지 않는다                                       |
| `onClose(restoreFocus)`         | 포커스를 trigger 로 돌려야 하면 `true`. popover 바깥을 누른 경우는 포커스가 누른 곳으로 가므로 `false` |
| `mobileVariant`                 | `'drawer'` 면 좁은 화면에서 drawer. 기본 `'popover'`                                                   |
| `preferredWidth` / `matchWidth` | 최소 폭(기본 240px). anchor 보다 좁아지지 않는다. `matchWidth` 면 anchor 와 같은 폭                    |
| `initialFocusSelector`          | 열 때 포커스를 줄 요소                                                                                 |
| `label`                         | `role` 이 있는 팝업(drawer 는 `dialog`)에 `aria-label`, `aria-labelledby` 가 없을 때의 이름            |

### 왜 이렇게

- 팝업은 portal 없이 제자리에 렌더하고 `popover="manual"` 로 native top layer 에 올립니다. DOM 위치가 그대로라 IDS theme(`data-color`, `data-mode`)을 물려받고, top layer 라서 조상의 `overflow` 에 잘리지 않습니다.
- Popover API 가 없는 엔진(jsdom 포함)에서는 `position: fixed` 와 `z-50` 이 대신합니다.

#### popover

- floating-ui 로 anchor 를 따라갑니다(`autoUpdate`).
- 열린 쪽에 내용이 들어가는 동안은 그쪽을 지킵니다. 방금 놓인 쪽(`landedSide`)을 다음 계산의 placement 로 되먹이므로, 필터링으로 줄어드는 목록이 trigger 반대편으로 건너뛰지 않습니다. `flip` 의 후보는 반대쪽 하나입니다.
- 높이는 처음부터 상한으로 둡니다(`capHeightBeforeFirstFlip`). 첫 flip 이 긴 목록의 전체 길이가 아니라 팝업이 실제로 가질 높이로 판단합니다.
- UA 가 popover 에 주는 `inset: 0` 을 `right`, `bottom` 에서 `auto` 로 풉니다(`undoPopoverUaInset`). 그대로 두면 상자가 과하게 제약되고, RTL 에서는 브라우저가 `right` 대신 `left` 를 버립니다.
- 위아래 어디에도 안 들어가는 팝업도 화면 안에 남깁니다(`shift`, `limitShift`). 필요하면 trigger 를 덮지만 trigger 를 떠나지는 않아서, trigger 가 스크롤로 사라지면 팝업도 따라갑니다.
- `size` 가 폭, `maxHeight`, `--anchor-width` 를 정합니다. 높이는 `MIN_HEIGHT`(120px)와 `maxHeight` 사이입니다.

#### drawer

- 아래쪽 sheet 입니다. 좌우 여백은 8px(`VIEWPORT_MARGIN`), 높이는 520px(`DRAWER_MAX_HEIGHT`)와 visual viewport 높이의 70% 중 작은 쪽입니다.
- 화면 키보드는 visual viewport 만 줄이고 fixed 요소가 쓰는 layout viewport 는 그대로 둡니다. 그래서 키보드가 덮는 만큼(`coveredByKeyboard`) sheet 를 올립니다.
- modal 입니다: 어두운 배경, focus trap, 페이지 스크롤 잠금(`RemoveScroll`), `role="dialog"`, `aria-modal`.
- 스크롤은 잠그지만 pinch zoom 은 막지 않습니다(`allowPinchZoom`). 저시력 사용자에게 필요합니다.
- focus trap 은 초기 포커스, Escape, 포커스 되돌리기를 하지 않습니다(`initialFocus: false`, `escapeDeactivates: false`, `returnFocusOnDeactivate: false`). 셋 다 `FieldPopup` 이 직접 합니다.
- 필드는 sheet 를 닫으면서 포커스를 자기 trigger 로 돌려보내는데, sheet 가 unmount 되기 전이라 trap 이 포커스를 다시 안으로 당깁니다. window 의 capture `focusin` 은 document 에 있는 trap 의 리스너보다 먼저 들리므로, trigger 로 가는 포커스를 보면 trap 을 먼저 풉니다(`releaseBeforeTrapPullsFocusBack`).
- 열린 팝업이 drawer 로 바뀌면 배경(`clickableBackdrop`)을 먼저 top layer 에 올리고 팝업을 다시 올립니다([`moveToTopOfTopLayer`](#layerts)). top layer 는 올린 순서로 쌓입니다.

#### 닫기

| 동작               | popover                        | drawer                                       |
| ------------------ | ------------------------------ | -------------------------------------------- |
| Escape             | 닫고 포커스를 되돌린다(`true`) | 같다                                         |
| 바깥 `pointerdown` | 닫는다(`false`)                | 무시한다. 배경의 `click` 으로 닫는다(`true`) |
| 포커스가 바깥으로  | 닫는다(`false`)                | trap 이 막는다                               |

- drawer 가 `pointerdown` 에서 닫히면 배경이 click 전에 사라져서 click 이 아래 페이지에 떨어지고, 그 누르기가 trigger 로 돌아간 포커스를 페이지로 옮깁니다. 그래서 drawer 는 `click` 에서 닫습니다(`closesOnBackdropClickInstead`, RULES.md 의 Overlays).
- 바깥 누르기는 포커스도 옮기는데, 그 포커스 이동은 같은 닫기의 일부입니다(`closedByOutsidePress`). `open` 을 제어하는 쪽이 팝업을 열어 둔 채로 두어도 같은 닫기를 두 번 듣지 않습니다. 키를 누르면 이 표시를 지웁니다.
- Escape 는 가장 위의 팝업만 닫습니다(`isTopPopup`). IME 조합 중이거나 이미 처리된(`defaultPrevented`) Escape 는 무시합니다.

#### 초기 포커스

- 순서: `initialFocusSelector` 에 맞는 요소, `[data-popup-autofocus]` 요소, drawer 면 첫 tabbable 또는 팝업 자신. popover 는 앞의 둘이 없으면 포커스를 trigger 에 그대로 둡니다.
- 한 번만 합니다(`initialFocusDone`). 다만 열린 채 drawer 로 바뀌었는데 포커스가 밖에 있으면 다시 합니다(`sheetMissingFocus`). modal sheet 는 포커스를 쥐어야 합니다.

#### revealPopupOption

- 팝업 안 스크롤 부모의 `scrollTop` 을 직접 바꿉니다(`scrollWithinPopup`). top layer 뒤의 문서는 스크롤하지 않습니다.
- `center` 는 옵션을 가운데에 둡니다. 목록은 선택한 옵션을 가운데에 두고 열려야 합니다.
- 위치 계산은 비동기라 열린 뒤에도 팝업이 줄어들 수 있습니다. 첫 배치 전의 가운데 맞추기는 기억했다가 배치가 끝나면 다시 합니다(`firstPlacementLanded`, `recenterAfterFirstPlacement`, `onPlacementLanded`).
- 옵션 위치는 가능하면 `offsetTop` 으로 읽습니다(`unscaledOffsetsApply`). `getBoundingClientRect` 는 열릴 때의 scale 애니메이션(`starting:scale-95`)을 받아 긴 목록에서 몇 줄씩 어긋납니다. `offsetTop` 은 스크롤 부모가 옵션의 offset parent 일 때만 맞으므로 `fieldListbox.list` 가 `relative` 입니다.

### 알아둘 것

- `onClose` 는 최신 값을 ref 에 둡니다. 렌더마다 새 함수를 넘겨도 리스너를 다시 붙이지 않습니다.
- 이벤트 target 이 Node 인지는 `instanceof Node` 가 아니라 `nodeType` 으로 봅니다(`isNodeFromAnyWindow`). `instanceof` 는 다른 frame 의 노드나 DOM 생성자가 전역에 없는 환경에서 틀립니다.
- 팝업의 `data-field-popup` 은 Field 가 읽습니다. Field 는 이 안의 input(검색 상자)을 필드의 값으로 세지 않습니다(`components/form/field/control-state.ts` 의 `isInPopupOf`). `revealPopupOption` 도 이 속성으로 팝업을 찾습니다.
- 팝업은 `[popover]` 라서, 다른 필드의 셸 안에 렌더돼도(TelField 안의 국가 Select) 그 셸의 `focus-ring` 이 팝업 안 input 의 포커스로 켜지지 않습니다. CSS 패키지의 `focus-ring` 이 `[popover] [data-field-input]` 을 뺍니다.
- `data-presentation`, `data-side` 는 Select, ColorField README 에 적힌 공개 상태 속성입니다. 이름을 바꾸면 그 README 도 고칩니다.

## layer.ts

### 쓰는 법

```ts
// components/form/select/index.tsx: 렌더 중에 묻는다
const drawer = useDrawerPresentation(mobileVariant);

// internal/field-popup/index.tsx
useLayoutEffect(() => {
  const node = popup.current;
  if (!node) return;
  if (drawer && clickableBackdrop.current) showInTopLayer(clickableBackdrop.current);
  moveToTopOfTopLayer(node);
  return registerPopup(node);          // cleanup 이 스택에서 지운다
}, [drawer]);
```

### 왜 이렇게

- `useDrawerPresentation` 은 `mobileVariant === 'drawer'` 이고 화면 폭이 `DRAWER_BELOW`(640px) 미만일 때 `true` 입니다. 그 밖의 팝업은 모두 anchor 에 붙습니다.
- 컴포넌트는 팝업의 위치 계산과 별개로 이 값을 렌더 중에 묻습니다. popover 와 drawer 는 포커스 모델이 다르기 때문입니다: drawer 는 modal 이라 포커스를 안으로 가져가고, popover 는 trigger 에 둡니다. ChipField 는 drawer 일 때 sheet 안에 검색 상자를 따로 그립니다.
- `max-width` 는 경계값을 포함하므로 media query 는 `DRAWER_BELOW - 0.02`(`639.98px`)로 적어 640px 을 뺍니다. `matchMedia` 가 없으면 `innerWidth < DRAWER_BELOW` 로 봅니다.
- 서버 렌더 값은 `false` 입니다(`useSyncExternalStore` 의 server snapshot). 서버 HTML 은 늘 popover 입니다.
- `showInTopLayer` 는 Popover API 가 없거나 이미 열려 있으면 아무것도 하지 않습니다.
- `moveToTopOfTopLayer` 는 열린 팝업을 닫았다 다시 열어 top layer 맨 위로 올립니다. `hidePopover()` 가 포커스를 잃게 했으면 원래 요소로 되돌립니다.
- `registerPopup`, `isTopPopup` 은 열린 팝업의 스택입니다. 팝업 안에서 연 팝업은 그 위에 쌓이고, Escape 는 맨 위 하나만 닫습니다.

## styles.ts

### 쓰는 법

```ts
// components/form/select/index.tsx
export const Style = tv({
  slots: {
    root: ['relative', fieldTrigger.base],
    listbox: fieldListbox.list,
    item: fieldListbox.option,
    indicator: fieldListbox.indicator,
    groupHeading: fieldListbox.heading,
    separator: fieldListbox.separator,
    empty: [fieldListbox.empty, 'not-data-empty:sr-only'],
  },
  variants: {
    variant: {
      outline: { root: fieldTrigger.variant.outline },
      soft: { root: fieldTrigger.variant.soft },
      ghost: { root: fieldTrigger.variant.ghost },
    },
  },
});
```

### 왜 이렇게

- `fieldTrigger` 는 Select, ChipField, ColorField, FileField 의 상자입니다. [`fieldSurface`](../README.md#field-surfacets) 의 `base` 에 flex layout 을 더하고, `variant`, `size` 는 `fieldSurface` 를 그대로 씁니다. `icon` 은 trigger 안 아이콘의 크기입니다.
- Select 와 ColorField 는 `fieldTrigger.size` 대신 padding 을 trigger 에 둡니다. trigger 가 상자를 채워야 어디를 눌러도 열리고, 그래서 상자 안의 Clear 는 `fieldAction.unpadded` 입니다. ChipField 는 상자가 padding 을 가지므로 `fieldTrigger.size` 를 씁니다.
- `popupStyle.popup` 은 `inset-ring` 이 아니라 진짜 테두리입니다(`borderOptionsCannotCover`). 스크롤 컨테이너에서 inset shadow 는 내용 아래에 칠해지므로, 강조된 옵션이 가장자리를 지날 때 테두리를 가립니다.
- `popup` 은 세로 flex 입니다. 안의 목록이 남은 높이를 받아, 고정된 검색 상자나 머리 아래에서 따로 스크롤합니다.
- `backdrop` 은 drawer 뒤의 페이지를 어둡게 하고 클릭을 받는 별도 top layer 요소입니다. popover 자신의 `::backdrop` 은 UA 가 `pointer-events: none` 을 강제해서 클릭을 받지 못합니다.
- `header` 는 drawer 안(`in-data-[presentation=drawer]:flex`)에서만 보입니다.
- 옵션 강조는 메뉴처럼 neutral muted 배경(`data-highlighted`)이고, 선택한 옵션은 끝에 체크를 둡니다(shadcn/ui 방식). theme 색은 trigger 의 focus 에 남깁니다.
- 옵션은 체크가 없어도 끝 padding(`pe-8`)을 비워 둡니다. 체크가 나타날 때 라벨이 밀리지 않습니다.
- `list` 는 옵션의 스크롤 컨테이너입니다. 키보드 이동이 팝업이 아니라 이 목록을 스크롤합니다. 팝업 padding 안으로 들어가서(`-mx-1 px-1`) 전체 폭 구분선이 잘리지 않고, `relative` 라 옵션의 offset parent 입니다(`offsetParentOfOptions`).
- `separator` 는 Divider 에 주는 클래스입니다. 목록 padding 안으로 들어가므로 Divider 자신의 전체 폭을 쓰면 한쪽 끝이 모자랍니다. 폭은 stretch 에 맡깁니다(`w-auto`).
- `searchRoot` 는 shadcn/ui 의 command input 같은 검색 줄입니다. ghost TextField 에 상자 대신 아래 선을 긋고, 캐럿이 포커스를 보여 주므로 ring 을 끕니다(`ringOffSinceCaretShowsFocus`). `focus-ring` 이 input 의 포커스로 ring 을 칠하므로 `!` 로 강제합니다. 팝업 padding 까지 채우도록 폭을 고정하지 않습니다.

### 알아둘 것

- `fieldTrigger`, `fieldListbox` 는 각 컴포넌트가 자기 `tv({ slots })` 에 넣는 `cn('...')` 값의 객체일 뿐입니다. `FieldSurfaceVariant` 에 값을 더하면 가져가는 컴포넌트의 `variants` 에도 각각 더해야 적용됩니다.
- Select, ChipField, ColorField 는 variant 타입이 `FieldTriggerVariant` 라서, 빠뜨리면 `satisfies Record<..., object>` 가 타입 오류를 냅니다. FileField 는 자기 `FileFieldVariant` 와 `compoundVariants` 를 따로 고칩니다.

## header.tsx

### 쓰는 법

```tsx
// internal/temporal-field/index.tsx
<FieldPopupHeader
  title={config.messages.title}
  closeLabel={config.messages.close}
  autoFocus                              // 닫기 버튼이 초기 포커스 후보가 된다
  onClose={() => close(true)}
/>
```

### 왜 이렇게

- drawer 는 자기를 연 필드를 덮으므로 스스로 이름을 밝히고 나갈 길을 줍니다. popover 는 필드가 보이므로 머리를 그리지 않습니다.
- temporal-field 는 늘 렌더하고 `header` 슬롯의 CSS 로 숨기고, ColorField 는 `drawer` 일 때만 렌더합니다.
- `autoFocus` 면 닫기 버튼에 `data-popup-autofocus` 를 붙입니다. `initialFocusSelector` 에 맞는 요소가 먼저입니다.

## search.tsx

### 쓰는 법

```tsx
// components/form/select/index.tsx (Select.SearchField)
<FieldPopupSearch
  {...own}
  controls={ids.listbox}                 // 검색어가 거르는 listbox 의 id
  activeDescendant={s.activeValue !== undefined ? ids.option(s.activeValue) : undefined}
/>
```

### 왜 이렇게

- Select.SearchField 와 ChipField 의 drawer 가 그리는, 목록 위의 검색 상자입니다.
- combobox wiring(`role="combobox"`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`, `aria-expanded`)은 `TextField.Input` 에 둡니다. TextField 는 Input 파트의 props 를 루트 props 보다 나중에 합치므로 wiring 이 호출한 쪽의 props 를 이깁니다. 호출한 쪽의 핸들러는 그래도 먼저 돕니다.
- `data-popup-autofocus` 라서 팝업이 열리면 검색 상자가 포커스를 받습니다.

### 알아둘 것

- `className`, `style` 은 input 으로 갑니다. 루트의 클래스는 `fieldListbox.searchRoot` 로 고정입니다.

## parts.ts

### 쓰는 법

```tsx
// components/form/select/index.tsx (Select.Icon)
return part(
  'span',
  asChild,
  children ?? <ChevronDownIcon />,
  mergeProps(props, { 'aria-hidden': true, className: c.styles.icon({ className }) }),
);

// internal/temporal-field/index.tsx
const parts = flattenFragments(children);
const count = (type: unknown) => parts.filter((n) => isValidElement(n) && n.type === type).length;
```

### 왜 이렇게

- `part(tag, asChild, children, props)` 는 파트 하나를 그립니다. `asChild` 가 아니면 `tag` 요소를 만들고, `asChild` 면 자식 요소 하나를 `mergeProps(자식 props, props)` 로 복제합니다. 파트의 wiring 이 이기고 자식의 핸들러가 먼저 돕니다.
- `asChild` 자식은 Fragment 가 아닌 요소 하나여야 합니다. HTML 요소 자식은 `tag` 와 같아야 하고(`span`, `div` 파트는 아무 요소나 됩니다), 컴포넌트 자식은 props 와 ref 를 넘긴다고 봅니다.
- `input` 파트는 children 을 받지 않습니다.
- 파트를 셀 때는 `utils` 의 [`flattenFragments`](../../utils/README.md#childrents) 로 Fragment 를 풉니다. `resolveState` 는 state 를 받는 `className`, `style`, `children` 을 풉니다.

### 알아둘 것

- temporal-field 의 `shell`, Select 의 `triggers` 처럼 풀어 낸 파트를 그대로 렌더하는 곳이 있습니다. `flattenFragments` 가 key 에 Fragment 경로를 붙이므로 파트를 여러 Fragment 에 나눠 담아도 key 가 겹치지 않습니다.
- `resolveState` 는 [`internal/state-props.ts`](../README.md#state-propsts) 의 `resolveState` 와 같은 동작입니다.
