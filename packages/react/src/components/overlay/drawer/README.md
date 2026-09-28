# Drawer

화면 가장자리에서 밀려 나오는 패널입니다. 가운데에 뜨는 대화상자는 `Dialog`, 버튼 옆에 붙는 작은 패널은 `Popover` 를 씁니다. Drawer 는 Dialog 와 파트, 속성이 같고 여기에 `side`, 끌기, snap point, 뒤 페이지 줄이기가 더해집니다.

- **네 가장자리.** `side` 로 `top`, `right`(기본), `bottom`, `left` 를 고릅니다. 화면에 닿는 쪽 모서리는 각지고 안쪽 모서리만 둥급니다.
- **끌어서 닫습니다.** 손가락이나 마우스로 닫히는 방향으로 끌다가 빠르게 튕기거나 크기의 25% 넘게 끌면 닫힙니다. 덜 끌면 제자리로 돌아갑니다.
- **멈출 높이를 정합니다.** `snapPoints` 를 주면 그 높이들 사이를 끌어서 오갑니다. `Drawer.Handle` 을 누르거나 Enter 로 다음 높이로 갑니다.
- **뒤 페이지가 물러납니다.** modal Drawer 가 열리면 iOS 시트처럼 뒤 페이지가 조금 작아지고 아래로 내려갑니다. `scaleBackground={false}` 로 끕니다.
- **포커스와 닫기는 Dialog 와 같습니다.** 포커스를 가두고, 닫으면 연 버튼으로 돌려줍니다. Escape, 배경 클릭, 모서리의 닫기 버튼, `Drawer.Close` 로 닫습니다.
- **겹쳐 열 수 있습니다.** 안에서 연 Drawer, Dialog, Select 시트가 위에 쌓이고 아래 Drawer 는 뒤로 물러납니다.

```tsx
import { Drawer } from '@gsainfoteam/ids-react';

<Drawer side="bottom">
  <Drawer.Trigger asChild>
    <Button variant="outline">필터</Button>
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Handle />
    <Drawer.Header>
      <Drawer.Title>필터</Drawer.Title>
      <Drawer.Description>조건을 고르면 목록이 바로 바뀝니다.</Drawer.Description>
    </Drawer.Header>
    <TextField aria-label="검색어" />
    <Drawer.Footer>
      <Drawer.Close>취소</Drawer.Close>
      <Drawer.Close asChild>
        <Button>적용</Button>
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>;
```

## 구조

| 파트                 | 역할                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `Drawer.Trigger`     | 여는 버튼. `asChild` 로 다른 버튼에 붙인다                                  |
| `Drawer.Content`     | 패널 본체. 닫혀 있으면 렌더하지 않는다                                      |
| `Drawer.Handle`      | 잡는 막대. 어디에 적어도 안쪽 가장자리에 붙는다                             |
| `Drawer.Header`      | 제목과 설명을 묶는다                                                        |
| `Drawer.Title`       | 패널의 이름(`aria-labelledby`)                                              |
| `Drawer.Description` | 패널의 설명(`aria-describedby`)                                             |
| `Drawer.Footer`      | 버튼 줄. 패널 아래 끝에 붙고, 좁은 화면에서는 세로로 주 버튼이 위에 온다    |
| `Drawer.Close`       | 닫는 버튼. 글자만 주면 outline 버튼, `asChild` 면 자식 버튼에 닫기를 붙인다 |
| `Drawer.Overlay`     | 뒤 배경. `className`, `style` 을 바꿀 때만 적는다                           |

- 모든 파트는 생략할 수 있습니다. `Drawer.Title` 이 없으면 `Drawer.Content` 에 `aria-label` 을 줍니다. 둘 다 없으면 개발 모드에서 경고합니다.
- 모서리의 닫기 버튼(X)은 늘 붙습니다. 빼려면 `hideClose` 를 줍니다.
- `Drawer.Handle` 은 `snapPoints` 가 두 개 이상일 때만 버튼(`aria-label="끌어서 크기 조절"`)입니다. 그 밖에는 스크린 리더에게 숨긴 그림입니다. 열 때의 첫 포커스는 손잡이를 건너뜁니다.

## 가장자리와 크기

```tsx
<Drawer side="right" />                                      // 기본. 폭 min(24rem, 100% - 2rem), 높이 전체
<Drawer side="bottom" />                                     // 폭 전체, 높이는 내용만큼(화면 - 2rem 까지)
<Drawer.Content className="w-[min(40rem,calc(100%-2rem))]" /> // 크기는 className 으로
```

- 크기 prop 은 없습니다. 내용이 길면 패널 안에서 스크롤합니다. 막대는 OS 막대가 아니라 [ScrollArea](../../layout/scroll-area/README.md) 의 `hover` 막대라 둥근 모서리 안쪽에 섭니다.
- `Drawer.Content` 가 ScrollArea root 이고 padding 과 `gap` 은 안쪽 viewport 가 가집니다. `className` 의 `p-*`, `gap-*` 는 root 에 붙으므로, 여백을 바꾸려면 안쪽에 요소를 두고 거기에 줍니다.
- `bottom` 패널은 화면 키보드가 덮는 만큼 올라갑니다. 필드의 시트와 같은 `sheet-viewport.ts` 를 씁니다.
- 여백은 `concentric-p-6` 입니다. `bottom`, `top` 은 그 여백에 safe area(`env(safe-area-inset-*)`)를 더합니다. `className` 으로 `concentric-p-4` 를 줘도 화면 쪽 모서리는 각진 채로 남습니다.

## 끌기

- 끌기는 pointer event 로 받습니다. 손가락과 마우스가 같게 움직이고, 10px 을 넘게 움직인 뒤에야 방향을 정합니다. 가로로 먼저 움직이면(아래 시트의 가로 스크롤) 끌기를 포기합니다.
- 놓을 때 마지막 100ms 의 속도가 0.4px/ms 를 넘거나 크기의 25% 넘게 끌었으면 닫힙니다.
- 여는 방향으로 끌면 고무줄처럼 조금만 따라옵니다(`8 * (log(d + 1) - 2)`).
- 이럴 때는 끌지 않습니다.
  - 스크롤된 목록 안에서 시작했고 그 목록이 그 방향으로 더 스크롤될 때. 목록이 스크롤됩니다.
  - 입력 요소(`input`, `textarea`, `select`, `contenteditable`)에서 시작했을 때
  - 글자를 선택해 둔 채로 눌렀을 때
  - `data-drawer-no-drag` 가 붙은 요소 안에서 시작했을 때(지도, 캔버스, 슬라이더 영역)
  - ScrollArea 의 막대(`data-scroll-area-scrollbar`)에서 시작했을 때. 막대를 끌면 내용이 스크롤됩니다.
  - 안에 뜬 다른 레이어(Select 시트, Popover)에서 시작했을 때
- 터치가 취소되면(`pointercancel`) 제자리로 돌아갑니다.
- `dismissible={false}` 면 끌어도 닫히지 않고 돌아옵니다.
- 움직임 줄이기(`prefers-reduced-motion`) 설정에서는 되돌아가는 애니메이션 없이 바로 제자리에 놓입니다.

```tsx
<div data-drawer-no-drag>
  <Map />
</div>
```

## Snap point

```tsx
<Drawer side="bottom" snapPoints={[0.3, '420px', 1]} />               // 화면 비율(0~1) 또는 px
<Drawer snapPoints={points} defaultActiveSnapPoint={0.3} />            // 비제어. 기본은 첫 값
<Drawer snapPoints={points} activeSnapPoint={snap} onActiveSnapPointChange={setSnap} /> // 제어
<Drawer snapPoints={points} fadeFromIndex={1} />                       // 배경이 어두워지기 시작할 위치
```

- 값은 작은 것부터 적습니다. `1` 은 패널 전체가 보이는 높이입니다.
- `snapPoints` 가 있으면 패널은 화면 - 2rem 크기로 커지고, 지금 높이만큼만 보이게 밀려납니다.
- 놓을 때는 위치와 속도로 멈출 곳을 고릅니다. 빠르게 튕기면 한 칸 옮기고, 아주 빠르게(2px/ms) 튕기면 끝까지 가거나 닫힙니다. 그 밖에는 가장 가까운 높이에 멈추고, 첫 높이보다 닫힌 쪽이 가까우면 닫힙니다.
- 배경과 뒤 페이지 줄이기는 `fadeFromIndex`(기본: 마지막) 바로 앞 높이에서 0, 그 높이에서 1 이 되도록 끄는 만큼 따라옵니다. 낮은 높이에서는 뒤 페이지가 그대로 보입니다.
- `Drawer.Handle` 을 누르거나 포커스한 채 Enter, Space 를 누르면 다음 높이로 가고, 마지막 다음은 처음입니다.

## 뒤 페이지 줄이기

- modal Drawer 가 열리면 가장 바깥 `IdsProvider` 의 요소가 `translateY(calc(env(safe-area-inset-top) + 14px)) scale((W - 26) / W)` 로 작아지고, 모서리가 8px 로 둥글어지며, `body` 는 검은색이 됩니다. 패널과 같은 시간, 같은 곡선으로 움직이고, 끄는 동안은 끄는 만큼 따라옵니다.
- 페이지를 스크롤한 상태에서도 튀지 않습니다. 기준점은 지금 보이는 화면의 위쪽 가운데이고, 보이는 부분만 둥글게 잘라냅니다(`clip-path`).
- `overflow: clip` 을 씁니다(`hidden` 이 아님). 스크롤 컨테이너가 생기지 않아서 `position: sticky` 가 그대로 동작합니다.
- 가장 바깥 `IdsProvider` 가 배경색이 없으면 그 위 요소의 배경색(없으면 `Canvas`)을 칠해서 검은 `body` 가 비치지 않게 합니다.
- 닫히면 애니메이션이 끝난 뒤 바꾼 스타일을 모두 되돌립니다.
- 가장 아래 Drawer 하나만 줄입니다. 안에서 연 Drawer 는 뒤 페이지를 다시 줄이지 않습니다.
- 가장 바깥 `IdsProvider` 는 화면을 채워야 자연스럽습니다(`min-h-dvh`). Provider 가 화면보다 짧으면 그 아래는 검게 보입니다. `data-color` 를 `<html>` 이나 `<body>` 에 직접 준 앱에서는 줄이지 않습니다.
- `modal={false}` 이거나 `scaleBackground={false}` 면 줄이지 않습니다.

### 고정된 요소(FloatingButton)

- `transform` 이 붙은 요소는 안의 `position: fixed` 요소의 기준이 됩니다. 그대로 두면 FloatingButton 처럼 화면 아래에 붙은 요소가 페이지 맨 아래로 튀어 스크롤한 페이지에서는 화면 밖으로 사라집니다.
- 그래서 열 때 Provider 안의 fixed 요소(top layer 에 뜬 레이어는 빼고)를 찾아 `translate` 로 원래 화면 자리에 붙여 둡니다. 페이지의 한 부분처럼 제자리에서 함께 줄어들고, 닫히면 `translate` 를 되돌립니다.
- 이미 `translate` 가 있던 요소는 그 값에 더합니다.
- 열려 있는 동안 새로 생긴 fixed 요소는 옮기지 않습니다.

## 열고 닫기

```tsx
<Drawer defaultOpen />                              // 비제어
<Drawer open={open} onOpenChange={setOpen} />      // 제어
<Drawer onOpenChangeComplete={(open) => {}} />     // 열리고 닫히는 애니메이션이 끝난 뒤
<Drawer dismissible={false} />                     // Escape, 배경 클릭, 끌기로 닫히지 않는다
<Drawer role="alertdialog" />                      // 되돌릴 수 없는 결정을 묻는다
<Drawer modal={false} />                           // 배경 없이. 뒤 페이지를 계속 쓴다
```

- `modal={false}` 는 배경, 포커스 가두기, 스크롤 잠금, 뒤 페이지 줄이기가 없습니다. 바깥을 누르거나 포커스가 나가도 닫히지 않고, Escape, `Drawer.Close`, 끌기로 닫습니다.
- 닫히면 포커스는 연 순간 포커스가 있던 요소로 돌아갑니다.
- `overlay.open` 으로도 엽니다. 쓰는 법은 Dialog 와 같습니다.

```tsx
const choice = await overlay.open<string>(({ close }) => (
  <Drawer side="bottom">
    <Drawer.Content>
      <Drawer.Title>공유</Drawer.Title>
      <Button onClick={() => close('link')}>링크 복사</Button>
    </Drawer.Content>
  </Drawer>
));
```

## 겹쳐 열기

- Drawer 안에서 연 Drawer, Dialog, Select 시트는 위에 쌓입니다. Escape 는 맨 위부터 하나씩 닫습니다.
- 위에 modal 이 열리면 아래 Drawer 는 `scale((W - 16) / W)` 로 작아지고 자기 축을 따라 16px 안쪽으로 물러납니다(`data-nested-open`).
- 가장 아래 Drawer 만 배경을 어둡게 합니다.
- modal 을 세 개 이상 겹치면 개발 모드에서 경고합니다.

## 상태

| 속성                | 붙는 곳                                        |
| ------------------- | ---------------------------------------------- |
| `data-side`         | `Drawer.Content`, 배경                         |
| `data-open`         | `Drawer.Content`                               |
| `data-ending-style` | `Drawer.Content`, 배경. 닫히는 애니메이션 동안 |
| `data-nested-open`  | 위에 다른 modal 이 열린 `Drawer.Content`       |
| `data-dragging`     | 끄는 동안의 `Drawer.Content`, 배경             |
| `data-popup-open`   | 열려 있는 동안의 `Drawer.Trigger`              |

## 속성

| 속성                                         | 기본 / 동작                                                   |
| -------------------------------------------- | ------------------------------------------------------------- |
| `open` / `defaultOpen`                       | 열림 상태. 기본 `false`                                       |
| `onOpenChange`                               | 열거나 닫으려 할 때                                           |
| `onOpenChangeComplete`                       | 열고 닫는 애니메이션이 끝난 뒤                                |
| `side`                                       | `right`(기본) / `left` / `top` / `bottom`                     |
| `modal`                                      | 기본 `true`                                                   |
| `scaleBackground`                            | 기본 `true`. modal 일 때 뒤 페이지를 줄인다                   |
| `dismissible`                                | 기본 `true`. `false` 면 Escape, 배경 클릭, 끌기로 닫히지 않음 |
| `role`                                       | `dialog`(기본) / `alertdialog`                                |
| `hideClose`                                  | 모서리의 닫기 버튼을 뺀다                                     |
| `snapPoints`                                 | 멈출 높이. 화면 비율(0~1) 또는 `'320px'`                      |
| `activeSnapPoint` / `defaultActiveSnapPoint` | 지금 높이. 기본 첫 값                                         |
| `onActiveSnapPointChange`                    | 멈출 높이가 바뀔 때                                           |
| `fadeFromIndex`                              | 배경이 다 어두워지는 snap point 의 index. 기본 마지막         |

## 알아둘 것

- 패널은 제자리에 렌더하고 브라우저의 top layer 에 올립니다. 부모의 `overflow`, `transform` 에 잘리지 않고, 뒤 페이지를 줄이는 `transform` 도 패널에는 닿지 않습니다.
- 열려 있는 동안 뒤 페이지는 `aria-hidden` 입니다. 토스트와 `role="status"` 알림은 숨기지 않습니다.
- `Drawer.Content` 안에 폼을 두면 제출은 평소처럼 바깥 form 과 이어집니다.
- 끌기 알고리즘은 vaul 에서 옮겨 왔습니다. vaul 은 관리가 멈췄고 Radix Dialog 가 필요해서 설치하지 않습니다.
