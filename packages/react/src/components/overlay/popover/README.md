# Popover

버튼 옆에 붙어 뜨는 작은 패널입니다. 부가 정보, 빠른 설정, 짧은 입력처럼 화면을 막을 만큼 무겁지 않은 내용을 담습니다. 응답을 받을 때까지 화면을 막으려면 `Dialog`, 짧은 글자 안내는 `Tooltip`, 명령 목록은 `Menu` 를 씁니다.

- **trigger 옆에 붙습니다.** `side`, `align` 쪽에 놓이고, 자리가 모자라면 반대쪽으로 넘어가며 화면 가장자리에서 8px 안쪽에 머뭅니다.
- **포커스를 옮기지 않습니다.** 열어도 포커스는 trigger 에 남습니다. 안의 입력으로 보내려면 `initialFocus` 나 `data-popup-autofocus` 를 씁니다.
- **닫는 법.** Escape, 바깥 누르기, 포커스가 밖으로 나갈 때, trigger 를 다시 누를 때, `Popover.Close`. Escape 와 `Popover.Close` 는 포커스를 trigger 로 돌려주고, 바깥 누르기는 누른 곳에 둡니다.
- **hover 로도 엽니다.** `triggerType="hover"` 면 올려 둔 채 `openDelay` 뒤에 열리고, 포인터가 content 로 건너가는 동안은 닫히지 않습니다.
- **modal.** `modal` 이면 Dialog 처럼 포커스를 가두고 뒤 페이지를 잠급니다.
- **겹쳐 열 수 있습니다.** 안에서 연 popover 는 위에 쌓이고, 바깥 popover 를 누르면 안쪽만 닫힙니다.

```tsx
import { Popover } from '@gsainfoteam/ids-react';

<Popover>
  <Popover.Trigger asChild>
    <Button variant="outline">공유</Button>
  </Popover.Trigger>
  <Popover.Content>
    <Popover.Arrow />
    <Popover.Title>링크 공유</Popover.Title>
    <Popover.Description>링크가 있는 사람은 누구나 볼 수 있습니다.</Popover.Description>
    <TextField aria-label="링크" readOnly defaultValue={url} />
  </Popover.Content>
</Popover>;
```

## 구조

| 파트                  | 역할                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| `Popover.Trigger`     | 여는 버튼. `asChild` 로 다른 요소에 붙인다                                  |
| `Popover.Content`     | 패널 본체. 닫혀 있으면 렌더하지 않는다                                      |
| `Popover.Arrow`       | trigger 쪽을 가리키는 화살표. 놓인 쪽에 맞춰 돈다                           |
| `Popover.Title`       | 패널의 이름(`aria-labelledby`)                                              |
| `Popover.Description` | 패널의 설명(`aria-describedby`)                                             |
| `Popover.Close`       | 닫는 버튼. 글자가 없으면 X 아이콘, 글자만 주면 outline 버튼, `asChild` 가능 |

- `Popover.Content` 만 꼭 필요합니다. `Popover.Title` 이 없으면 `Popover.Content` 에 `aria-label` 을 줍니다.
- `Popover.Content` 는 Popover 하나에 하나입니다. 두 개면 개발 모드에서 경고합니다.
- `Popover.Trigger` 도 `anchor` 도 없으면 붙을 곳이 없어 개발 모드에서 경고합니다.

## 위치

```tsx
<Popover.Content />                                  // 기본: side="bottom", align="center", sideOffset={8}
<Popover.Content side="right" align="start" />       // top | right | bottom | left, start | center | end
<Popover.Content sideOffset={4} alignOffset={-8} />  // px
<Popover.Content anchor={cellRef} />                 // trigger 대신 다른 요소 옆에 붙는다(요소 또는 ref)
<Popover.Content className="w-96" />                 // 기본 폭 w-72, 크기 prop 은 없다
```

- 놓인 쪽은 `data-side`, `data-align` 으로 읽습니다. 들어오는 애니메이션도 그쪽에서 자랍니다.
- `anchor` 를 줘도 trigger 가 있으면 누르기와 포커스 되돌리기는 trigger 기준입니다.

## 열고 닫기

```tsx
<Popover defaultOpen />                             // 비제어
<Popover open={open} onOpenChange={setOpen} />     // 제어
<Popover onOpenChangeComplete={(open) => {}} />    // 열리고 닫히는 애니메이션이 끝난 뒤
<Popover.Content initialFocus="input[name=q]" />   // 열 때 포커스를 옮길 요소
```

- 포커스를 옮길 곳은 `initialFocus` 선택자, 그다음 `[data-popup-autofocus]` 요소입니다. 둘 다 없으면 옮기지 않습니다.
- 닫힐 때 포커스가 패널 안에 있었으면 trigger 로 돌아갑니다. 바깥을 눌러 닫으면 누른 곳에 남습니다.
- 닫히는 애니메이션이 끝날 때까지 요소가 남습니다(`data-ending-style`).

## hover

```tsx
<Popover triggerType="hover" openDelay={200} closeDelay={100}>
  <Popover.Trigger asChild>
    <a href="/users/42">김지스트</a>
  </Popover.Trigger>
  <Popover.Content>
    <UserCard id={42} />
  </Popover.Content>
</Popover>
```

- trigger 에서 content 로 가는 삼각형 안을 지나는 동안은 닫히지 않습니다(`safePolygon`).
- trigger 를 누르면(터치, 키보드 Enter 포함) 열리고, 포인터가 떠나도 닫히지 않습니다. Escape 나 바깥 누르기로 닫습니다.

## modal

```tsx
<Popover modal>
  <Popover.Trigger asChild>
    <Button>이름 편집</Button>
  </Popover.Trigger>
  <Popover.Content aria-label="이름 편집">
    <TextField aria-label="이름" />
    <Popover.Close asChild>
      <Button>저장</Button>
    </Popover.Close>
  </Popover.Content>
</Popover>
```

- 열면 안의 첫 입력 요소로 포커스가 가고, Tab 은 패널 안에서만 돕니다.
- 뒤 페이지는 스크롤되지 않고 `aria-hidden` 입니다. 투명한 배경을 누르면 닫히고 포커스는 trigger 로 돌아갑니다.

## overlay.open

```tsx
import { overlay } from '@gsainfoteam/ids-react';

const color = await overlay.open<string>(({ close }) => (
  <Popover>
    <Popover.Content anchor={swatchRef} aria-label="색 고르기">
      <Button onClick={() => close('red')}>빨강</Button>
    </Popover.Content>
  </Popover>
));
// 'red', Escape 나 바깥 누르기로 닫으면 undefined
```

- `open` prop 이 없는 Popover 는 `overlay.open` 의 항목에 저절로 붙습니다. trigger 가 없으므로 `anchor` 를 줍니다.

## 상태

| 속성                | 붙는 곳                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `data-open`         | `Popover.Content`                                                |
| `data-ending-style` | `Popover.Content`. 닫히는 애니메이션 동안                        |
| `data-side`         | `Popover.Content`. 실제로 놓인 쪽(`top` `right` `bottom` `left`) |
| `data-align`        | `Popover.Content`. 실제 정렬(`start` `center` `end`)             |
| `data-popup-open`   | 열려 있는 동안의 `Popover.Trigger`                               |

## 속성

| 속성                   | 기본 / 동작                                            |
| ---------------------- | ------------------------------------------------------ |
| `open` / `defaultOpen` | 열림 상태. 기본 `false`                                |
| `onOpenChange`         | 열거나 닫으려 할 때                                    |
| `onOpenChangeComplete` | 열고 닫는 애니메이션이 끝난 뒤                         |
| `modal`                | 기본 `false`. 포커스를 가두고 뒤 페이지를 잠근다       |
| `triggerType`          | `click`(기본) / `hover`                                |
| `openDelay`            | hover 로 열리기까지 ms. 기본 `200`                     |
| `closeDelay`           | hover 가 떠난 뒤 닫히기까지 ms. 기본 `100`             |

`Popover.Content`

| 속성           | 기본 / 동작                                    |
| -------------- | ---------------------------------------------- |
| `side`         | `bottom`                                       |
| `align`        | `center`                                       |
| `sideOffset`   | `8`. trigger 와의 간격(px)                     |
| `alignOffset`  | `0`. 정렬 방향으로 미는 거리(px)               |
| `anchor`       | trigger 대신 붙을 요소 또는 ref                |
| `initialFocus` | 열 때 포커스를 옮길 요소의 선택자              |

## 알아둘 것

- 패널은 제자리에 렌더하고 브라우저의 top layer 에 올립니다. 부모의 `overflow`, `transform` 에 잘리지 않고, 가까운 `IdsProvider` 의 theme 과 form 을 그대로 씁니다.
- `Popover.Content` 는 넘치는 내용을 자르지 않습니다(화살표가 밖으로 나와야 합니다). 긴 목록은 안쪽 요소에 `max-h-*` 와 `overflow-y-auto` 를 줍니다.
- 역할은 `dialog` 입니다. modal 일 때만 `aria-modal="true"` 가 붙습니다.
