# ButtonGroup

버튼 여러 개를 하나의 컨트롤처럼 이어 붙입니다. 분할 버튼, 확대와 축소, 툴바 묶음에 씁니다.

- **이어 붙이기.** 바깥 모서리만 둥글고, 맞닿는 outline 테두리는 한 줄로 겹칩니다. 오른쪽에서 왼쪽으로 쓰는 화면에서도 바깥쪽이 둥급니다.
- **크기와 variant 전파.** 그룹의 `size` 와 `variant` 를 안의 Button, IconButton, Toggle 이 따릅니다. 버튼에 직접 준 값이 이깁니다.
- **앞으로 나오는 포커스.** hover, 누름, 포커스한 버튼이 이웃 위로 올라와 테두리와 포커스 링이 가려지지 않습니다.
- **합성.** 그룹 안에 그룹을 넣으면 간격을 두고 떨어지고, `ButtonGroup.Text` 와 `TextField` 도 테두리를 이어 붙입니다.
- **접근성.** `role="group"` 이 붙고, `aria-label` 을 주면 스크린 리더가 무엇을 묶었는지 읽습니다.

```tsx
import { Button, ButtonGroup, IconButton } from '@gsainfoteam/ids-react';

<ButtonGroup variant="outline" aria-label="저장">
  <Button>저장</Button>
  <IconButton icon={<ChevronDownIcon />} aria-label="저장 옵션" />
</ButtonGroup>;
```

## 크기와 variant

```tsx
<ButtonGroup size="tiny" variant="outline" aria-label="확대">
  <IconButton icon={<MinusIcon />} aria-label="줄이기" /> {/* tiny, outline 을 따른다 */}
  <Button>100%</Button>
  <Button variant="solid">맞춤</Button> {/* 직접 준 variant 가 이긴다 */}
</ButtonGroup>
```

- 그룹 안의 그룹은 바깥 그룹의 `size` 와 `variant` 를 물려받습니다.
- 크기가 다른 버튼을 섞으면 높이가 맞지 않습니다. 보통은 그룹에만 `size` 를 줍니다.

## 구분선

```tsx
<ButtonGroup aria-label="저장">
  <Button>저장</Button>
  <ButtonGroup.Separator /> {/* 채운 버튼 사이에 선을 긋는다 */}
  <IconButton variant="solid" icon={<ChevronDownIcon />} aria-label="저장 옵션" />
</ButtonGroup>
```

- `solid`, `soft` 처럼 테두리가 없는 버튼 사이를 나눌 때 씁니다. `outline` 은 테두리가 이미 선 역할을 합니다.
- 선은 이웃과 1px 씩 겹쳐서 outline 버튼 옆에 두어도 두 줄이 되지 않습니다.
- 스크린 리더에는 `role="separator"` 로 읽힙니다.

## 합성

```tsx
<ButtonGroup variant="outline" aria-label="편집">
  <ButtonGroup aria-label="클립보드">   {/* 그룹 안의 그룹끼리는 떨어진다 */}
    <IconButton icon={<ScissorsIcon />} aria-label="잘라내기" />
    <IconButton icon={<ClipboardIcon />} aria-label="붙여넣기" />
  </ButtonGroup>
  <ButtonGroup aria-label="기록">
    <IconButton icon={<ArrowUturnLeftIcon />} aria-label="실행 취소" />
  </ButtonGroup>
</ButtonGroup>

<ButtonGroup aria-label="주소">
  <ButtonGroup.Text>https://</ButtonGroup.Text>   {/* 회색 칸. asChild 로 <label> 등을 그릴 수 있다 */}
  <TextField aria-label="도메인" />                {/* 필드도 테두리를 이어 붙인다 */}
  <Button variant="outline">이동</Button>
</ButtonGroup>
```

## 방향과 간격

```tsx
<ButtonGroup orientation="vertical" aria-label="정렬">  {/* 세로. 버튼 너비가 가장 넓은 버튼에 맞춰진다 */}
  <Button>위</Button>
  <Button>아래</Button>
</ButtonGroup>

<ButtonGroup attached={false} aria-label="필터">       {/* 붙이지 않고 간격만 둔다 */}
  <Button>전체</Button>
  <Button>읽지 않음</Button>
</ButtonGroup>
```

## 속성

| 속성                    | 기본 / 동작                                            |
| ----------------------- | ------------------------------------------------------ |
| `orientation`           | `horizontal`(기본) / `vertical`                        |
| `attached`              | `true`. `false` 면 버튼마다 모서리를 두고 8px 떨어진다 |
| `size`                  | 안의 컨트롤이 따르는 크기. 생략하면 각자 크기          |
| `variant`               | 안의 컨트롤이 따르는 variant. 생략하면 각자 기본값     |
| `aria-label`            | 그룹의 이름                                            |
| `ButtonGroup.Separator` | 선. 그룹 방향과 수직이다                               |
| `ButtonGroup.Text`      | 회색 칸. `asChild` 를 받는다                           |
| 그 외 native 속성       | `div` 로 간다                                          |

## 알아둘 것

- `aria-label` 도 `aria-labelledby` 도 없으면 개발 모드에서 콘솔에 경고합니다. 그룹 안의 그룹은 경고하지 않습니다.
- 버튼 하나하나가 Tab 순서에 들어갑니다. 화살표 키로 옮겨 다니며 하나를 고르는 묶음은 `ToggleGroup` 을 씁니다.
- 테두리를 겹치는 기준은 `data-variant="outline"` 과 `data-variant="glossy"` 입니다. 직접 만든 컨트롤도 이 속성을 붙이면 이어 붙습니다.
- 이어 붙인 `glossy` 버튼은 각자의 그림자를 빼고, 그룹이 그림자 하나를 둘레에 그립니다. 켜질 때만 채워지는 `glossy` 토글(`aria-pressed`, `aria-checked`)은 그룹 그림자를 만들지 않고 켜진 토글이 제 그림자를 갖습니다. `attached={false}` 면 버튼마다 그림자를 갖습니다.
- 그룹 안에 제자리로 렌더된 팝오버(`[popover]`)와 그 focus guard 는 이어 붙이는 칸에서 빠집니다. 팝오버를 여는 마지막 버튼도 바깥 모서리를 지키고, 팝오버 양옆의 outline 테두리도 한 줄로 겹칩니다.
