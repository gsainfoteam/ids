# Dialog

페이지 위에 떠서 응답을 받을 때까지 나머지 화면을 막는 대화상자입니다. 화면 가장자리에서 밀려 나오는 패널은 `Drawer`, 버튼 옆에 붙는 작은 패널은 `Popover` 를 씁니다.

- **포커스를 가둡니다.** 열면 안의 첫 입력 요소로 포커스가 가고, Tab 은 대화상자 안에서만 돕니다. 닫으면 연 버튼으로 돌아갑니다.
- **나머지 화면은 잠깁니다.** 뒤 페이지는 스크롤되지 않고 스크린 리더에게도 숨겨집니다. 확대(pinch zoom)는 막지 않습니다.
- **닫는 법.** Escape, 배경 클릭, 모서리의 닫기 버튼, `Dialog.Close`. 되돌릴 수 없는 결정은 `dismissible={false}` 로 버튼으로만 닫게 합니다.
- **어디서든 엽니다.** `overlay.open` 으로 컴포넌트 밖에서 열고, 닫을 때 넘긴 값을 `await` 으로 받습니다.
- **겹쳐 열 수 있습니다.** 안에서 연 대화상자는 위에 쌓이고, 아래 대화상자는 조금 작아지며 뒤로 물러납니다.
- **한글 입력.** 조합 중에 누른 Escape 는 조합만 취소하고 대화상자는 그대로 둡니다.

```tsx
import { Dialog } from '@gsainfoteam/ids-react';

<Dialog>
  <Dialog.Trigger asChild>
    <Button variant="outline">프로필 수정</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>프로필 수정</Dialog.Title>
      <Dialog.Description>바꾼 내용은 저장을 눌러야 반영됩니다.</Dialog.Description>
    </Dialog.Header>
    <TextField aria-label="이름" />
    <Dialog.Footer>
      <Dialog.Close>취소</Dialog.Close>
      <Dialog.Close asChild>
        <Button>저장</Button>
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>;
```

## 구조

| 파트                 | 역할                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `Dialog.Trigger`     | 여는 버튼. `asChild` 로 다른 버튼에 붙인다                                  |
| `Dialog.Content`     | 대화상자 본체. 닫혀 있으면 렌더하지 않는다                                  |
| `Dialog.Header`      | 제목과 설명을 묶는다                                                        |
| `Dialog.Title`       | 대화상자의 이름(`aria-labelledby`)                                          |
| `Dialog.Description` | 대화상자의 설명(`aria-describedby`)                                         |
| `Dialog.Footer`      | 버튼 줄. 좁은 화면에서는 세로로, 주 버튼이 위에 온다                        |
| `Dialog.Close`       | 닫는 버튼. 글자만 주면 outline 버튼, `asChild` 면 자식 버튼에 닫기를 붙인다 |
| `Dialog.Overlay`     | 뒤 배경. `className`, `style` 을 바꿀 때만 적는다                           |

- 모든 파트는 생략할 수 있습니다. `Dialog.Title` 이 없으면 `Dialog.Content` 에 `aria-label` 을 줍니다. 둘 다 없으면 개발 모드에서 경고합니다.
- 모서리의 닫기 버튼(X)은 늘 붙습니다. 빼려면 `hideClose` 를 줍니다.

## 크기

```tsx
<Dialog.Content />                       // 기본: 최대 폭 max-w-sm(384px), 화면 높이 - 2rem 까지
<Dialog.Content className="max-w-2xl" /> // 폭과 높이는 className 으로
```

- 크기 prop 은 없습니다. 본문이 화면보다 길면 대화상자 안에서 스크롤합니다.

## 열고 닫기

```tsx
<Dialog defaultOpen />                              // 비제어
<Dialog open={open} onOpenChange={setOpen} />      // 제어
<Dialog onOpenChangeComplete={(open) => {}} />     // 열리고 닫히는 애니메이션이 끝난 뒤
<Dialog dismissible={false} />                     // Escape 와 배경 클릭으로 닫히지 않는다
<Dialog role="alertdialog" />                      // 되돌릴 수 없는 결정을 묻는다
```

- 닫히면 포커스는 연 순간 포커스가 있던 요소로 돌아갑니다. 그 요소가 사라졌으면(닫힌 메뉴의 항목) 그 메뉴의 trigger 로 갑니다.
- 닫히는 애니메이션이 끝날 때까지 요소가 남습니다(`data-ending-style`).

## overlay.open

```tsx
import { overlay } from '@gsainfoteam/ids-react';

const discard = await overlay.open<boolean>(({ close }) => (
  <Dialog role="alertdialog">
    <Dialog.Content>
      <Dialog.Title>변경 사항을 버릴까요?</Dialog.Title>
      <Dialog.Footer>
        <Button variant="outline" onClick={() => close(false)}>계속 편집</Button>
        <Button onClick={() => close(true)}>버리기</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>
));
// true / false, Escape 나 배경으로 닫으면 undefined
```

- `open` prop 이 없는 Dialog 는 `overlay.open` 의 항목에 저절로 붙습니다. 열림 상태와 닫힌 뒤 치우기를 따로 적지 않습니다.
- 가장 바깥 `IdsProvider` 안에 그려지고 그 theme 을 씁니다. 부른 곳의 theme 을 쓰려면 `useOverlay().open` 을 씁니다.
- `overlay.open(render, { id })` 로 같은 id 를 다시 열면 그 대화상자의 내용만 바뀝니다. `overlay.close(id, value)`, `overlay.closeAll()` 로 밖에서 닫습니다.

## 겹쳐 열기

- 대화상자 안에서 연 대화상자, 안에 든 Select, 메뉴는 위에 쌓입니다. Escape 와 바깥 클릭은 맨 위부터 하나씩 닫습니다.
- 가장 아래 대화상자만 배경을 어둡게 합니다. 위의 대화상자 뒤에서는 아래 대화상자가 조금 작아집니다(`data-nested-open`).
- 대화상자를 세 개 이상 겹치면 개발 모드에서 경고합니다.

## 상태

| 속성                | 붙는 곳                                        |
| ------------------- | ---------------------------------------------- |
| `data-open`         | `Dialog.Content`                               |
| `data-ending-style` | `Dialog.Content`, 배경. 닫히는 애니메이션 동안 |
| `data-nested-open`  | 위에 다른 대화상자가 열린 `Dialog.Content`     |
| `data-popup-open`   | 열려 있는 동안의 `Dialog.Trigger`              |

## 속성

| 속성                   | 기본 / 동작                                            |
| ---------------------- | ------------------------------------------------------ |
| `open` / `defaultOpen` | 열림 상태. 기본 `false`                                |
| `onOpenChange`         | 열거나 닫으려 할 때                                    |
| `onOpenChangeComplete` | 열고 닫는 애니메이션이 끝난 뒤                         |
| `dismissible`          | 기본 `true`. `false` 면 Escape 와 배경 클릭을 무시한다 |
| `role`                 | `dialog`(기본) / `alertdialog`                         |
| `hideClose`            | 모서리의 닫기 버튼을 뺀다                              |

## 알아둘 것

- 대화상자는 제자리에 렌더하고 브라우저의 top layer 에 올립니다. 부모의 `overflow`, `transform` 에 잘리지 않고, 가까운 `IdsProvider` 의 theme 을 그대로 씁니다.
- 열려 있는 동안 뒤 페이지는 `aria-hidden` 입니다. 토스트와 `role="status"` 알림은 숨기지 않습니다.
- `Dialog.Content` 안에 폼을 두면 제출은 평소처럼 바깥 form 과 이어집니다. 대화상자는 DOM 에서 자리를 옮기지 않습니다.
