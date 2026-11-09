# Bubble

대화의 말풍선입니다. 보낸 말과 받은 말의 모양(꼬리 모서리, 색)을 나눕니다. 줄 배치(아바타, 이름, 시간, 끝으로 붙이기)는 Bubble 이 아니라 감싸는 줄이 맡습니다.

- **`align` 은 모양만 바꿉니다.** 꼬리 쪽 아래 모서리를 4px 로 좁힐 뿐, 말풍선을 옮기지 않습니다. 보낸 말을 끝으로 붙이려면 줄에 `flex justify-end` 를 줍니다.
- **줄을 고르게 접고 가장 긴 줄에 맞춰 줄입니다.** 글이 여러 줄로 접히면 CSS 만으로는 상자가 최대폭에 머물러 줄 끝에 빈 공간이 남습니다. Bubble 은 `text-wrap: balance` 로 줄 수를 유지하면서 줄 길이를 고르게 맞추고, 브라우저가 그린 뒤 `Range.getClientRects()` 로 가장 긴 줄의 끝을 재서 상자를 그 폭으로 줄입니다.
- **최대폭은 `--bubble-max-width`.** 기본은 담는 줄 폭의 80% 입니다. Bubble 이나 조상 요소에 변수를 줍니다.
- **반응은 선택입니다.** `Bubble.Reactions` 를 마지막 자식으로 두면 상자 아래 모서리에 겹쳐 그립니다.
- **누를 수 없습니다.** 루트는 역할이 없는 `div` 이고, 안에 문단, 목록, 링크를 그대로 넣습니다.

```tsx
import { Bubble, Chip } from '@gsainfoteam/ids-react';

<Bubble>안녕하세요</Bubble>

<Bubble align="end" variant="solid">요약해 줘</Bubble>

<Bubble>
  학식 메뉴 알려 줘
  <Bubble.Reactions>
    <Chip><Chip.Icon aria-hidden={false}>👍</Chip.Icon>2</Chip>
  </Bubble.Reactions>
</Bubble>
```

| Property  | Type                              | Default   |
| --------- | --------------------------------- | --------- |
| `align`   | `'start' \| 'end'`                | `'start'` |
| `variant` | `'soft' \| 'solid' \| 'outline'`  | `'soft'`  |
| `asChild` | `boolean`                         | `false`   |

## Variant

```tsx
<Bubble variant="soft">     {/* 기본. 옅은 중립 면 (muted). 받은 말 */}
<Bubble variant="solid">    {/* 브랜드 채움 (primary). 보낸 말 */}
<Bubble variant="outline">  {/* 바탕색 면에 중립 테두리. 시스템 안내에 가까운 말 */}
```

- 흔한 조합은 보낸 말 `align="end" variant="solid"`, 받은 말 `align="start"` 의 기본 `soft` 입니다.
- 글자는 바탕과 짝인 색을 씁니다. `solid` 는 `on-primary`, `soft` 와 `outline` 은 `on-surface` 입니다. 링크와 아이콘은 이 색을 이어받습니다.
- 안쪽 여백은 12px(`concentric-p-3`), 모서리는 16px, 꼬리 쪽 모서리는 4px 입니다.

## 줄 배치

```tsx
<ol aria-label="대화" className="flex flex-col gap-3 break-keep">
  <li className="flex justify-end">
    <Bubble align="end" variant="solid">오늘 셔틀 몇 시에 와?</Bubble>
  </li>
  <li className="flex items-start gap-2">
    <Avatar name="GIST 도우미" size="tiny" aria-hidden />
    <Bubble>12시 20분에 광주송정역행이 와요.</Bubble>
  </li>
</ol>

<ol>
  <Bubble asChild align="end">  {/* 목록 항목을 말풍선으로 */}
    <li>고마워!</li>
  </Bubble>
</ol>
```

- Bubble 은 Message 안에 있는지 살피지 않습니다. Message 는 `align` 을 넘기고, 직접 둔 Bubble 은 앱이 `align` 을 줍니다.
- 한국어는 줄 바깥 요소에 `break-keep` 을 줍니다. 글자 단위로 접히면 줄이 거의 꽉 차서 줄일 폭이 남지 않습니다.

## 폭 맞춤

```tsx
<div className="[--bubble-max-width:60%]">  {/* 이 안의 말풍선은 줄의 60% 까지 */}
  <Bubble>...</Bubble>
</div>

<Bubble style={{ '--bubble-max-width': '24rem' } as CSSProperties}>...</Bubble>
```

- 줄을 고르게 맞추는 일은 브라우저의 `text-wrap: balance` 가 합니다. Chrome 은 6줄, Firefox 는 10줄까지 맞추고, 그보다 긴 글은 평소처럼 접힌 상태에서 가장 긴 줄에 맞춰 줄입니다.
- 글자를 canvas 로 재는 Pretext 는 쓰지 않습니다. children 이 평범한 글자일 때만 맞고(링크, 코드, 이모지가 섞인 노드는 잴 수 없음), CSS 글꼴 설정(`font-size-adjust` 등)과 어긋날 수 있기 때문입니다.
- 상자는 `fit-content` 로 시작합니다. 한 줄이면 그대로 두고, 여러 줄로 접혀 가장 긴 줄이 상자보다 1px 이상 짧을 때만 `--bubble-fit-width` 를 루트에 씁니다.
- 글자(텍스트 노드의 줄 상자)와 그림, 아이콘, `inline-block` 처럼 한 덩어리로 놓이는 요소를 잽니다. `absolute` 로 띄운 요소와 겹친 반응은 재지 않습니다.
- 다시 재는 때: 내용이 바뀔 때(MutationObserver), 부모 폭이 바뀔 때(ResizeObserver), 글꼴을 다 받았을 때.
- 같은 때 다시 재야 하는 말풍선은 한 번에 모읍니다. 모든 말풍선의 폭을 먼저 지우고, 전부 잰 다음, 새 폭을 씁니다. 그래서 말풍선이 많아도 layout 은 한 번만 다시 계산합니다.
- 서버 HTML 에는 폭이 없고 hydration 뒤에 잽니다. 그래서 서버와 클라이언트의 HTML 이 같고, 화면에는 처음 한 번 최대폭으로 그렸다가 줄어듭니다.
- 부모의 폭이 말풍선 폭으로 정해지면(`w-fit` 인 부모, `max-content` 칸) 80% 가 서로를 따라 줄어듭니다. 부모에는 말풍선과 무관한 폭을 줍니다.

## 반응

```tsx
<Bubble>
  학식 메뉴 알려 줘
  <Bubble.Reactions>                         {/* 마지막 자식: 아래 모서리에 겹침 */}
    <Chip><Chip.Icon aria-hidden={false}>👍</Chip.Icon>2</Chip>
    <Chip><Chip.Icon aria-hidden={false}>😮</Chip.Icon>1</Chip>
  </Bubble.Reactions>
</Bubble>

<Bubble>
  <Bubble.Reactions>...</Bubble.Reactions>   {/* 마지막이 아니면 상자 안, 적은 자리에 */}
  <p>본문</p>
</Bubble>
```

- 겹친 반응은 아래 가장자리에서 꼬리의 반대쪽 끝, 12px 안쪽에 붙습니다. `align="start"` 면 끝 쪽, `align="end"` 면 시작 쪽입니다.
- 겹치면 말풍선 아래에 12px 여백을 두어 다음 줄과 부딪치지 않게 합니다. 반응의 자식에는 바탕색 2px 고리를 둘러 상자 테두리와 떼어 놓습니다.
- 반응은 `role="group"` 이고 이름은 `t('bubble.reactions')`("반응") 입니다. `aria-label` 로 바꿉니다.
- 무엇을 넣을지는 앱이 정합니다. 반응은 기본 `soft` 인 `Chip` 이 어울립니다. 회색 면에 바탕색 고리가 둘러져 말풍선과 떨어져 보입니다.
- 이모지는 `Chip.Icon` 에 넣습니다. 숫자와 같은 줄에 가운데 맞고 Chip 의 간격만큼 떨어집니다. `Chip.Icon` 은 기본이 `aria-hidden` 이므로 `aria-hidden={false}` 를 주어 이모지 이름을 읽게 합니다.
- 크기는 기본(`standard`)을 씁니다. `tiny` 는 간격이 2px 라 이모지와 숫자가 붙어 보입니다.
