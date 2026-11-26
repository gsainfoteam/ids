# AvatarGroup

참석자나 협업자처럼 여러 사람을 아바타 한 줄로 보여 주는 그룹입니다.

- **어떤 배경에서도 보이는 틈.** 겹친 아바타는 겹친 쪽을 투명하게 오려냅니다. 테두리 색을 배경에 맞출 필요 없이 카드, 브랜드 색, 그라데이션 위에서도 틈이 배경 그대로 보입니다.
- **넘치는 사람은 `+N` 으로.** `AvatarGroup.Overflow` 의 `max` 를 넘는 사람은 `+N` 하나로 모이고, 스크린 리더는 "외 N명" 이라고 읽습니다.
- **렌더하지 않은 사람까지.** 서버가 앞의 몇 명과 전체 수만 줄 때 `AvatarGroup.Overflow` 의 `total` 로 나머지를 셉니다.
- **쌓이는 순서.** 앞사람을 위로 올릴지 뒷사람을 올릴지 고릅니다. 오른쪽에서 왼쪽으로 쓰는 문서에서는 알아서 뒤집힙니다.
- **크기 전파.** 그룹의 `size` 를 아바타가 따릅니다.

```tsx
import { Avatar, AvatarGroup } from '@gsainfoteam/ids-react';

<AvatarGroup aria-label="회의 참석자">
  {members.map((member) => (
    <Avatar key={member.id} src={member.photo} name={member.name} />
  ))}
  <AvatarGroup.Overflow max={3} />
</AvatarGroup>;
```

## 넘치는 사람

```tsx
<AvatarGroup>
  {avatars}
  <AvatarGroup.Overflow max={3} />                    {/* 앞의 3명 + "+N" */}
</AvatarGroup>

<AvatarGroup>
  {firstThree}
  <AvatarGroup.Overflow total={128} />                {/* 그린 3명 + "+125" */}
</AvatarGroup>

<AvatarGroup>
  <AvatarGroup.Overflow max={2} aria-label={`and ${avatars.length - 2} more`}>
    {({ count }) => `${count}+`}                      {/* 앞에 두면 "+N" 이 앞에 온다 */}
  </AvatarGroup.Overflow>
  {avatars}
</AvatarGroup>
```

- 넘치는 사람을 세는 일은 `AvatarGroup.Overflow` 가 맡습니다. `max` 와 `total` 은 이 파트에 주고, 파트가 없으면 모든 아바타를 그립니다.
- `+N` 은 이름이 "외 N명" 인 이미지입니다. 이름은 파트의 `aria-label` 로 바꿉니다.
- 가려진 사람을 모두 렌더했다면 `+N` 에 마우스를 올렸을 때 그 이름들이 보입니다. `total` 로 센 사람까지는 알 수 없어서 이때는 보이지 않습니다.
- 세 자리 수부터는 원 안에 들어가도록 글자가 작아집니다.
- `max` 가 1보다 작으면 1로 봅니다.

## 쌓기

```tsx
<AvatarGroup stacking="first-on-top" />  // 기본. 앞사람이 위
<AvatarGroup stacking="last-on-top" />   // 뒷사람이 위
<AvatarGroup layout="inline" />          // 겹치지 않고 간격을 두고 늘어놓는다
```

- 아래에 깔린 아바타는 겹친 쪽이 2px 틈을 두고 오려집니다.
- `dir="rtl"` 안에서는 방향이 뒤집힙니다.

## 크기

```tsx
<AvatarGroup size="tiny">
  <Avatar name="Acme" /> {/* tiny */}
  <Avatar name="Globex" size="standard" /> {/* 직접 준 값이 이긴다 */}
</AvatarGroup>
```

## 상태

앱은 상태를 런타임 값으로 읽습니다. DOM 의 `data-*` 속성은 IDS 내부 스타일용이라 문서에 두지 않고 지키겠다고 약속하지도 않습니다.

- `layout`, `stacking`, `size` 와 `Overflow` 의 `max`, `total` 은 앱이 넘긴 값입니다.
- `+N` 에 모인 수는 `AvatarGroup.Overflow` 의 `children` 이 받는 `{ count }` 로 읽습니다.
- 새 디자인(`custom-design`)에서만 루트의 `className`, `style` 에 `AvatarGroup.State`(`visible`, `hidden`, `layout`, `stacking`, `size`)를, `Overflow` 의 `className`, `style` 에 `{ count }` 를 받는 함수를 줍니다.
- 런타임으로 읽을 수 없는 상태: 아바타마다 겹쳐 오려진 쪽(`start` / `end`).

## 속성

| 속성            | 기본 / 동작                                  |
| --------------- | -------------------------------------------- |
| `layout`        | `stack`(기본) / `inline`                     |
| `stacking`      | `first-on-top`(기본) / `last-on-top`         |
| `size`          | `standard`(기본) / `tiny`. 아바타로 전파     |
| 그 외           | 루트 `ul` 의 native 속성. `aria-label` 권장  |

| 파트                   | 속성                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `AvatarGroup.Overflow` | `max`(그릴 아바타 수), `total`(전체 인원), `aria-label`(기본 "외 N명") |

## 알아둘 것

- 자식 하나가 한 사람입니다. `<a href>` 나 툴팁으로 감싼 아바타도 한 사람으로 세고, 안쪽 아바타가 오려집니다.
- 겹침 간격은 `size` 에 맞춰져 있습니다. 새 디자인에서 아바타 크기를 `className` 으로 따로 바꾸면 겹침이 맞지 않습니다.
- 루트는 `ul`, 아바타는 하나씩 `li` 에 담깁니다. 겹치게 당기는 것은 `li` 라서, 아바타 옆에 제자리로 렌더된 팝오버와 그 focus guard 는 당겨지지 않습니다.
