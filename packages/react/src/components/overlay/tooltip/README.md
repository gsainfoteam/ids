# Tooltip

버튼이나 아이콘에 마우스를 올리거나 키보드로 포커스하면 뜨는 짧은 설명입니다. 누를 수 있는 내용(링크, 버튼, 입력)이나 긴 설명은 `Popover` 를 씁니다.

- **마우스와 키보드로 엽니다.** 마우스를 올리고 잠시(600ms) 기다리면 열리고, Tab 으로 포커스가 오면 바로 열립니다. 터치와 마우스 클릭으로 생긴 포커스로는 열리지 않습니다.
- **닫는 법.** 마우스가 trigger 를 떠날 때, 포커스가 빠질 때, trigger 나 다른 곳을 누를 때, Escape. Dialog 안에서도 Escape 는 툴팁부터 닫습니다.
- **연달아 볼 때는 바로 뜹니다.** 툴바의 버튼을 옮겨 가며 올리면 두 번째부터는 기다리지 않고, 들어오는 애니메이션도 생략합니다(`TooltipDelayGroup`).
- **스크린 리더.** trigger 에 `aria-describedby` 로 이어집니다. 이름(`aria-label`)을 대신하지 않으므로 아이콘 버튼에는 따로 이름을 줍니다.
- **Dialog 를 열면 닫힙니다.** 모달이 열리면 떠 있던 툴팁이 모두 닫히고, 모달이 닫히며 trigger 로 돌아온 포커스로는 다시 열리지 않습니다.

```tsx
import { Tooltip } from '@gsainfoteam/ids-react';

<Tooltip content="변경 사항 저장">
  <Button>저장</Button>
</Tooltip>;
```

## 구조

```tsx
<Tooltip>
  <Tooltip.Trigger asChild>
    <IconButton aria-label="공유" icon={<ShareIcon />} />
  </Tooltip.Trigger>
  <Tooltip.Content>
    링크 복사
    <Tooltip.Arrow />
  </Tooltip.Content>
</Tooltip>
```

| 파트              | 역할                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `Tooltip.Trigger` | 툴팁을 여는 요소. 기본은 `button`, `asChild` 로 자식 요소에 붙인다           |
| `Tooltip.Content` | 말풍선. 닫혀 있으면 렌더하지 않는다. `className`, `style` 을 받는다         |
| `Tooltip.Arrow`   | 말풍선의 꼬리. trigger 쪽을 가리키고, 말풍선 모서리에서 8px 안쪽에 머문다 |

- `content` 를 주면 짧은 형태입니다. 자식 요소 하나가 trigger 가 되고, `arrow` 로 꼬리를 붙입니다.
- trigger 는 ref 와 이벤트를 받는 요소여야 합니다. IDS 컴포넌트는 모두 받습니다.
- 자식이 원래 가진 `aria-describedby` 는 지우지 않고 툴팁 id 를 뒤에 붙입니다.

## 위치

```tsx
<Tooltip side="bottom" />               // 'top'(기본) | 'right' | 'bottom' | 'left'
<Tooltip align="start" />               // 'start' | 'center'(기본) | 'end'
<Tooltip sideOffset={10} />             // trigger 와의 간격, 기본 6px
```

- 들어갈 자리가 없으면 반대쪽으로 넘어가고, 화면 가장자리에서 8px 안쪽에 머뭅니다. 실제로 놓인 쪽은 `data-side` 로 알 수 있습니다.
- 폭은 내용만큼이고 `max-w-xs` 에서 줄바꿈합니다. 바꾸려면 `Tooltip.Content` 에 `className` 을 줍니다.

## 열고 닫기

```tsx
<Tooltip defaultOpen />                              // 비제어
<Tooltip open={open} onOpenChange={setOpen} />      // 제어
<Tooltip openDelay={0} closeDelay={200} />          // 이 툴팁만 지연을 바꾼다
<Tooltip disabled />                                // 열리지 않는다
```

- `openDelay`, `closeDelay` 를 주지 않으면 가장 가까운 `TooltipDelayGroup` 의 값(기본 600ms, 0ms)을 씁니다.
- trigger 를 누르면 닫히고, 마우스가 trigger 를 떠났다 다시 올 때까지 열리지 않습니다.

## TooltipDelayGroup

```tsx
import { TooltipDelayGroup } from '@gsainfoteam/ids-react';

<TooltipDelayGroup openDelay={300}>
  <Toolbar />
</TooltipDelayGroup>;
```

- 그룹 안의 툴팁은 한 번에 하나만 열립니다. 하나가 열려 있거나 닫힌 지 300ms 가 지나지 않았으면 다음 툴팁은 기다리지 않고 열립니다.
- `IdsProvider` 가 앱 전체를 그룹 하나로 묶으므로 따로 적지 않아도 됩니다. 한 영역만 다른 지연을 쓸 때 감쌉니다.

## 비활성 trigger

```tsx
<Tooltip content="권한이 없어 삭제할 수 없습니다">
  <span tabIndex={0} className="inline-flex">
    <Button disabled className="pointer-events-none">삭제</Button>
  </span>
</Tooltip>

<Tooltip content="권한이 없어 삭제할 수 없습니다">
  <Button disabled focusableWhenDisabled>삭제</Button>
</Tooltip>
```

- `disabled` 인 요소는 마우스 이벤트도 포커스도 받지 않아 툴팁이 열리지 않습니다. 감싸는 요소에 붙이거나, IDS 버튼이면 `focusableWhenDisabled` 를 줍니다. 그대로 두면 개발 모드에서 경고합니다.

## 상태

| 속성                | 붙는 곳                                                    |
| ------------------- | ---------------------------------------------------------- |
| `data-side`         | `Tooltip.Content`. 실제로 놓인 쪽                          |
| `data-align`        | `Tooltip.Content`                                          |
| `data-open`         | 열려 있는 `Tooltip.Content`                                |
| `data-ending-style` | `Tooltip.Content`. 닫히는 애니메이션 동안                  |
| `data-instant`      | 그룹에서 바로 이어 열린 `Tooltip.Content`. 애니메이션 없음 |
| `data-popup-open`   | 열려 있는 동안의 trigger                                   |

## 속성

| 속성                       | 기본 / 동작                                               |
| -------------------------- | --------------------------------------------------------- |
| `content`                  | 짧은 형태의 내용. 주면 자식이 trigger 가 된다             |
| `arrow`                    | 짧은 형태에서 꼬리를 붙인다. 기본 `false`                 |
| `open` / `defaultOpen`     | 열림 상태. 기본 `false`                                   |
| `onOpenChange`             | 열거나 닫으려 할 때                                       |
| `side` / `align`           | 기본 `top` / `center`                                     |
| `sideOffset`               | 기본 6                                                    |
| `openDelay` / `closeDelay` | 기본은 그룹의 값(600 / 0). 그룹이 없어도 같다             |
| `disabled`                 | 열리지 않는다. `open` 이어도 숨긴다                       |

## 알아둘 것

- 툴팁은 가장 가까운 `IdsProvider` 의 요소 안으로 portal 하고 top layer 에 올립니다. 부모의 `overflow` 에 잘리지 않고, trigger 옆에 요소가 끼어들지 않아 `space-*`, `divide-*`, `Group` 의 이음새가 흐트러지지 않습니다. `IdsProvider` 밖에서는 제자리에 렌더합니다.
- 말풍선은 `pointer-events: none` 입니다. 마우스를 말풍선으로 옮기면 닫히고, 안의 요소는 누를 수 없습니다. 안에 포커스를 받는 요소를 넣으면 개발 모드에서 경고합니다.
- 서버 렌더에서는 trigger 만 그립니다.
