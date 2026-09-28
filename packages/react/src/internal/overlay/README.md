# overlay

오버레이(Dialog, Drawer, Popover, Menu, Tooltip, Toast, 필드의 팝업)가 함께 쓰는 코어입니다. 닫기 규칙, top layer, 나가는 애니메이션, anchor 위치, modal 의 포커스와 스크롤을 한곳에서 정합니다.

| 파일                                     | 내용                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| [`layer-stack.ts`](#layer-stackts)       | 열린 레이어의 스택과 Escape, 바깥 누르기, 포커스 규칙(`useLayer`)        |
| [`top-layer.ts`](#top-layerts)           | top layer 에 올리기, 다시 올리기, transition 없이 바꾸기, toaster 올리기 |
| [`use-presence.ts`](#use-presencets)     | 닫힌 뒤 나가는 애니메이션이 끝날 때까지 남는 mount 상태                  |
| [`use-anchored.ts`](#use-anchoredts)     | anchor 에 붙는 위치 계산(`@floating-ui/react` 의 `useFloating`)          |
| [`modal-layer.tsx`](#modal-layertsx)     | modal 의 배경, 포커스 가두기, 나머지 페이지 숨기기, 스크롤 잠금          |
| [`sheet-viewport.ts`](#sheet-viewportts) | 좁은 화면의 drawer 판정과 화면 키보드 높이                               |
| [`focus.ts`](#focusts)                   | 초기 포커스, 포커스 되돌리기, 늘 안으로 치는 요소                        |
| [`store.ts`](#storets)                   | `overlay.open` 의 항목 스토어와 host 선출                                |
| [`host.tsx`](#hosttsx)                   | 항목을 그리는 `OverlayHost`, 항목에 붙는 binding, portal root            |
| [`external-store.ts`](#external-storets) | `useSyncExternalStore` 가 읽는 작은 스토어                               |

## 쓰는 곳

| 쓰는 곳                                 | 가져가는 것                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| IdsProvider                             | `OverlayHost`, `PortalRootContext`                                                                                                          |
| Alert                                   | `usePresence`                                                                                                                               |
| Dialog                                  | `useLayer`, `ModalLayer`, `usePresence`, `useOverlayItem`, `OverlayItemContext`, `initialFocusTarget`, `returnFocusTo`, `focusReturnTarget` |
| [field-popup](../field-popup/README.md) | `useLayer`, `useAnchored`, `ModalLayer`, `initialFocusTarget`, `showInTopLayer`, `raiseWhatStaysAboveLayers`, `sheet-viewport.ts`           |

## 조립하는 법

레이어 하나는 이 순서로 조립합니다.

```tsx
const [element, setElement] = useState<HTMLElement | null>(null);
const presence = usePresence(open, { elements: () => [element, backdrop], onExitComplete });
const layer = useLayer(open, {
  kind: 'popup',                        // 'modal' | 'popup' | 'tooltip'
  element: () => element,
  anchor: () => trigger,
  onDismiss: (reason) => {
    setOpen(false);
    if (reason === 'escape-key') returnFocusTo(focusReturnTarget(layer));
  },
});
useLayoutEffect(() => {                 // useLayer 뒤에 둔다
  if (open && element) initialFocusTarget(element, { holdsFocus: false })?.focus();
}, [open, element]);
if (!presence.mounted) return null;
```

- `useLayer` 는 초기 포커스를 옮기는 effect 보다 먼저 부릅니다. 스택은 등록할 때의 `activeElement` 를 되돌아갈 곳으로 기억합니다.
- 레이어는 `open` 이 `false` 가 되는 순간 스택을 떠납니다. 나가는 애니메이션 동안은 Escape 와 바깥 누르기를 받지 않습니다.
- 레이어는 제자리에 렌더하고 `popover="manual"` 로 top layer 에 올립니다. DOM 위치가 그대로라 theme(`data-color`, `data-mode`), Field 의 `focusout` 판정, 폼 소속, Tab 순서를 물려받고, top layer 라서 조상의 `transform`, `overflow`, `opacity` 에 갇히지 않습니다.

## layer-stack.ts

열린 레이어의 스택입니다. 문서마다 `keydown`, `pointerdown`, `focusin` 리스너를 하나씩 두고, 열린 순서로 쌓인 레이어를 위에서부터 봅니다.

### 쓰는 법

```ts
const layer = useLayer(open, {
  kind: 'modal',
  element: () => contentRef.current,
  anchor: () => triggerRef.current,
  dismissible,                                   // 기본 true
  onDismiss: (reason, event) => close(reason),   // 'escape-key' | 'outside-press' | 'focus-out' | 'covered'
  onPositionChange: ({ covered, modalsBelow }) => setNested(covered),
});

focusReturnTarget(layer);                        // 닫을 때 포커스를 돌려줄 요소
elementsAbove(layer);                            // 이 레이어 위에 열린 레이어의 요소
```

### 규칙

| 규칙           | 이벤트              | 동작                                                                                                                                                       |
| -------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 Escape      | `keydown`           | 맨 위 레이어 하나만 `'escape-key'` 로 닫고 `preventDefault` 한다. `stopPropagation` 은 하지 않는다                                                         |
| R2 바깥 누르기 | `pointerdown`       | 위에서부터 popup 을 `'outside-press'` 로 닫는다. 누른 곳을 품은 레이어나 modal 을 만나면 멈춘다. 닫기 전에 안의 포커스를 blur 한다                         |
| R3 포커스      | `focusin`           | 맨 위 modal 보다 위의 popup 은 포커스가 밖으로 나가면 `'focus-out'` 으로 닫는다. 맨 위 modal 은 밖으로 나간 포커스를 마지막으로 포커스했던 요소로 되돌린다 |
| R4 tooltip     | 등록, `pointerdown` | modal 이 열리면 모든 tooltip 을 `'covered'` 로 닫는다. tooltip 은 자기 밖(trigger 포함)을 누르면 닫힌다                                                    |
| R5 toaster     | top layer           | 스택에 들어가지 않는다. 레이어가 올라온 뒤 [`raiseWhatStaysAboveLayers`](#top-layerts) 가 다시 맨 위로 올린다                                              |

- "안" 은 레이어 요소, anchor, 위에 열린 레이어(tooltip 제외), toaster(`[data-toaster]`), focus guard(`[data-floating-ui-focus-guard]`) 입니다.
- R1 은 이미 처리된(`defaultPrevented`) Escape 와 IME 조합 중(`isComposing`, `keyCode 229`)의 Escape 를 건너뜁니다. 안쪽 컨트롤이 Escape 를 먼저 쓰려면 `preventDefault()` 합니다(Alert, TextField 의 지우기).
- `dismissible: false` 인 레이어가 맨 위면 R1, R2 가 거기서 멈춥니다. 아래 레이어도 닫히지 않습니다.
- modal 은 `pointerdown` 으로 닫히지 않습니다. 배경의 `click` 으로만 닫히고([`ModalLayer`](#modal-layertsx)), 아래의 popup 도 그대로 둡니다.
- R2 가 닫은 레이어는 같은 누르기로 옮겨 가는 포커스로 한 번 더 닫히지 않습니다(`pressedOutside`). 키를 누르거나 다시 누르면 지웁니다.
- R3 의 되돌리기는 되돌아갈 곳(`focusReturnTarget`), anchor, 위의 레이어, toaster 로 가는 포커스는 막지 않습니다. modal 을 닫으면서 trigger 로 돌려준 포커스를 다시 당기지 않습니다.
- modal 의 `onPositionChange` 는 등록, 해제 때마다 `covered`(위에 modal 이 있음)와 `modalsBelow` 를 알립니다. 아래 modal 의 `data-nested-open`, 위 modal 의 투명한 배경이 이 값을 씁니다.

### 왜 이렇게

- 닫기 엔진이 하나입니다. `@floating-ui/react` 의 `useDismiss` 는 Escape 의 전파를 막고 `defaultPrevented` 를 보지 않아 IDS 의 Escape 규칙과 어긋나고, 두 엔진을 섞으면 같은 닫기를 두 번 알립니다.
- 순서는 연 시간입니다. DOM 위치와 상관없이 `overlay.open` 으로 연 레이어도 같은 규칙을 따릅니다. 한 commit 에 같이 열린 레이어는 자식의 layout effect 가 먼저 돌기 때문에, 새 레이어가 이미 열린 레이어를 DOM 으로 품으면 그 아래에 끼워 넣습니다.
- `focusReturnTarget` 은 연 순간 포커스가 있던 요소, 그 요소가 사라졌으면 그 요소를 품었던 레이어의 anchor, 그다음 자기 anchor 순서로 찾습니다. 메뉴 항목에서 연 Dialog 는 닫힌 메뉴의 항목 대신 메뉴 trigger 로 돌아갑니다.
- 리스너는 스택이 빌 때 뗍니다.

### 알아둘 것

- 스택은 모듈 상태라 문서(iframe)마다 따로입니다.
- 스택은 포커스를 되돌리지 않습니다. `onDismiss` 의 이유를 보고 컴포넌트가 `returnFocusTo(focusReturnTarget(layer))` 를 부릅니다. 바깥 누르기는 포커스가 누른 곳으로 가므로 되돌리지 않습니다.
- `kind` 가 바뀌면(필드 팝업이 drawer 로 바뀔 때) 다시 등록해서 스택 맨 위로 갑니다.

## top-layer.ts

### 쓰는 법

```ts
showInTopLayer(node);                          // Popover API 가 없거나 이미 열렸으면 아무것도 하지 않는다
raiseInTopLayer(node);                         // 닫았다 다시 열어 맨 위로. 안의 포커스는 지킨다
withoutTransitions(region, () => raiseInTopLayer(region));
const stop = keepAboveLayers(() => raiseToaster());
raiseWhatStaysAboveLayers();                   // 레이어를 올린 쪽이 부른다
```

### 왜 이렇게

- top layer 는 올린 순서로 쌓입니다. 이미 열린 요소를 위로 올리려면 닫았다 다시 엽니다(`raiseInTopLayer`). `hidePopover()` 가 안의 포커스를 잃게 하면 원래 요소로 돌려놓습니다.
- 다시 열면 요소가 `display: none` 에서 돌아오므로 `@starting-style` 의 들어오는 transition 이 다시 돕니다. `withoutTransitions` 는 요소와 모든 자손의 `transition` 을 끄고 스타일을 한 번 계산한 뒤 되돌려서, 이미 떠 있는 토스트가 다시 들어오지 않게 합니다.
- toaster 는 스택에 들어가지 않고 `keepAboveLayers` 로 등록합니다. tooltip 이 아닌 레이어가 올라오면 올린 쪽이 `raiseWhatStaysAboveLayers()` 를 불러 toaster 를 다시 맨 위로 올립니다.

### 알아둘 것

- Popover API 가 없는 엔진(jsdom 포함)에서는 요소의 `fixed`, `z-50` 클래스가 대신합니다. 레이어 스타일에 두 클래스를 빼지 않습니다.
- UA 가 `[popover]` 에 주는 `inset: 0`, `margin: auto` 는 anchor 에 붙는 레이어에서 풀어야 합니다. [`useAnchored`](#use-anchoredts) 가 `right`, `bottom` 을 `auto` 로 풀고, 레이어 스타일은 `m-0` 을 둡니다.

## use-presence.ts

`open` 이 `false` 가 된 뒤에도 나가는 애니메이션이 끝날 때까지 `mounted` 를 `true` 로 둡니다.

### 쓰는 곳

- Alert(`use-alert.ts`)

### 쓰는 법

```tsx
const { mounted, ending } = usePresence(open, {
  elements: () => [node, backdrop],     // 애니메이션을 기다릴 요소
  onExitComplete: () => overlayItem.remove(),
  onEnterComplete: () => onOpenChangeComplete(true),   // 들어오는 애니메이션이 끝난 뒤
});
if (!mounted) return null;
<div data-ending-style={ending ? '' : undefined} className="data-ending-style:opacity-0" />
```

### 왜 이렇게

- 상태는 렌더 중에 바꿉니다(`lastOpen`). `open` 이 바뀐 그 렌더에서 `ending` 이 맞춰져서, 닫힌 채로 한 번 그려지는 틈이 없습니다.
- 한 프레임 기다린 뒤 `getAnimations()` 를 읽습니다. `data-ending-style` 이 붙은 스타일로 transition 이 시작된 뒤에 모아야 합니다. `getAnimations()` 는 스타일을 먼저 계산합니다.
- 기다리는 effect 는 layout effect 입니다. 나가는 중에 다시 열면 transition 이 되돌아가며 취소되고 `finished` 가 settle 되는데, 그 전에 같은 commit 안에서 기다림을 끊어야 다시 연 요소를 치우지 않습니다.
- `onEnterComplete` 도 같은 방법으로 열린 뒤 한 프레임 기다렸다가 애니메이션이 끝나면 부릅니다. 끝나기 전에 닫으면 부르지 않습니다.
- 타이머를 쓰지 않습니다. 애니메이션이 없으면(`motion-reduce:transition-none`) 다음 프레임에 바로 끝납니다.
- 들어오는 애니메이션은 `starting:` 변형(`@starting-style`)으로 그립니다. top layer 에 올라오는 순간 `display: none` 에서 돌아오므로 따로 속성이 필요 없습니다.

### 알아둘 것

- 테스트는 인라인 `transition-duration` 을 주고 `getAnimations()` 의 애니메이션을 `finish()` 합니다(RULES.md 의 Tests).
- 막 렌더한 요소를 스타일이 한 번도 계산되기 전에 닫으면 transition 이 생기지 않고 바로 끝납니다.

## use-anchored.ts

`useFloating` 으로 anchor 에 붙는 위치를 계산합니다. 요소는 state 로 넘깁니다(`refs.set*` 를 렌더 중에 부르지 않습니다).

### 쓰는 법

```ts
const anchored = useAnchored({
  open,
  reference: trigger,                  // state 의 요소, 또는 RefObject
  floating: element,
  positioned: !drawer,                 // false 면 context 만 만들고 위치는 계산하지 않는다
  side: 'bottom',                      // 'top' | 'right' | 'bottom' | 'left'
  align: 'start',                      // 'start' | 'center' | 'end'
  sideOffset: 4,
  width: 240,                          // 숫자: anchor 폭과 이 값 중 큰 폭, 'anchor': anchor 와 같은 폭
  maxHeight: 360,
  arrow: arrowElement,
});
<div ref={setElement} style={anchored.floatingStyles} data-side={anchored.side} />
```

### 왜 이렇게

- 방금 놓인 쪽(`landed`)을 다음 계산의 placement 로 씁니다. 필터링으로 줄어드는 목록이 반대편으로 건너뛰지 않습니다. `flip` 의 후보는 반대쪽 하나이고, 열 때마다 `side` 로 돌아갑니다.
- 높이는 처음부터 상한으로 둡니다(`capHeightBeforeFirstFlip`). 첫 `flip` 이 긴 목록의 전체 길이가 아니라 실제로 가질 높이로 판단합니다. 이 layout effect 는 `useFloating` 보다 먼저 선언해서 먼저 돕니다.
- `size.apply` 가 `--anchor-width`, `--anchor-height`, `--available-width`, `--available-height` 를 씁니다. `width`, `maxHeight` 를 주면 폭과 높이(120px 와 `maxHeight` 사이)도 직접 씁니다.
- 화면 가장자리에서 8px(`VIEWPORT_MARGIN`) 안쪽에 머뭅니다(`shift`, `limitShift`). 필요하면 anchor 를 덮지만 anchor 를 떠나지는 않아서, anchor 가 스크롤로 사라지면 따라갑니다.
- `transform: false` 입니다. 레이어의 `scale` 들어오기 애니메이션과 `transform` 이 겹치지 않습니다.
- UA 가 `[popover]` 에 주는 `inset: 0` 을 `right`, `bottom` 에서 `auto` 로 풉니다(`undoPopoverUaInset`). 그대로 두면 상자가 과하게 제약되고, RTL 에서는 브라우저가 `right` 대신 `left` 를 버립니다.
- `reference` 가 RefObject 면 렌더 중에 `.current` 를 읽지 않고 layout effect 에서 `refs.setReference` 로 넘깁니다. `positioned` 가 `false` 면 `null` 을 넘겨서 위치를 계산하지 않습니다.

### 알아둘 것

- `autoUpdate` 는 anchor 와 레이어의 스크롤 조상에만 리스너를 둡니다. 레이어 안의 스크롤로는 다시 계산하지 않습니다.
- `side` 가 열린 채로 바뀌면 다음 flip 까지 반영되지 않습니다.

## modal-layer.tsx

modal 레이어의 배경, 포커스 가두기, 나머지 페이지 숨기기, 스크롤 잠금입니다.

### 쓰는 법

```tsx
<ModalLayer
  open={open}
  layer={layer}                         // useLayer 의 결과
  element={element}                     // state 의 content 요소
  contentRef={setElement}               // content 에 붙는 ref. RemoveScroll 이 content 로 넘긴다
  backdrop={{ className: backdropStyle, ref: setBackdrop }}   // false 면 배경 없음. ref 로 배경 요소를 받는다
  onBackdropClick={() => close('outside-press')}
>
  <div popover="manual" role="dialog" tabIndex={-1}>...</div>
</ModalLayer>
```

### 왜 이렇게

- 배경은 content 와 따로 top layer 에 올리는 요소입니다. popover 자신의 `::backdrop` 은 UA 가 `pointer-events: none` 을 강제해서 클릭을 받지 못합니다. 배경을 먼저 올리고 content 를 다시 올려서(`raiseInTopLayer`) content 가 위에 옵니다.
- 배경은 `pointerdown` 이 아니라 `click` 에서 닫습니다. 누르는 순간 닫으면 배경이 사라진 뒤 click 이 아래 페이지에 떨어지고, 그 누르기가 trigger 로 돌려준 포커스를 옮깁니다.
- `FloatingFocusManager` 는 가두기만 맡깁니다: `modal`, `closeOnFocusOut={false}`, `initialFocus={-1}`, `returnFocus={false}`. 초기 포커스와 되돌리기는 컴포넌트가 이유를 보고 하고, 밖으로 나간 포커스는 [R3](#layer-stackts) 이 되돌립니다.
- 나머지 페이지는 `aria-hidden` 으로 숨깁니다(`inert` 가 아님). `inert` 는 toaster 까지 누를 수 없게 합니다. `[aria-live]` 인 toaster 와 `role="status"` 는 floating-ui 가 숨기지 않습니다.
- 스크롤 잠금은 `react-remove-scroll` 입니다(`body[data-scroll-locked]`). pinch zoom 은 막지 않습니다(`allowPinchZoom`). 위에 열린 레이어는 `shards` 라서 그 안은 스크롤됩니다.
- 닫히기 시작하면(`open` 이 `false`) 가두기, 숨기기, 잠금을 바로 풉니다. 나가는 애니메이션 동안 trigger 로 돌아간 포커스가 숨겨진 채로 남지 않습니다.

### 알아둘 것

- content 의 ref 는 `contentRef` 로 넘깁니다. `RemoveScroll` 이 자식을 복제하면서 ref 를 덮으므로 자식에 직접 단 ref 는 사라집니다.
- `context` 를 넘기지 않으면 reference 없는 root context 를 만듭니다. anchor 에 붙는 modal(modal Popover)은 [`useAnchored`](#use-anchoredts) 의 `context` 를 넘깁니다.

## sheet-viewport.ts

### 쓰는 곳

- [field-popup](../field-popup/README.md) 과 Select, ChipField, ColorField 의 `useDrawerPresentation`

### 쓰는 법

```ts
const drawer = useDrawerPresentation(mobileVariant);   // 'drawer' 이고 640px 미만이면 true

const stop = onViewportChange(win, () => {
  sheet.style.bottom = `${coveredByKeyboard(win)}px`;
  sheet.style.maxHeight = `${visibleHeight(win) * 0.7}px`;
});
```

### 왜 이렇게

- `max-width` 는 경계값을 포함하므로 media query 는 `DRAWER_BELOW - 0.02`(`639.98px`)로 적어 640px 을 뺍니다. `matchMedia` 가 없으면 `innerWidth < DRAWER_BELOW` 로 봅니다.
- 서버 렌더 값은 `false` 입니다(`useSyncExternalStore` 의 server snapshot). 서버 HTML 은 늘 popover 입니다.
- 화면 키보드는 visual viewport 만 줄이고 fixed 요소가 쓰는 layout viewport 는 그대로 둡니다. 키보드가 덮는 만큼(`coveredByKeyboard`) sheet 를 올립니다.

## focus.ts

### 쓰는 법

```ts
initialFocusTarget(layer, { selector, holdsFocus: true });   // selector → [data-popup-autofocus] → 첫 tabbable → 레이어
returnFocusTo(focusReturnTarget(layer));                     // 되돌린 포커스로 표시한다
focusWasReturned(trigger);                                   // tooltip 이 다시 열리지 않게 묻는다
blurWithin(layerElement);                                    // 치우기 전에 React 가 blur 를 듣게 한다
```

### 왜 이렇게

- `holdsFocus` 가 `false` 면(popover) 앞의 둘이 없을 때 포커스를 옮기지 않습니다. trigger 에 남습니다.
- 되돌린 포커스는 그 요소가 포커스를 잃을 때까지 표시됩니다. 키보드 Escape 로 닫은 뒤 돌아온 trigger 는 `:focus-visible` 이라 tooltip 이 다시 열리려 하므로, Tooltip 은 `focusWasReturned` 를 보고 열지 않습니다.
- 브라우저는 포커스된 요소가 DOM 에서 빠질 때 `blur` 를 보내지 않습니다. 레이어를 치우기 전에 `blurWithin` 으로 먼저 blur 해야 Field 의 `onBlur`(검증, touched)가 돕니다.

## store.ts

`overlay.open` 으로 연 오버레이의 목록입니다. 컴포넌트 밖에서도 부를 수 있고, 닫을 때 넘긴 값으로 Promise 가 풀립니다.

### 쓰는 법

```tsx
const confirmed = await overlay.open<boolean>(({ close }) => (
  <Dialog>
    <Button onClick={() => close(true)}>확인</Button>
  </Dialog>
));                                          // 닫기만 하면 undefined

overlay.open(render, { id: 'settings' });    // 같은 id 를 다시 열면 그 항목을 바꾼다
overlay.close('settings', value);
overlay.closeAll();
overlay.unmount('settings');                 // 나가는 애니메이션 없이 치운다
```

### 왜 이렇게

- 항목은 `{ id, open, render, theme }` 입니다. 닫으면 `open` 만 `false` 가 되고, 나가는 애니메이션이 끝난 뒤에 목록에서 빠집니다.
- 열린 id 를 다시 열면 render 를 바꾸고 이전 Promise 를 `undefined` 로 풉니다. 같은 key 라서 다시 mount 되지 않습니다.
- 닫히는 중인 id 를 다시 열면 그대로 다시 열립니다. 나가던 요소가 남습니다.
- 닫힌 항목은 붙은 레이어가 없으면 바로(`removeIfNothingExits`), 있으면 그 레이어의 나가기가 끝날 때(`exited`) 빠집니다. 붙은 레이어 수는 `bindLayer` 가 셉니다.
- host 는 여러 개 등록될 수 있고(Storybook Docs 는 Provider 를 여러 개 그림), 먼저 등록된 하나가 그립니다(`overlayHosts`).
- 마지막 host 가 빠지면 열린 Promise 를 모두 `undefined` 로 풀고 목록을 비웁니다. 같은 task 안에서 다시 등록되면(StrictMode 의 effect 재실행) 비우지 않습니다.
- overlay-kit 을 감싸지 않은 이유는 RULES.md 의 What we build 에 있습니다.

### 알아둘 것

- `render` 는 컴포넌트가 아니라 host 가 렌더 중에 부르는 함수입니다. 안에서 hook 을 부르지 않습니다.
- 스토어는 모듈 상태라 문서(iframe)마다 따로입니다.

## host.tsx

### 쓰는 법

```tsx
// components/utility/ids-provider/ids-provider.tsx: 가장 바깥 Provider 만
{outermost && <OverlayHost />}

// Dialog 같은 레이어: open 을 받지 않았으면 항목에 붙는다
const item = useOverlayItem(openProp);          // { open, close, exited } | null
const open = item?.open ?? ownOpen;
usePresence(open, { onExitComplete: () => item?.exited() });
<OverlayItemContext value={null}>{children}</OverlayItemContext>   // 안쪽 레이어는 붙지 않게

const scoped = useOverlay();                    // 부른 곳의 theme 으로 연다
```

### 왜 이렇게

- 항목마다 `display: contents` 인 wrapper 가 `data-color`, `data-mode` 를 가집니다. 항목은 host 의 theme 을 따르고, `useOverlay()` 로 열면 부른 곳의 theme 을 씁니다.
- host 는 IdsProvider 의 요소 안, children 뒤에 그립니다. `asChild` 면 자식 요소 하나를 지켜야 하므로 요소 옆에 그립니다. 항목이 없으면 아무것도 그리지 않아서 서버 HTML 이 그대로입니다.
- 레이어는 `open` prop 이 없을 때만 항목에 붙습니다(`useOverlayItem`). 붙은 레이어는 자식에게 `OverlayItemContext` 를 `null` 로 넘겨서, 안에 든 다른 레이어가 같은 항목에 붙지 않게 합니다.
- `PortalRootContext` 는 가장 가까운 IdsProvider 의 요소입니다. Tooltip 이 그 안에 portal 합니다.

## external-store.ts

`get`, `set`, `subscribe` 만 있는 스토어입니다. `useSyncExternalStore(store.subscribe, store.get)` 로 읽습니다.

- `set` 은 같은 값(`Object.is`)이면 알리지 않습니다. 목록을 바꿀 때는 새 배열을 넘깁니다.
- zustand 를 쓰지 않는 이유는 RULES.md 의 What we build 에 있습니다.
