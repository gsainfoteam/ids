# Avatar

사람이나 조직을 사진, 이니셜, 아이콘 순서로 보여 주는 동그란 또는 네모난 표시입니다.

- **이미지 상태.** 불러오는 중, 불러옴, 실패를 `data-status` 로 알리고 `onStatusChange` 로 넘겨줍니다.
- **깜빡임 없는 fallback.** 이미지를 불러오는 동안 600ms를 기다렸다가 이니셜을 보여 주므로, 빨리 오는 이미지 앞에 글자가 번쩍이지 않습니다. 이미지가 없거나 깨지면 바로 보여 줍니다.
- **깨진 이미지는 빠진다.** 실패한 `<img>` 는 DOM에서 빠지고 이니셜이 자리를 채웁니다. 깨진 이미지 아이콘은 보이지 않습니다.
- **SSR과 캐시.** 하이드레이션 전에 이미 불러온 이미지도 알아채고, 새 `src` 는 새 요소라 앞사람의 사진이 남지 않습니다.
- **이니셜.** 한글 이름은 성 한 글자, 그 밖에는 앞 두 단어의 첫 글자입니다. 이모지나 악센트는 반으로 잘리지 않습니다.
- **비율을 지키는 글자.** 크기를 `className` 으로 바꿔도 이니셜이 함께 커집니다.

```tsx
import { Avatar } from '@gsainfoteam/ids-react';

<Avatar src="/avatars/alice.jpg" name="Alice Kim" />;
```

## fallback

```tsx
<Avatar src={user.photo} name="Alice Kim" />   {/* 사진 → 실패하면 "AK" */}
<Avatar name="류현승" />                         {/* 이미지가 없으면 바로 "류" */}
<Avatar alt="알 수 없는 사용자" />                {/* 이름도 없으면 사람 아이콘 */}

<Avatar name="Acme" shape="square">
  <Avatar.Fallback>
    <BuildingOffice2Icon />                      {/* fallback을 직접 그린다 */}
  </Avatar.Fallback>
</Avatar>

<Avatar src={user.photo} name={user.name}>
  <Avatar.Fallback delay={0} />                  {/* 기다리지 않고 바로 이니셜 */}
</Avatar>
```

- `initialsOf(name)` 으로 같은 규칙을 따로 쓸 수 있습니다: `initialsOf('ada lovelace king')` → `'AL'`.
- 괄호나 `@` 같은 기호는 건너뜁니다: `initialsOf('(주)아크메')` → `'주'`.

## 이미지 상태

```tsx
<Avatar
  src={user.photo}
  name={user.name}
  onStatusChange={(status) => log(status)}           // 'loading' | 'loaded' | 'error'
  className={(state) => (state.status === 'loaded' ? 'ring-2' : undefined)}
/>

<Avatar name={user.name}>
  <Avatar.Image src={user.photo} referrerPolicy="no-referrer" />  {/* img 속성을 직접 */}
</Avatar>
```

| `data-status` | 뜻                                   |
| ------------- | ------------------------------------ |
| `loading`     | 이미지를 불러오는 중                 |
| `loaded`      | 이미지를 그렸다                      |
| `error`       | 이미지가 없거나 깨져서 fallback 표시 |

- 이미지는 `loading="lazy"`, `decoding="async"` 가 기본입니다. `Avatar.Image` 에 넘기면 바꿀 수 있습니다.

## 모양과 크기

```tsx
<Avatar shape="circle" />        // 기본
<Avatar shape="square" />        // 조직, 브랜드
<Avatar size="tiny" />           // standard(40px, 기본) / tiny(24px)
<Avatar className="size-20" />   // 그 밖의 크기. 이니셜도 비율에 맞게 커진다
```

- `AvatarGroup` 안에서는 그룹의 `size` 와 `shape` 를 따릅니다. 직접 준 값이 이깁니다.

## 접근성

```tsx
<Avatar src={photo} name="Alice Kim" />             // role="img", 이름 "Alice Kim"
<Avatar src={photo} alt="Alice Kim의 프로필 사진" /> // alt가 이름보다 먼저
<Avatar src={photo} name="Alice Kim" alt="" />      // 장식용. 바로 옆에 이름을 적었을 때
```

- 이름은 `aria-label`, `alt`, `name` 순서로 정합니다.
- `alt=""` 는 `<img alt="">` 처럼 장식용이라는 뜻입니다. 스크린 리더가 이름을 두 번 읽지 않도록 숨깁니다.

## 상태와 data 속성

| 속성          | 뜻                                |
| ------------- | --------------------------------- |
| `data-status` | `loading` / `loaded` / `error`    |
| `data-shape`  | `circle` / `square`               |
| `data-size`   | `standard` / `tiny`               |
| `data-cutout` | 그룹에서 겹친 쪽: `start` / `end` |

함수로 받는 상태는 `{ status, shape, size }` 입니다. 루트의 `className`, `style` 과 `Avatar.Image`, `Avatar.Fallback` 의 `className`, `style`, `Fallback` 의 `children` 이 받습니다.

## 속성

| 속성               | 기본 / 동작                                          |
| ------------------ | ---------------------------------------------------- |
| `src`              | 이미지 주소                                          |
| `name`             | 이니셜과 접근성 이름                                 |
| `alt`              | 접근성 이름. `""` 이면 장식용                        |
| `shape`            | `circle`(기본) / `square`                            |
| `size`             | `standard`(기본) / `tiny`. 그룹 안에서는 그룹을 따름 |
| `onStatusChange`   | 이미지 상태가 바뀔 때                                |
| `Image`            | `img` 의 native 속성. `src` 를 따로 줄 수 있다       |
| `Fallback.delay`   | 이미지를 기다리는 시간. 기본 `600`(ms)               |
| `Fallback.asChild` | 기본 `span` 대신 자식 요소에 속성을 합친다           |
| 그 외              | 루트 `span` 의 native 속성                           |

## 알아둘 것

- 기본 아이콘은 `@heroicons/react` 의 `UserIcon` 입니다. `Avatar.Fallback` 의 children으로 바꿀 수 있습니다.
- 사진은 `object-cover` 로 채웁니다. 투명한 PNG 로고는 fallback 대신 옅은 회색 바탕 위에 그려집니다.
