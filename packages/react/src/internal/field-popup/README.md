# field-popup

필드가 여는 팝업을 그리는 공용 코드입니다. 보통은 trigger 에 붙는 popover 이고, `mobileVariant="drawer"` 인 필드는 640px 보다 좁은 화면에서 아래에서 올라오는 modal drawer 가 됩니다.

- 팝업 안 목록의 클래스는 [`list-styles.ts`](../README.md#list-stylests), 팝업을 여는 trigger 상자는 [`field-surface.ts`](../README.md#field-surfacets) 의 `fieldTrigger` 입니다.
- 파트 헬퍼 `part` 는 [`utils/part.ts`](../../utils/README.md#partts) 입니다.

| 파일                       | 내용                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| [`index.tsx`](#indextsx)   | `FieldPopup`, `revealPopupOption`, `FieldPopupHeader` 와 `useDrawerPresentation` 의 다시 내보내기 |
| [`layer.ts`](#layerts)     | 열린 팝업의 스택(`registerPopup`, `isTopPopup`)                                                   |
| [`styles.ts`](#stylests)   | `popupStyle`                                                                                      |
| [`header.tsx`](#headertsx) | drawer 머리의 제목과 닫기 버튼(`FieldPopupHeader`)                                                |
| [`search.tsx`](#searchtsx) | 목록 위의 검색 상자(`FieldPopupSearch`)                                                           |

- drawer 판정(`useDrawerPresentation`)과 top layer 에 올리는 함수는 [`internal/overlay`](../overlay/README.md) 에 있습니다.

## 쓰는 곳

| 컴포넌트                                      | 가져가는 것                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| Select                                        | `FieldPopup`, `useDrawerPresentation`, `revealPopupOption`, `FieldPopupSearch` |
| ChipField                                     | `FieldPopup`, `useDrawerPresentation`, `revealPopupOption`, `FieldPopupSearch` |
| ColorField                                    | `FieldPopup`, `FieldPopupHeader`, `useDrawerPresentation`                      |
| [temporal-field](../temporal-field/README.md) | `FieldPopup`, `FieldPopupHeader`                                               |

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
- 열린 팝업이 drawer 로 바뀌면 배경(`clickableBackdrop`)을 먼저 top layer 에 올리고 팝업을 다시 올립니다([`raiseInTopLayer`](../overlay/README.md#top-layerts)). top layer 는 올린 순서로 쌓입니다.

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
- 옵션 위치는 가능하면 `offsetTop` 으로 읽습니다(`unscaledOffsetsApply`). `getBoundingClientRect` 는 열릴 때의 scale 애니메이션(`starting:scale-95`)을 받아 긴 목록에서 몇 줄씩 어긋납니다. `offsetTop` 은 스크롤 부모가 옵션의 offset parent 일 때만 맞으므로 [`listStyles.list`](../README.md#list-stylests) 가 `relative` 입니다.

### 알아둘 것

- `onClose` 는 최신 값을 ref 에 둡니다. 렌더마다 새 함수를 넘겨도 리스너를 다시 붙이지 않습니다.
- 이벤트 target 이 Node 인지는 `utils` 의 [`isNodeFromAnyWindow`](../../utils/README.md#domts) 로 봅니다.
- 팝업의 `data-field-popup` 은 Field 가 읽습니다. Field 는 이 안의 input(검색 상자)을 필드의 값으로 세지 않습니다(`components/form/field/control-state.ts` 의 `isInPopupOf`). `revealPopupOption` 도 이 속성으로 팝업을 찾습니다.
- 팝업은 `[popover]` 라서, 다른 필드의 셸 안에 렌더돼도(TelField 안의 국가 Select) 그 셸의 `focus-ring` 이 팝업 안 input 의 포커스로 켜지지 않습니다. CSS 패키지의 `focus-ring` 이 `[popover] [data-field-input]` 을 뺍니다.
- `data-presentation`, `data-side` 는 Select, ColorField README 에 적힌 공개 상태 속성입니다. 이름을 바꾸면 그 README 도 고칩니다.

## layer.ts

### 쓰는 법

```ts
// internal/field-popup/index.tsx
useLayoutEffect(() => {
  const node = popup.current;
  if (!node) return;
  if (drawer && clickableBackdrop.current) showInTopLayer(clickableBackdrop.current);
  raiseInTopLayer(node);
  return registerPopup(node);          // cleanup 이 스택에서 지운다
}, [drawer]);
```

### 왜 이렇게

- `registerPopup`, `isTopPopup` 은 열린 팝업의 스택입니다. 팝업 안에서 연 팝업은 그 위에 쌓이고, Escape 는 맨 위 하나만 닫습니다.
- `useDrawerPresentation` 은 [`overlay/sheet-viewport.ts`](../overlay/README.md#sheet-viewportts), `showInTopLayer` 와 `raiseInTopLayer` 는 [`overlay/top-layer.ts`](../overlay/README.md#top-layerts) 입니다.

## styles.ts

### 쓰는 법

```ts
// internal/field-popup/index.tsx
const styles = popupStyle({ presentation });   // 'popover' | 'drawer'
<div className={styles.popup({ className })} />
{drawer && <div className={styles.backdrop()} />}

// internal/field-popup/header.tsx
const styles = popupStyle();
<div className={styles.header()}><span className={styles.title()}>{title}</span></div>
```

### 왜 이렇게

- `popupStyle.popup` 은 `inset-ring` 이 아니라 진짜 테두리입니다(`borderOptionsCannotCover`). 스크롤 컨테이너에서 inset shadow 는 내용 아래에 칠해지므로, 강조된 옵션이 가장자리를 지날 때 테두리를 가립니다.
- `popup` 은 세로 flex 입니다. 안의 목록이 남은 높이를 받아, 고정된 검색 상자나 머리 아래에서 따로 스크롤합니다.
- `backdrop` 은 drawer 뒤의 페이지를 어둡게 하고 클릭을 받는 별도 top layer 요소입니다. popover 자신의 `::backdrop` 은 UA 가 `pointer-events: none` 을 강제해서 클릭을 받지 못합니다.
- `header` 는 drawer 안(`in-data-[presentation=drawer]:flex`)에서만 보입니다.

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

- `className`, `style` 은 input 으로 갑니다. 루트의 클래스는 [`listStyles.searchRoot`](../README.md#list-stylests) 로 고정입니다.
