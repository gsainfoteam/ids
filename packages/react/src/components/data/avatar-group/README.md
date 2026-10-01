# AvatarGroup

참석자나 협업자처럼 여러 사람을 아바타 한 줄로 보여 주는 그룹입니다.

- **어떤 배경에서도 보이는 틈.** 겹친 아바타는 겹친 쪽을 투명하게 오려냅니다. 테두리 색을 배경에 맞출 필요 없이 카드, 브랜드 색, 그라데이션 위에서도 틈이 배경 그대로 보입니다.
- **넘치는 사람은 `+N` 으로.** `max` 를 넘는 사람은 `+N` 하나로 모이고, 스크린 리더는 "외 N명" 이라고 읽습니다.
- **렌더하지 않은 사람까지.** 서버가 앞의 몇 명과 전체 수만 줄 때 `total` 로 나머지를 셉니다.
- **쌓이는 순서.** 앞사람을 위로 올릴지 뒷사람을 올릴지 고릅니다. 오른쪽에서 왼쪽으로 쓰는 문서에서는 알아서 뒤집힙니다.
- **크기와 모양 전파.** 그룹의 `size` 와 `shape` 를 아바타가 따릅니다.

```tsx
import { Avatar, AvatarGroup } from '@gsainfoteam/ids-react';

<AvatarGroup max={3} aria-label="회의 참석자">
  {members.map((member) => (
    <Avatar key={member.id} src={member.photo} name={member.name} />
  ))}
</AvatarGroup>;
```

## 넘치는 사람

```tsx
<AvatarGroup max={3}>{avatars}</AvatarGroup>          {/* 앞의 3명 + "+N" */}
<AvatarGroup total={128}>{firstThree}</AvatarGroup>   {/* 그린 3명 + "+125" */}

<AvatarGroup max={2} overflowLabel={(count) => `and ${count} more`}>
  <AvatarGroup.Overflow>                             {/* 앞에 두면 "+N" 이 앞에 온다 */}
    {({ count }) => `${count}+`}                     {/* 남은 수를 받는 함수 */}
  </AvatarGroup.Overflow>
  {avatars}
</AvatarGroup>
```

- `+N` 은 이름이 "외 N명" 인 이미지입니다. 이름은 `overflowLabel` 로 바꿉니다.
- 가려진 사람을 모두 렌더했다면 `+N` 에 마우스를 올렸을 때 그 이름들이 보입니다. `total` 로 센 사람까지는 알 수 없어서 이때는 보이지 않습니다.
- 세 자리 수부터는 원 안에 들어가도록 글자가 작아집니다.
- `max` 가 1보다 작으면 1로 봅니다.

## 쌓기

```tsx
<AvatarGroup stacking="first-on-top" />  // 기본. 앞사람이 위
<AvatarGroup stacking="last-on-top" />   // 뒷사람이 위
<AvatarGroup layout="inline" />          // 겹치지 않고 간격을 두고 늘어놓는다
```

- 아래에 깔린 아바타는 겹친 쪽에 `data-cutout="start"` 또는 `"end"` 가 붙고, 그쪽이 2px 틈을 두고 오려집니다.
- 네모난 아바타는 위 아바타의 둥근 모서리 모양대로 오려집니다.
- `dir="rtl"` 안에서는 방향이 뒤집힙니다.

## 크기와 모양

```tsx
<AvatarGroup size="tiny" shape="square">
  <Avatar name="Acme" /> {/* tiny, square */}
  <Avatar name="Globex" size="standard" /> {/* 직접 준 값이 이긴다 */}
</AvatarGroup>
```

## 상태와 data 속성

| 요소      | 속성                                                             |
| --------- | ---------------------------------------------------------------- |
| 루트      | `data-avatar-group`, `data-layout`, `data-stacking`, `data-size` |
| 각 아바타 | `data-cutout="start \| end"` (겹쳐서 오려진 쪽)                  |
| `+N`      | `data-avatar-group-overflow`                                     |

루트의 `className`, `style` 은 `{ visible, hidden, layout, stacking, size, shape }` 를 받는 함수가 될 수 있고, `Overflow` 의 `className`, `style`, `children` 은 `{ count }` 를 받습니다.

## 속성

| 속성            | 기본 / 동작                                  |
| --------------- | -------------------------------------------- |
| `max`           | 그릴 아바타 수. 나머지는 `+N`                |
| `total`         | 전체 인원. 렌더하지 않은 사람까지 센다       |
| `layout`        | `stack`(기본) / `inline`                     |
| `stacking`      | `first-on-top`(기본) / `last-on-top`         |
| `size`          | `standard`(기본) / `tiny`. 아바타로 전파     |
| `shape`         | `circle`(기본) / `square`. 아바타로 전파     |
| `overflowLabel` | `+N` 의 이름. 기본 `(count) => '외 N명'`     |
| 그 외           | 루트 `div` 의 native 속성. `aria-label` 권장 |

## 알아둘 것

- 자식 하나가 한 사람입니다. `<a href>` 나 툴팁으로 감싼 아바타도 한 사람으로 세고, 안쪽 아바타가 오려집니다.
- 겹침 간격은 `size` 에 맞춰져 있습니다. 아바타 크기를 `className` 으로 따로 바꾸면 겹침이 맞지 않습니다.
- 아바타 옆에 제자리로 렌더된 팝오버(`[popover]`)와 그 focus guard 는 겹치게 당기지 않습니다.
