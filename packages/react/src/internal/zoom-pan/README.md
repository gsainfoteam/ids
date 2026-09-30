# zoom-pan

그림 하나를 확대하고, 끌어서 옮기고, 아래로 쓸어 닫는 제스처 엔진입니다. 휠, 두 손가락, 두 번 탭(클릭), 키보드로 배율을 바꿉니다. 확대한 그림은 가장자리까지만 끌리고, 빠르게 놓으면 관성으로 미끄러집니다. 배율 1 에서 아래로 쓸면 Drawer 와 같은 기준으로 닫습니다.

| 파일                                 | 내용                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| [`engine.ts`](#enginets)             | 요소에 붙는 엔진 `createZoomPan`. pointer, wheel, Safari gesture, 키, 애니메이션 |
| [`use-zoom-pan.ts`](#use-zoom-pants) | React hook `useZoomPan`. 두 요소에 엔진을 붙이고 배율을 state 로 제어한다        |
| [`math.ts`](#mathts)                 | 순수 계산. 이동 한계, 한 점을 기준으로 한 확대, 핀치, 휠 배율, 관성              |

## 쓰는 곳

- Image 의 뷰어(`components/data/image/viewer-layer.tsx`)가 `useZoomPan` 으로 지금 보는 장의 영역과 상자에 붙입니다. 장을 넘기면 앞 장에서 떼고(그 장의 배율은 1 로 돌아간다) 새 장에 붙습니다.
- 뷰어는 배율을 Image.Group 의 `zoom` 으로 제어하고, 확대 중에는 슬라이드 트랙이 끌리지 않게 `watchDrag` 에서 `isZoomed()` 를 묻습니다. 쓸어 닫기의 `presence` 는 대화상자와 배경막의 `--image-viewer-presence` 로 칠합니다.

## 쓰는 법

```tsx
const [area, setArea] = useState<HTMLElement | null>(null);
const [box, setBox] = useState<HTMLElement | null>(null);

const zoomPan = useZoomPan({
  element: area, // 제스처를 받는 영역
  content: box, // 확대되는 상자. 둘 다 있어야 붙는다
  scale: zoom, // 제어하는 배율. 없으면 defaultScale(1)에서 시작
  onScaleChange: setZoom, // 제스처나 버튼이 끝난 배율
  maxScale: 4,
  disabled: false, // true 면 엔진을 떼고 transform 을 되돌린다
  onSwipe: (presence, dragging) => paintBackdrop(presence, dragging),
  onSwipeClose: () => setOpen(false),
  onPinchStart: () => slides.cancelDrag(),
});

<div ref={setArea} onKeyDown={(event) => zoomPan.onKeyDown(event)}>
  <div ref={setBox} style={{ aspectRatio }}>
    <img className="size-full object-contain" />
  </div>
</div>;

zoomPan.zoomed; // 제어하는 배율이 1 보다 큰가. 렌더에서 읽는다
zoomPan.canZoomIn; // 배율이 최대보다 작은가. 확대 버튼의 disabled
zoomPan.zoomIn(); // 가운데를 기준으로 2배
zoomPan.zoomOut(); // 절반
zoomPan.reset(); // 1배
zoomPan.zoomTo(3, { x: event.clientX, y: event.clientY }); // 화면 좌표를 기준으로
useSlides({ watchDrag: () => !zoomPan.isZoomed() }); // 트랙이 누르는 순간 엔진에 묻는다
```

## 입력

| 입력                 | 동작                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| 휠                   | 커서를 기준으로 확대, 축소. 휠 한 칸(100px)에 2^0.2 배. 트랙패드 핀치(`ctrlKey` 가 붙은 휠)도 같다 |
| 두 손가락            | 두 손가락의 가운데를 기준으로 확대. 가운데가 움직이면 함께 옮긴다                                  |
| Safari 트랙패드 핀치 | `gesturechange` 의 `scale`                                                                         |
| 두 번 탭, 두 번 클릭 | 배율 1 이면 누른 곳을 기준으로 2배, 확대 중이면 1배                                                |
| 한 손가락 (확대 중)  | 옮긴다. 그림의 가장자리에서 멈추고, 빠르게 놓으면 관성으로 미끄러진다                              |
| 한 손가락 (배율 1)   | 10px 움직인 뒤 방향을 정한다. 위아래면 쓸어 닫기, 옆이면 슬라이드 트랙에 맡긴다                    |
| `+` `=`, `-`, `0`    | 가운데를 기준으로 2배, 절반, 1배                                                                   |
| 방향키 (확대 중)     | 50px 씩 옮긴다. 배율 1 이면 처리하지 않고(`false`) 뷰어의 이전, 다음에 넘긴다                      |

## engine.ts

| 이름                                          | 하는 일                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| `createZoomPan(area, image, { scale, read })` | 리스너를 붙이고 `scale` 배율로 그린다. `read()` 는 `ZoomPanSettings` 를 돌려준다 |
| `isZoomed()`                                  | 지금 그린 배율이 1 보다 크거나 핀치 중인가. 트랙이 누르는 순간 묻는다            |
| `zoomIn()` `zoomOut()` `reset()`              | 가운데를 기준으로 2배, 절반, 1배                                                 |
| `zoomTo(scale, around?)`                      | `around`(화면 좌표, 없으면 가운데)를 기준으로 그 배율                            |
| `follow(scale)`                               | 제어하는 배율을 받는다. 끄는 중이 아니면 가운데를 기준으로 옮겨 간다             |
| `onKeyDown(event)`                            | React 키 이벤트. 처리하면 `true`                                                 |
| `dispose()`                                   | 리스너를 떼고 content 의 `transform`, 영역의 스타일을 되돌린다                   |

- 좌표는 영역의 가운데를 원점으로 한 `{ scale, x, y }` 하나입니다. content 는 `translate3d(x, y, 0) scale(s)` 로 그리고, `transform-origin` 은 기본값(가운데)입니다. 화면 좌표는 영역의 `getBoundingClientRect` 로 바꾸고, 조상이 줄어 있으면 그 비율로 나눕니다.
- 배율은 제스처가 끝날 때 `onCommit` 으로 한 번 알립니다(소수 셋째 자리). 쓰는 쪽은 그 값을 자기 state 에 넣고 `follow` 로 돌려줍니다. 제어하는 부모가 값을 받지 않으면 다음 `follow` 에서 원래 배율로 돌아갑니다.
- 누른 손가락은 모두 기록합니다(`pointers`). 한 손가락 제스처가 무엇이든(기다림, 이동, 쓸기, 트랙에 맡긴 옆 끌기) 두 번째 손가락이 닿으면 핀치로 넘어가고 `onPinchStart` 를 부릅니다. 핀치 중 한 손가락을 떼면 남은 손가락이 새 제스처를 시작합니다.
- 애니메이션은 Web Animations 입니다. 인라인 `transform` 에 목표를 먼저 쓰고 그 사이를 재생하므로, 끝나거나 `finish()` 되면 목표에 있습니다. 재생 중에 끌기가 시작되면 `getComputedStyle` 의 행렬에서 지금 값을 읽어 거기서 잡습니다. 탭은 재생을 멈추지 않아서 두 번 탭한 축소가 끊기지 않습니다.
- 버튼과 키의 한 단계는 재생 중인 값이 아니라 목표에서 셉니다. `+` 를 빠르게 두 번 누르면 4배입니다.
- `prefers-reduced-motion` 이면 모든 이동이 애니메이션 없이 바로 가고, 관성으로 미끄러지지 않습니다.
- `+` `=` `-` `0` 은 RULES.md 의 Keys 대로 `event.key` 로 읽습니다. TanStack 은 AZERTY 의 `à`(Digit0 자리)를 `0` 으로 맞추기 때문입니다. 방향키는 `keyHandler` 입니다. 조합 중인 키, 이미 처리된 키, Control, Alt, Meta 가 눌린 키(브라우저 확대)는 건너뜁니다.
- 쓸어 닫기는 Drawer 의 [`drawer-gesture.ts`](../../components/overlay/drawer/drawer-gesture.ts) 를 그대로 씁니다. `latchAxis`(10px 뒤 방향 결정), `resistedOffset`(위로는 고무줄), `releaseTarget`(0.4px/ms 넘게 튕기거나 영역 높이의 25% 넘게 끌면 닫기), `presenceAt`(배경막이 옅어지는 정도), `velocityOf`(마지막 100ms 의 속도). `onSwipeClose` 가 없으면 위아래 끌기도 트랙에 맡깁니다.
- 영역에 `touch-action: none` 과 `user-select: none` 을 줍니다. 브라우저가 손가락으로 페이지를 움직이거나 확대하지 않고, 끄는 동안 글자가 선택되지 않습니다. iOS Safari 가 두 손가락으로 페이지를 확대하지 않도록 `gesturestart` 도 막습니다. 그림을 끌어 내보내는 native drag(`dragstart`)도 막습니다.
- 휠은 `passive: false` 로 들어 늘 `preventDefault()` 합니다. 영역 위의 휠과 트랙패드 핀치는 페이지를 스크롤하거나 확대하지 않습니다.
- 영역이나 그림의 크기가 바뀌면(`ResizeObserver`) 이동을 새 한계 안으로 옮깁니다.
- React 를 모르는 엔진입니다. React 에서는 아래 `useZoomPan` 이 붙입니다.

## use-zoom-pan.ts

| 이름                                            | 하는 일                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `useZoomPan(options)`                           | `element` 와 `content` 가 있고 `disabled` 가 아니면 layout effect 에서 엔진을 붙인다 |
| `scale`, `zoomed`                               | 제어하는(또는 스스로 가진) 배율과 그것이 1 보다 큰가                                 |
| `canZoomIn`, `canZoomOut`                       | 배율이 최대보다 작은가, 1 보다 큰가                                                  |
| `isZoomed()`                                    | 엔진이 지금 그린 배율. 핀치 중이면 `true`. 엔진이 없으면 `false`                     |
| `zoomIn` `zoomOut` `reset` `zoomTo` `onKeyDown` | 엔진에 넘긴다. 엔진이 없으면 아무것도 하지 않는다(`onKeyDown` 은 `false`)            |

- 배율은 `useControllableState` 입니다. 엔진의 `onCommit` 이 배율을 넣고, 렌더가 끝나면 layout effect 가 `follow(scale)` 로 돌려줍니다. 부모가 같은 값을 받지 않아도 되돌아가도록 커밋 횟수(`commits`)도 effect 의 의존성에 넣습니다.
- 설정(`maxScale`, 콜백)은 렌더마다 ref 에 새로 쓰고, 엔진은 `read()` 로 쓸 때마다 읽습니다. 콜백이 바뀌어도 엔진을 다시 만들지 않으므로 끌던 제스처가 끊기지 않습니다.
- 엔진을 만들 때의 배율은 그 렌더의 배율입니다. 뷰어는 장을 넘길 때 `value` 와 `zoom`(1)을 한 번에 바꾸므로 새 장은 1 에서 시작합니다.
- `disabled` 나 요소가 바뀌면 엔진을 떼면서 transform 을 지웁니다. 뷰어는 닫히는 동안 떼지 않습니다. 떼면 확대한 사진이 닫히는 애니메이션의 첫 장면보다 먼저 1 로 돌아갑니다.

## math.ts

- 한 점을 기준으로 한 확대는 그 점 아래의 그림이 제자리에 남는 식입니다: `x' = p - (p - x) * s' / s`. PhotoSwipe 의 `Slide.zoomTo` 와 YARL Zoom 의 `changeZoom` 이 같은 식을 씁니다.
- 이동 한계는 확대한 그림이 영역을 덮는 만큼입니다: `|x| <= (s * w - W) / 2`. 영역보다 좁은 축은 가운데에 둡니다(PhotoSwipe 의 `PanBounds`, YARL 의 `changeOffsets`).
- 핀치는 시작 때의 가운데 `m0`, 이동 `x0`, 배율 `s0` 에서 `x = m - (m0 - x0) * s / s0` 입니다(PhotoSwipe 의 `ZoomHandler`). 배율 1 아래로는 15%, 최대 위로는 5% 만 따라가고, 놓으면 한계 안으로 돌아옵니다(`settle`).
- 휠 배율은 PhotoSwipe 의 `2 ^ (-deltaY * k)` 이고, `k` 는 `deltaMode` 가 픽셀이면 0.002, 줄이면 0.05, 페이지면 1 입니다.
- 관성은 놓을 때의 속도에 325ms 를 곱한 만큼 더 가고, 한계에서 멈춥니다(`coast`). 975ms 동안 처음이 빠르고 끝이 느린 곡선으로 재생합니다.
- 보고하는 배율은 소수 셋째 자리로 반올림합니다(`roundScale`). 1.0004 같은 값이 확대로 읽히지 않습니다.

## 알아둘 것

- content 는 영역의 가운데에 놓고, 그 상자가 곧 보이는 그림이어야 합니다. `object-fit: contain` 으로 줄인 그림은 여백까지 상자라 이동 한계가 틀립니다. `max-h-full max-w-full` 처럼 상자 자체를 줄입니다.
- `onKeyDown` 은 뷰어의 루트에 붙입니다. 포커스가 툴바 버튼에 있어도 키가 닿습니다. 확대 중에는 방향키를 엔진이 쓰므로(`preventDefault`), 뷰어의 이전, 다음은 `defaultPrevented` 인 키를 건너뛰는 `keyHandler` 로 받습니다.
- 계산식은 PhotoSwipe 5(MIT)의 `slide.js`, `pan-bounds.js`, `zoom-handler.js`, `scroll-wheel.js` 와 yet-another-react-lightbox(MIT)의 Zoom 플러그인에서 옮겼습니다. react-zoom-pan-pinch 를 쓰지 않는 이유는 Image 의 Notion 스펙에 있습니다(import 때 스타일을 넣고, 트리셰이킹이 안 되고, 트랙이나 쓸어 닫기와 맞출 수 없음).
