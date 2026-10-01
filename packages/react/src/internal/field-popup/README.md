# field-popup

필드가 여는 팝업을 그리는 공용 코드입니다. 보통은 trigger 에 붙는 popover 이고, `mobileVariant="drawer"` 인 필드는 640px 보다 좁은 화면에서 아래에서 올라오는 modal drawer 가 됩니다.

- 팝업 안 목록의 클래스는 [`list-styles.ts`](../README.md#list-stylests), 팝업을 여는 trigger 상자는 [`field-surface.ts`](../README.md#field-surfacets) 의 `fieldTrigger` 입니다.
- 파트 헬퍼 `part` 는 [`utils/part.ts`](../../utils/README.md#partts) 입니다.

| 파일                       | 내용                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| [`index.tsx`](#indextsx)   | `FieldPopup`, `revealPopupOption`, `FieldPopupHeader` 와 `useDrawerPresentation` 의 다시 내보내기 |
| [`styles.ts`](#stylests)   | `popupStyle`                                                                                      |
| [`header.tsx`](#headertsx) | drawer 머리의 제목과 닫기 버튼(`FieldPopupHeader`)                                                |
| [`search.tsx`](#searchtsx) | 목록 위의 검색 상자(`FieldPopupSearch`)                                                           |

- 닫기 규칙, top layer, 위치 계산, modal 은 [`internal/overlay`](../overlay/README.md) 의 코어입니다. `FieldPopup` 은 그 코어를 필드가 쓰는 props 로 묶은 어댑터입니다.

## 쓰는 곳

| 컴포넌트                                      | 가져가는 것                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| Select                                        | `FieldPopup`, `useDrawerPresentation`, `revealPopupOption`, `FieldPopupSearch` |
| ChipField                                     | `FieldPopup`, `useDrawerPresentation`, `revealPopupOption`, `FieldPopupSearch` |
| ColorField                                    | `FieldPopup`, `FieldPopupHeader`, `useDrawerPresentation`                      |
| [temporal-field](../temporal-field/README.md) | `FieldPopup`, `FieldPopupHeader`                                               |
| Menu                                          | `FieldPopupSearch`(명령 팔레트의 `Menu.Search`)                                |

- `search.tsx` 는 `index.tsx` 가 다시 내보내지 않습니다. `internal/field-popup/search` 에서 직접 가져옵니다.

## index.tsx

### 쓰는 법

```tsx
// components/form/chip-field/root.tsx
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
- 레이어는 popover 일 때 `popup`, drawer 일 때 `modal` 입니다([`useLayer`](../overlay/README.md#layer-stackts)). 열린 채 drawer 로 바뀌면 다시 등록되어 스택 맨 위로 갑니다.

#### popover

- [`useAnchored`](../overlay/README.md#use-anchoredts) 가 anchor 를 따라갑니다. 방금 놓인 쪽을 지키고, 높이를 처음부터 상한으로 두고, 화면 안에 남깁니다.
- 폭은 `preferredWidth`(기본 240px)와 anchor 폭 중 큰 쪽, `matchWidth` 면 anchor 폭입니다. 높이는 120px 와 `maxHeight` 사이입니다.
- 첫 배치가 끝나면(`isPositioned`) 미뤄 둔 가운데 맞추기를 합니다([revealPopupOption](#revealpopupoption)).

#### drawer

- 아래쪽 sheet 입니다. 좌우 여백은 8px(`VIEWPORT_MARGIN`), 높이는 520px(`DRAWER_MAX_HEIGHT`)와 visual viewport 높이의 70% 중 작은 쪽입니다.
- 화면 키보드가 덮는 만큼(`coveredByKeyboard`) sheet 를 올립니다([`sheet-viewport.ts`](../overlay/README.md#sheet-viewportts)).
- modal 입니다([`ModalLayer`](../overlay/README.md#modal-layertsx)): 어두운 배경, 포커스 가두기, 나머지 페이지 숨기기(`aria-hidden`), 스크롤 잠금(`RemoveScroll`, pinch zoom 은 허용), `role="dialog"`, `aria-modal`.
- 필드는 sheet 를 닫으면서 포커스를 자기 trigger 로 돌려보냅니다. sheet 가 아직 붙어 있어도 스택은 anchor(필드 루트) 안으로 가는 포커스를 되돌리지 않습니다.
- 열린 팝업이 drawer 로 바뀌면 배경을 먼저 top layer 에 올리고 팝업을 다시 올립니다. top layer 는 올린 순서로 쌓입니다.

#### 닫기

| 동작               | popover                        | drawer                                       |
| ------------------ | ------------------------------ | -------------------------------------------- |
| Escape             | 닫고 포커스를 되돌린다(`true`) | 같다                                         |
| 바깥 `pointerdown` | 닫는다(`false`)                | 무시한다. 배경의 `click` 으로 닫는다(`true`) |
| 포커스가 바깥으로  | 닫는다(`false`)                | 안으로 되돌린다                              |

- 규칙은 스택의 R1~R3 입니다. `onDismiss` 의 이유가 `'escape-key'` 면 `onClose(true)`, 나머지는 `onClose(false)` 입니다.
- drawer 가 `pointerdown` 에서 닫히면 배경이 click 전에 사라져서 click 이 아래 페이지에 떨어지고, 그 누르기가 trigger 로 돌아간 포커스를 페이지로 옮깁니다. 그래서 drawer 는 `click` 에서 닫습니다.
- 바깥 누르기는 포커스도 옮기는데, 그 포커스 이동은 같은 닫기의 일부입니다. `open` 을 제어하는 쪽이 팝업을 열어 둔 채로 두어도 같은 닫기를 두 번 듣지 않습니다.
- Escape 는 맨 위 레이어만 닫습니다. Dialog 안의 Select 는 Select 먼저 닫힙니다.

#### 초기 포커스

- 순서: `initialFocusSelector` 에 맞는 요소, `[data-popup-autofocus]` 요소, drawer 면 첫 tabbable 또는 팝업 자신([`initialFocusTarget`](../overlay/README.md#focusts)). popover 는 앞의 둘이 없으면 포커스를 trigger 에 그대로 둡니다.
- 한 번만 합니다(`initialFocusDone`). 다만 열린 채 drawer 로 바뀌었는데 포커스가 밖에 있으면 다시 합니다(`sheetMissingFocus`). modal sheet 는 포커스를 쥐어야 합니다.

#### revealPopupOption

- 팝업 안 스크롤 부모의 `scrollTop` 을 직접 바꿉니다(`scrollWithinPopup`). top layer 뒤의 문서는 스크롤하지 않습니다. 스크롤 부모는 옵션에서 가장 가까운 `overflow-y: auto | scroll` 조상이라, 목록이 있으면 listbox, 없으면 팝업의 viewport 입니다.
- `center` 는 옵션을 가운데에 둡니다. 목록은 선택한 옵션을 가운데에 두고 열려야 합니다.
- `center` 가 아니면 스크롤 부모의 `scroll-padding` 만큼 가장자리에서 떨어뜨립니다(`scrollPaddingOf`). 브라우저의 `scrollIntoView({ block: 'nearest' })` 와 같은 규칙입니다. 목록은 ScrollArea `fade="y"` 라 `scroll-padding` 이 흐린 폭이고, 방향키로 옮긴 옵션이 흐린 띠 안에 서지 않습니다.
- 위치 계산은 비동기라 열린 뒤에도 팝업이 줄어들 수 있습니다. 첫 배치 전의 가운데 맞추기는 기억했다가 배치가 끝나면 다시 합니다(`firstPlacementLanded`, `recenterAfterFirstPlacement`, `onPlacementLanded`).
- 옵션 위치는 가능하면 `offsetTop` 으로 읽습니다(`unscaledOffsetsApply`). `getBoundingClientRect` 는 열릴 때의 scale 애니메이션(`starting:scale-95`)을 받아 긴 목록에서 몇 줄씩 어긋납니다. `offsetTop` 은 스크롤 부모가 옵션의 offset parent 일 때만 맞으므로 [`listStyles.list`](../README.md#list-stylests) 가 `relative` 입니다.

### 알아둘 것

- `onClose` 는 `useLayer` 가 부를 때마다 최신 값을 읽습니다. 렌더마다 새 함수를 넘겨도 다시 등록하지 않습니다.
- 팝업의 `data-field-popup` 은 Field 가 읽습니다. Field 는 이 안의 input(검색 상자)을 필드의 값으로 세지 않습니다(`components/form/field/control-state.ts` 의 `isInPopupOf`). `revealPopupOption` 도 이 속성으로 팝업을 찾습니다.
- 팝업은 `[popover]` 라서, 다른 필드의 셸 안에 렌더돼도(TelField 안의 국가 Select) 그 셸의 `focus-ring` 이 팝업 안 input 의 포커스로 켜지지 않습니다. CSS 패키지의 `focus-ring` 이 셸 안 `[popover]` 에 든 `data-field-input`, `data-text-field-input`, `data-text-area-input` 을 뺍니다.
- `data-presentation`, `data-side` 는 Select, ColorField README 에 적힌 공개 상태 속성입니다. 이름을 바꾸면 그 README 도 고칩니다.
- `FieldPopup` 에 준 `ref` 는 요소에 닿지 않습니다. `ModalLayer` 의 `RemoveScroll` 이 자식의 ref 를 자기 것으로 바꿉니다. 요소가 필요하면 `data-*` 속성과 `closest` 로 찾습니다(Select 의 `data-select-popup`, ChipField 의 `data-chip-field-popup`).

## styles.ts

### 쓰는 법

```ts
// internal/field-popup/index.tsx
const styles = popupStyle({ presentation });   // 'popover' | 'drawer'
<ScrollArea asChild fade="y">
  <div className={styles.popup({ className })}>
    <ScrollArea.Viewport className={styles.viewport()}>{children}</ScrollArea.Viewport>
  </div>
</ScrollArea>
{drawer && <div className={styles.backdrop()} />}

// internal/field-popup/header.tsx
const styles = popupStyle();
<div className={styles.header()}><span className={styles.title()}>{title}</span></div>
```

### 왜 이렇게

- `popupStyle.popup` 은 `inset-ring` 이 아니라 진짜 테두리입니다(`borderOptionsCannotCover`). 스크롤 컨테이너에서 inset shadow 는 내용 아래에 칠해지므로, 강조된 옵션이 가장자리를 지날 때 테두리를 가립니다.
- 팝업은 `ScrollArea asChild` 의 root 이고 내용은 `ScrollArea.Viewport`(`viewport` 슬롯)에서 스크롤합니다. 달력이나 색 선택기가 화면보다 길 때 OS 막대 대신 IDS 막대가 둥근 모서리 안쪽에 섭니다.
- 팝업과 그 안의 목록(Select, ChipField)은 `fade="y"` 입니다. 위나 아래에 내용이 더 남으면 그 가장자리가 흐려집니다. 좌우는 스크롤하지 않으므로 흐리지 않습니다.
- `popup` 은 모서리만 `concentric-p-1` 로 정하고 padding 은 0 입니다(`cornerOfThePaddedViewport`). padding(`p-1`)은 viewport 가 가져서, 스크롤되는 내용이 padding 과 함께 움직이고 테두리 바로 안쪽에서 잘립니다.
- `popup` 과 `viewport` 는 세로 flex 입니다. 안의 목록이 남은 높이를 받아, 고정된 검색 상자나 머리 아래에서 따로 스크롤합니다. 그래서 목록이 있는 팝업의 viewport 는 넘치지 않고 막대도 목록의 것 하나만 보입니다.
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
// components/form/select/search-field.tsx (Select.SearchField)
<FieldPopupSearch
  {...own}
  controls={ids.listbox}                 // 검색어가 거르는 listbox 의 id
  activeDescendant={s.activeValue !== undefined ? ids.option(s.activeValue) : undefined}
/>
```

### 왜 이렇게

- Select.SearchField, ChipField 의 drawer, Menu 명령 팔레트의 `Menu.Search` 가 그리는, 목록 위의 검색 상자입니다.
- combobox wiring(`role="combobox"`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`, `aria-expanded`)은 `TextField.Input` 에 둡니다. TextField 는 Input 파트의 props 를 루트 props 보다 나중에 합치므로 wiring 이 호출한 쪽의 props 를 이깁니다. 호출한 쪽의 핸들러는 그래도 먼저 돕니다.
- `data-popup-autofocus` 라서 팝업이 열리면 검색 상자가 포커스를 받습니다.

### 알아둘 것

- `className`, `style` 은 input 으로 갑니다. 루트의 클래스는 [`listStyles.searchRoot`](../README.md#list-stylests) 로 고정입니다.
